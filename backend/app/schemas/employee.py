from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


class EmployeeCreate(BaseModel):
    employee_id: str = Field(
        min_length=1, max_length=20, pattern=r"^[A-Za-z0-9-]+$"
    )
    full_name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    department: str = Field(min_length=1, max_length=50)

    @model_validator(mode="before")
    @classmethod
    def strip_strings(cls, values: Any) -> Any:
        if isinstance(values, dict):
            for key, value in values.items():
                if isinstance(value, str):
                    values[key] = value.strip()
        return values


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EmployeeListResponse(BaseModel):
    employees: list[EmployeeResponse]
    total: int
