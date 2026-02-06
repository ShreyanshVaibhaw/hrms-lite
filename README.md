# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Tech Stack

| Layer    | Technology     |
| -------- | -------------- |
| Backend  | FastAPI        |
| Frontend | React          |
| Database | PostgreSQL     |
| Styling  | Tailwind CSS   |

## Features

- Employee directory with full CRUD operations (create, read, update, delete)
- Daily attendance tracking (check-in / check-out)
- Dashboard with summary statistics
- Filter and search across employee records
- RESTful API with automatic OpenAPI documentation

## Run Locally

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # edit with your database credentials
uvicorn app.main:app --reload
```

The API server starts at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

## API Documentation

Once the backend is running, interactive API docs are available at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Deployment

1. Provision a PostgreSQL database and set `DATABASE_URL` in your environment.
2. Run Alembic migrations: `alembic upgrade head`
3. Serve the backend behind a reverse proxy (e.g., Nginx) with Uvicorn workers.
4. Build the frontend (`npm run build`) and serve the `dist/` folder via a static file server or CDN.

## Assumptions

- Single-tenant deployment (one organization per instance).
- Authentication and role-based access control are out of scope for the initial version.
- Attendance is tracked per calendar day with one check-in and one check-out per employee.
- The database schema uses UTC timestamps throughout.
