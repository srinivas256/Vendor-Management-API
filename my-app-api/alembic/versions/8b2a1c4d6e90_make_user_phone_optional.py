"""Make user phone optional.

Revision ID: 8b2a1c4d6e90
Revises: c93f09310116
"""
from typing import Sequence, Union

from alembic import op


revision: str = "8b2a1c4d6e90"
down_revision: Union[str, Sequence[str], None] = "c93f09310116"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column("users", "phone", nullable=True)


def downgrade() -> None:
    op.execute("UPDATE users SET phone = '' WHERE phone IS NULL")
    op.alter_column("users", "phone", nullable=False)
