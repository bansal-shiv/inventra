from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Customer, Order, OrderItem, Product
from app.schemas import OrderCreate, OrderLineOut, OrderOut

router = APIRouter(prefix="/orders", tags=["orders"])


def _serialize(order: Order) -> OrderOut:
    lines = [
        OrderLineOut(
            product_id=i.product_id,
            product_name=i.product.name if i.product else f"#{i.product_id}",
            quantity=i.quantity,
            unit_price=i.unit_price,
        )
        for i in order.items
    ]
    return OrderOut(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else None,
        total_amount=order.total_amount,
        created_at=order.created_at,
        items=lines,
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Customer not found")

    wanted: dict[int, int] = {}
    for line in payload.items:
        wanted[line.product_id] = wanted.get(line.product_id, 0) + line.quantity

    order = Order(customer_id=customer.id, total_amount=0)
    total = 0

    for product_id, qty in wanted.items():
        product = db.get(Product, product_id)
        if not product:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, f"Product {product_id} not found"
            )
        if product.quantity < qty:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Insufficient stock for '{product.name}' "
                f"(requested {qty}, available {product.quantity})",
            )

        product.quantity -= qty
        total += product.price * qty
        order.items.append(
            OrderItem(product_id=product.id, quantity=qty, unit_price=product.price)
        )

    order.total_amount = total
    db.add(order)
    db.commit()
    db.refresh(order)
    return _serialize(order)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.id.desc()).all()
    return [_serialize(o) for o in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    return _serialize(order)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(Order, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")

    for item in order.items:
        product = db.get(Product, item.product_id)
        if product:
            product.quantity += item.quantity

    db.delete(order)
    db.commit()
