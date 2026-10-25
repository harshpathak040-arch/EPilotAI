import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, StudyMaterial, QuizAttempt, AdminActivityLog
from dependencies import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])

@router.get("/overview")
def get_admin_overview(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    student_count = db.query(User).filter(User.role == "student").count()
    active_count = db.query(User).filter(User.status == "active").count()
    total_materials = db.query(StudyMaterial).count()
    total_quizzes = db.query(QuizAttempt).count()

    return {
        "totalStudents": student_count,
        "activeUsers": active_count,
        "totalMaterials": total_materials,
        "totalQuizzesTaken": total_quizzes,
        "geminiModel": os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        "systemUptimeHours": "24.0",
        "databaseHealth": "PostgreSQL & SQLAlchemy Engine Synced"
    }

@router.get("/users")
def get_all_users(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    result = []
    for u in users:
        mat_count = db.query(StudyMaterial).filter(StudyMaterial.user_id == u.id).count()
        quiz_count = db.query(QuizAttempt).filter(QuizAttempt.user_id == u.id).count()
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "status": u.status,
            "createdAt": u.created_at.isoformat(),
            "materialsCount": mat_count,
            "quizzesCount": quiz_count
        })
    return result

@router.post("/toggle-user")
def toggle_user_status(
    body: dict,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    user_id = body.get("userId")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.email == "admin@epilot.ai":
        raise HTTPException(status_code=400, detail="Primary administrator account cannot be deactivated")

    user.status = "deactivated" if user.status == "active" else "active"

    log = AdminActivityLog(
        admin_id=admin.id,
        action="USER_STATUS_TOGGLED",
        target_entity=user.email,
        details=f"Account status toggled to {user.status}"
    )
    db.add(log)
    db.commit()

    return {"success": True, "status": user.status}

@router.get("/logs")
def get_admin_logs(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    logs = db.query(AdminActivityLog).order_by(AdminActivityLog.created_at.desc()).limit(50).all()
    return [
        {
            "id": l.id,
            "adminId": l.admin_id,
            "adminEmail": l.admin.email if l.admin else "admin@epilot.ai",
            "action": l.action,
            "targetEntity": l.target_entity,
            "details": l.details,
            "createdAt": l.created_at.isoformat()
        }
        for l in logs
    ]
