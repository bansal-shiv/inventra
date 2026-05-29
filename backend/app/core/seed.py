import re
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Customer, Order, OrderItem, Product


SAMPLE_PRODUCTS = [
    {"name": "Wireless Mouse", "sku": "ACC-WM-201", "price": Decimal("799.00"), "quantity": 48},
    {"name": "Mechanical Keyboard", "sku": "ACC-KB-310", "price": Decimal("4499.00"), "quantity": 17},
    {"name": "USB-C Hub 7-in-1", "sku": "ACC-HUB-007", "price": Decimal("1899.00"), "quantity": 6},
    {"name": "27\" 4K Monitor", "sku": "DSP-MON-274K", "price": Decimal("28499.00"), "quantity": 9},
    {"name": "Noise-cancelling Headphones", "sku": "AUD-NC-500", "price": Decimal("8999.00"), "quantity": 22},
    {"name": "Standing Desk Mat", "sku": "ERG-MAT-01", "price": Decimal("2299.00"), "quantity": 3},
    {"name": "Webcam 1080p", "sku": "CAM-WEB-108", "price": Decimal("2999.00"), "quantity": 31},
    {"name": "Laptop Stand Aluminium", "sku": "ERG-LS-AL", "price": Decimal("1799.00"), "quantity": 14},
]

SAMPLE_CUSTOMERS = [
    {"full_name": "Aarav Sharma", "email": "aarav.sharma@inventra.in", "phone": "+91 98201 45678"},
    {"full_name": "Priya Iyer", "email": "priya.iyer@inventra.in", "phone": "+91 99887 76655"},
    {"full_name": "Rohan Mehta", "email": "rohan.mehta@inventra.in", "phone": "+91 98765 43210"},
    {"full_name": "Ananya Reddy", "email": "ananya.reddy@inventra.in", "phone": "+91 90123 45678"},
    {"full_name": "David Fernandes", "email": "david.fernandes@inventra.in", "phone": "+91 91234 56780"},
]

SAMPLE_ORDERS = [
    {"customer_email": "aarav.sharma@inventra.in", "lines": [("ACC-WM-201", 2), ("ACC-KB-310", 1)]},
    {"customer_email": "priya.iyer@inventra.in", "lines": [("AUD-NC-500", 1), ("CAM-WEB-108", 1)]},
    {"customer_email": "rohan.mehta@inventra.in", "lines": [("ERG-LS-AL", 3)]},
    {"customer_email": "david.fernandes@inventra.in", "lines": [("DSP-MON-274K", 1), ("ACC-HUB-007", 2)]},
]


def _digits(phone: str) -> str:
    return re.sub(r"\D", "", phone)


def seed_if_empty(db: Session) -> None:
    if db.query(Product).count() > 0 or db.query(Customer).count() > 0:
        return

    products = {}
    for p in SAMPLE_PRODUCTS:
        obj = Product(**p)
        db.add(obj)
        products[p["sku"]] = obj

    customers = {}
    for c in SAMPLE_CUSTOMERS:
        obj = Customer(**c, phone_digits=_digits(c["phone"]))
        db.add(obj)
        customers[c["email"]] = obj

    db.flush()

    for o in SAMPLE_ORDERS:
        cust = customers[o["customer_email"]]
        order = Order(customer_id=cust.id, total_amount=0)
        total = Decimal("0")
        for sku, qty in o["lines"]:
            prod = products[sku]
            if prod.quantity < qty:
                continue
            prod.quantity -= qty
            total += prod.price * qty
            order.items.append(
                OrderItem(product_id=prod.id, quantity=qty, unit_price=prod.price)
            )
        order.total_amount = total
        db.add(order)

    db.commit()
