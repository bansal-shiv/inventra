import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Customer
from app.schemas import CustomerCreate, CustomerOut, CustomerUpdate

router = APIRouter(prefix="/customers", tags=["customers"])


def _digits(phone: str) -> str:
    return re.sub(r"\D", "", phone or "")


@router.post("", response_model=CustomerOut, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    if db.query(Customer).filter(Customer.email == payload.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "A customer with this email already exists")

    digits = _digits(payload.phone)
    if db.query(Customer).filter(Customer.phone_digits == digits).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "A customer with this phone number already exists")

    customer = Customer(**payload.model_dump(), phone_digits=digits)
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@router.get("", response_model=list[CustomerOut])
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).order_by(Customer.id.desc()).all()


@router.get("/{customer_id}", response_model=CustomerOut)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(customer_id: int, payload: CustomerUpdate, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

    data = payload.model_dump(exclude_unset=True)

    new_email = data.get("email")
    if new_email and new_email != customer.email:
        if db.query(Customer).filter(Customer.email == new_email).first():
            raise HTTPException(status.HTTP_409_CONFLICT, "A customer with this email already exists")

    new_phone = data.get("phone")
    if new_phone:
        new_digits = _digits(new_phone)
        if new_digits != customer.phone_digits:
            clash = db.query(Customer).filter(Customer.phone_digits == new_digits).first()
            if clash:
                raise HTTPException(status.HTTP_409_CONFLICT, "A customer with this phone number already exists")
            customer.phone_digits = new_digits

    for field, value in data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.get(Customer, customer_id)
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")
    db.delete(customer)
    db.commit()
