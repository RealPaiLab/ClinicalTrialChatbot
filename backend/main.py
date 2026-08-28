from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from agents.clinical_trials.prompts import ensure_clinical_trials_prompt_seeded
from agents.input_triage.prompts import ensure_triage_prompt_seeded
from agents.translation.prompts import ensure_translation_prompt_seeded
from core.config import get_settings
from core.database import engine, read_engine
from core.dependencies import aclose_translation_provider, get_vocabulary_service
from core.embeddings import get_embedder
from core.exception_handlers import register_exception_handlers
from core.http_retry import aclose_retrying_client
from core.langfuse import setup_langfuse
from core.middleware import ClientIPMiddleware
from core.redis import aclose_redis_client
from routes import chat, debug, evals, feedback, translation, trials


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: verify DB connectivity
    async with engine.connect() as conn:
        await conn.execute(text("SELECT 1"))
    # Warm the tool vocabulary
    await get_vocabulary_service().refresh()
    setup_langfuse()
    ensure_clinical_trials_prompt_seeded()
    ensure_triage_prompt_seeded()
    ensure_translation_prompt_seeded()
    if get_settings().embedding_warmup:
        await get_embedder().embed_query("warmup")
    yield
    # Shutdown: close the shared HTTP client and dispose both connection pools
    await aclose_retrying_client()
    await aclose_translation_provider()
    await aclose_redis_client()
    await engine.dispose()
    await read_engine.dispose()


_docs_enabled = not get_settings().is_production
app = FastAPI(
    lifespan=lifespan,
    docs_url="/docs" if _docs_enabled else None,
    redoc_url="/redoc" if _docs_enabled else None,
    openapi_url="/openapi.json" if _docs_enabled else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().cors_allow_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(ClientIPMiddleware)


register_exception_handlers(app)

app.include_router(chat.router)
app.include_router(trials.router)
app.include_router(translation.router)
app.include_router(feedback.router)
app.include_router(evals.router)

if not get_settings().is_production:
    app.include_router(debug.router)


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
