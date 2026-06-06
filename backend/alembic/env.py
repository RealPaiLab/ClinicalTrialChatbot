import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.pool import NullPool

# Import models package so all model modules are registered with Base.metadata.
# Add new model modules to models/__init__.py
import models  # noqa: F401
from alembic import context
from models.base import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

from core.config import get_settings  # noqa: E402

_settings = get_settings()


def run_migrations_offline() -> None:
    """Run migrations without a live DB connection.

    Useful for generating SQL scripts: alembic upgrade head --sql
    """
    context.configure(
        url=_settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection) -> None:  # type: ignore[no-untyped-def]
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations against a live DB using asyncpg."""
    connectable = create_async_engine(
        _settings.database_url,
        poolclass=NullPool,  # migrations are one-shot: no pooling needed
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
