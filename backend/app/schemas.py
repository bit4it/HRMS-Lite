from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class EmployeeCreate(BaseModel):
    employee_id: str = Field(min_length=1, max_length=50)
    full_name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    department: str = Field(min_length=1, max_length=80)


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    model_config = ConfigDict(from_attributes=True)


class AttendanceCreate(BaseModel):
    employee_id: int
    date: date
    status: Literal["Present", "Absent"]


class AttendanceResponse(BaseModel):
    id: int
    employee_id: int
    date: date
    status: str

    model_config = ConfigDict(from_attributes=True)


class APIError(BaseModel):
    detail: str
