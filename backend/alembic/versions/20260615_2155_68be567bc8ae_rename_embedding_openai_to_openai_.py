"""rename embedding_openai to openai_embedding

Revision ID: 68be567bc8ae
Revises: 50ab5a7ad66d
Create Date: 2026-06-15 21:55:54.242162

"""
from collections.abc import Sequence

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '68be567bc8ae'
down_revision: str | None = '50ab5a7ad66d'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column('trials', 'embedding_openai', new_column_name='openai_embedding')


def downgrade() -> None:
    op.alter_column('trials', 'openai_embedding', new_column_name='embedding_openai')
