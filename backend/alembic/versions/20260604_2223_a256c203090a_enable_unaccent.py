"""enable unaccent

Revision ID: a256c203090a
Revises: a90b558a91dc
Create Date: 2026-06-04 22:23:25.926681

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "a256c203090a"
down_revision: str | None = "a90b558a91dc"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")


def downgrade() -> None:
    op.execute("DROP EXTENSION IF EXISTS unaccent")
