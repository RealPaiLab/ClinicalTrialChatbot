"""rename embedding to qwen_embedding

Revision ID: 50ab5a7ad66d
Revises: 08ccc8dcbba5
Create Date: 2026-06-15 21:51:40.288742

"""
from collections.abc import Sequence

from alembic import op


# revision identifiers, used by Alembic.
revision: str = '50ab5a7ad66d'
down_revision: str | None = '08ccc8dcbba5'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.alter_column('trials', 'embedding', new_column_name='qwen_embedding')


def downgrade() -> None:
    op.alter_column('trials', 'qwen_embedding', new_column_name='embedding')
