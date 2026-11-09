from datetime import date

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/exams", tags=["admin-exams"])

MAX_MARKS = 100


class MarkEntry(BaseModel):
    student_id: int
    mcq_marks: float | None = None
    essay_marks: float | None = None


class MarksUpdate(BaseModel):
    marks: List[MarkEntry] = []


class ExamCreate(BaseModel):
    class_id: int | None = None
    exam_number: int | None = None
    exam_name: str | None = None
    test_date: date | None = None


@router.get("/classes")
def list_classes(current_user: dict = Depends(require_role("admin", "superadmin"))):
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT c.id, c.name, c.exam_year,
                       (SELECT i.name
                          FROM institutes i
                          JOIN students s ON s.institute_id = i.id
                          JOIN enrollments e ON e.student_id = s.id
                         WHERE e.class_id = c.id
                         LIMIT 1) AS institute_name
                FROM classes c
                ORDER BY c.exam_year DESC, c.name
            """)
        ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/tests")
def list_tests(
    class_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if class_id is None:
        return []
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT e.id, e.exam_number, e.exam_name, e.test_date,
                       (SELECT COUNT(*) FROM enrollments en
                          WHERE en.class_id = :class_id) AS students_total,
                       (SELECT COUNT(*) FROM exam_marks em
                          WHERE em.exam_id = e.id AND em.marks IS NOT NULL) AS marks_entered
                FROM exams e
                WHERE e.class_id = :class_id
                ORDER BY e.exam_number DESC
            """),
            {"class_id": class_id},
        ).mappings().all()
    return [dict(r) for r in rows]


@router.post("/tests", status_code=201)
def create_test(
    body: ExamCreate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    class_id = body.class_id
    if class_id is None:
        raise HTTPException(status_code=400, detail="class_id is required")

    with engine.begin() as conn:
        class_row = conn.execute(
            text("SELECT 1 FROM classes WHERE id = :id"),
            {"id": class_id},
        ).first()
        if class_row is None:
            raise HTTPException(status_code=400, detail="Unknown class")

        if body.exam_number is None:
            exam_number = int(
                conn.execute(
                    text("""
                        SELECT COALESCE(MAX(exam_number), 0) + 1
                        FROM exams WHERE class_id = :class_id
                    """),
                    {"class_id": class_id},
                ).scalar()
            )
        else:
            exam_number = body.exam_number

        exists = conn.execute(
            text("""
                SELECT 1 FROM exams
                WHERE class_id = :class_id AND exam_number = :exam_number
            """),
            {"class_id": class_id, "exam_number": exam_number},
        ).first()
        if exists:
            raise HTTPException(
                status_code=409,
                detail=f"Exam number {exam_number} already exists for this class",
            )

        exam_name = body.exam_name or f"Test {exam_number}"

        row = conn.execute(
            text("""
                INSERT INTO exams (class_id, exam_number, exam_name, test_date)
                VALUES (:class_id, :exam_number, :exam_name, COALESCE(:test_date, CURRENT_DATE))
                RETURNING id, class_id, exam_number, exam_name, test_date
            """),
            {
                "class_id": class_id,
                "exam_number": exam_number,
                "exam_name": exam_name,
                "test_date": body.test_date,
            },
        ).mappings().first()

    return dict(row)


@router.put("/tests/{exam_id}/marks")
def update_exam_marks(
    exam_id: int,
    body: MarksUpdate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.begin() as conn:
        exam = conn.execute(
            text("SELECT id, class_id FROM exams WHERE id = :id"),
            {"id": exam_id},
        ).mappings().first()
        if exam is None:
            raise HTTPException(status_code=404, detail="Exam not found")
        class_id = exam["class_id"]

        valid_student_ids = {
            row[0]
            for row in conn.execute(
                text("""
                    SELECT s.id
                    FROM students s
                    JOIN users u ON u.id = s.user_id
                    JOIN enrollments en ON en.student_id = s.id
                    WHERE en.class_id = :class_id
                      AND u.is_active = TRUE
                """),
                {"class_id": class_id},
            ).all()
        }

        for entry in body.marks:
            if entry.student_id not in valid_student_ids:
                raise HTTPException(
                    status_code=400,
                    detail=f"Student {entry.student_id} is not in this class",
                )
            for field_name, value in (
                ("mcq_marks", entry.mcq_marks),
                ("essay_marks", entry.essay_marks),
            ):
                if value is not None:
                    if not isinstance(value, (int, float)) or isinstance(value, bool):
                        raise HTTPException(
                            status_code=400,
                            detail=f"Student {entry.student_id}: {field_name} must be a number",
                        )
                    if value < 0 or value > MAX_MARKS:
                        raise HTTPException(
                            status_code=400,
                            detail=f"Student {entry.student_id}: {field_name} must be between 0 and {MAX_MARKS}",
                        )

        saved = 0
        for entry in body.marks:
            if entry.mcq_marks is None and entry.essay_marks is None:
                conn.execute(
                    text("""
                        DELETE FROM exam_marks
                        WHERE exam_id = :exam_id AND student_id = :student_id
                    """),
                    {"exam_id": exam_id, "student_id": entry.student_id},
                )
            else:
                conn.execute(
                    text("""
                        INSERT INTO exam_marks (exam_id, student_id, mcq_marks, essay_marks)
                        VALUES (:exam_id, :student_id, :mcq_marks, :essay_marks)
                        ON CONFLICT (exam_id, student_id)
                        DO UPDATE SET
                            mcq_marks = EXCLUDED.mcq_marks,
                            essay_marks = EXCLUDED.essay_marks
                    """),
                    {
                        "exam_id": exam_id,
                        "student_id": entry.student_id,
                        "mcq_marks": entry.mcq_marks,
                        "essay_marks": entry.essay_marks,
                    },
                )
                saved += 1

        marks_entered = conn.execute(
            text("""
                SELECT COUNT(*) FROM exam_marks
                WHERE exam_id = :exam_id
                  AND mcq_marks IS NOT NULL
                  AND essay_marks IS NOT NULL
            """),
            {"exam_id": exam_id},
        ).scalar() or 0

        students_total = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN enrollments en ON en.student_id = s.id
                WHERE en.class_id = :class_id
                  AND u.is_active = TRUE
            """),
            {"class_id": class_id},
        ).scalar() or 0

    return {
        "saved": saved,
        "marks_entered": int(marks_entered),
        "students_total": int(students_total),
    }


@router.post("/tests/{exam_id}/marks/import")
def import_exam_marks(
    exam_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    MAX_FILE_BYTES = 1024 * 1024

    with engine.begin() as conn:
        exam = conn.execute(
            text("SELECT id, class_id FROM exams WHERE id = :id"),
            {"id": exam_id},
        ).mappings().first()
        if exam is None:
            raise HTTPException(status_code=404, detail="Exam not found")
        class_id = exam["class_id"]

        raw = file.file.read()
        if len(raw) > MAX_FILE_BYTES:
            raise HTTPException(
                status_code=413, detail="File too large (max 1 MB)"
            )

        import csv, io
        text_stream = io.TextIOWrapper(io.BytesIO(raw), encoding="utf-8")
        reader = csv.reader(text_stream)

        try:
            header = next(reader)
        except StopIteration:
            raise HTTPException(
                status_code=400, detail="CSV file is empty"
            )

        header = [h.strip() for h in header]
        if header != ["student_code", "mcq_marks", "essay_marks"]:
            raise HTTPException(
                status_code=400,
                detail="CSV header must be: student_code,mcq_marks,essay_marks",
            )

        matched = []
        errors = []
        line_no = 2

        valid_students = {}
        for row in conn.execute(
            text("""
                SELECT s.id, s.student_code
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN enrollments en ON en.student_id = s.id
                WHERE en.class_id = :class_id
                  AND u.is_active = TRUE
            """),
            {"class_id": class_id},
        ).all():
            valid_students[row[1]] = row[0]

        for fields in reader:
            if not fields or all(f.strip() == "" for f in fields):
                line_no += 1
                continue

            if len(fields) < 3:
                errors.append({
                    "line": line_no,
                    "student_code": (fields[0] if fields else ""),
                    "message": "Row must have student_code, mcq_marks, essay_marks",
                })
                line_no += 1
                continue

            student_code = fields[0].strip()
            mcq_raw = fields[1].strip()
            essay_raw = fields[2].strip()

            student_id = valid_students.get(student_code)
            if student_id is None:
                errors.append({
                    "line": line_no,
                    "student_code": student_code,
                    "message": "Student not found in this class",
                })
                line_no += 1
                continue

            mcq = None
            essay = None
            if mcq_raw != "":
                try:
                    mcq = float(mcq_raw)
                except ValueError:
                    errors.append({
                        "line": line_no,
                        "student_code": student_code,
                        "message": "mcq_marks must be numeric",
                    })
                    line_no += 1
                    continue
            if essay_raw != "":
                try:
                    essay = float(essay_raw)
                except ValueError:
                    errors.append({
                        "line": line_no,
                        "student_code": student_code,
                        "message": "essay_marks must be numeric",
                    })
                    line_no += 1
                    continue

            matched.append({
                "student_id": student_id,
                "student_code": student_code,
                "mcq_marks": mcq,
                "essay_marks": essay,
            })
            line_no += 1

    return {"matched": matched, "errors": errors}


@router.get("/tests/{exam_id}/marks")
def get_exam_marks(
    exam_id: int,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.connect() as conn:
        exam = conn.execute(
            text("""
                SELECT e.id, e.exam_number, e.exam_name, e.test_date, e.class_id,
                       c.name AS class_name
                FROM exams e
                JOIN classes c ON c.id = e.class_id
                WHERE e.id = :exam_id
            """),
            {"exam_id": exam_id},
        ).mappings().first()
        if exam is None:
            raise HTTPException(status_code=404, detail="Exam not found")

        class_id = exam["class_id"]

        students_total = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN enrollments en ON en.student_id = s.id
                WHERE en.class_id = :class_id
                  AND u.is_active = TRUE
            """),
            {"class_id": class_id},
        ).scalar() or 0

        marks_entered = conn.execute(
            text("""
                SELECT COUNT(*) FROM exam_marks WHERE exam_id = :exam_id
            """),
            {"exam_id": exam_id},
        ).scalar() or 0

        rows = conn.execute(
            text("""
                SELECT s.id AS student_id, s.student_code,
                       s.name_with_initials AS name,
                       em.mcq_marks, em.essay_marks, em.final_marks
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN enrollments en ON en.student_id = s.id
                LEFT JOIN exam_marks em ON em.student_id = s.id
                                         AND em.exam_id = :exam_id
                WHERE en.class_id = :class_id
                  AND u.is_active = TRUE
                ORDER BY s.student_code
            """),
            {"exam_id": exam_id, "class_id": class_id},
        ).mappings().all()

    return {
        "exam": dict(exam),
        "students_total": int(students_total),
        "marks_entered": int(marks_entered),
        "rows": [dict(r) for r in rows],
    }
