class EmployeeNotFoundError(Exception):
    def __init__(self, employee_id: str) -> None:
        self.employee_id = employee_id
        super().__init__(f"Employee not found: {employee_id}")


class DuplicateEmployeeError(Exception):
    def __init__(self, field: str, value: str) -> None:
        self.field = field
        self.value = value
        super().__init__(f"Employee with {field} '{value}' already exists")


class DuplicateAttendanceError(Exception):
    def __init__(self, employee_id: str, date: str) -> None:
        self.employee_id = employee_id
        self.date = date
        super().__init__(
            f"Attendance already recorded for employee {employee_id} on {date}"
        )


class ValidationError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)
