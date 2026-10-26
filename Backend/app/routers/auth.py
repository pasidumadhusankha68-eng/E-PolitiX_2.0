from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.database import engine
from app.schemas import LoginRequest, RegisterRequest
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(data: RegisterRequest):
    email = data.email.lower()
    try:
        # engine.begin() = one transaction: both inserts succeed or neither does
        with engine.begin() as conn:
            institute = conn.execute(
                text("SELECT 1 FROM institutes WHERE id = :id"),
                {"id": data.institute_id},
            ).first()
            if institute is None:
                raise HTTPException(status_code=400, detail="Unknown institute")

            user_id = conn.execute(
                text("""
                    INSERT INTO users (full_name, email, password_hash, role)
                    VALUES (:full_name, :email, :password_hash, 'student')
                    RETURNING id
                """),
                {
                    "full_name": data.full_name,
                    "email": email,
                    "password_hash": hash_password(data.password),
                },
            ).scalar_one()

            student_code = conn.execute(
                text("""
                    INSERT INTO students (user_id, institute_id, exam_year,
                        name_with_initials, address, school, gender, nic, mobile_number)
                    VALUES (:user_id, :institute_id, :exam_year,
                        :name_with_initials, :address, :school, :gender, :nic, :mobile)
                    RETURNING student_code
                """),
                {
                    "user_id": user_id,
                    "institute_id": data.institute_id,
                    "exam_year": data.exam_year,
                    "name_with_initials": data.name_with_initials,
                    "address": data.address,
                    "school": data.school,
                    "gender": data.gender,
                    "nic": data.nic.upper(),
                    "mobile": data.mobile,
                },
            ).scalar_one()
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="An account with these details already exists"
        )

    return {"message": "Registration successful", "student_code": student_code}


@router.post("/login")
def login(data: LoginRequest):
    with engine.connect() as conn:
        user = conn.execute(
            text("""
                SELECT id, full_name, password_hash, role, is_active
                FROM users WHERE email = :email
            """),
            {"email": data.email.lower()},
        ).mappings().first()

    # Same message for "no such email" and "wrong password" on purpose
    if user is None or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user["is_active"]:
        raise HTTPException(status_code=403, detail="This account is disabled")

    return {
        "access_token": create_access_token(user["id"], user["role"]),
        "token_type": "bearer",
        "role": user["role"],
        "full_name": user["full_name"],
    }


@router.get("/me")
def me(current: dict = Depends(get_current_user)):
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT u.id, u.full_name, u.email, u.role, s.student_code
                FROM users u
                LEFT JOIN students s ON s.user_id = u.id
                WHERE u.id = :id
            """),
            {"id": current["id"]},
        ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="User not found")
    return dict(row)