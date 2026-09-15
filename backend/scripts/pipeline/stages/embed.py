"""Embed the trials that carried no vector forward."""

from __future__ import annotations

import uuid
from dataclasses import dataclass

from sqlalchemy import bindparam, select, update
from sqlalchemy.orm import selectinload

from core.config import get_settings
from core.embeddings import EmbeddingProvider, get_embedder
from core.embeddings.columns import EMBEDDING_COLUMNS, resolve_provider
from core.embeddings.openai_batch import OpenAIBatchEmbedder
from core.logger import get_logger
from models import Trial
from scripts.ctc.db.shadow import BUILD_SCHEMA, shadow_connection, shadow_session
from services.documents import compose_trial_document

logger = get_logger(__name__)


@dataclass(frozen=True, slots=True)
class EmbedResult:
    provider: EmbeddingProvider
    pending: int
    embedded: int
    batch_id: str | None = None


async def _pending_documents(
    schema: str, provider: EmbeddingProvider, force: bool, limit: int | None
) -> dict[uuid.UUID, str]:
    column = EMBEDDING_COLUMNS[provider]
    statement = select(Trial).options(selectinload(Trial.sites)).order_by(Trial.id)
    if not force:
        statement = statement.where(column.is_(None))
    if limit is not None:
        statement = statement.limit(limit)
    async with shadow_session(schema) as session:
        trials = (await session.execute(statement)).scalars().unique().all()
        return {trial.id: compose_trial_document(trial) for trial in trials}


async def _write(
    schema: str, provider: EmbeddingProvider, vectors: dict[uuid.UUID, list[float]]
) -> int:
    if not vectors:
        return 0
    column = EMBEDDING_COLUMNS[provider]
    statement = (
        update(Trial)
        .where(Trial.id == bindparam("trial_id"))
        .values({column: bindparam("vector")})
    )
    async with shadow_connection(schema) as connection:
        await connection.execute(
            statement,
            [
                {"trial_id": trial_id, "vector": vector}
                for trial_id, vector in vectors.items()
            ],
        )
    return len(vectors)


async def _embed_ollama(
    schema: str, documents: dict[uuid.UUID, str], batch_size: int
) -> int:
    embedder = get_embedder(EmbeddingProvider.OLLAMA)
    trial_ids = list(documents)
    embedded = 0
    for start in range(0, len(trial_ids), batch_size):
        chunk = trial_ids[start : start + batch_size]
        vectors = await embedder.embed_documents([documents[key] for key in chunk])
        embedded += await _write(
            schema, EmbeddingProvider.OLLAMA, dict(zip(chunk, vectors, strict=True))
        )
    return embedded


async def _embed_openai(
    schema: str, documents: dict[uuid.UUID, str], batch_id: str | None
) -> tuple[int, str]:
    """One JSONL batch for the whole corpus; `batch_id` resumes a submitted one."""
    embedder = OpenAIBatchEmbedder(get_settings())
    if batch_id is None:
        batch_id = await embedder.submit({str(k): v for k, v in documents.items()})
        logger.info("submitted openai embedding batch %s", batch_id)
    vectors = await embedder.fetch(batch_id)
    written = await _write(
        schema,
        EmbeddingProvider.OPENAI,
        {uuid.UUID(key): vector for key, vector in vectors.items()},
    )
    return written, batch_id


async def embed(
    *,
    provider: EmbeddingProvider | None = None,
    schema: str = BUILD_SCHEMA,
    batch_size: int | None = None,
    force: bool = False,
    limit: int | None = None,
    batch_id: str | None = None,
) -> EmbedResult:
    settings = get_settings()
    active = resolve_provider(provider)
    documents = await _pending_documents(schema, active, force, limit)

    if not documents and batch_id is None:
        return EmbedResult(provider=active, pending=0, embedded=0)

    if active is EmbeddingProvider.OPENAI:
        embedded, used_batch = await _embed_openai(schema, documents, batch_id)
        return EmbedResult(
            provider=active,
            pending=len(documents),
            embedded=embedded,
            batch_id=used_batch,
        )

    embedded = await _embed_ollama(
        schema, documents, batch_size or settings.embedding_batch_size
    )
    return EmbedResult(provider=active, pending=len(documents), embedded=embedded)
