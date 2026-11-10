import csv
import io

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/results", tags=["admin-results"])

_INST_FILTER = "AND (:institute_id IS NULL OR s.institute_id = :institute_id)"


@router.get("/filters")
def get_filters(
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.connect() as conn:
        institutes = conn.execute(
            text("SELECT id, name FROM institutes ORDER BY name")
        ).mappings().all()
        years = conn.execute(
            text("SELECT DISTINCT exam_year FROM classes ORDER BY exam_year DESC")
        ).mappings().all()
    return {
        "institutes": [dict(r) for r in institutes],
        "exam_years": [r["exam_year"] for r in years],
    }


@router.get("/tests")
def get_tests(
    exam_year: int,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT DISTINCT ON (e.exam_number)
                       e.exam_number, e.exam_name, e.test_date
                FROM exams e
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                ORDER BY e.exam_number DESC, e.test_date DESC NULLS LAST, e.id DESC
            """),
            {"exam_year": exam_year},
        ).mappings().all()
    return [dict(r) for r in rows]


@router.get("/summary")
def get_summary(
    exam_year: int,
    exam_number: int,
    institute_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    params = {
        "exam_year": exam_year,
        "exam_number": exam_number,
        "institute_id": institute_id,
    }

    with engine.connect() as conn:
        students_total = conn.execute(
            text(f"""
                SELECT COUNT(DISTINCT s.id)
                FROM students s
                JOIN enrollments en ON en.student_id = s.id
                JOIN classes c ON c.id = en.class_id
                WHERE c.exam_year = :exam_year {_INST_FILTER}
            """),
            params,
        ).scalar() or 0

        students_marked = conn.execute(
            text(f"""
                SELECT COUNT(DISTINCT em.student_id)
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                  AND e.exam_number = :exam_number
                  AND em.mcq_marks IS NOT NULL
                  AND em.essay_marks IS NOT NULL
                  {_INST_FILTER}
            """),
            params,
        ).scalar() or 0

        class_average = conn.execute(
            text(f"""
                SELECT ROUND(AVG(em.final_marks)::numeric, 1)
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                  AND e.exam_number = :exam_number
                  AND em.final_marks IS NOT NULL
                  {_INST_FILTER}
            """),
            params,
        ).scalar()

        prev_number = conn.execute(
            text("""
                SELECT MAX(e2.exam_number)
                FROM exams e2
                JOIN classes c2 ON c2.id = e2.class_id
                WHERE c2.exam_year = :exam_year
                  AND e2.exam_number < :exam_number
            """),
            {"exam_year": exam_year, "exam_number": exam_number},
        ).scalar()

        prev_average = None
        if prev_number is not None:
            prev_average = conn.execute(
                text(f"""
                    SELECT ROUND(AVG(em.final_marks)::numeric, 1)
                    FROM exam_marks em
                    JOIN students s ON s.id = em.student_id
                    JOIN exams e ON e.id = em.exam_id
                    JOIN classes c ON c.id = e.class_id
                    WHERE c.exam_year = :exam_year
                      AND e.exam_number = :prev_number
                      AND em.final_marks IS NOT NULL
                      {_INST_FILTER}
                """),
                {**params, "prev_number": prev_number},
            ).scalar()

        average_vs_previous = None
        if class_average is not None and prev_average is not None:
            average_vs_previous = round(
                float(class_average) - float(prev_average), 1
            )

        highest_row = conn.execute(
            text(f"""
                SELECT em.final_marks AS mark, s.student_code
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                  AND e.exam_number = :exam_number
                  AND em.final_marks IS NOT NULL
                  {_INST_FILTER}
                ORDER BY em.final_marks DESC, s.student_code
                LIMIT 1
            """),
            params,
        ).mappings().first()

        lowest_row = conn.execute(
            text(f"""
                SELECT em.final_marks AS mark, s.student_code
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                  AND e.exam_number = :exam_number
                  AND em.final_marks IS NOT NULL
                  {_INST_FILTER}
                ORDER BY em.final_marks ASC, s.student_code
                LIMIT 1
            """),
            params,
        ).mappings().first()

    highest = (
        {"mark": float(highest_row["mark"]), "student_code": highest_row["student_code"]}
        if highest_row is not None
        else None
    )
    lowest = (
        {"mark": float(lowest_row["mark"]), "student_code": lowest_row["student_code"]}
        if lowest_row is not None
        else None
    )

    return {
        "students_marked": int(students_marked),
        "students_total": int(students_total),
        "missing": int(students_total) - int(students_marked),
        "class_average": float(class_average) if class_average is not None else None,
        "average_vs_previous": average_vs_previous,
        "highest": highest,
        "lowest": lowest,
    }


@router.get("/rank-list")
def get_rank_list(
    exam_year: int,
    view: str = "single",
    exam_number: int | None = None,
    institute_id: int | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 10,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if view not in ("single", "average"):
        raise HTTPException(status_code=400, detail="view must be 'single' or 'average'")
    if view == "single" and exam_number is None:
        raise HTTPException(status_code=400, detail="exam_number is required when view is 'single'")
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 1
    if page_size > 100:
        page_size = 100
    offset = (page - 1) * page_size

    common = {
        "exam_year": exam_year,
        "institute_id": institute_id,
        "search": (f"%{search}%" if search is not None else None),
        "limit": page_size,
        "offset": offset,
    }

    if view == "single":
        common["exam_number"] = exam_number
        marked_sql = """
            SELECT s.id AS student_id, s.student_code, s.name_with_initials,
                   s.institute_id, i.name AS institute_name,
                   em.mcq_marks, em.essay_marks, em.final_marks,
                   1 AS tests_counted
            FROM exam_marks em
            JOIN students s ON s.id = em.student_id
            JOIN exams e ON e.id = em.exam_id
            JOIN classes c ON c.id = e.class_id
            JOIN institutes i ON i.id = s.institute_id
            WHERE c.exam_year = :exam_year
              AND e.exam_number = :exam_number
        """
        tests_counted = 1
    else:
        marked_sql = """
            SELECT student_id, student_code, name_with_initials, institute_id, institute_name,
                   ROUND(AVG(mcq_marks)::numeric, 1) AS mcq_marks,
                   ROUND(AVG(essay_marks)::numeric, 1) AS essay_marks,
                   ROUND(AVG(final_marks)::numeric, 1) AS final_marks,
                   COUNT(DISTINCT exam_id) AS tests_counted
            FROM (
                SELECT s.id AS student_id, s.student_code, s.name_with_initials,
                       s.institute_id, i.name AS institute_name,
                       em.mcq_marks, em.essay_marks, em.final_marks,
                       e.id AS exam_id
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                JOIN institutes i ON i.id = s.institute_id
                WHERE c.exam_year = :exam_year
            ) raw
            GROUP BY student_id, student_code, name_with_initials, institute_id, institute_name
        """
        tests_counted = None  # resolved for 'average' inside the connection block below

    full_sql = f"""
        WITH marked AS ({marked_sql}),
        ranked AS (
            SELECT *,
                   RANK() OVER (ORDER BY final_marks DESC NULLS LAST) AS overall_rank,
                   RANK() OVER (PARTITION BY institute_id ORDER BY final_marks DESC NULLS LAST) AS institute_rank
            FROM marked
        ),
        filtered AS (
            SELECT * FROM ranked
            WHERE (:institute_id IS NULL OR institute_id = :institute_id)
              AND (:search IS NULL OR name_with_initials ILIKE :search OR student_code ILIKE :search)
        )
        SELECT COUNT(*) AS total FROM filtered
    """
    with engine.connect() as conn:
        if view == "average":
            tests_counted = int(
                conn.execute(
                    text("""
                        SELECT COUNT(DISTINCT e.id)
                        FROM exams e
                        JOIN classes c ON c.id = e.class_id
                        WHERE c.exam_year = :exam_year
                    """),
                    {"exam_year": exam_year},
                ).scalar()
                or 0
            )
        total_row = conn.execute(text(full_sql), common).mappings().first()
        total = int(total_row["total"]) if total_row else 0

        items_sql = f"""
            WITH marked AS ({marked_sql}),
            ranked AS (
                SELECT *,
                       RANK() OVER (ORDER BY final_marks DESC NULLS LAST) AS overall_rank,
                       RANK() OVER (PARTITION BY institute_id ORDER BY final_marks DESC NULLS LAST) AS institute_rank
                FROM marked
            ),
            filtered AS (
                SELECT * FROM ranked
                WHERE (:institute_id IS NULL OR institute_id = :institute_id)
                  AND (:search IS NULL OR name_with_initials ILIKE :search OR student_code ILIKE :search)
            )
            SELECT overall_rank, institute_rank, student_id, student_code,
                   name_with_initials AS name, institute_name,
                   mcq_marks, essay_marks, final_marks, tests_counted
            FROM filtered
            ORDER BY overall_rank, student_code
            LIMIT :limit OFFSET :offset
        """
        rows = conn.execute(text(items_sql), common).mappings().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "tests_counted": tests_counted,
        "items": [
            {
                "overall_rank": int(r["overall_rank"]),
                "institute_rank": int(r["institute_rank"]),
                "student_id": int(r["student_id"]),
                "student_code": r["student_code"],
                "name": r["name"],
                "institute_name": r["institute_name"],
                "mcq_marks": float(r["mcq_marks"]) if r["mcq_marks"] is not None else None,
                "essay_marks": float(r["essay_marks"]) if r["essay_marks"] is not None else None,
                "final_marks": float(r["final_marks"]) if r["final_marks"] is not None else None,
            }
            for r in rows
        ],
    }


def _validate(view: str, exam_number: int | None) -> None:
    if view not in ("single", "average"):
        raise HTTPException(status_code=400, detail="view must be 'single' or 'average'")
    if view == "single" and exam_number is None:
        raise HTTPException(status_code=400, detail="exam_number is required when view is 'single'")


def _marked_sql(view: str, exam_number: int | None) -> str:
    if view == "single":
        return """
            SELECT s.id AS student_id, s.student_code, s.name_with_initials,
                   s.institute_id, i.name AS institute_name,
                   em.mcq_marks, em.essay_marks, em.final_marks,
                   1 AS tests_counted
            FROM exam_marks em
            JOIN students s ON s.id = em.student_id
            JOIN exams e ON e.id = em.exam_id
            JOIN classes c ON c.id = e.class_id
            JOIN institutes i ON i.id = s.institute_id
            WHERE c.exam_year = :exam_year
              AND e.exam_number = :exam_number
              AND em.final_marks IS NOT NULL
        """
    return """
        SELECT student_id, student_code, name_with_initials, institute_id, institute_name,
               ROUND(AVG(mcq_marks)::numeric, 1) AS mcq_marks,
               ROUND(AVG(essay_marks)::numeric, 1) AS essay_marks,
               ROUND(AVG(final_marks)::numeric, 1) AS final_marks,
               COUNT(DISTINCT exam_id) AS tests_counted
        FROM (
            SELECT s.id AS student_id, s.student_code, s.name_with_initials,
                   s.institute_id, i.name AS institute_name,
                   em.mcq_marks, em.essay_marks, em.final_marks,
                   e.id AS exam_id
            FROM exam_marks em
            JOIN students s ON s.id = em.student_id
            JOIN exams e ON e.id = em.exam_id
            JOIN classes c ON c.id = e.class_id
            JOIN institutes i ON i.id = s.institute_id
            WHERE c.exam_year = :exam_year
              AND em.final_marks IS NOT NULL
        ) raw
        GROUP BY student_id, student_code, name_with_initials, institute_id, institute_name
    """


def _fetch_ranked(view: str, exam_year: int, exam_number: int | None, institute_id: int | None):
    params = {"exam_year": exam_year, "exam_number": exam_number, "institute_id": institute_id}
    marked = _marked_sql(view, exam_number)
    sql = f"""
        WITH marked AS ({marked}),
        ranked AS (
            SELECT *,
                   RANK() OVER (ORDER BY final_marks DESC NULLS LAST) AS overall_rank,
                   RANK() OVER (PARTITION BY institute_id ORDER BY final_marks DESC NULLS LAST) AS institute_rank
            FROM marked
        ),
        filtered AS (
            SELECT * FROM ranked
            WHERE (:institute_id IS NULL OR institute_id = :institute_id)
        )
        SELECT overall_rank, institute_rank, student_id, student_code,
               name_with_initials AS name, institute_name,
               mcq_marks, essay_marks, final_marks, tests_counted
        FROM filtered
        ORDER BY overall_rank, student_code
    """
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
    return [dict(r) for r in rows]


@router.get("/distribution")
def get_distribution(
    exam_year: int,
    view: str = "single",
    exam_number: int | None = None,
    institute_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    _validate(view, exam_number)
    params = {"exam_year": exam_year, "exam_number": exam_number, "institute_id": institute_id}
    if view == "single":
        marked = """
            SELECT s.institute_id, em.final_marks
            FROM exam_marks em
            JOIN students s ON s.id = em.student_id
            JOIN exams e ON e.id = em.exam_id
            JOIN classes c ON c.id = e.class_id
            WHERE c.exam_year = :exam_year
              AND e.exam_number = :exam_number
              AND em.final_marks IS NOT NULL
        """
    else:
        marked = """
            SELECT student_id, institute_id, ROUND(AVG(final_marks)::numeric, 1) AS final_marks
            FROM (
                SELECT s.id AS student_id, s.institute_id, em.final_marks
                FROM exam_marks em
                JOIN students s ON s.id = em.student_id
                JOIN exams e ON e.id = em.exam_id
                JOIN classes c ON c.id = e.class_id
                WHERE c.exam_year = :exam_year
                  AND em.final_marks IS NOT NULL
            ) raw
            GROUP BY student_id, institute_id
        """
    sql = f"""
        WITH marked AS ({marked}),
        filtered AS (
            SELECT * FROM marked
            WHERE (:institute_id IS NULL OR institute_id = :institute_id)
        ),
        bucketed AS (
            SELECT final_marks,
                   CASE
                     WHEN final_marks >= 80 THEN '80-100'
                     WHEN final_marks >= 60 THEN '60-79'
                     WHEN final_marks >= 40 THEN '40-59'
                     WHEN final_marks >= 20 THEN '20-39'
                     ELSE '0-19'
                   END AS label
            FROM filtered
        ),
        counts AS (
            SELECT label, COUNT(*) AS cnt FROM bucketed GROUP BY label
        )
        SELECT b.label, COALESCE(c.cnt, 0) AS count
        FROM (VALUES ('80-100',1), ('60-79',2), ('40-59',3), ('20-39',4), ('0-19',5))
             AS b(label, ord)
        LEFT JOIN counts c ON c.label = b.label
        ORDER BY b.ord
    """
    total_sql = f"""
        WITH marked AS ({marked}),
        filtered AS (
            SELECT * FROM marked
            WHERE (:institute_id IS NULL OR institute_id = :institute_id)
        )
        SELECT COUNT(*) FROM filtered
    """
    with engine.connect() as conn:
        rows = conn.execute(text(sql), params).mappings().all()
        total = conn.execute(text(total_sql), params).scalar() or 0
    return {
        "buckets": [{"label": r["label"], "count": int(r["count"])} for r in rows],
        "total": int(total),
    }


@router.get("/export.csv")
def export_csv(
    exam_year: int,
    view: str = "single",
    exam_number: int | None = None,
    institute_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    _validate(view, exam_number)
    rows = _fetch_ranked(view, exam_year, exam_number, institute_id)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow([
        "overall_rank", "institute_rank", "student_code", "name",
        "institute", "mcq_marks", "essay_marks", "final_marks",
    ])
    for r in rows:
        writer.writerow([
            r["overall_rank"], r["institute_rank"], r["student_code"], r["name"],
            r["institute_name"],
            r["mcq_marks"], r["essay_marks"], r["final_marks"],
        ])
    filename = f"results_{exam_year}_{view}.csv"
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export.pdf")
def export_pdf(
    exam_year: int,
    view: str = "single",
    exam_number: int | None = None,
    institute_id: int | None = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    _validate(view, exam_number)
    params = {"exam_year": exam_year, "exam_number": exam_number, "institute_id": institute_id}
    rows = _fetch_ranked(view, exam_year, exam_number, institute_id)

    with engine.connect() as conn:
        test_name = None
        if view == "single":
            test_name = conn.execute(
                text("""
                    SELECT DISTINCT e.exam_name
                    FROM exams e
                    JOIN classes c ON c.id = e.class_id
                    WHERE c.exam_year = :exam_year AND e.exam_number = :exam_number
                """),
                params,
            ).scalar()
        inst_name = None
        if institute_id is not None:
            inst_name = conn.execute(
                text("SELECT name FROM institutes WHERE id = :id"),
                {"id": institute_id},
            ).scalar()

    title = test_name or "Average of all tests"
    title = f"{title} — Year {exam_year}"
    if inst_name:
        title += f" — Institute: {inst_name}"
    elif institute_id is not None:
        title += f" — Institute ID: {institute_id}"

    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        from reportlab.lib.styles import getSampleStyleSheet
    except ImportError:
        raise HTTPException(
            status_code=500, detail="reportlab is not installed (pip install reportlab)"
        )

    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4, leftMargin=18, rightMargin=18, topMargin=18, bottomMargin=18,
        title=title, author="E-PolitiX",
    )
    styles = getSampleStyleSheet()
    elements = [Paragraph(title, styles["Title"]), Spacer(1, 12)]

    header = ["Rank", "Inst. Rank", "Student Code", "Name", "Institute", "MCQ", "Essay", "Final"]
    data = [header]
    for r in rows:
        data.append([
            str(r["overall_rank"]), str(r["institute_rank"]), r["student_code"], r["name"],
            r["institute_name"],
            "" if r["mcq_marks"] is None else str(r["mcq_marks"]),
            "" if r["essay_marks"] is None else str(r["essay_marks"]),
            "" if r["final_marks"] is None else str(r["final_marks"]),
        ])
    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1e3a8a")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f1f5f9")]),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (1, -1), "CENTER"),
        ("ALIGN", (5, 0), (-1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(table)
    doc.build(elements)
    pdf = buf.getvalue()
    filename = f"results_{exam_year}_{view}.pdf"
    return Response(
        content=pdf,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
