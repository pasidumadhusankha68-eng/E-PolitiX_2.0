from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Literal
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from app.database import engine
from app.security import get_current_user, hash_password, require_admin, require_role

router = APIRouter(prefix="/admin/users", tags=["admin-users"])


@router.get("/students")
def list_students(
    search: str = Query(""),
    institute_id: str | None = Query(None),
    exam_year: str | None = Query(None),
    status: str = Query("all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_admin),
):
    if status not in ("all", "active", "disabled"):
        raise HTTPException(status_code=400, detail="status must be all, active or disabled")

    inst_id = int(institute_id) if institute_id not in (None, "") else None
    year = int(exam_year) if exam_year not in (None, "") else None
    is_active = None if status == "all" else (status == "active")

    where = """
        WHERE (s.name_with_initials ILIKE :search
               OR s.student_code ILIKE :search
               OR s.mobile_number ILIKE :search)
          AND (:inst_id IS NULL OR s.institute_id = :inst_id)
          AND (:year IS NULL OR s.exam_year = :year)
          AND (:is_active IS NULL OR u.is_active = :is_active)
    """
    params = {
        "search": f"%{search.strip()}%",
        "inst_id": inst_id,
        "year": year,
        "is_active": is_active,
    }

    with engine.connect() as conn:
        total = conn.execute(
            text(f"""
                SELECT COUNT(*)
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                {where}
            """),
            params,
        ).scalar()

        offset = (page - 1) * page_size
        rows = conn.execute(
            text(f"""
                SELECT s.id, s.user_id, s.student_code,
                       s.name_with_initials AS name, i.name AS institute_name,
                       s.exam_year, s.mobile_number AS mobile, u.is_active
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                {where}
                ORDER BY s.exam_year DESC, s.seq_no
                LIMIT :limit OFFSET :offset
            """),
            {**params, "limit": page_size, "offset": offset},
        ).mappings().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [dict(r) for r in rows],
    }


@router.get("/students/{student_id}/preview")
def get_student_preview(
    student_id: int,
    current_user: dict = Depends(require_admin),
):
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT s.id AS id,
                       s.student_code AS student_code,
                       u.full_name AS name,
                       s.name_with_initials AS name_with_initials,
                       i.name AS institute_name,
                       s.exam_year AS exam_year,
                       u.is_active AS is_active
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                WHERE s.id = :student_id
            """),
            {"student_id": student_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")

    student = dict(row)

    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT e.id AS exam_id, e.exam_number, e.exam_name, e.test_date,
                       m.mcq_marks, m.essay_marks, m.final_marks
                FROM exam_marks m
                JOIN exams e ON e.id = m.exam_id
                WHERE m.student_id = :student_id
                ORDER BY e.exam_number ASC
            """),
            {"student_id": student_id},
        ).mappings().all()

    marks = [
        {
            "exam_id": r["exam_id"],
            "exam_number": r["exam_number"],
            "exam_name": r["exam_name"],
            "test_date": r["test_date"].isoformat() if r["test_date"] else None,
            "mcq_marks": float(r["mcq_marks"]) if r["mcq_marks"] is not None else None,
            "essay_marks": float(r["essay_marks"]) if r["essay_marks"] is not None else None,
            "final_marks": float(r["final_marks"]) if r["final_marks"] is not None else None,
        }
        for r in rows
    ]

    return {
        "student": student,
        "marks": marks,
    }


@router.get("/admins")
def list_admins(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT id, full_name, email
                FROM users
                WHERE role IN ('admin', 'superadmin')
                ORDER BY full_name
            """),
        ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/counts")
def get_counts(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        students = conn.execute(text("SELECT COUNT(*) FROM students")).scalar()
        admins = conn.execute(
            text("SELECT COUNT(*) FROM users WHERE role IN ('admin', 'superadmin')")
        ).scalar()
    return {"students": students, "admins": admins}


@router.get("/filters")
def get_filters(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        institutes = conn.execute(
            text("SELECT id, name FROM institutes ORDER BY name")
        ).mappings().all()
        years = conn.execute(
            text("SELECT DISTINCT exam_year FROM students ORDER BY exam_year DESC")
        ).scalars().all()
    return {
        "institutes": [dict(r) for r in institutes],
        "exam_years": years,
    }


@router.get("/students/{student_id}")
def get_student(student_id: int, current_user: dict = Depends(require_role("admin", "superadmin"))):
    return _get_student_detail(student_id)


def _get_student_detail(student_id: int) -> dict:
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT s.id, s.user_id, s.student_code,
                       u.full_name, u.email,
                       s.name_with_initials, s.institute_id,
                       i.name AS institute_name, s.exam_year,
                       s.mobile_number, s.nic, s.school, s.gender,
                       s.address, s.created_at, u.is_active
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                WHERE s.id = :id
            """),
            {"id": student_id},
        ).mappings().first()
    if row is None:
        raise HTTPException(status_code=404, detail="Student not found")

    student = dict(row)

    with engine.connect() as conn:
        payment = conn.execute(
            text("""
                SELECT status
                FROM student_payments
                WHERE student_id = :id
                  AND month = date_trunc('month', CURRENT_DATE)
                  AND status = 'paid'
            """),
            {"id": student_id},
        ).first()
        student["payment_status"] = "paid" if payment else "unpaid"

        results = conn.execute(
            text("""
                SELECT e.exam_number, e.exam_name,
                       em.mcq_marks, em.essay_marks, em.final_marks
                FROM exam_marks em
                JOIN exams e ON e.id = em.exam_id
                WHERE em.student_id = :id
                ORDER BY e.exam_number
            """),
            {"id": student_id},
        ).mappings().all()
        student["results"] = [dict(r) for r in results]

    return student


class StatusUpdate(BaseModel):
    is_active: bool


@router.patch("/students/{student_id}/status")
def set_student_status(
    student_id: int,
    body: StatusUpdate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.begin() as conn:
        row = conn.execute(
            text("SELECT s.id, s.user_id FROM students s WHERE s.id = :id"),
            {"id": student_id},
        ).first()
        if row is None:
            raise HTTPException(status_code=404, detail="Student not found")
        user_id = row[1]
        conn.execute(
            text("UPDATE users SET is_active = :is_active WHERE id = :id"),
            {"is_active": body.is_active, "id": user_id},
        )
        conn.execute(
            text("UPDATE students SET is_active = :is_active WHERE id = :id"),
            {"is_active": body.is_active, "id": student_id},
        )
    return {"id": student_id, "is_active": body.is_active}


class StudentUpdate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    name_with_initials: str = Field(min_length=2, max_length=100)
    email: EmailStr
    institute_id: int
    exam_year: int = Field(ge=2000, le=2100)
    mobile: str = Field(pattern=r"^0\d{9}$")
    nic: str = Field(pattern=r"^(\d{12})$")
    school: str | None = Field(default=None, min_length=2, max_length=200)
    gender: Literal["Male", "Female"] | None = None
    address: str | None = Field(default=None, min_length=3, max_length=200)
    new_password: str | None = None


@router.put("/students/{student_id}")
def update_student(
    student_id: int,
    body: StudentUpdate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    email = body.email.lower()
    try:
        with engine.begin() as conn:
            row = conn.execute(
                text("SELECT s.id, s.user_id FROM students s WHERE s.id = :id"),
                {"id": student_id},
            ).mappings().first()
            if row is None:
                raise HTTPException(status_code=404, detail="Student not found")
            user_id = row["user_id"]

            institute = conn.execute(
                text("SELECT 1 FROM institutes WHERE id = :id"),
                {"id": body.institute_id},
            ).first()
            if institute is None:
                raise HTTPException(status_code=400, detail="Unknown institute")

            existing = conn.execute(
                text("SELECT 1 FROM users WHERE email = :email AND id != :id"),
                {"email": email, "id": user_id},
            ).first()
            if existing:
                raise HTTPException(
                    status_code=409, detail="An account with these details already exists"
                )

            if body.new_password and body.new_password.strip():
                conn.execute(
                    text("""
                        UPDATE users
                        SET full_name = :full_name, email = :email,
                            password_hash = :password_hash
                        WHERE id = :id
                    """),
                    {
                        "full_name": body.full_name,
                        "email": email,
                        "password_hash": hash_password(body.new_password),
                        "id": user_id,
                    },
                )
            else:
                conn.execute(
                    text("""
                        UPDATE users
                        SET full_name = :full_name, email = :email
                        WHERE id = :id
                    """),
                    {
                        "full_name": body.full_name,
                        "email": email,
                        "id": user_id,
                    },
                )

            conn.execute(
                text("""
                    UPDATE students
                    SET name_with_initials = :name_with_initials,
                        institute_id = :institute_id, exam_year = :exam_year,
                        mobile_number = :mobile, nic = :nic,
                        school = :school, gender = :gender, address = :address
                    WHERE id = :id
                """),
                {
                    "name_with_initials": body.name_with_initials,
                    "institute_id": body.institute_id,
                    "exam_year": body.exam_year,
                    "mobile": body.mobile,
                    "nic": body.nic.upper(),
                    "school": body.school,
                    "gender": body.gender,
                    "address": body.address,
                    "id": student_id,
                },
            )
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="An account with these details already exists"
        )

    return _get_student_detail(student_id)


class StudentCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    name_with_initials: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    mobile: str = Field(pattern=r"^0\d{9}$")
    nic: str = Field(pattern=r"^(\d{12})$")
    institute_id: int
    exam_year: int = Field(ge=2000, le=2100)
    school: str | None = Field(default=None, min_length=2, max_length=200)
    gender: Literal["Male", "Female"] | None = None
    address: str | None = Field(default=None, min_length=3, max_length=200)


@router.post("/students", status_code=201)
def create_student(
    body: StudentCreate, current_user: dict = Depends(require_role("admin", "superadmin"))
):
    email = body.email.lower()
    try:
        # engine.begin() = one transaction: both inserts succeed or neither does
        with engine.begin() as conn:
            institute = conn.execute(
                text("SELECT 1 FROM institutes WHERE id = :id"),
                {"id": body.institute_id},
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
                    "full_name": body.full_name,
                    "email": email,
                    "password_hash": hash_password(body.password),
                },
            ).scalar_one()

            student = conn.execute(
                text("""
                    INSERT INTO students (user_id, institute_id, exam_year,
                        name_with_initials, address, school, gender, nic, mobile_number)
                    VALUES (:user_id, :institute_id, :exam_year,
                        :name_with_initials, :address, :school, :gender, :nic, :mobile)
                    RETURNING id, student_code
                """),
                {
                    "user_id": user_id,
                    "institute_id": body.institute_id,
                    "exam_year": body.exam_year,
                    "name_with_initials": body.name_with_initials,
                    "address": body.address,
                    "school": body.school,
                    "gender": body.gender,
                    "nic": body.nic.upper(),
                    "mobile": body.mobile,
                },
            ).mappings().first()
    except IntegrityError:
        raise HTTPException(
            status_code=409, detail="An account with these details already exists"
        )

    return {"id": student["id"], "student_code": student["student_code"]}

