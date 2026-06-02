<<<<<<< HEAD
# InvenTrack — Inventory & Order Management System

A production-ready, fully containerized full-stack application for managing products, customers, and orders with real-time inventory tracking.

## Tech Stack

| Layer          | Technology                     |
|----------------|-------------------------------|
| **Frontend**   | React (Vite)                  |
| **Backend**    | Python / FastAPI              |
| **Database**   | PostgreSQL 16                 |
| **Containers** | Docker + Docker Compose       |
| **Deployment** | Render (backend) + Vercel (frontend) |

## Features

- **Product Management** — CRUD operations with unique SKU enforcement
- **Customer Management** — CRUD with unique email validation
- **Order Management** — Create orders with automatic stock deduction, cancel with stock restoration
- **Dashboard** — Real-time stats: total products, customers, orders, low-stock alerts
- **Business Logic** — Inventory validation, auto-calculated totals, proper error handling
- **Responsive UI** — Dark theme, mobile-friendly, toast notifications

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── database.py      # SQLAlchemy configuration
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/         # API route handlers
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/api.js       # Axios API layer
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Router setup
│   │   └── index.css        # Design system
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── .env.example
```

## Quick Start (Docker)

### Prerequisites
- Docker & Docker Compose installed

### Run

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-name>

# Copy environment variables
cp .env.example .env

# Build and start all services
docker-compose up --build
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

## Local Development (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Set environment variable
set DATABASE_URL=postgresql://admin:changeme@localhost:5432/inventory_db

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Products
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | `/products/`      | Create product      |
| GET    | `/products/`      | List all products   |
| GET    | `/products/{id}`  | Get product by ID   |
| PUT    | `/products/{id}`  | Update product      |
| DELETE | `/products/{id}`  | Delete product      |

### Customers
| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| POST   | `/customers/`      | Create customer      |
| GET    | `/customers/`      | List all customers   |
| GET    | `/customers/{id}`  | Get customer by ID   |
| DELETE | `/customers/{id}`  | Delete customer      |

### Orders
| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| POST   | `/orders/`      | Create order (deducts stock)       |
| GET    | `/orders/`      | List all orders                    |
| GET    | `/orders/{id}`  | Get order details                  |
| DELETE | `/orders/{id}`  | Cancel order (restores stock)      |

### Dashboard
| Method | Endpoint       | Description         |
|--------|----------------|---------------------|
| GET    | `/dashboard/`  | Summary statistics  |

## Business Rules

1. Product SKU must be unique
2. Customer email must be unique
3. Product quantity cannot be negative
4. Orders cannot be placed if inventory is insufficient
5. Creating an order automatically reduces available stock
6. Cancelling an order restores stock
7. Total order amount is calculated automatically by the backend

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment instructions.

## Environment Variables

| Variable           | Description                        | Default                  |
|--------------------|------------------------------------|--------------------------|
| `DATABASE_URL`     | PostgreSQL connection string       | —                        |
| `CORS_ORIGINS`     | Allowed CORS origins (comma-sep)   | `http://localhost:3000`  |
| `POSTGRES_DB`      | Database name                      | `inventory_db`           |
| `POSTGRES_USER`    | Database user                      | `admin`                  |
| `POSTGRES_PASSWORD`| Database password                  | —                        |
| `VITE_API_URL`     | Backend API URL for frontend       | `http://localhost:8000`  |

## License

MIT
=======
# TechnicalAssessment
>>>>>>> b7fb799f509248e248ee82ec7627fff0e3287c69
