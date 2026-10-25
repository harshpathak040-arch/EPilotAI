from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db
from models import StudyMaterial, User
from schemas import MaterialResponse
from dependencies import get_current_user
from services.document_service import extract_text_from_pdf
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/materials", tags=["Study Materials"])

@router.get("", response_model=List[MaterialResponse])
def list_materials(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "admin":
        return db.query(StudyMaterial).order_by(StudyMaterial.created_at.desc()).all()
    return db.query(StudyMaterial).filter(StudyMaterial.user_id == current_user.id).order_by(StudyMaterial.created_at.desc()).all()

@router.get("/{material_id}")
def get_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    if current_user.role != "admin" and mat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    return {
        "id": mat.id,
        "title": mat.title,
        "fileName": mat.file_name,
        "fileSize": mat.file_size,
        "extractedText": mat.extracted_text,
        "summary": mat.summary,
        "createdAt": mat.created_at.isoformat()
    }

@router.post("/upload")
async def upload_pdf(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Max size: 10MB
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 10MB maximum limit")

    if not file.filename.lower().endswith(('.pdf', '.txt', '.md')):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload a PDF or text document.")

    if file.filename.lower().endswith('.pdf'):
        extracted_text, pages = extract_text_from_pdf(contents)
    else:
        extracted_text = contents.decode("utf-8", errors="ignore")

    doc_title = title or file.filename.replace(".pdf", "").replace("_", " ").title()

    mat = StudyMaterial(
        user_id=current_user.id,
        title=doc_title,
        file_name=file.filename,
        file_size=len(contents),
        extracted_text=extracted_text
    )
    db.add(mat)
    db.commit()
    db.refresh(mat)

    return {
        "id": mat.id,
        "title": mat.title,
        "fileName": mat.file_name,
        "fileSize": mat.file_size,
        "createdAt": mat.created_at.isoformat()
    }

@router.post("/{material_id}/summary")
def generate_material_summary(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    if current_user.role != "admin" and mat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    summary_result = gemini_service.generate_summary(mat.extracted_text)
    mat.summary = summary_result.get("summary", "")
    db.commit()

    return {
        "summary": mat.summary,
        "keyPoints": summary_result.get("keyPoints", [])
    }

@router.delete("/{material_id}")
def delete_material(
    material_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mat = db.query(StudyMaterial).filter(StudyMaterial.id == material_id).first()
    if not mat:
        raise HTTPException(status_code=404, detail="Material not found")
    if current_user.role != "admin" and mat.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")

    db.delete(mat)
    db.commit()
    return {"success": True, "message": "Material removed"}
