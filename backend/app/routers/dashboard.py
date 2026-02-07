from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class DashboardResponse(BaseModel):
    total_employees: int
    present_today: int
    absent_today: int
    unmarked_today: int


@router.get("/", response_model=DashboardResponse)
def dashboard_stats(db: Session = Depends(get_db)):
    try:
        IST = timezone(timedelta(hours=5, minutes=30))
        today = datetime.now(IST).date()

        total_employees = db.query(Employee).count()
        present_today = (
            db.query(Attendance)
            .filter(Attendance.date == today, Attendance.status == "Present")
            .count()
        )
        absent_today = (
            db.query(Attendance)
            .filter(Attendance.date == today, Attendance.status == "Absent")
            .count()
        )
        unmarked_today = total_employees - present_today - absent_today

        return DashboardResponse(
            total_employees=total_employees,
            present_today=present_today,
            absent_today=absent_today,
            unmarked_today=unmarked_today,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
