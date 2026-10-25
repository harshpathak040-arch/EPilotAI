from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from datetime import datetime, timezone

from database import get_db
from models import Quiz, QuizAttempt, StudyMaterial, User
from schemas import QuizGenerateRequest, QuizSubmitRequest
from dependencies import get_current_user
from services.gemini_service import gemini_service

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

@router.get("")
def list_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quizzes = db.query(Quiz).filter(Quiz.user_id == current_user.id).order_by(Quiz.created_at.desc()).all()
    return [
        {
            "id": q.id,
            "title": q.title,
            "difficulty": q.difficulty,
            "materialId": q.material_id,
            "questionCount": len(q.questions),
            "createdAt": q.created_at.isoformat()
        }
        for q in quizzes
    ]

@router.get("/{quiz_id}")
def get_quiz_for_taking(
    quiz_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # Critical Security: Strip answer and explanation so client cannot inspect DOM or response to cheat!
    sanitized_questions = [
        {
            "id": q.get("id"),
            "question": q.get("question"),
            "options": q.get("options")
        }
        for q in quiz.questions
    ]

    return {
        "id": quiz.id,
        "title": quiz.title,
        "difficulty": quiz.difficulty,
        "materialId": quiz.material_id,
        "questions": sanitized_questions,
        "createdAt": quiz.created_at.isoformat()
    }

@router.post("/generate")
def generate_quiz(
    req: QuizGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source_text = ""
    title = "Adaptive Knowledge Check"

    if req.material_id:
        mat = db.query(StudyMaterial).filter(StudyMaterial.id == req.material_id).first()
        if mat:
            source_text = mat.extracted_text
            title = f"{mat.title} ({req.difficulty} Quiz)"

    if not source_text:
        first_mat = db.query(StudyMaterial).first()
        if first_mat:
            source_text = first_mat.extracted_text
            title = f"{first_mat.title} Quiz"
        else:
            raise HTTPException(status_code=400, detail="No study materials available to generate quiz")

    questions = gemini_service.generate_quiz(source_text, req.difficulty, req.question_count)
    if not questions:
        raise HTTPException(status_code=500, detail="Failed to synthesize quiz questions")

    quiz = Quiz(
        user_id=current_user.id,
        material_id=req.material_id,
        title=title,
        difficulty=req.difficulty,
        questions=questions
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    return {
        "id": quiz.id,
        "title": quiz.title,
        "difficulty": quiz.difficulty,
        "questionCount": len(quiz.questions),
        "createdAt": quiz.created_at.isoformat()
    }

@router.post("/{quiz_id}/submit")
def submit_quiz_attempt(
    quiz_id: str,
    req: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    correct_count = 0
    review_breakdown = []

    for q in quiz.questions:
        q_id_str = str(q.get("id"))
        user_answer = req.answers.get(q_id_str, "No answer")
        correct_answer = q.get("answer")
        is_correct = (user_answer == correct_answer)

        if is_correct:
            correct_count += 1

        review_breakdown.append({
            "id": q.get("id"),
            "question": q.get("question"),
            "selectedAnswer": user_answer,
            "correctAnswer": correct_answer,
            "isCorrect": is_correct,
            "explanation": q.get("explanation", "Verified correct by curriculum engine.")
        })

    total_q = len(quiz.questions)
    score = round((correct_count / (total_q or 1)) * 100)

    attempt = QuizAttempt(
        quiz_id=quiz.id,
        user_id=current_user.id,
        user_answers=req.answers,
        score=score,
        total_questions=total_q,
        correct_count=correct_count
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attemptId": attempt.id,
        "score": score,
        "correctCount": correct_count,
        "totalQuestions": total_q,
        "reviewBreakdown": review_breakdown
    }
