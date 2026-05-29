import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, EmailStr, Field, field_validator


_PHONE_OK = re.compile(r"^[\d+\-\s]+$")


def _clean_phone(v: str) -> str:
    if not v or not _PHONE_OK.match(v):
        raise ValueError("Phone may only contain digits, spaces, dashes, and +")
    digits = re.sub(r"\D", "", v)
    if len(digits) < 7 or len(digits) > 15:
        raise ValueError("Phone must contain 7 to 15 digits")
    return v.strip()


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    sku: str = Field(min_length=1, max_length=64)
    price: Decimal = Field(gt=0)
    quantity: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    sku: str | None = Field(default=None, min_length=1, max_length=64)
    price: Decimal | None = Field(default=None, gt=0)
    quantity: int | None = Field(default=None, ge=0)


class ProductOut(ProductBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: str = Field(min_length=4, max_length=30)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        return _clean_phone(v)


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=150)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=4, max_length=30)

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        if v is None:
            return v
        return _clean_phone(v)


class CustomerOut(CustomerBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class OrderLineIn(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderLineIn]

    @field_validator("items")
    @classmethod
    def must_have_items(cls, v):
        if not v:
            raise ValueError("An order must contain at least one item")
        return v


class OrderLineOut(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: Decimal

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    id: int
    customer_id: int
    customer_name: str | None = None
    total_amount: Decimal
    created_at: datetime
    items: list[OrderLineOut]

    model_config = {"from_attributes": True}
