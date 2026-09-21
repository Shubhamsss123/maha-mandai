from decimal import Decimal

from pydantic import BaseModel, Field, model_validator


class AdminCategoryIn(BaseModel):
    name_en: str = Field(min_length=2, max_length=80)
    name_mr: str = Field(min_length=2, max_length=80)


class AdminProductIn(BaseModel):
    slug: str = Field(min_length=3, max_length=120)
    name_en: str = Field(min_length=2, max_length=120)
    name_mr: str = Field(min_length=2, max_length=120)
    description_en: str = Field(min_length=2, max_length=1000)
    description_mr: str = Field(min_length=2, max_length=1000)
    original_price: Decimal = Field(gt=0)
    discounted_price: Decimal = Field(gt=0)
    stock_quantity: int = Field(ge=0)
    image_url: str | None = Field(default=None, max_length=500)
    category_id: int = Field(gt=0)
    is_active: bool = True

    @model_validator(mode="after")
    def validate_prices(self):
        if self.discounted_price > self.original_price:
            raise ValueError("Discounted price cannot exceed original price")
        return self
