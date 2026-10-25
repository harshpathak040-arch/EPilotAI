"""
EPilot AI — Admin Account Initialization Script
Creates the initial administrator account with Argon2id password hashing.
Run via: python scripts/create_admin.py
"""
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, Base, engine
from models import User
from auth import hash_password

def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    admin_email = "admin@epilot.ai"
    admin_pass = "AdminPass123!"

    existing = db.query(User).filter(User.email == admin_email).first()
    if existing:
        print(f"[EPilot Admin Setup] Admin account already exists: {admin_email}")
        existing.password_hash = hash_password(admin_pass)
        existing.status = "active"
        existing.role = "admin"
        db.commit()
        print(f"[EPilot Admin Setup] Password updated with Argon2 hash.")
        db.close()
        return

    admin_user = User(
        name="EPilot Super Admin",
        email=admin_email,
        password_hash=hash_password(admin_pass),
        role="admin",
        status="active"
    )

    db.add(admin_user)
    db.commit()
    print(f"==================================================")
    print(f"  EPILOT AI — ADMINISTRATOR ACCOUNT CREATED")
    print(f"  Email:    {admin_email}")
    print(f"  Password: {admin_pass}")
    print(f"  Role:     admin")
    print(f"  Hashing:  Argon2id")
    print(f"==================================================")
    db.close()

if __name__ == "__main__":
    create_admin()
