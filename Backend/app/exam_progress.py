from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text

from app.database import engine
from app.routers.auth import get_current_user

router = APIRouter(prefix="/student", tags=["student"])


@router.get("/exam-progress")
def exam_progress(user=Depends(get_current_user)):
    with engine.connect() as conn:
        student = conn.execute(
            text("SELECT id FROM students WHERE user_id = :uid"),
            {"uid": user["id"]},
        ).mappings().first()

        if not student:
            raise HTTPException(404, "Student profile not found for this user")

        rows = conn.execute(
            text("""
                SELECT e.id AS exam_id, e.exam_number, e.exam_name, e.test_date,
                       m.mcq_marks, m.essay_marks, m.final_marks
                FROM exam_marks m
                JOIN exams e ON e.id = m.exam_id
                WHERE m.student_id = :sid
                ORDER BY e.exam_number ASC
            """),
            {"sid": student["id"]},
        ).mappings().all()

    results = [
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

    finals = [r["final_marks"] for r in results if r["final_marks"] is not None]

    return {
        "current_average_mark": round(sum(finals) / len(finals), 1) if finals else None,
        "current_highest_mark": max(finals) if finals else None,
        "last_result": results[-1] if results else None,
        "results": results,
    }


@router.get("/all-students-marks")
def all_students_marks(user=Depends(get_current_user)):
    """Return every student's exam marks for the per-student progress graph."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT u.full_name,
                       s.student_code,
                       e.exam_name,
                       e.exam_number,
                       m.mcq_marks,
                       m.essay_marks,
                       m.final_marks
                FROM exam_marks m
                JOIN students s ON s.id = m.student_id
                JOIN users u ON u.id = s.user_id
                JOIN exams e ON e.id = m.exam_id
                ORDER BY u.full_name ASC, e.exam_number ASC
            """),
        ).mappings().all()

    students = defaultdict(lambda: {"name": "", "code": "", "exams": []})
    for r in rows:
        key = r["student_code"] or r["full_name"]
        if not students[key]["name"]:
            students[key]["name"] = r["full_name"]
            students[key]["code"] = r["student_code"]
        students[key]["exams"].append({
            "exam_name": r["exam_name"],
            "exam_number": r["exam_number"],
            "mcq_marks": float(r["mcq_marks"]) if r["mcq_marks"] is not None else None,
            "essay_marks": float(r["essay_marks"]) if r["essay_marks"] is not None else None,
            "final_marks": float(r["final_marks"]) if r["final_marks"] is not None else None,
        })

    return {"students": list(students.values())}