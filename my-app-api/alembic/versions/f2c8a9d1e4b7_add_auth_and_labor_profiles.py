"""Add account authentication and labor profile fields.

Revision ID: f2c8a9d1e4b7
Revises: 8b2a1c4d6e90
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


revision: str = "f2c8a9d1e4b7"
down_revision: Union[str, Sequence[str], None] = "8b2a1c4d6e90"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
    op.add_column(
        "users",
        sa.Column("role", sa.String(length=20), server_default="labor", nullable=False),
    )
    op.add_column("users", sa.Column("location", sa.String(length=120), nullable=True))
    op.add_column("users", sa.Column("skills", sa.String(length=500), nullable=True))
    op.add_column(
        "users",
        sa.Column("experience_years", sa.Integer(), server_default="0", nullable=False),
    )
    op.add_column(
        "users",
        sa.Column("is_available", sa.Boolean(), server_default=sa.true(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_email", table_name="users")
    op.drop_column("users", "is_available")
    op.drop_column("users", "experience_years")
    op.drop_column("users", "skills")
    op.drop_column("users", "location")
    op.drop_column("users", "role")
    op.drop_column("users", "password_hash")
