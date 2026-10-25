from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json

from database import get_db
from models import StudyTask, StudyMaterial, User
from schemas import TaskCreateRequest, TaskResponse
from dependencies import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/study-tasks", tags=["Study Planner"])

@router.get("", response_model=List[TaskResponse])
def get_user_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(StudyTask).filter(StudyTask.user_id == current_user.id).order_by(StudyTask.created_at.desc()).all()

@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_study_task(
    req: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = StudyTask(
        user_id=current_user.id,
        subject=req.subject,
        topic=req.topic,
        due_date=req.due_date,
        duration_minutes=req.duration_minutes,
        priority=req.priority,
        status="pending",
        is_ai_suggested=False
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/toggle")
def toggle_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin" and task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    task.status = "completed" if task.status == "pending" else "pending"
    db.commit()
    return {"id": task.id, "status": task.status}

@router.delete("/{task_id}")
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin" and task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(task)
    db.commit()
    return {"success": True, "message": "Task deleted"}
