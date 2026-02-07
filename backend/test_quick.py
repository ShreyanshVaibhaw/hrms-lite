"""Quick smoke tests for HRMS Lite API endpoints."""

import sys

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

results = []
TEST_EMPLOYEE_ID = "TEST-001"


def run(name, fn):
    try:
        fn()
        results.append((name, "PASS"))
        print(f"  PASS  {name}")
    except AssertionError as e:
        results.append((name, "FAIL"))
        print(f"  FAIL  {name} — {e}")


def test_root():
    r = client.get("/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "HRMS Lite API" in r.json().get("message", "")


def test_health():
    r = client.get("/health")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert r.json().get("status") == "healthy"


def test_create_employee():
    r = client.post("/api/employees/", json={
        "employee_id": TEST_EMPLOYEE_ID,
        "full_name": "Test User",
        "email": "test@example.com",
        "department": "Engineering",
    })
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"


def test_create_employee_duplicate():
    r = client.post("/api/employees/", json={
        "employee_id": TEST_EMPLOYEE_ID,
        "full_name": "Test User",
        "email": "test@example.com",
        "department": "Engineering",
    })
    assert r.status_code == 409, f"Expected 409, got {r.status_code}: {r.text}"


def test_list_employees():
    r = client.get("/api/employees/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert "employees" in data
    assert isinstance(data["employees"], list)


def test_mark_attendance():
    from datetime import date
    r = client.post("/api/attendance/", json={
        "employee_id": TEST_EMPLOYEE_ID,
        "date": str(date.today()),
        "status": "Present",
    })
    assert r.status_code == 201, f"Expected 201, got {r.status_code}: {r.text}"


def test_dashboard():
    r = client.get("/api/dashboard/")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert "total_employees" in data


def test_delete_employee():
    r = client.delete(f"/api/employees/{TEST_EMPLOYEE_ID}")
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    data = r.json()
    assert "message" in data


if __name__ == "__main__":
    print("\nHRMS Lite — Quick Smoke Tests\n" + "=" * 40)

    run("GET /", test_root)
    run("GET /health", test_health)
    run("POST /api/employees (create)", test_create_employee)
    run("POST /api/employees (duplicate)", test_create_employee_duplicate)
    run("GET /api/employees (list)", test_list_employees)
    run("POST /api/attendance (mark)", test_mark_attendance)
    run("GET /api/dashboard", test_dashboard)
    run("DELETE /api/employees/{id}", test_delete_employee)

    print("=" * 40)
    passed = sum(1 for _, s in results if s == "PASS")
    total = len(results)
    print(f"\nResults: {passed}/{total} passed")

    if passed < total:
        sys.exit(1)
