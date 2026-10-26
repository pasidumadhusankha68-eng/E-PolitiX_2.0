from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.database import engine
from app.routers import auth

app = FastAPI(title="E-PolitiX API")

# Lets your React app (a different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)


@app.get("/institutes")
def list_institutes():
    """For the institute dropdown on the register form."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, code, name FROM institutes ORDER BY name")
        ).mappings().all()
    return [dict(r) for r in rows]