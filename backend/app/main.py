from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers.employees import router as employees_router
from app.routers.attendance import router as attendance_router
from app.routers.dashboard import router as dashboard_router

import app.models  # noqa: F401 — ensure models are registered before create_all


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="HRMS Lite API",
    description="API for managing employee records and tracking attendance",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees_router)
app.include_router(attendance_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "HRMS Lite API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
