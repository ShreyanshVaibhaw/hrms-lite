from sqlalchemy.orm import Session

from app.models.employee import Employee
from app.schemas.employee import EmployeeCreate
from app.exceptions import DuplicateEmployeeError, EmployeeNotFoundError


def create_employee(db: Session, employee_data: EmployeeCreate) -> Employee:
    if db.query(Employee).filter(Employee.employee_id == employee_data.employee_id).first():
        raise DuplicateEmployeeError(field="employee_id", value=employee_data.employee_id)

    if db.query(Employee).filter(Employee.email == employee_data.email).first():
        raise DuplicateEmployeeError(field="email", value=employee_data.email)

    employee = Employee(**employee_data.model_dump())
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
