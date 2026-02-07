from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.employee import EmployeeCreate, EmployeeResponse, EmployeeListResponse
from app.crud.employee import (
    create_employee,
    get_all_employees,
    get_employee_by_id,
    delete_employee,
)
from app.exceptions import EmployeeNotFoundError, DuplicateEmployeeError

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create(employee_data: EmployeeCreate, db: Session = Depends(get_db)):
    try:
        return create_employee(db, employee_data)
    except DuplicateEmployeeError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/", response_model=EmployeeListResponse)
def list_all(db: Session = Depends(get_db)):
    try:
        employees = get_all_employees(db)
        return EmployeeListResponse(employees=employees, total=len(employees))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_one(employee_id: str, db: Session = Depends(get_db)):
    try:
        return get_employee_by_id(db, employee_id)
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.delete("/{employee_id}")
def delete(employee_id: str, db: Session = Depends(get_db)):
    try:
        delete_employee(db, employee_id)
        return {"message": f"Employee {employee_id} deleted successfully"}
    except EmployeeNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
