from __future__ import annotations

import argparse
import asyncio

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
from sqlalchemy.orm import selectinload

from core.config import get_settings
from core.database import AsyncSessionFactory
from core.embeddings import get_embedder
from models import Trial
from services.documents import compose_trial_document

console = Console()


async def embed_trials(batch_size: int, force: bool) -> None:
    embedder = get_embedder()
    stmt = select(Trial).options(selectinload(Trial.sites)).order_by(Trial.id)
    if not force:
        stmt = stmt.where(Trial.embedding.is_(None))

    async with AsyncSessionFactory() as session:
        trials = list((await session.execute(stmt)).scalars().unique().all())
        if not trials:
            console.print("[green]Nothing to embed; all trials are up to date.[/green]")
            return

        embedded = 0
        with Progress(
            TextColumn("[progress.description]Embedding trials"),
            BarColumn(),
            MofNCompleteColumn(),
            TimeElapsedColumn(),
            console=console,
        ) as progress:
            task = progress.add_task("trials", total=len(trials))
            for i in range(0, len(trials), batch_size):
                batch = trials[i : i + batch_size]
                documents = [compose_trial_document(t) for t in batch]
                vectors = await embedder.embed_documents(documents)
                for trial, vector in zip(batch, vectors, strict=True):
                    await session.execute(
                        update(Trial)
                        .where(Trial.id == trial.id)
                        .values(embedding=vector)
                    )
                await session.commit()
                embedded += len(batch)
                progress.advance(task, len(batch))

    table = Table(title="Embedding complete", show_header=False, box=None)
    table.add_row("Trials embedded", str(embedded))
    table.add_row("Mode", "force (all)" if force else "missing only")
    console.print(table)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate and store pgvector embeddings for trials."
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=get_settings().embedding_batch_size,
        metavar="N",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-embed every trial, not only those missing an embedding.",
    )
    args = parser.parse_args()
    asyncio.run(embed_trials(args.batch_size, args.force))


if __name__ == "__main__":
    main()
