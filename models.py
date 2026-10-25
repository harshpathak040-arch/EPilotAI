import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, Integer, Float, ForeignKey, DateTime, JSON, Boolean
)
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # "student" | "admin"
    status = Column(String(20), default="active", nullable=False)  # "active" | "deactivated"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    materials = relationship("StudyMaterial", back_populates="owner", cascade="all, delete-orphan")
    quizzes = relationship("Quiz", back_populates="owner", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    study_tasks = relationship("StudyTask", back_populates="user", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")
    admin_logs = relationship("AdminActivityLog", back_populates="admin", cascade="all, delete-orphan")

class StudyMaterial(Base):
    __tablename__ = "study_materials"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    extracted_text = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="materials")
    quizzes = relationship("Quiz", back_populates="material", cascade="all, delete-orphan")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    material_id = Column(String(36), ForeignKey("study_materials.id"), nullable=True)
    title = Column(String(255), nullable=False)
    difficulty = Column(String(20), default="Medium", nullable=False)  # Easy, Medium, Hard
    questions = Column(JSON, nullable=False)  # [{ id, question, options, answer, explanation }]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    owner = relationship("User", back_populates="quizzes")
    material = relationship("StudyMaterial", back_populates="quizzes")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    quiz_id = Column(String(36), ForeignKey("quizzes.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    user_answers = Column(JSON, nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    quiz = relationship("Quiz", back_populates="attempts")
    user = relationship("User", back_populates="quiz_attempts")

class StudyTask(Base):
    __tablename__ = "study_tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    subject = Column(String(100), nullable=False)
    topic = Column(String(200), nullable=False)
    due_date = Column(String(50), nullable=False)
    duration_minutes = Column(Integer, default=45, nullable=False)
    priority = Column(String(20), default="Medium", nullable=False)
    status = Column(String(20), default="pending", nullable=False)
    is_ai_suggested = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="study_tasks")

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), default="Study Session", nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    session_id = Column(String(36), ForeignKey("chat_sessions.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" | "model"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    session = relationship("ChatSession", back_populates="messages")

class AdminActivityLog(Base):
    __tablename__ = "admin_activity_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    admin_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_entity = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    admin = relationship("User", back_populates="admin_logs")
