from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import Employee
from app.schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, db: Session = Depends(get_db)) -> Employee:
    exists = db.query(Employee).filter(
        or_(Employee.employee_id == payload.employee_id, Employee.email == payload.email)
    ).first()
    if exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with same employee_id or email already exists.",
        )

    employee = Employee(
        employee_id=payload.employee_id.strip(),
        full_name=payload.full_name.strip(),
        email=payload.email.strip().lower(),
        department=payload.department.strip(),
    )
    db.add(employee)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with same employee_id or email already exists.",
        )
    db.refresh(employee)
    return employee


@router.get("", response_model=list[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)) -> list[Employee]:
    return db.query(Employee).order_by(Employee.id.desc()).all()


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)) -> None:
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found.")

    db.delete(employee)
    db.commit()
