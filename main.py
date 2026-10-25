import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from dotenv import load_dotenv

from database import engine, Base, get_db
from routers import auth_routes, materials, quizzes, study_planner, tutor, admin

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables cleanly without destructive drops
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="EPilot AI — Learning Platform",
    description="Adaptive AI-powered study dashboard, quiz engine, and academic assistant.",
    version="1.0.0",
    lifespan=lifespan
)

# Narrow CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_routes.router)
app.include_router(materials.router)
app.include_router(quizzes.router)
app.include_router(study_planner.router)
app.include_router(tutor.router)
app.include_router(admin.router)

# Mount static files if present
if os.path.exists("dist"):
    app.mount("/static", StaticFiles(directory="dist"), name="static")

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "unhealthy"
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "online",
        "app": "EPilot AI",
        "database": db_status,
        "gemini_model_configured": os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
