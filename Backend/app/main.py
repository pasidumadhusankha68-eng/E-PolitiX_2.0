from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.exam_progress import router as exam_progress_router

from app.database import engine
from app.routers import admin_dashboard, admin_exams, admin_online_classes, admin_payments, admin_results, admin_users, auth, online_classes, resources, student_profile



app = FastAPI(title="E-PolitiX API")



# Lets your React app (a different port) call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://epolitix.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(exam_progress_router)
app.include_router(admin_dashboard.router)
app.include_router(admin_exams.router)
app.include_router(admin_results.router)
app.include_router(admin_online_classes.router)
app.include_router(admin_payments.router)
app.include_router(online_classes.router)
app.include_router(admin_users.router)
app.include_router(resources.router)
app.include_router(student_profile.router)


@app.get("/institutes")
def list_institutes():
    """For the institute dropdown on the register form."""
    with engine.connect() as conn:
        rows = conn.execute(
            text("SELECT id, code, name FROM institutes ORDER BY name")
        ).mappings().all()
    return [dict(r) for r in rows]