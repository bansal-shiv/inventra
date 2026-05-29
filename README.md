# Inventra — Inventory & Order Management System

A full-stack app for managing products, customers, orders, and inventory. Built with
FastAPI, PostgreSQL, and a React (Vite) frontend, fully containerized with Docker.

## Stack

| Layer       | Tech                                          |
|-------------|-----------------------------------------------|
| Backend     | Python, FastAPI, SQLAlchemy                   |
| Database    | PostgreSQL 16                                 |
| Frontend    | React 18 (Vite), Tailwind CSS, react-hot-toast |
| Containers  | Docker, Docker Compose                        |

## Highlights

- Full CRUD for products, customers, and orders
- Business rules enforced server-side: unique SKU, unique email, unique phone,
  non-negative quantity, inventory check, automatic stock reduction on order,
  automatic stock restoration on cancellation, server-computed totals
- Dashboard with totals, low-stock list, and recent orders
- Toast notifications for actions, confirm dialogs for destructive ones
- Search across products and customers
- Seed data loaded on first startup for an instantly demoable app

## Project layout

```
.
├── backend/            FastAPI app, models, routers, seed
├── frontend/           React + Vite single-page app
├── docker-compose.yml  runs db + backend + frontend together
└── .env.example        copy to .env before running
```

## Running locally

You only need Docker installed.

```bash
cp .env.example .env       # then edit the password
docker compose up --build
```

- Frontend: http://localhost:5173
- API + interactive docs: http://localhost:8000/docs

The database is seeded with sample products, customers, and orders on first
startup, so the app is immediately usable. To stop and wipe everything:

```bash
docker compose down -v
```

## API reference

### Products
| Method | Path             | Purpose            |
|--------|------------------|--------------------|
| POST   | /products        | Create a product   |
| GET    | /products        | List products      |
| GET    | /products/{id}   | Get one product    |
| PUT    | /products/{id}   | Update a product   |
| DELETE | /products/{id}   | Delete a product   |

### Customers
| Method | Path              | Purpose            |
|--------|-------------------|--------------------|
| POST   | /customers        | Create a customer  |
| GET    | /customers        | List customers     |
| GET    | /customers/{id}   | Get one customer   |
| PUT    | /customers/{id}   | Update a customer  |
| DELETE | /customers/{id}   | Delete a customer  |

### Orders
| Method | Path           | Purpose                              |
|--------|----------------|--------------------------------------|
| POST   | /orders        | Create an order                      |
| GET    | /orders        | List orders                          |
| GET    | /orders/{id}   | Get one order                        |
| DELETE | /orders/{id}   | Cancel an order (stock is restored)  |

### Stats
`GET /stats` — totals, low-stock list, and the five most recent orders.

## Business rules

- Product SKU is unique (409 on conflict).
- Customer email and phone number are each unique (409 on conflict).
- Product quantity cannot be negative (422 on input).
- Orders are rejected with 400 when stock is insufficient.
- Placing an order reduces stock; cancelling restores it.
- Order totals are calculated by the backend at purchase-time prices.
- Phone numbers accept 7–15 digits with spaces, dashes, and a leading +.

## Environment variables

| Variable                  | Used by   | Notes                              |
|---------------------------|-----------|------------------------------------|
| POSTGRES_USER/PASSWORD/DB | db        | Postgres credentials               |
| DATABASE_URL              | backend   | Full Postgres connection string    |
| CORS_ORIGINS              | backend   | Comma-separated allowed origins    |
| LOW_STOCK_THRESHOLD       | backend   | Low-stock cutoff for the dashboard |
| VITE_API_URL              | frontend  | Backend base URL (build-time)      |

