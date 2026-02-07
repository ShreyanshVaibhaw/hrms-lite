from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, field_validator


class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: Literal["Present", "Absent"]

    @field_validator("date")
    @classmethod
    def date_not_in_future(cls, v: date) -> date:
        if v > date.today():
            raise ValueError("Attendance date cannot be in the future")
        return v


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AttendanceListResponse(BaseModel):
    records: list[AttendanceResponse]
    total: int


class AttendanceSummary(BaseModel):
    employee_id: str
    full_name: str
    total_days: int
    present_days: int
    absent_days: int
