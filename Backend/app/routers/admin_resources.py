from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text

from app.database import engine
from app.drive_links import to_embed_url
from app.security import require_admin

router = APIRouter(prefix="/admin/resources", tags=["admin-resources"])

_URL_ERROR = (
    "Use a Google Drive or Google Docs FILE link (not a folder link). "
    "Example: https://drive.google.com/file/d/.../view"
)


class ResourceIn(BaseModel):
    class_id: int
    category: str
    title: str
    description: str | None = None
    url: str
    resource_date: date | None = None
    is_published: bool = True


class PreviewIn(BaseModel):
    url: str


class PublishIn(BaseModel):
    is_published: bool


def _resource_item(row: dict, embed_url: str | None) -> dict:
    return {
        "id": row["id"],
        "class_id": row["class_id"],
        "category": row["category"],
        "title": row["title"],
        "description": row["description"],
        "url": row["url"],
        "resource_date": row["resource_date"],
        "is_published": row["is_published"],
        "created_by": row["created_by"],
        "created_at": row["created_at"],
        "embed_url": embed_url,
    }


@router.get("")
def list_resources(current_user: dict = Depends(require_admin)):
    with engine.connect() as conn:
        rows = conn.execute(
            text("""
                SELECT id, class_id, category, title, description, url,
                       resource_date, is_published, created_by, created_at
                FROM resources
                ORDER BY resource_date DESC, id DESC
            """)
        ).mappings().all()
    return {
        "items": [_resource_item(dict(r), to_embed_url(r["url"])) for r in rows]
    }


@router.post("", status_code=201)
def create_resource(
    body: ResourceIn, current_user: dict = Depends(require_admin)
):
    embed_url = to_embed_url(body.url)
    if embed_url is None:
        raise HTTPException(status_code=400, detail=_URL_ERROR)

    with engine.begin() as conn:
        row = conn.execute(
            text("""
                INSERT INTO resources (class_id, category, title, description, url,
                                       resource_date, is_published, created_by)
                VALUES (:class_id, :category, :title, :description, :url,
                        COALESCE(:resource_date, CURRENT_DATE), :is_published,
                        :created_by)
                RETURNING id, class_id, category, title, description, url,
                          resource_date, is_published, created_by, created_at
            """),
            {
                "class_id": body.class_id,
                "category": body.category,
                "title": body.title,
                "description": body.description,
                "url": body.url,
                "resource_date": body.resource_date,
                "is_published": body.is_published,
                "created_by": current_user["id"],
            },
        ).mappings().first()
    return _resource_item(dict(row), embed_url)


@router.put("/{id}")
def update_resource(
    id: int, body: ResourceIn, current_user: dict = Depends(require_admin)
):
    embed_url = to_embed_url(body.url)
    if embed_url is None:
        raise HTTPException(status_code=400, detail=_URL_ERROR)

    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT 1 FROM resources WHERE id = :id"), {"id": id}
        ).first()
        if existing is None:
            raise HTTPException(status_code=404, detail="Resource not found")

        row = conn.execute(
            text("""
                UPDATE resources
                SET class_id = :class_id,
                    category = :category,
                    title = :title,
                    description = :description,
                    url = :url,
                    resource_date = COALESCE(:resource_date, resource_date),
                    is_published = :is_published
                WHERE id = :id
                RETURNING id, class_id, category, title, description, url,
                          resource_date, is_published, created_by, created_at
            """),
            {
                "id": id,
                "class_id": body.class_id,
                "category": body.category,
                "title": body.title,
                "description": body.description,
                "url": body.url,
                "resource_date": body.resource_date,
                "is_published": body.is_published,
            },
        ).mappings().first()
    return _resource_item(dict(row), embed_url)


@router.post("/preview")
def preview_url(body: PreviewIn, current_user: dict = Depends(require_admin)):
    embed_url = to_embed_url(body.url)
    if embed_url is None:
        raise HTTPException(status_code=400, detail=_URL_ERROR)
    return {"embed_url": embed_url}


@router.patch("/{id}/publish")
def publish_resource(
    id: int, body: PublishIn, current_user: dict = Depends(require_admin)
):
    with engine.begin() as conn:
        existing = conn.execute(
            text("SELECT 1 FROM resources WHERE id = :id"), {"id": id}
        ).first()
        if existing is None:
            raise HTTPException(status_code=404, detail="Resource not found")
        conn.execute(
            text("UPDATE resources SET is_published = :is_published WHERE id = :id"),
            {"is_published": body.is_published, "id": id},
        )
    return {"id": id, "is_published": body.is_published}
