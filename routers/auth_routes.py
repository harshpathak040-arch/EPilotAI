from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from database import get_db
from models import User, AdminActivityLog
from schemas import UserRegisterRequest, UserLoginRequest, UserResponse
from auth import hash_password, verify_password, create_session_token
from dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(req: UserRegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists"
        )

    user = User(
        name=req.name,
        email=req.email.lower(),
        password_hash=hash_password(req.password),
        role="student",
        status="active"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login_user(req: UserLoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Verify your email and password."
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated by an administrator."
        )

    token = create_session_token(user.id, user.role)

    if user.role == "admin":
        log = AdminActivityLog(
            admin_id=user.id,
            action="ADMIN_LOGIN_SUCCESS",
            target_entity="Auth Session",
            details="Admin successfully authenticated via Argon2 credentials."
        )
        db.add(log)
        db.commit()

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "status": user.status
        }
    }

@router.get("/me", response_model=UserResponse)
def get_authenticated_user(current_user: User = Depends(get_current_user)):
    return current_user
