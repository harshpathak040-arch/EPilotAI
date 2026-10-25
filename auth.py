import os
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from dotenv import load_dotenv

load_dotenv()

ph = PasswordHasher()
SECRET_KEY = os.getenv("SESSION_SECRET", "epilot_super_secret_session_key_99482937")
serializer = URLSafeTimedSerializer(SECRET_KEY, salt="epilot-session-salt")

SESSION_MAX_AGE = 86400  # 24 hours

def hash_password(password: str) -> str:
    """Hashes password using Argon2id."""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against stored Argon2 hash."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False

def create_session_token(user_id: str, role: str) -> str:
    """Generates tamper-proof timed session token."""
    return serializer.dumps({"user_id": user_id, "role": role})

def decode_session_token(token: str) -> dict | None:
    """Decodes and validates session token signature and expiration."""
    try:
        return serializer.loads(token, max_age=SESSION_MAX_AGE)
    except (SignatureExpired, BadSignature, Exception):
        return None
