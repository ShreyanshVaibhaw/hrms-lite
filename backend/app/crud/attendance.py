import calendar
from datetime import date

from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.models.attendance import Attendance
from app.schemas.attendance import (
    AttendanceCreate,
    AttendanceSummary,
    DateAttendanceRecord,
    MonthSummaryDay,
)
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


def upsert_attendance(db: Session, attendance_data: AttendanceCreate) -> Attendance:
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
        existing.status = attendance_data.status
        db.commit()
        db.refresh(existing)
        return existing

    record = Attendance(**attendance_data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def bulk_upsert_attendance(
    db: Session, records: list[AttendanceCreate]
) -> tuple[list[Attendance], int]:
    results = []
    failed = 0
    for item in records:
        try:
            result = upsert_attendance(db, item)
            results.append(result)
        except Exception:
            failed += 1
    return results, failed


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


def get_attendance_by_date(
    db: Session, target_date: date
) -> list[DateAttendanceRecord]:
    employees = db.query(Employee).order_by(Employee.employee_id).all()
    attendance_map = {}

    records = db.query(Attendance).filter(Attendance.date == target_date).all()
    for r in records:
        attendance_map[r.employee_id] = (r.status, r.id)

    result = []
    for emp in employees:
        status_info = attendance_map.get(emp.employee_id)
        result.append(
            DateAttendanceRecord(
                employee_id=emp.employee_id,
                full_name=emp.full_name,
                department=emp.department,
                status=status_info[0] if status_info else None,
                attendance_id=status_info[1] if status_info else None,
            )
        )
    return result


def get_month_summary(
    db: Session, year: int, month: int
) -> list[MonthSummaryDay]:
    _, last_day = calendar.monthrange(year, month)
    start = date(year, month, 1)
    end = date(year, month, last_day)

    records = (
        db.query(Attendance)
        .filter(Attendance.date >= start, Attendance.date <= end)
        .all()
    )

    day_map: dict[date, dict[str, int]] = {}
    for r in records:
        if r.date not in day_map:
            day_map[r.date] = {"present": 0, "absent": 0}
        if r.status == "Present":
            day_map[r.date]["present"] += 1
        else:
            day_map[r.date]["absent"] += 1

    result = []
    for d, counts in sorted(day_map.items()):
        result.append(
            MonthSummaryDay(
                date=d,
                present=counts["present"],
                absent=counts["absent"],
            )
        )
    return result
