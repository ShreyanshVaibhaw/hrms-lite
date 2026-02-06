from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceSummary,
)
from app.crud.attendance import (
    mark_attendance,
    get_attendance_by_employee,
    get_attendance_summary,
)
from app.exceptions import (
    EmployeeNotFoundError,
    DuplicateAttendanceError,
)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark(attendance_data: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        return mark_attendance(db, attendance_data)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except DuplicateAttendanceError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{employee_id}", response_model=AttendanceListResponse)
def get_records(
    employee_id: str,
    date_from: date | None = Query(default=None),
    date_to: date | None = Query(default=None),
    db: Session = Depends(get_db),
):
    try:
        records = get_attendance_by_employee(db, employee_id, date_from, date_to)
        return AttendanceListResponse(records=records, total=len(records))
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{employee_id}/summary", response_model=AttendanceSummary)
def summary(employee_id: str, db: Session = Depends(get_db)):
    try:
        return get_attendance_summary(db, employee_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
