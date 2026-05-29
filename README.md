# Inventra

A small inventory and order management system. Manages products, customers, orders, and stock levels. Built for a take-home assessment.

## Live demo

Frontend: https://inventra-two-rust.vercel.app
Backend API docs: https://inventra-backend-7w85.onrender.com/docs
Docker image: https://hub.docker.com/r/bansalshiv/inventra-backend

The backend runs on Render's free tier, which sleeps the service after about 15 minutes of inactivity. The first request after a quiet period takes around 30 to 60 seconds to wake it back up. After that, things are fast until the next idle period. If the dashboard hangs at "Loading..." on first visit, that's the reason.

## Stack

Backend: Python 3.11, FastAPI, SQLAlchemy, Pydantic.
Database: PostgreSQL 16.
Frontend: React 18 with Vite, Tailwind CSS, react-hot-toast for notifications.
Containers: Docker and docker-compose.

I picked FastAPI over Flask because the auto-generated docs page is useful for testing and demoing. Every endpoint is interactive out of the box.

## Features

CRUD for products, customers, and orders. On top of that:

- A dashboard with totals, a low-stock list, and the five most recent orders
- Server-side business rules (see below)
- Toast notifications for success and a confirm dialog before deletes
- Search across products and customers
- Sample data loaded on first startup so the app is usable straight away

## Running it locally

You only need Docker installed. From the project root:

    cp .env.example .env
    docker compose up --build

Once everything is up:

- App: http://localhost:5173
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

The database is seeded with 8 products, 5 customers, and 4 orders on first run. The seed only runs when the database is empty, so restarts will not duplicate the data.

To stop everything and wipe the database volume:

    docker compose down -v

## Business rules

Most of the interesting logic lives on the backend. The frontend just surfaces error messages from the API.

- Product SKUs and customer emails are unique. 409 on conflict.
- Phone numbers are unique too. Digits are normalised before the check, so "+91 98765 43210" and "9876543210" count as the same number.
- Phone numbers accept 7 to 15 digits with spaces, dashes, and a leading plus.
- Product quantity cannot go negative. 422 if you try.
- Orders are rejected with 400 if any line item exceeds available stock.
- Placing an order reduces stock; deleting an order restores it.
- Order totals are computed server-side at purchase-time prices, so editing a product's price later does not rewrite historic order amounts.

## API

Products: GET, POST, GET /{id}, PUT /{id}, DELETE /{id}
Customers: GET, POST, GET /{id}, PUT /{id}, DELETE /{id}
Orders: GET, POST, GET /{id}, DELETE /{id}
Stats: GET /stats (totals, low stock, recent orders)
Health: GET /health

Full request and response schemas, plus a try-it-now panel, are available at /docs.

## Project layout

    backend/            FastAPI app: models, routers, schemas, seed
    frontend/           React and Vite single-page app
    docker-compose.yml  brings up db, backend, and frontend together
    .env.example        template, copy to .env before first run

## Environment variables

POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB: Postgres credentials.
DATABASE_URL: Full Postgres connection string used by the backend.
CORS_ORIGINS: Comma-separated list of allowed origins.
LOW_STOCK_THRESHOLD: Products at or below this count appear on the dashboard.
VITE_API_URL: Backend base URL. Baked into the frontend by Vite at build time.

Nothing is hardcoded. All of the above are read from environment variables. For local development they come from a .env file. On Render and Vercel they are set in each platform's dashboard.

