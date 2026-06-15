from __future__ import annotations

import argparse
import asyncio
import uuid

from rich.console import Console
from rich.progress import (
    BarColumn,
    MofNCompleteColumn,
    Progress,
    TextColumn,
    TimeElapsedColumn,
)
from rich.table import Table
from sqlalchemy import select, update
from sqlalchemy.orm import InstrumentedAttribute, selectinload

from core.config import get_settings
from core.database import AsyncSessionFactory
from core.embeddings import EmbeddingProvider, get_embedder
from core.embeddings.openai_batch import OpenAIBatchEmbedder
from models import Trial
from services.documents import compose_trial_document

console = Console()

_COLUMNS: dict[EmbeddingProvider, InstrumentedAttribute[list[float] | None]] = {
    EmbeddingProvider.OLLAMA: Trial.qwen_embedding,
    EmbeddingProvider.OPENAI: Trial.openai_embedding,
}


async def _pending_documents(
    column: InstrumentedAttribute[list[float] | None],
    force: bool,
    limit: int | None = None,
) -> dict[str, str]:
    """trial id (str) -> composed document for trials missing this embedding."""
    stmt = select(Trial).options(selectinload(Trial.sites)).order_by(Trial.id)
    if not force:
        stmt = stmt.where(column.is_(None))
    if limit is not None:
        stmt = stmt.limit(limit)
    async with AsyncSessionFactory() as session:
        trials = list((await session.execute(stmt)).scalars().unique().all())
        return {str(t.id): compose_trial_document(t) for t in trials}


async def _write(
    column: InstrumentedAttribute[list[float] | None],
    embeddings: dict[str, list[float]],
) -> int:
    async with AsyncSessionFactory() as session:
        for trial_id, vector in embeddings.items():
            await session.execute(
                update(Trial)
                .where(Trial.id == uuid.UUID(trial_id))
                .values({column: vector})
            )
        await session.commit()
    return len(embeddings)


def _report(provider: EmbeddingProvider, embedded: int, mode: str) -> None:
    table = Table(title="Embedding complete", show_header=False, box=None)
    table.add_row("Provider", provider.value)
    table.add_row("Trials embedded", str(embedded))
    table.add_row("Mode", mode)
    console.print(table)


async def _embed_ollama(force: bool, batch_size: int, limit: int | None) -> None:
    """Synchronous path: embed documents in batches via the local Ollama embedder."""
    column = _COLUMNS[EmbeddingProvider.OLLAMA]
    documents = await _pending_documents(column, force, limit)
    if not documents:
        console.print("[green]Nothing to embed; all trials are up to date.[/green]")
        return

    embedder = get_embedder(EmbeddingProvider.OLLAMA)
    ids = list(documents)
    embedded = 0
    with Progress(
        TextColumn("[progress.description]Embedding trials"),
        BarColumn(),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
        console=console,
    ) as progress:
        task = progress.add_task("trials", total=len(ids))
        for i in range(0, len(ids), batch_size):
            chunk = ids[i : i + batch_size]
            vectors = await embedder.embed_documents([documents[k] for k in chunk])
            await _write(column, dict(zip(chunk, vectors, strict=True)))
            embedded += len(chunk)
            progress.advance(task, len(chunk))

    _report(
        EmbeddingProvider.OLLAMA, embedded, "force (all)" if force else "missing only"
    )


async def _embed_openai(force: bool, batch_id: str | None, limit: int | None) -> None:
    """Batch API path: submit one JSONL batch (or resume one), poll, then write."""
    column = _COLUMNS[EmbeddingProvider.OPENAI]
    embedder = OpenAIBatchEmbedder(get_settings())
    if batch_id is None:
        documents = await _pending_documents(column, force, limit)
        if not documents:
            console.print(
                "[green]Nothing to embed; all trials have an OpenAI embedding.[/green]"
            )
            return
        batch_id = await embedder.submit(documents)
        console.print(
            f"Submitted batch [bold]{batch_id}[/bold] ({len(documents)} trials). "
            "Polling until complete (resume later with --batch-id if interrupted)…"
        )
    else:
        console.print(f"Resuming batch [bold]{batch_id}[/bold]. Polling…")

    embeddings = await embedder.fetch(batch_id)
    embedded = await _write(column, embeddings)
    _report(
        EmbeddingProvider.OPENAI, embedded, "force (all)" if force else "missing only"
    )


async def embed_trials(
    provider: EmbeddingProvider,
    force: bool,
    batch_size: int,
    batch_id: str | None,
    limit: int | None,
) -> None:
    if provider is EmbeddingProvider.OPENAI:
        await _embed_openai(force, batch_id, limit)
    else:
        await _embed_ollama(force, batch_size, limit)


def main() -> None:
    settings = get_settings()
    parser = argparse.ArgumentParser(
        description="Generate and store pgvector embeddings for trials."
    )
    parser.add_argument(
        "--provider",
        type=EmbeddingProvider,
        choices=list(EmbeddingProvider),
        default=EmbeddingProvider(settings.embedding_provider),
        help="ollama embeds qwen_embedding synchronously; openai embeds "
        "openai_embedding via the Batch API.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-embed every trial, not only those missing an embedding.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=settings.embedding_batch_size,
        metavar="N",
        help="Ollama only: documents per synchronous embedding call.",
    )
    parser.add_argument(
        "--batch-id",
        metavar="ID",
        default=None,
        help="OpenAI only: resume an already-submitted batch (skip submission).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        metavar="N",
        help="Embed at most N trials (use for a small smoke-test batch).",
    )
    args = parser.parse_args()
    asyncio.run(
        embed_trials(
            args.provider, args.force, args.batch_size, args.batch_id, args.limit
        )
    )


if __name__ == "__main__":
    main()
