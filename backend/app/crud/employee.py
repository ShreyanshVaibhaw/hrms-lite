from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate
from app.exceptions import DuplicateEmployeeError, EmployeeNotFoundError


def create_employee(db: Session, employee_data: EmployeeCreate) -> Employee:
    cleaned = employee_data.model_dump()
    cleaned["employee_id"] = cleaned["employee_id"].strip()
    cleaned["full_name"] = cleaned["full_name"].strip()
    cleaned["email"] = cleaned["email"].strip().lower()
    cleaned["department"] = cleaned["department"].strip()

    if db.query(Employee).filter(Employee.employee_id == cleaned["employee_id"]).first():
        raise DuplicateEmployeeError(field="employee_id", value=cleaned["employee_id"])

    if db.query(Employee).filter(Employee.email == cleaned["email"]).first():
        raise DuplicateEmployeeError(field="email", value=cleaned["email"])

    employee = Employee(**cleaned)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def get_all_employees(db: Session) -> list[Employee]:
    return db.query(Employee).order_by(Employee.created_at.desc()).all()


def get_employee_by_id(db: Session, employee_id: str) -> Employee:
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise EmployeeNotFoundError(employee_id)
    return employee


def delete_employee(db: Session, employee_id: str) -> Employee:
    employee = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not employee:
        raise EmployeeNotFoundError(employee_id)
    db.delete(employee)
    db.commit()
    return employee
