from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from core.config import get_settings
from core.database import engine, read_engine
from core.embeddings import get_embedder
from core.langfuse import setup_langfuse
from routes import chat, trials


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: verify DB connectivity
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    setup_langfuse(get_settings().environment)
    if get_settings().embedding_warmup:
        await get_embedder().embed_query("warmup")
    yield
    # Shutdown: dispose both connection pools
    await engine.dispose()
    await read_engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(trials.router)


@app.get("/health")
async def health() -> dict[str, str]:
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "unreachable"
    return {"status": "ok", "database": db_status}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
