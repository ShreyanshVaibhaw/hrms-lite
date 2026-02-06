from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    __table_args__ = (
        UniqueConstraint("employee_id", "date", name="uq_employee_date"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(
        String(20),
        ForeignKey("employees.employee_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False)
    status = Column(String(10), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    employee = relationship("Employee", back_populates="attendance_records")
