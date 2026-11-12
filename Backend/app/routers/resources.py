import json
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import text

from app.database import engine
from app.drive_links import to_embed_url
from app.security import get_current_user

router = APIRouter(prefix="/resources", tags=["resources"])

COLOMBO = ZoneInfo("Asia/Colombo")


def _get_student_id(conn, current_user):
    """Return the logged-in student's id, or None if no student row exists."""
    row = conn.execute(
        text("SELECT id FROM students WHERE user_id = :user_id"),
        {"user_id": current_user["id"]},
    ).mappings().first()
    return row["id"] if row else None


def _compute_access(conn, student_id):
    """Return (free_week, paid, has_access).

    free_week: today's day-of-month in Asia/Colombo is 1-7.
    paid: a student_payments row with status='paid' and month = first day of current Colombo month.
    has_access: free_week or paid.
    """
    today_colombo = datetime.now(COLOMBO).date()
    free_week = 1 <= today_colombo.day <= 7

    paid = False
    row = conn.execute(
        text("""
            SELECT 1 FROM student_payments sp
            WHERE sp.student_id = :student_id
              AND sp.status = 'paid'
              AND sp.month = date_trunc('month', (now() AT TIME ZONE 'Asia/Colombo'))::date
            LIMIT 1
        """),
        {"student_id": student_id},
    ).first()
    if row is not None:
        paid = True

    return free_week, paid, (free_week or paid)


@router.get("/access")
def get_access(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            return {"has_access": False, "free_week": False, "paid": False}
        free_week, paid, has_access = _compute_access(conn, student_id)

    return {"has_access": has_access, "free_week": free_week, "paid": paid}


@router.get("")
def list_resources(
    current_user: dict = Depends(get_current_user),
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            raise HTTPException(status_code=402, detail="Payment required")

        free_week, paid, has_access = _compute_access(conn, student_id)
        if not has_access:
            raise HTTPException(status_code=402, detail="Payment required")

        conditions = ["en.student_id = :student_id", "r.is_published = TRUE"]
        params = {"student_id": student_id}

        if category is not None:
            conditions.append("r.category = :category")
            params["category"] = category

        if search is not None:
            conditions.append("(r.title ILIKE :search OR r.description ILIKE :search)")
            params["search"] = f"%{search}%"

        where_sql = " AND ".join(conditions)

        rows = conn.execute(
            text(f"""
                SELECT r.id, r.category, r.title, r.description, r.resource_date
                FROM resources r
                JOIN enrollments en ON en.class_id = r.class_id
                WHERE {where_sql}
                ORDER BY r.resource_date DESC, r.id DESC
            """),
            params,
        ).mappings().all()

    today = datetime.now(COLOMBO).date()
    items = []
    for row in rows:
        d = dict(row)
        rd = d["resource_date"]
        is_new = (today - rd).days <= 7 if rd is not None else False
        items.append({
            "id": d["id"],
            "category": d["category"],
            "title": d["title"],
            "description": d["description"],
            "resource_date": d["resource_date"],
            "is_new": is_new,
        })
    return {"items": items}


@router.get("/{id}/view")
def view_resource(id: int, current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            raise HTTPException(status_code=402, detail="Payment required")

        free_week, paid, has_access = _compute_access(conn, student_id)
        if not has_access:
            raise HTTPException(status_code=402, detail="Payment required")

        row = conn.execute(
            text("""
                SELECT r.title, r.url
                FROM resources r
                JOIN enrollments en ON en.class_id = r.class_id
                WHERE r.id = :id
                  AND en.student_id = :student_id
                  AND r.is_published = TRUE
            """),
            {"id": id, "student_id": student_id},
        ).mappings().first()

        if row is None:
            raise HTTPException(status_code=404, detail="Resource not found")

        embed_url = to_embed_url(row["url"])
        if embed_url is None:
            raise HTTPException(status_code=422, detail="This file cannot be shown here")

        info = conn.execute(
            text("SELECT name_with_initials, student_code FROM students WHERE id = :id"),
            {"id": student_id},
        ).mappings().first()

        watermark = f"{info['name_with_initials']} · {info['student_code']}"

    return Response(
        content=json.dumps({
            "title": row["title"],
            "embed_url": embed_url,
            "watermark": watermark,
        }),
        media_type="application/json",
        headers={"Cache-Control": "no-store"},
    )
