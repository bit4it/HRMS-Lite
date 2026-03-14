from datetime import date

from fastapi import Depends, FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from sqlalchemy.orm import Session

from app.db.database import Base, engine, get_db
from app.models import Attendance, Employee
from app.routers import attendance, employees

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/summary")
def get_summary(db: Session = Depends(get_db)) -> dict:
    today = date.today()
    total_employees = db.query(Employee).count()
    present_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Present")
        .count()
    )
    absent_today = (
        db.query(Attendance)
        .filter(Attendance.date == today, Attendance.status == "Absent")
        .count()
    )
    total_departments = db.query(Employee.department).distinct().count()
    return {
        "total_employees": total_employees,
        "present_today": present_today,
        "absent_today": absent_today,
        "total_departments": total_departments,
    }


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else {"msg": "Invalid request."}
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_error.get("msg", "Invalid request.")},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(_request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Unexpected server error: {str(exc)}"},
    )


app.include_router(employees.router)
app.include_router(attendance.router)
