from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/sidebar", tags=["admin-sidebar"])

COLOMBO = ZoneInfo("Asia/Colombo")


@router.get("/counts")
def get_sidebar_counts(current_user: dict = Depends(require_role("admin", "superadmin"))):
    month_start = datetime.now(COLOMBO).date().replace(day=1)

    with engine.connect() as conn:
        payments_unpaid = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM students s
                JOIN users u ON u.id = s.user_id
                WHERE u.is_active = TRUE
                  AND NOT EXISTS (
                    SELECT 1 FROM student_payments sp
                    WHERE sp.student_id = s.id
                      AND sp.month = :month
                      AND sp.status = 'paid'
                  )
            """),
            {"month": month_start},
        ).scalar() or 0

        exams_incomplete = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM exams e
                WHERE (
                    SELECT COUNT(*)
                    FROM enrollments en
                    JOIN students s ON s.id = en.student_id
                    JOIN users u ON u.id = s.user_id
                    WHERE en.class_id = e.class_id
                      AND u.is_active = TRUE
                ) - (
                    SELECT COUNT(*)
                    FROM exam_marks m
                    WHERE m.exam_id = e.id
                      AND m.mcq_marks IS NOT NULL
                      AND m.essay_marks IS NOT NULL
                ) > 0
            """)
        ).scalar() or 0

    return {
        "payments_unpaid": int(payments_unpaid),
        "exams_incomplete": int(exams_incomplete),
    }
