"""remove otp, add user.is_verified

Revision ID: 20260920_0002
Revises: 20260613_0001
Create Date: 2026-09-20
"""

from alembic import op
import sqlalchemy as sa


revision = "20260920_0002"
down_revision = "20260613_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("user", sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()))
    op.alter_column("user", "is_verified", server_default=None)
    op.drop_table("otprequest")


def downgrade() -> None:
    op.create_table(
        "otprequest",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("mobile_number", sa.String(), nullable=False),
        sa.Column("otp_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("verified", sa.Boolean(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("request_ip", sa.String(), nullable=True),
    )
    op.drop_column("user", "is_verified")
