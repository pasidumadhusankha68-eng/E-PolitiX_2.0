from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import text

from app.database import engine
from app.security import require_admin, require_role

router = APIRouter(prefix="/admin/dashboard", tags=["admin-dashboard"])


@router.get("/stats")
def get_stats(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        students_total = conn.execute(
            text("SELECT COUNT(*) FROM students WHERE is_active = TRUE")
        ).scalar() or 0

        new_this_week = conn.execute(
            text("""
                SELECT COUNT(*) FROM students
                WHERE created_at >= date_trunc('week', now())
            """)
        ).scalar() or 0

        tests_this_month = conn.execute(
            text("""
                SELECT COUNT(*) FROM exams
                WHERE test_date >= date_trunc('month', CURRENT_DATE)::date
                  AND test_date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
            """)
        ).scalar() or 0

        classes_count = conn.execute(
            text("""
                SELECT COUNT(DISTINCT class_id) FROM exams
                WHERE test_date >= date_trunc('month', CURRENT_DATE)::date
                  AND test_date < (date_trunc('month', CURRENT_DATE) + interval '1 month')::date
            """)
        ).scalar() or 0

        latest = conn.execute(
            text("""
                SELECT id, exam_name FROM exams
                ORDER BY exam_number DESC, test_date DESC
                LIMIT 1
            """)
        ).mappings().first()

        if latest is None:
            average_mark_last_test = None
            last_exam_name = None
        else:
            avg_row = conn.execute(
                text("""
                    SELECT ROUND(AVG(em.final_marks), 1) AS avg_mark
                    FROM exam_marks em
                    WHERE em.exam_id = :exam_id
                """),
                {"exam_id": latest["id"]},
            ).mappings().first()
            average_mark_last_test = avg_row["avg_mark"] if avg_row else None
            last_exam_name = latest["exam_name"]

    return {
        "students_total": int(students_total),
        "new_this_week": int(new_this_week),
        "new_this_week_since_monday": int(new_this_week),
        "tests_this_month": int(tests_this_month),
        "classes_count": int(classes_count),
        "average_mark_last_test": float(average_mark_last_test) if average_mark_last_test is not None else None,
        "last_exam_name": last_exam_name,
    }


@router.get("/average-by-institute")
def get_average_by_institute(user=Depends(require_role("admin", "superadmin"))):
    with engine.connect() as conn:
        institutes = conn.execute(
            text("SELECT id, name FROM institutes ORDER BY id")
        ).mappings().all()

        rows = conn.execute(
            text("""
                SELECT e.exam_number,
                       s.institute_id,
                       ROUND(AVG(m.final_marks)::numeric, 1) AS avg_mark
                FROM exam_marks m
                JOIN exams e ON e.id = m.exam_id
                JOIN students s ON s.id = m.student_id
                GROUP BY e.exam_number, s.institute_id
                ORDER BY e.exam_number
            """)
        ).mappings().all()

    # build {exam_number: {institute_id: average}}
    by_test = {}
    for r in rows:
        by_test.setdefault(r["exam_number"], {})[str(r["institute_id"])] = (
            float(r["avg_mark"]) if r["avg_mark"] is not None else None
        )

    tests = []
    for exam_number in sorted(by_test.keys()):
        averages = {str(i["id"]): by_test[exam_number].get(str(i["id"])) for i in institutes}
        tests.append({
            "exam_number": exam_number,
            "label": f"Test {exam_number}",
            "averages": averages,
        })

    return {
        "institutes": [{"id": i["id"], "name": i["name"]} for i in institutes],
        "tests": tests,
    }


@router.get("/registrations")
def get_registrations(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT date_trunc('week', created_at)::date AS week_start,
                       COUNT(*) AS count
                FROM students
                WHERE created_at >= (now() - interval '8 weeks')
                GROUP BY date_trunc('week', created_at)::date
                ORDER BY week_start
            """)
        ).mappings().all()

    week_map = {str(r["week_start"]): int(r["count"]) for r in rows}

    data = []
    for i in range(7, -1, -1):
        d = date.today() - timedelta(weeks=i)
        monday = d - timedelta(days=d.weekday())
        data.append({
            "week": f"W{8 - i}",
            "students": week_map.get(str(monday), 0),
        })

    return {"registrations": data}


@router.get("/attention")
def get_attention(current_user: dict = Depends(require_admin)):
    items = []

    with engine.connect() as conn:
        disabled = conn.execute(
            text("SELECT COUNT(*) FROM students WHERE is_active = FALSE")
        ).scalar() or 0
        if disabled:
            items.append({
                "id": "att-disabled",
                "text": f"{int(disabled)} account(s) are disabled",
                "to": "/admin/users",
                "level": "info",
            })

        classes_without_exams = conn.execute(
            text("""
                SELECT COUNT(*) FROM classes c
                WHERE NOT EXISTS (
                    SELECT 1 FROM exams e WHERE e.class_id = c.id
                )
            """)
        ).scalar() or 0
        if classes_without_exams:
            items.append({
                "id": "att-classes-no-exams",
                "text": f"{int(classes_without_exams)} class(es) still have no exam scheduled",
                "to": "/admin/classes",
                "level": "warning",
            })

        latest_exam_id = conn.execute(
            text("SELECT id FROM exams ORDER BY exam_number DESC, test_date DESC LIMIT 1")
        ).scalar()
        if latest_exam_id is not None:
            total_students = conn.execute(
                text("SELECT COUNT(*) FROM students WHERE is_active = TRUE")
            ).scalar() or 0
            marked = conn.execute(
                text("SELECT COUNT(DISTINCT student_id) FROM exam_marks WHERE exam_id = :exam_id"),
                {"exam_id": latest_exam_id},
            ).scalar() or 0
            missing_marks = max(0, int(total_students) - int(marked))
            if missing_marks:
                items.append({
                    "id": "att-missing-marks",
                    "text": f"Test {latest_exam_id}: {int(missing_marks)} mark(s) missing",
                    "to": "/admin/exams",
                    "level": "warning",
                })

    if not items:
        items.append({
            "id": "att-caught-up",
            "text": "All caught up",
            "to": "/admin/dashboard",
            "level": "info",
        })

    return {"attention": items}
