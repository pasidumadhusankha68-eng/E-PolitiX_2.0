from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import text

from app.database import engine
from app.security import get_current_user

router = APIRouter(prefix="/online-classes", tags=["online-classes"])


def _get_student_id(conn, current_user):
    """Return the logged-in student's id, or None if no student row exists."""
    row = conn.execute(
        text("SELECT id FROM students WHERE user_id = :user_id"),
        {"user_id": current_user["id"]},
    ).mappings().first()
    return row["id"] if row else None


def _is_paid(conn, student_id):
    """True if the student has a paid payment for the current Asia/Colombo month."""
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
    return row is not None


def _compute_state(paid, starts_at):
    """Return 'locked', 'waiting', or 'open' based on paid status and start time."""
    if starts_at.tzinfo is None:
        starts_at = starts_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if not paid:
        return "locked"
    if now < starts_at - timedelta(minutes=15):
        return "waiting"
    return "open"


def _compute_status(is_cancelled, starts_at, duration_min):
    """Return 'cancelled', 'live', 'done', or 'scheduled'."""
    if is_cancelled:
        return "cancelled"
    if starts_at.tzinfo is None:
        starts_at = starts_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    end_at = starts_at + timedelta(minutes=duration_min)
    if starts_at <= now <= end_at:
        return "live"
    if now > end_at:
        return "done"
    return "scheduled"


def _base_classes_sql(extra_where="", order="ASC"):
    """Common SELECT of a student's online classes via enrollments.

    Returns id, title, starts_at, duration_min, class_name, notes, is_cancelled.
    Does NOT return zoom_url or passcode.
    """
    return f"""
        SELECT oc.id, oc.title, oc.starts_at, oc.duration_min,
               c.name AS class_name, oc.notes, oc.is_cancelled
        FROM online_classes oc
        JOIN enrollments en ON en.class_id = oc.class_id
        JOIN classes c ON c.id = oc.class_id
        WHERE en.student_id = :student_id {extra_where}
        ORDER BY oc.starts_at {order}
    """


def _format_item(row, paid):
    """Convert a DB row to the standard item dict with status, state, can_join."""
    row = dict(row)
    state = _compute_state(paid, row["starts_at"])
    status = _compute_status(row["is_cancelled"], row["starts_at"], row["duration_min"])
    return {
        "id": row["id"],
        "title": row["title"],
        "starts_at": row["starts_at"],
        "duration_min": row["duration_min"],
        "class_name": row["class_name"],
        "notes": row["notes"],
        "is_cancelled": row["is_cancelled"],
        "status": status,
        "state": state,
        "can_join": state == "open",
    }


@router.get("/next")
def get_next_class(
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            return {"next": None}

        paid = _is_paid(conn, student_id)

        row = conn.execute(
            text("""
                SELECT oc.id, oc.title, oc.starts_at, oc.duration_min,
                       c.name AS class_name, oc.notes,
                       oc.zoom_url, oc.passcode
                FROM online_classes oc
                JOIN enrollments en ON en.class_id = oc.class_id
                JOIN classes c ON c.id = oc.class_id
                WHERE en.student_id = :student_id
                  AND oc.is_cancelled = FALSE
                  AND oc.starts_at + oc.duration_min * interval '1 minute' >= now()
                ORDER BY oc.starts_at ASC
                LIMIT 1
            """),
            {"student_id": student_id},
        ).mappings().first()

    if row is None:
        return {"next": None}

    row = dict(row)
    state = _compute_state(paid, row["starts_at"])
    can_join = state == "open"

    return {
        "next": {
            "id": row["id"],
            "title": row["title"],
            "starts_at": row["starts_at"],
            "duration_min": row["duration_min"],
            "class_name": row["class_name"],
            "notes": row["notes"],
            "state": state,
            "can_join": can_join,
            "zoom_url": row["zoom_url"] if can_join else None,
            "passcode": row["passcode"] if can_join else None,
        }
    }


@router.get("/today")
def get_today_classes(
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            return {"items": []}

        paid = _is_paid(conn, student_id)

        rows = conn.execute(
            text(_base_classes_sql(
                extra_where="""
                    AND DATE(oc.starts_at AT TIME ZONE 'Asia/Colombo')
                        = (now() AT TIME ZONE 'Asia/Colombo')::date
                """,
                order="ASC",
            )),
            {"student_id": student_id},
        ).mappings().all()

    return {"items": [_format_item(row, paid) for row in rows]}


@router.get("/upcoming")
def get_upcoming_classes(
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            return {"items": []}

        paid = _is_paid(conn, student_id)

        rows = conn.execute(
            text(_base_classes_sql(
                extra_where="""
                    AND oc.starts_at + oc.duration_min * interval '1 minute' >= now()
                """,
                order="ASC",
            )),
            {"student_id": student_id},
        ).mappings().all()

    return {"items": [_format_item(row, paid) for row in rows]}


@router.get("/past")
def get_past_classes(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    offset = (page - 1) * page_size

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            return {"total": 0, "page": page, "page_size": page_size, "items": []}

        paid = _is_paid(conn, student_id)

        total = conn.execute(
            text("""
                SELECT COUNT(*)
                FROM online_classes oc
                JOIN enrollments en ON en.class_id = oc.class_id
                WHERE en.student_id = :student_id
                  AND oc.starts_at + oc.duration_min * interval '1 minute' < now()
            """),
            {"student_id": student_id},
        ).scalar() or 0

        rows = conn.execute(
            text(_base_classes_sql(
                extra_where="""
                    AND oc.starts_at + oc.duration_min * interval '1 minute' < now()
                """,
                order="DESC",
            )) + " LIMIT :limit OFFSET :offset",
            {"student_id": student_id, "limit": page_size, "offset": offset},
        ).mappings().all()

    return {
        "total": int(total),
        "page": page,
        "page_size": page_size,
        "items": [_format_item(row, paid) for row in rows],
    }


@router.get("/{class_session_id}/join")
def join_online_class(
    class_session_id: int,
    current_user: dict = Depends(get_current_user),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Students only")

    with engine.connect() as conn:
        student_id = _get_student_id(conn, current_user)
        if student_id is None:
            raise HTTPException(status_code=404, detail="Online class not found")

        paid = _is_paid(conn, student_id)

        row = conn.execute(
            text("""
                SELECT oc.id, oc.title, oc.starts_at, oc.duration_min,
                       oc.zoom_url, oc.passcode, oc.is_cancelled
                FROM online_classes oc
                JOIN enrollments en ON en.class_id = oc.class_id
                WHERE oc.id = :id
                  AND en.student_id = :student_id
            """),
            {"id": class_session_id, "student_id": student_id},
        ).mappings().first()

    if row is None:
        raise HTTPException(status_code=404, detail="Online class not found")

    row = dict(row)

    if row["is_cancelled"]:
        raise HTTPException(status_code=403, detail="Class cancelled")

    if not paid:
        raise HTTPException(status_code=403, detail="Payment required")

    starts_at = row["starts_at"]
    if starts_at.tzinfo is None:
        starts_at = starts_at.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)
    end_at = starts_at + timedelta(minutes=row["duration_min"])

    if now < starts_at - timedelta(minutes=15) or now > end_at:
        raise HTTPException(
            status_code=403, detail="The link opens 15 minutes before class"
        )

    return {
        "zoom_url": row["zoom_url"],
        "passcode": row["passcode"],
    }
