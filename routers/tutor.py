from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import json

from database import get_db
from models import ChatSession, ChatMessage, StudyMaterial, User
from schemas import TutorChatRequest, TutorChatResponse
from dependencies import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])

@router.get("/messages")
def get_tutor_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).first()
    if not session:
        return []
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.asc()).all()
    return [
        {
            "id": m.id,
            "sessionId": m.session_id,
            "role": m.role,
            "content": m.content,
            "createdAt": m.created_at.isoformat()
        }
        for m in messages
    ]

@router.post("/chat")
def chat_with_tutor(
    req: TutorChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    session = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).first()
    if not session:
        session = ChatSession(user_id=current_user.id, title="Active Socratic Study Session")
        db.add(session)
        db.commit()
        db.refresh(session)

    # Save user message
    user_msg = ChatMessage(session_id=session.id, role="user", content=req.message)
    db.add(user_msg)
    db.commit()

    # Load material context if attached
    context_text = ""
    if req.material_id:
        mat = db.query(StudyMaterial).filter(StudyMaterial.id == req.material_id).first()
        if mat:
            context_text = mat.extracted_text

    # Build conversation history
    past_messages = db.query(ChatMessage).filter(ChatMessage.session_id == session.id).order_by(ChatMessage.created_at.desc()).limit(6).all()
    past_messages.reverse()

    gemini_messages = [{"role": m.role, "parts": [{"text": m.content}]} for m in past_messages]

    # Model generates Socratic reply
    tutor_reply = gemini_service.socratic_tutor_reply(gemini_messages, context_text)

    # Save AI message
    model_msg = ChatMessage(session_id=session.id, role="model", content=tutor_reply)
    db.add(model_msg)
    db.commit()
    db.refresh(model_msg)

    return {
        "id": model_msg.id,
        "sessionId": session.id,
        "role": model_msg.role,
        "content": model_msg.content,
        "createdAt": model_msg.created_at.isoformat()
    }
