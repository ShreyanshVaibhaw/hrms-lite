from app.routers.employees import router as employees_router
from app.routers.attendance import router as attendance_router
from app.routers.dashboard import router as dashboard_router

__all__ = ["employees_router", "attendance_router", "dashboard_router"]
