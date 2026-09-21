# Maha Mandai MVP

Monorepo for Maha Mandai online agriculture and grocery delivery platform.

## Stack
- Frontend: Next.js + TypeScript + Tailwind CSS
- Backend: FastAPI + SQLModel + Alembic
- Database: PostgreSQL
- Auth: Mobile + OTP + JWT
- Containerization: Docker Compose

## Quick Start
1. Copy `.env.example` to `.env`.
2. Run `docker compose up --build`.
3. Backend API docs: `http://localhost:8000/docs`
4. Frontend app: `http://localhost:3000`

## Database and Seed
- Migrations are executed automatically in docker startup.
- To run manually:
	- `cd apps/backend && alembic upgrade head`
	- `cd apps/backend && python seed.py`

## Customer Flow URLs
- Home: `/en`
- Login: `/en/login`
- Products: `/en/products`
- Addresses: `/en/addresses`
- Cart: `/en/cart`
- Checkout: `/en/checkout`
- Orders: `/en/orders`

## Current Status
- Initial implementation scaffold in progress.
- OTP auth and core domain models are included in the first build.
