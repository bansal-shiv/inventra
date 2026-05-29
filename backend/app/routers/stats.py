from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models import Customer, Order, Product
from app.schemas import ProductOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("")
def dashboard(db: Session = Depends(get_db)):
    low_stock = (
        db.query(Product)
        .filter(Product.quantity <= settings.low_stock_threshold)
        .order_by(Product.quantity.asc())
        .all()
    )

    recent = db.query(Order).order_by(Order.id.desc()).limit(5).all()
    recent_payload = [
        {
            "id": o.id,
            "customer_name": o.customer.full_name if o.customer else None,
            "item_count": len(o.items),
            "total_amount": float(o.total_amount),
            "created_at": o.created_at.isoformat(),
        }
        for o in recent
    ]

    return {
        "total_products": db.query(Product).count(),
        "total_customers": db.query(Customer).count(),
        "total_orders": db.query(Order).count(),
        "low_stock_threshold": settings.low_stock_threshold,
        "low_stock_products": [ProductOut.model_validate(p) for p in low_stock],
        "recent_orders": recent_payload,
    }
