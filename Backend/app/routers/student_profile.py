from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text

from app.database import engine
from app.security import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/student/profile", tags=["student-profile"])


def _current_month_colombo() -> date:
    return datetime.now(ZoneInfo("Asia/Colombo")).date().replace(day=1)


def _last_three_months() -> list[date]:
    today = _current_month_colombo()
    months = []
    for i in range(2, -1, -1):
        month = today
        for _ in range(i):
            first = month.replace(day=1)
            prev = first - timedelta(days=1)
            month = prev.replace(day=1)
        months.append(month)
    return months


class ProfileUpdate(BaseModel):
    email: EmailStr | None = Field(default=None)
    mobile_number: str | None = Field(default=None, pattern=r"^0\d{9}$")
    address: str | None = Field(default=None, min_length=3, max_length=200)
    school: str | None = Field(default=None, min_length=2, max_length=200)


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("")
def get_student_profile(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    student_id = current_user["id"]

    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT s.id AS student_id,
                       s.student_code,
                       u.full_name,
                       u.email,
                       s.name_with_initials,
                       i.name AS institute_name,
                       s.exam_year,
                       s.mobile_number,
                       s.address,
                       s.school,
                       s.gender,
                       s.nic,
                       s.created_at,
                       u.is_active
                FROM students s
                JOIN users u ON u.id = s.user_id
                LEFT JOIN institutes i ON i.id = s.institute_id
                WHERE s.user_id = :id
            """),
            {"id": student_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(status_code=404, detail="Student profile not found")

    profile = dict(row)

    with engine.connect() as conn:
        class_row = conn.execute(
            text("""
                SELECT c.name AS class_name
                FROM enrollments e
                JOIN classes c ON c.id = e.class_id
                WHERE e.student_id = :id
                ORDER BY e.enrolled_at ASC
                LIMIT 1
            """),
            {"id": row["student_id"]},
        ).mappings().first()
    profile["class_name"] = class_row["class_name"] if class_row else None

    months = _last_three_months()
    month_params = {f"m{i}": m for i, m in enumerate(months)}

    with engine.connect() as conn:
        payment_rows = conn.execute(
            text(f"""
                SELECT month, status
                FROM student_payments
                WHERE student_id = :id
                  AND month IN ({', '.join(f':m{i}' for i in range(3))})
            """),
            {"id": student_id, **month_params},
        ).mappings().all()

    paid_map = {}
    for r in payment_rows:
        if r["status"] == "paid":
            paid_map[r["month"].strftime("%Y-%m")] = "paid"

    payments = []
    for m in reversed(months):
        key = m.strftime("%Y-%m")
        payments.append({
            "month": key,
            "status": paid_map.get(key, "unpaid"),
        })

    profile["payments"] = payments

    return profile


@router.put("")
def update_student_profile(
    body: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    student_id = current_user["id"]

    email = body.email.lower() if body.email else None

    with engine.begin() as conn:
        student_row = conn.execute(
            text("""
                SELECT s.id, s.user_id
                FROM students s
                WHERE s.user_id = :id
            """),
            {"id": student_id},
        ).mappings().first()
        if student_row is None:
            raise HTTPException(status_code=404, detail="Student profile not found")

        user_id = student_row["user_id"]

        if email is not None:
            existing = conn.execute(
                text("SELECT 1 FROM users WHERE email = :email AND id != :id"),
                {"email": email, "id": user_id},
            ).first()
            if existing:
                raise HTTPException(
                    status_code=409, detail="An account with this email already exists"
                )
            conn.execute(
                text("UPDATE users SET email = :email WHERE id = :id"),
                {"email": email, "id": user_id},
            )

        if body.mobile_number is not None:
            conn.execute(
                text("UPDATE students SET mobile_number = :mobile WHERE id = :id"),
                {"mobile": body.mobile_number, "id": student_row["id"]},
            )
        if body.address is not None:
            conn.execute(
                text("UPDATE students SET address = :address WHERE id = :id"),
                {"address": body.address, "id": student_row["id"]},
            )
        if body.school is not None:
            conn.execute(
                text("UPDATE students SET school = :school WHERE id = :id"),
                {"school": body.school, "id": student_row["id"]},
            )

    return get_student_profile(current_user)


# Same password rules as RegisterRequest.password in app/schemas.py
MIN_PASSWORD_LEN = 8
MAX_PASSWORD_LEN = 72


@router.post("/password")
def change_password(
    body: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    new_password = body.new_password
    if len(new_password) < MIN_PASSWORD_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"String should have at least {MIN_PASSWORD_LEN} characters",
        )
    if len(new_password) > MAX_PASSWORD_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"String should have at most {MAX_PASSWORD_LEN} characters",
        )

    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT password_hash FROM users WHERE id = :id"),
            {"id": current_user["id"]},
        ).first()
        if row is None:
            raise HTTPException(status_code=404, detail="User not found")

        if not verify_password(body.current_password, row[0]):
            raise HTTPException(
                status_code=400, detail="Current password is incorrect"
            )

        if new_password == body.current_password:
            raise HTTPException(
                status_code=400, detail="New password must be different"
            )

        conn.execute(
            text("UPDATE users SET password_hash = :hash WHERE id = :id"),
            {
                "hash": hash_password(new_password),
                "id": current_user["id"],
            },
        )

    return {"message": "Password changed"}
