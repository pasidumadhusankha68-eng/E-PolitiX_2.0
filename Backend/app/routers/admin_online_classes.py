from datetime import datetime, timedelta, timezone
from urllib.parse import urlparse

from fastapi import APIRouter, Depends, HTTPException, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy import text

from app.database import engine
from app.security import require_role

router = APIRouter(prefix="/admin/online-classes", tags=["admin-online-classes"])

MAX_DURATION = 480
MIN_DURATION = 15


class OnlineClassCreate(BaseModel):
    class_id: int
    title: str
    starts_at: str
    duration_min: int
    zoom_url: str | None = None
    passcode: str | None = None
    notes: str | None = None
    force: bool = False


class OnlineClassUpdate(BaseModel):
    title: str | None = None
    starts_at: str | None = None
    duration_min: int | None = None
    zoom_url: str | None = None
    passcode: str | None = None
    notes: str | None = None
    force: bool = False


def _validate_zoom_url(url: str | None) -> str | None:
    if url is None or url == "":
        return None
    parsed = urlparse(url)
    if parsed.scheme != "https":
        raise HTTPException(status_code=400, detail="zoom_url must start with https://")
    host = parsed.hostname or ""
    if not host.endswith("zoom.us"):
        raise HTTPException(
            status_code=400, detail="zoom_url host must end with zoom.us"
        )
    return url


@router.get("")
def list_online_classes(
    when: str = "upcoming",
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if when not in ("upcoming", "past"):
        raise HTTPException(status_code=400, detail="when must be 'upcoming' or 'past'")

    items_sql = f"""
        SELECT oc.id, oc.class_id, c.name AS class_name, oc.title, oc.starts_at,
               oc.duration_min, oc.zoom_url, oc.passcode, oc.notes, oc.is_cancelled,
               CASE
                 WHEN oc.is_cancelled THEN 'cancelled'
                 WHEN oc.starts_at <= now()
                      AND oc.starts_at + oc.duration_min * interval '1 minute' >= now()
                 THEN 'live'
                 WHEN oc.starts_at + oc.duration_min * interval '1 minute' < now()
                 THEN 'done'
                 ELSE 'scheduled'
               END AS status
        FROM online_classes oc
        JOIN classes c ON c.id = oc.class_id
        WHERE oc.starts_at + oc.duration_min * interval '1 minute' {'>' if when == 'upcoming' else '<='} now()
        ORDER BY oc.starts_at {'ASC' if when == 'upcoming' else 'DESC'}
    """

    counts_sql = """
        SELECT
            COUNT(*) FILTER (
                WHERE oc.starts_at + oc.duration_min * interval '1 minute' > now()
            ) AS upcoming,
            COUNT(*) FILTER (
                WHERE oc.starts_at + oc.duration_min * interval '1 minute' <= now()
            ) AS past
        FROM online_classes oc
    """

    with engine.connect() as conn:
        rows = conn.execute(text(items_sql)).mappings().all()
        count_row = conn.execute(text(counts_sql)).mappings().first()

    return {
        "items": [dict(r) for r in rows],
        "counts": {
            "upcoming": int(count_row["upcoming"]) if count_row else 0,
            "past": int(count_row["past"]) if count_row else 0,
        },
    }


@router.post("", status_code=201)
def create_online_class(
    body: OnlineClassCreate,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    # Validate class exists
    class_row = None
    with engine.connect() as conn:
        class_row = conn.execute(
            text("SELECT 1 FROM classes WHERE id = :id"),
            {"id": body.class_id},
        ).first()
    if class_row is None:
        raise HTTPException(status_code=400, detail="Class does not exist")

    # Validate title
    if not body.title or not body.title.strip():
        raise HTTPException(status_code=400, detail="title is required")

    # Validate duration
    if not isinstance(body.duration_min, int) or isinstance(body.duration_min, bool):
        raise HTTPException(status_code=400, detail="duration_min must be an integer")
    if body.duration_min < MIN_DURATION or body.duration_min > MAX_DURATION:
        raise HTTPException(
            status_code=400,
            detail=f"duration_min must be between {MIN_DURATION} and {MAX_DURATION}",
        )

    # Validate zoom_url
    body.zoom_url = _validate_zoom_url(body.zoom_url)

    # Validate starts_at is in the future
    try:
        starts_at = datetime.fromisoformat(body.starts_at)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400, detail="starts_at must be a valid ISO timestamp with timezone"
        )
    if starts_at.tzinfo is None:
        raise HTTPException(
            status_code=400, detail="starts_at must include a timezone offset"
        )
    starts_at_utc = starts_at.astimezone(timezone.utc)
    if starts_at_utc <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="starts_at must be in the future")

    ends_at = starts_at_utc + timedelta(minutes=body.duration_min)

    # Clash check: non-cancelled classes of same class_id overlapping [starts_at, ends_at]
    clashes = []
    with engine.connect() as conn:
        clash_rows = conn.execute(
            text("""
                SELECT oc.id, oc.title, oc.starts_at, oc.duration_min
                FROM online_classes oc
                WHERE oc.class_id = :class_id
                  AND oc.is_cancelled = FALSE
                  AND oc.starts_at < :ends_at
                  AND :starts_at < oc.starts_at + oc.duration_min * interval '1 minute'
            """),
            {
                "class_id": body.class_id,
                "starts_at": starts_at_utc,
                "ends_at": ends_at,
            },
        ).mappings().all()
        clashes = [dict(r) for r in clash_rows]

    if clashes and not body.force:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "This class overlaps another class",
                "clashes": clashes,
            },
        )

    # Insert
    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO online_classes (class_id, title, starts_at, duration_min,
                                            zoom_url, passcode, notes, is_cancelled, created_by)
                VALUES (:class_id, :title, :starts_at, :duration_min,
                        :zoom_url, :passcode, :notes, FALSE, :created_by)
                RETURNING id, class_id, title, starts_at, duration_min, zoom_url,
                          passcode, notes, is_cancelled, created_by, created_at
            """),
            {
                "class_id": body.class_id,
                "title": body.title.strip(),
                "starts_at": starts_at_utc,
                "duration_min": body.duration_min,
                "zoom_url": body.zoom_url,
                "passcode": body.passcode,
                "notes": body.notes,
                "created_by": current_user["id"],
            },
        ).mappings().first()

    return dict(row)


@router.patch("/{class_session_id}")
def update_online_class(
    class_session_id: int = Path(...),
    body: OnlineClassUpdate = None,
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    if body is None:
        body = OnlineClassUpdate()

    # Fetch existing row
    existing = None
    with engine.connect() as conn:
        existing = conn.execute(
            text("""
                SELECT id, class_id, title, starts_at, duration_min, zoom_url,
                       passcode, notes, is_cancelled, created_by, created_at
                FROM online_classes WHERE id = :id
            """),
            {"id": class_session_id},
        ).mappings().first()

    if existing is None:
        raise HTTPException(status_code=404, detail="Online class not found")

    existing = dict(existing)
    if existing["is_cancelled"]:
        raise HTTPException(status_code=400, detail="Cannot edit a cancelled class")

    # Resolve new values (fall back to existing)
    new_class_id = existing["class_id"]
    new_title = body.title if body.title is not None else existing["title"]
    new_duration = (
        body.duration_min if body.duration_min is not None else existing["duration_min"]
    )
    new_zoom_url = (
        body.zoom_url if body.zoom_url is not None else existing["zoom_url"]
    )
    new_passcode = (
        body.passcode if body.passcode is not None else existing["passcode"]
    )
    new_notes = body.notes if body.notes is not None else existing["notes"]

    # Validate title (if provided)
    if body.title is not None:
        if not new_title or not new_title.strip():
            raise HTTPException(status_code=400, detail="title is required")

    # Validate duration_min (if provided)
    if body.duration_min is not None:
        if not isinstance(new_duration, int) or isinstance(new_duration, bool):
            raise HTTPException(status_code=400, detail="duration_min must be an integer")
        if new_duration < MIN_DURATION or new_duration > MAX_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"duration_min must be between {MIN_DURATION} and {MAX_DURATION}",
            )

    # Validate zoom_url (if provided)
    if body.zoom_url is not None:
        new_zoom_url = _validate_zoom_url(new_zoom_url)

    # Validate starts_at (if provided)
    new_starts_at = existing["starts_at"]
    if body.starts_at is not None:
        try:
            starts_at = datetime.fromisoformat(body.starts_at)
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="starts_at must be a valid ISO timestamp with timezone",
            )
        if starts_at.tzinfo is None:
            raise HTTPException(
                status_code=400, detail="starts_at must include a timezone offset"
            )
        starts_at_utc = starts_at.astimezone(timezone.utc)
        if starts_at_utc <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="starts_at must be in the future")
        new_starts_at = starts_at_utc

    ends_at = new_starts_at + timedelta(minutes=new_duration)

    # Clash check (exclude self): same class_id, non-cancelled, overlapping
    clashes = []
    with engine.connect() as conn:
        clash_rows = conn.execute(
            text("""
                SELECT oc.id, oc.title, oc.starts_at, oc.duration_min
                FROM online_classes oc
                WHERE oc.class_id = :class_id
                  AND oc.id <> :self_id
                  AND oc.is_cancelled = FALSE
                  AND oc.starts_at < :ends_at
                  AND :starts_at < oc.starts_at + oc.duration_min * interval '1 minute'
            """),
            {
                "class_id": new_class_id,
                "self_id": class_session_id,
                "starts_at": new_starts_at,
                "ends_at": ends_at,
            },
        ).mappings().all()
        clashes = [dict(r) for r in clash_rows]

    if clashes and not body.force:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "This class overlaps another class",
                "clashes": clashes,
            },
        )

    # Build dynamic UPDATE for only provided fields
    set_parts = []
    params = {"id": class_session_id}
    if body.title is not None:
        set_parts.append("title = :title")
        params["title"] = new_title.strip()
    if body.starts_at is not None:
        set_parts.append("starts_at = :starts_at")
        params["starts_at"] = new_starts_at
    if body.duration_min is not None:
        set_parts.append("duration_min = :duration_min")
        params["duration_min"] = new_duration
    if body.zoom_url is not None:
        set_parts.append("zoom_url = :zoom_url")
        params["zoom_url"] = new_zoom_url
    if body.passcode is not None:
        set_parts.append("passcode = :passcode")
        params["passcode"] = new_passcode
    if body.notes is not None:
        set_parts.append("notes = :notes")
        params["notes"] = new_notes

    if set_parts:
        update_sql = f"""
            UPDATE online_classes
            SET {', '.join(set_parts)}
            WHERE id = :id
            RETURNING id, class_id, title, starts_at, duration_min, zoom_url,
                      passcode, notes, is_cancelled, created_by, created_at
        """
        with engine.begin() as conn:
            row = conn.execute(text(update_sql), params).mappings().first()
    else:
        row = existing

    return dict(row)


@router.post("/{class_session_id}/cancel")
def cancel_online_class(
    class_session_id: int = Path(...),
    current_user: dict = Depends(require_role("admin", "superadmin")),
):
    existing = None
    with engine.connect() as conn:
        existing = conn.execute(
            text("SELECT id, is_cancelled FROM online_classes WHERE id = :id"),
            {"id": class_session_id},
        ).mappings().first()

    if existing is None:
        raise HTTPException(status_code=404, detail="Online class not found")

    if existing["is_cancelled"]:
        # Already cancelled: return the full row
        with engine.connect() as conn:
            row = conn.execute(
                text("""
                    SELECT id, class_id, title, starts_at, duration_min, zoom_url,
                           passcode, notes, is_cancelled, created_by, created_at
                    FROM online_classes WHERE id = :id
                """),
                {"id": class_session_id},
            ).mappings().first()
        return dict(row)

    with engine.begin() as conn:
        row = conn.execute(
            text("""
                UPDATE online_classes
                SET is_cancelled = TRUE
                WHERE id = :id
                RETURNING id, class_id, title, starts_at, duration_min, zoom_url,
                          passcode, notes, is_cancelled, created_by, created_at
            """),
            {"id": class_session_id},
        ).mappings().first()

    return dict(row)
