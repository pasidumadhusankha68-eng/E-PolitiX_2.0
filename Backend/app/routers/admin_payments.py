import re
from datetime import date, datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/payments", tags=["admin-payments"])

COLOMBO = ZoneInfo("Asia/Colombo")


def parse_month(value: str) -> date:
    """'2026-11' -> date(2026, 11, 1)"""
    if not re.fullmatch(r"\d{4}-(0[1-9]|1[0-2])", value or ""):
        raise HTTPException(status_code=400, detail="month must be YYYY-MM")
    return date(int(value[:4]), int(value[5:7]), 1)


@router.get("/filters")
def get_filters(current_user: dict = Depends(require_role("admin", "superadmin"))):
    with engine.connect() as conn:
        institutes = conn.execute(
            text("SELECT id, name FROM institutes ORDER BY name")
        ).mappings().all()
        years = conn.execute(
            text("SELECT DISTINCT exam_year FROM students ORDER BY exam_year DESC")
        ).scalars().all()
    return {
        "institutes": [{"id": r["id"], "name": r["name"]} for r in institutes],
        "exam_years": list(years),
    }


@router.get("")
def list_payments(
    month: str | None = Query(None),
    search: str = Query(""),
    institute_id: str | None = Query(None),
    exam_year: str | None = Query(None),
    status: str = Query("all"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if status not in ("all", "paid", "unpaid"):
        raise HTTPException(status_code=400, detail="status must be all, paid or unpaid")

    if month:
        month_start = parse_month(month)
    else:
        month_start = datetime.now(COLOMBO).date().replace(day=1)

    try:
        inst_id = int(institute_id) if institute_id not in (None, "") else None
        year = int(exam_year) if exam_year not in (None, "") else None
    except ValueError:
        raise HTTPException(status_code=400, detail="institute_id and exam_year must be numbers")

    filters = """
        AND (CAST(:inst_id AS INT) IS NULL OR s.institute_id = CAST(:inst_id AS INT))
        AND (CAST(:year AS INT) IS NULL OR s.exam_year = CAST(:year AS INT))
    """
    search_cond = """
        AND (s.name_with_initials ILIKE :search
             OR s.student_code ILIKE :search
             OR s.mobile_number ILIKE :search)
    """
    status_cond = """
        AND (:status = 'all' OR COALESCE(sp.status, 'unpaid') = :status)
    """
    params = {
        "month": month_start,
        "search": f"%{search.strip()}%",
        "inst_id": inst_id,
        "year": year,
        "status": status,
    }

    base_from = """
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN institutes i ON i.id = s.institute_id
        LEFT JOIN student_payments sp ON sp.student_id = s.id AND sp.month = :month
        WHERE u.is_active = TRUE
    """

    with engine.connect() as conn:
        total = conn.execute(
            text(f"""
                SELECT COUNT(*)
                {base_from}
                {filters}
                {search_cond}
                {status_cond}
            """),
            params,
        ).scalar() or 0

        # Summary cards: all active students for the month.
        # Only the institute / exam year filters apply (not search or status).
        summary_row = conn.execute(
            text(f"""
                SELECT COUNT(*) AS total,
                       COUNT(*) FILTER (WHERE sp.status = 'paid') AS paid
                {base_from}
                {filters}
            """),
            params,
        ).mappings().first()

        offset = (page - 1) * page_size
        rows = conn.execute(
            text(f"""
                SELECT s.id AS student_id,
                       s.student_code,
                       s.name_with_initials AS name,
                       i.name AS institute_name,
                       s.mobile_number,
                       COALESCE(sp.status, 'unpaid') AS status,
                       sp.reference_no,
                       sp.paid_date,
                       sp.note
                {base_from}
                {filters}
                {search_cond}
                {status_cond}
                ORDER BY s.student_code
                LIMIT :limit OFFSET :offset
            """),
            {**params, "limit": page_size, "offset": offset},
        ).mappings().all()

    paid = int(summary_row["paid"])
    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [dict(r) for r in rows],
        "summary": {
            "paid": paid,
            "unpaid": int(summary_row["total"]) - paid,
        },
    }


class PaymentUpdate(BaseModel):
    month: str
    status: str
    reference_no: str | None = None
    paid_date: str | None = None
    note: str | None = None
    force: bool = False


def _item_shape(student_id: int, month: date) -> dict | None:
    with engine.connect() as conn:
        row = conn.execute(
            text("""
                SELECT s.id AS student_id,
                       s.student_code,
                       s.name_with_initials AS name,
                       i.name AS institute_name,
                       s.mobile_number,
                       COALESCE(sp.status, 'unpaid') AS status,
                       sp.reference_no,
                       sp.paid_date,
                       sp.note
                FROM students s
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                LEFT JOIN student_payments sp
                       ON sp.student_id = s.id AND sp.month = :month
                WHERE s.id = :student_id AND u.is_active = TRUE
            """),
            {"student_id": student_id, "month": month},
        ).mappings().first()
    return dict(row) if row else None


@router.put("/students/{student_id}")
def update_payment(
    student_id: int,
    body: PaymentUpdate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if body.status not in ("paid", "unpaid"):
        raise HTTPException(status_code=400, detail="status must be paid or unpaid")

    month_start = parse_month(body.month)

    today = datetime.now(COLOMBO).date()
    if month_start > today.replace(day=1):
        raise HTTPException(status_code=400, detail="month cannot be in the future")

    paid_date = None
    if body.status == "paid":
        if body.paid_date:
            try:
                paid_date = date.fromisoformat(body.paid_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="paid_date must be YYYY-MM-DD")
            if paid_date > today:
                raise HTTPException(status_code=400, detail="paid_date cannot be in the future")
        else:
            paid_date = today

    reference_no = (body.reference_no or "").strip() or None
    note = (body.note or "").strip() or None

    with engine.begin() as conn:
        student = conn.execute(
            text("""
                SELECT s.id
                FROM students s
                JOIN users u ON u.id = s.user_id
                WHERE s.id = :id AND u.is_active = TRUE
            """),
            {"id": student_id},
        ).mappings().first()
        if student is None:
            raise HTTPException(status_code=404, detail="Student not found or inactive")

        if reference_no and body.status == "paid" and not body.force:
            clash = conn.execute(
                text("""
                    SELECT sp.month, s.student_code, s.name_with_initials
                    FROM student_payments sp
                    JOIN students s ON s.id = sp.student_id
                    WHERE sp.reference_no = :ref
                      AND sp.status = 'paid'
                      AND NOT (sp.student_id = :student_id AND sp.month = :month)
                    LIMIT 1
                """),
                {"ref": reference_no, "student_id": student_id, "month": month_start},
            ).mappings().first()
            if clash is not None:
                raise HTTPException(
                    status_code=409,
                    detail={
                        "message": "This slip number was already used",
                        "used_by": {
                            "student_code": clash["student_code"],
                            "name": clash["name_with_initials"],
                            "month": str(clash["month"])[:7],
                        },
                    },
                )

        if body.status == "paid":
            conn.execute(
                text("""
                    INSERT INTO student_payments
                        (student_id, month, status, reference_no, paid_date, note,
                         recorded_by, updated_at)
                    VALUES
                        (:student_id, :month, 'paid', :reference_no, :paid_date, :note,
                         :recorded_by, now())
                    ON CONFLICT (student_id, month) DO UPDATE
                    SET status = 'paid',
                        reference_no = EXCLUDED.reference_no,
                        paid_date = EXCLUDED.paid_date,
                        note = EXCLUDED.note,
                        recorded_by = EXCLUDED.recorded_by,
                        updated_at = now()
                """),
                {
                    "student_id": student_id,
                    "month": month_start,
                    "reference_no": reference_no,
                    "paid_date": paid_date,
                    "note": note,
                    "recorded_by": current_user["id"],
                },
            )
        else:
            # Unpaid: keep the old reference / date / note as a record
            conn.execute(
                text("""
                    INSERT INTO student_payments
                        (student_id, month, status, recorded_by, updated_at)
                    VALUES
                        (:student_id, :month, 'unpaid', :recorded_by, now())
                    ON CONFLICT (student_id, month) DO UPDATE
                    SET status = 'unpaid',
                        recorded_by = EXCLUDED.recorded_by,
                        updated_at = now()
                """),
                {
                    "student_id": student_id,
                    "month": month_start,
                    "recorded_by": current_user["id"],
                },
            )

    return _item_shape(student_id, month_start)