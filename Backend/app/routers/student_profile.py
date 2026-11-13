from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import text

from app.database import engine
from app.security import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/student", tags=["student-profile"])


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


@router.get("/profile")
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


@router.get("/top-students")
def get_top_students(
    response: Response,
    view: str | None = None,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    response.headers["Cache-Control"] = "private, max-age=60"

    view = (view or "latest").strip().lower()
    if view not in ("latest", "average"):
        view = "latest"

    with engine.connect() as conn:
        viewer = conn.execute(
            text("""
                SELECT s.id AS student_id, s.exam_year
                FROM students s
                JOIN users u ON u.id = s.user_id
                WHERE u.id = :id
            """),
            {"id": current_user["id"]},
        ).mappings().first()

        if viewer is None:
            raise HTTPException(status_code=404, detail="Student profile not found")

        exam_year = viewer["exam_year"]
        base_filters = """
            c.exam_year = :year
            AND s.exam_year = :year
            AND u.is_active
            AND em.final_marks IS NOT NULL
        """

        test = None
        rows = []

        if view == "latest":
            total = conn.execute(
                text("""
                    SELECT COUNT(*)
                    FROM students s
                    JOIN users u ON u.id = s.user_id
                    WHERE s.exam_year = :year AND u.is_active
                """),
                {"year": exam_year},
            ).scalar()

            mark_counts = conn.execute(
                text(f"""
                    SELECT ex.exam_number AS exam_number, COUNT(*) AS cnt
                    FROM exam_marks em
                    JOIN exams ex ON ex.id = em.exam_id
                    JOIN classes c ON c.id = ex.class_id
                    JOIN students s ON s.id = em.student_id
                    JOIN users u ON u.id = s.user_id
                    WHERE {base_filters}
                    GROUP BY ex.exam_number
                """),
                {"year": exam_year},
            ).mappings().all()

            chosen = None
            if total and total > 0:
                for r in sorted(mark_counts, key=lambda x: x["exam_number"], reverse=True):
                    if r["cnt"] * 100 >= total * 80:
                        chosen = r["exam_number"]
                        break
            if chosen is None and mark_counts:
                chosen = max(r["exam_number"] for r in mark_counts)

            if chosen is not None:
                test_row = conn.execute(
                    text("""
                        SELECT ex.exam_number, ex.exam_name, ex.test_date
                        FROM exams ex
                        JOIN classes c ON c.id = ex.class_id
                        WHERE c.exam_year = :year AND ex.exam_number = :num
                        ORDER BY ex.id
                        LIMIT 1
                    """),
                    {"year": exam_year, "num": chosen},
                ).mappings().first()
                if test_row is not None:
                    test = {
                        "exam_number": test_row["exam_number"],
                        "exam_name": test_row["exam_name"],
                        "test_date": test_row["test_date"].isoformat(),
                    }

                rows = conn.execute(
                    text(f"""
                        SELECT s.id AS student_id, s.student_code,
                               s.name_with_initials AS name,
                               i.name AS institute_name,
                               em.final_marks AS mark,
                               RANK() OVER (ORDER BY em.final_marks DESC) AS place
                        FROM exam_marks em
                        JOIN exams ex ON ex.id = em.exam_id
                        JOIN classes c ON c.id = ex.class_id
                        JOIN students s ON s.id = em.student_id
                        LEFT JOIN institutes i ON i.id = s.institute_id
                        JOIN users u ON u.id = s.user_id
                        WHERE {base_filters}
                          AND ex.exam_number = :num
                    """),
                    {"year": exam_year, "num": chosen},
                ).mappings().all()
        else:
            rows = conn.execute(
                text(f"""
                    WITH student_avg AS (
                        SELECT s.id AS student_id, s.student_code,
                               s.name_with_initials AS name,
                               i.name AS institute_name,
                               ROUND(AVG(em.final_marks), 1) AS mark
                        FROM exam_marks em
                        JOIN exams ex ON ex.id = em.exam_id
                        JOIN classes c ON c.id = ex.class_id
                        JOIN students s ON s.id = em.student_id
                        LEFT JOIN institutes i ON i.id = s.institute_id
                        JOIN users u ON u.id = s.user_id
                        WHERE {base_filters}
                        GROUP BY s.id, s.student_code, s.name_with_initials, i.name
                    )
                    SELECT student_id, student_code, name, institute_name, mark,
                           RANK() OVER (ORDER BY mark DESC) AS place
                    FROM student_avg
                    ORDER BY place ASC, name ASC
                """),
                {"year": exam_year},
            ).mappings().all()

    items = []
    for r in rows:
        place = r["place"]
        if place is None or place > 3:
            continue
        items.append({
            "place": place,
            "name": r["name"],
            "institute_name": r["institute_name"],
            "mark": float(r["mark"]),
            "code_masked": (r["student_code"] or "")[:6] + "****",
            "is_me": r["student_id"] == viewer["student_id"],
        })

    items.sort(key=lambda x: (x["place"], x["name"]))
    items = items[:6]

    return {
        "view": view,
        "exam_year": exam_year,
        "test": test,
        "items": items,
    }


@router.put("/profile")
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


@router.post("/profile/password")
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
