from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceListResponse,
    AttendanceSummary,
    BulkAttendanceCreate,
    BulkAttendanceResponse,
    DateAttendanceResponse,
    MonthSummaryResponse,
)
from app.crud.attendance import (
    mark_attendance,
    upsert_attendance,
    bulk_upsert_attendance,
    get_attendance_by_employee,
    get_attendance_summary,
    get_attendance_by_date,
    get_month_summary,
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


@router.put("/", response_model=AttendanceResponse)
def upsert(attendance_data: AttendanceCreate, db: Session = Depends(get_db)):
    try:
        return upsert_attendance(db, attendance_data)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/bulk", response_model=BulkAttendanceResponse)
def bulk_mark(payload: BulkAttendanceCreate, db: Session = Depends(get_db)):
    try:
        results, failed = bulk_upsert_attendance(db, payload.records)
        return BulkAttendanceResponse(
            success=len(results),
            failed=failed,
            results=results,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/date/{target_date}", response_model=DateAttendanceResponse)
def get_by_date(target_date: date, db: Session = Depends(get_db)):
    try:
        records = get_attendance_by_date(db, target_date)
        present = sum(1 for r in records if r.status == "Present")
        absent = sum(1 for r in records if r.status == "Absent")
        unmarked = sum(1 for r in records if r.status is None)
        return DateAttendanceResponse(
            date=target_date,
            records=records,
            present=present,
            absent=absent,
            unmarked=unmarked,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/calendar/{year}/{month}", response_model=MonthSummaryResponse)
def calendar_summary(year: int, month: int, db: Session = Depends(get_db)):
    try:
        days = get_month_summary(db, year, month)
        return MonthSummaryResponse(year=year, month=month, days=days)
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
