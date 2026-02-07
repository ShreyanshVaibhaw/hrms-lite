# HRMS Lite

A lightweight Human Resource Management System for managing employee records and tracking daily attendance.

## Live Demo

- **Frontend:** [https://hrms-lite.vercel.app](https://hrms-lite.vercel.app)
- **Backend API:** [https://hrms-lite-api.onrender.com](https://hrms-lite-api.onrender.com)

> The backend is hosted on Render's free tier and may take 30-60 seconds to wake up on the first request.

## Tech Stack

| Layer    | Technology   |
| -------- | ------------ |
| Backend  | FastAPI      |
| Frontend | React        |
| Database | PostgreSQL   |
| Styling  | Tailwind CSS |
| Hosting  | Render + Vercel |

## Features

- Employee directory with full CRUD operations (create, read, update, delete)
- Daily attendance tracking (mark present / absent per employee per day)
- Dashboard with summary statistics (total, present, absent, unmarked)
- Filter attendance records by date range
- Input validation and sanitization
- Responsive design with mobile-friendly sidebar navigation
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

## Environment Variables

### Backend

| Variable          | Description                                  | Example                                          |
| ----------------- | -------------------------------------------- | ------------------------------------------------ |
| `DATABASE_URL`    | PostgreSQL connection string                 | `postgresql://user:pass@host:5432/hrms_lite`     |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `https://hrms-lite.vercel.app,http://localhost:5173` |

### Frontend

| Variable        | Description                  | Example                                    |
| --------------- | ---------------------------- | ------------------------------------------ |
| `VITE_API_URL`  | Base URL of the backend API  | `https://hrms-lite-api.onrender.com`       |

## Deployment

### 1. Database (Neon.tech)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string (it will look like `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`)

### 2. Backend (Render)

1. Push the repository to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Connect your GitHub repository
4. Set the **Root Directory** to `backend`
5. Set the **Build Command** to `pip install -r requirements.txt`
6. Set the **Start Command** to `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables:
   - `DATABASE_URL` — paste the Neon.tech connection string
   - `ALLOWED_ORIGINS` — set to your Vercel frontend URL (e.g., `https://hrms-lite.vercel.app`)
8. Deploy

### 3. Frontend (Vercel)

1. Create a new project on [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Set the **Root Directory** to `frontend`
4. Set the **Framework Preset** to Vite
5. Add the environment variable:
   - `VITE_API_URL` — set to your Render backend URL (e.g., `https://hrms-lite-api.onrender.com`)
6. Deploy

## Project Structure

```
hrms-lite/
├── backend/
│   ├── app/
│   │   ├── crud/           # Database operations
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── config.py       # Settings and environment config
│   │   ├── database.py     # Database connection setup
│   │   ├── exceptions.py   # Custom exception classes
│   │   └── main.py         # FastAPI application entry point
│   ├── Procfile            # Render deployment config
│   ├── render.yaml         # Render service definition
│   ├── requirements.txt    # Python dependencies
│   └── runtime.txt         # Python version for deployment
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page-level components
│   │   ├── services/       # API client
│   │   ├── App.jsx         # Root component with routing
│   │   └── main.jsx        # Application entry point
│   ├── vercel.json         # Vercel rewrite rules for SPA
│   └── package.json        # Node.js dependencies
└── README.md
```

## Assumptions

- Single-tenant deployment (one organization per instance).
- Authentication and role-based access control are out of scope for the initial version.
- Attendance is tracked per calendar day with one record per employee per day.
- The database schema uses UTC timestamps throughout.
