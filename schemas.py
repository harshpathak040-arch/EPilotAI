from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Material Schemas
class MaterialCreate(BaseModel):
    title: str
    extracted_text: str
    file_name: Optional[str] = None
    file_size: Optional[int] = 0

class MaterialResponse(BaseModel):
    id: str
    title: str
    file_name: str
    file_size: int
    summary: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Quiz Schemas
class QuizGenerateRequest(BaseModel):
    material_id: Optional[str] = None
    difficulty: str = "Medium"
    question_count: int = 4

class QuestionSanitized(BaseModel):
    id: int
    question: str
    options: List[str]

class QuizResponse(BaseModel):
    id: str
    title: str
    difficulty: str
    material_id: Optional[str]
    question_count: int
    questions: Optional[List[QuestionSanitized]] = None
    created_at: datetime

class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str]

# Task Schemas
class TaskCreateRequest(BaseModel):
    subject: str
    topic: str
    due_date: str = "This week"
    duration_minutes: int = 45
    priority: str = "Medium"

class TaskResponse(BaseModel):
    id: str
    subject: str
    topic: str
    due_date: str
    duration_minutes: int
    priority: str
    status: str
    is_ai_suggested: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Tutor Schemas
class TutorChatRequest(BaseModel):
    message: str
    material_id: Optional[str] = None

class TutorChatResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime
