from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/payments", tags=["admin-payments"])


@router.get("")
def list_payments(
    search: str = Query(""),
    institute_id: str | None = Query(None),
    status: str = Query("all"),
    month: str | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if status not in ("all", "paid", "unpaid"):
        raise HTTPException(status_code=400, detail="status must be all, paid or unpaid")

    offset = (page - 1) * page_size

    where_conditions = ["1=1"]
    params = {}

    if search:
        where_conditions.append(
            "(u.full_name ILIKE :search OR s.student_code ILIKE :search OR u.email ILIKE :search)"
        )
        params["search"] = f"%{search}%"

    if institute_id:
        where_conditions.append("s.institute_id = :institute_id")
        params["institute_id"] = int(institute_id)

    if status != "all":
        where_conditions.append("sp.status = :status")
        params["status"] = status

    if month:
        where_conditions.append("sp.month = :month")
        params["month"] = month

    where_sql = " AND ".join(where_conditions)

    with engine.connect() as conn:
        total = conn.execute(
            text(f"""
                SELECT COUNT(*)
                FROM student_payments sp
                JOIN students s ON s.id = sp.student_id
                JOIN users u ON u.id = s.user_id
                WHERE {where_sql}
            """),
            params,
        ).scalar() or 0

        rows = conn.execute(
            text(f"""
                SELECT sp.id, sp.student_id, s.student_code,
                       u.full_name, u.email,
                       s.institute_id, i.name AS institute_name,
                       sp.month, sp.status,
                       sp.created_at
                FROM student_payments sp
                JOIN students s ON s.id = sp.student_id
                JOIN users u ON u.id = s.user_id
                JOIN institutes i ON i.id = s.institute_id
                WHERE {where_sql}
                ORDER BY sp.month DESC, sp.created_at DESC
                LIMIT :limit OFFSET :offset
            """),
            {**params, "limit": page_size, "offset": offset},
        ).mappings().all()

    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [dict(r) for r in rows],
    }


@router.get("/filters")
def get_payment_filters(
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    with engine.connect() as conn:
        institutes = conn.execute(
            text("SELECT id, name FROM institutes ORDER BY name")
        ).mappings().all()

        months = conn.execute(
            text("""
                SELECT DISTINCT month
                FROM student_payments
                ORDER BY month DESC
                LIMIT 12
            """)
        ).mappings().all()

    return {
        "institutes": [dict(r) for r in institutes],
        "months": [str(r["month"]) for r in months],
    }
