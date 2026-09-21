"""initial schema

Revision ID: 20260613_0001
Revises:
Create Date: 2026-06-13
"""

from alembic import op
import sqlalchemy as sa


revision = "20260613_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "user",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("mobile_number", sa.String(), nullable=False),
        sa.Column("role", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_user_mobile_number", "user", ["mobile_number"], unique=True)

    op.create_table(
        "category",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name_en", sa.String(), nullable=False),
        sa.Column("name_mr", sa.String(), nullable=False),
    )

    op.create_table(
        "serviceablepincode",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("pincode", sa.String(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_serviceablepincode_pincode", "serviceablepincode", ["pincode"], unique=True)

    op.create_table(
        "product",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("name_en", sa.String(), nullable=False),
        sa.Column("name_mr", sa.String(), nullable=False),
        sa.Column("description_en", sa.String(), nullable=False),
        sa.Column("description_mr", sa.String(), nullable=False),
        sa.Column("original_price", sa.Numeric(), nullable=False),
        sa.Column("discounted_price", sa.Numeric(), nullable=False),
        sa.Column("stock_quantity", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("category_id", sa.Integer(), sa.ForeignKey("category.id"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
    )
    op.create_index("ix_product_slug", "product", ["slug"], unique=True)

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

    op.create_table(
        "address",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("house", sa.String(), nullable=False),
        sa.Column("street", sa.String(), nullable=False),
        sa.Column("landmark", sa.String(), nullable=True),
        sa.Column("area", sa.String(), nullable=False),
        sa.Column("city", sa.String(), nullable=False),
        sa.Column("state", sa.String(), nullable=False),
        sa.Column("pincode", sa.String(), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
    )

    op.create_table(
        "cart",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
    )

    op.create_table(
        "cartitem",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("cart_id", sa.Integer(), sa.ForeignKey("cart.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
    )

    op.create_table(
        "order",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("address_id", sa.Integer(), sa.ForeignKey("address.id"), nullable=False),
        sa.Column("total_amount", sa.Numeric(), nullable=False),
        sa.Column("payment_method", sa.String(), nullable=False),
        sa.Column("payment_status", sa.String(), nullable=False),
        sa.Column("order_status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "orderitem",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("order.id"), nullable=False),
        sa.Column("product_id", sa.Integer(), sa.ForeignKey("product.id"), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("price", sa.Numeric(), nullable=False),
    )

    op.create_table(
        "refreshtoken",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("user.id"), nullable=False),
        sa.Column("token_hash", sa.String(), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_refreshtoken_token_hash", "refreshtoken", ["token_hash"], unique=True)

    op.create_table(
        "paymenttransaction",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("order.id"), nullable=False),
        sa.Column("provider", sa.String(), nullable=False),
        sa.Column("provider_order_id", sa.String(), nullable=True),
        sa.Column("provider_payment_id", sa.String(), nullable=True),
        sa.Column("amount", sa.Numeric(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("paymenttransaction")
    op.drop_index("ix_refreshtoken_token_hash", table_name="refreshtoken")
    op.drop_table("refreshtoken")
    op.drop_table("orderitem")
    op.drop_table("order")
    op.drop_table("cartitem")
    op.drop_table("cart")
    op.drop_table("address")
    op.drop_table("otprequest")
    op.drop_index("ix_product_slug", table_name="product")
    op.drop_table("product")
    op.drop_index("ix_serviceablepincode_pincode", table_name="serviceablepincode")
    op.drop_table("serviceablepincode")
    op.drop_table("category")
    op.drop_index("ix_user_mobile_number", table_name="user")
    op.drop_table("user")
