from datetime import date

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.attendance import Attendance
from app.schemas.attendance import AttendanceCreate, AttendanceSummary
from app.exceptions import (
    DuplicateAttendanceError,
    EmployeeNotFoundError,
)


def mark_attendance(db: Session, attendance_data: AttendanceCreate) -> Attendance:
    employee = (
        db.query(Employee)
        .filter(Employee.employee_id == attendance_data.employee_id)
        .first()
    )
    if not employee:
        raise EmployeeNotFoundError(attendance_data.employee_id)

    existing = (
        db.query(Attendance)
        .filter(
            Attendance.employee_id == attendance_data.employee_id,
            Attendance.date == attendance_data.date,
        )
        .first()
    )
    if existing:
        raise DuplicateAttendanceError(
            attendance_data.employee_id, str(attendance_data.date)
        )

    record = Attendance(**attendance_data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_attendance_by_employee(
    db: Session,
    employee_id: str,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[Attendance]:
    employee = (
        db.query(Employee).filter(Employee.employee_id == employee_id).first()
    )
    if not employee:
        raise EmployeeNotFoundError(employee_id)

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)

    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)

    return query.order_by(Attendance.date.desc()).all()


def get_attendance_summary(db: Session, employee_id: str) -> AttendanceSummary:
    employee = (
        db.query(Employee).filter(Employee.employee_id == employee_id).first()
    )
    if not employee:
        raise EmployeeNotFoundError(employee_id)

    records = (
        db.query(Attendance).filter(Attendance.employee_id == employee_id).all()
    )

    total_days = len(records)
    present_days = sum(1 for r in records if r.status == "Present")
    absent_days = sum(1 for r in records if r.status == "Absent")

    return AttendanceSummary(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        total_days=total_days,
        present_days=present_days,
        absent_days=absent_days,
    )
