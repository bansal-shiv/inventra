from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, SessionLocal, engine
from app.core.seed import seed_if_empty
from app.routers import customers, orders, products, stats

Base.metadata.create_all(bind=engine)

with SessionLocal() as _db:
    seed_if_empty(_db)

app = FastAPI(
    title="Inventra API",
    version="1.0",
    description="Backend for Inventra — a small inventory and order management system. Endpoints for products, customers, orders, and dashboard stats.",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
app.include_router(stats.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
