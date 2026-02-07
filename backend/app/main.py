import logging
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import engine, Base
from app.routers.employees import router as employees_router
from app.routers.attendance import router as attendance_router
from app.routers.dashboard import router as dashboard_router

import app.models  # noqa: F401 — ensure models are registered before create_all

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


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
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info("%s %s", request.method, request.url.path)
    response = await call_next(request)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    if errors:
        first = errors[0]
        field = " -> ".join(str(loc) for loc in first.get("loc", []) if loc != "body")
        msg = first.get("msg", "Invalid value")
        detail = f"Field '{field}': {msg}" if field else msg
    else:
        detail = "Validation error"
    return JSONResponse(status_code=422, content={"detail": detail})


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s:\n%s", request.method, request.url.path, traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
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
