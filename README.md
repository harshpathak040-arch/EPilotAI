# EPilot AI — AI-Powered Learning Platform

EPilot AI is an intelligent educational platform that converts static study materials (PDFs, notes) into interactive learning workflows with Socratic AI tutoring, server-graded quizzes, and personalized study planning, plus a role-guarded administration portal.

---

## Architecture Overview

- **Interactive Full-Stack Web Engine:** Vite + React + Express + `@google/genai` TypeScript SDK (powers the live browser preview).
- **Backend Architecture:** Python FastAPI + SQLAlchemy + Psycopg + PyMuPDF + `google-genai` Python SDK + Argon2 password hashing.
- **Database Support:** PostgreSQL (Supabase compatible) and SQLite zero-config local engine.
- **AI Engine:** Google Gemini (`gemini-3.8-flash` / `gemini-2.5-flash`) with untrusted document isolation.

---

## Windows PowerShell Setup Instructions (Stage 8)

Run these exact commands in **Windows PowerShell** to install dependencies, initialize the database, create the admin account, and launch the server:

### 1. Create and Activate Virtual Environment
```powershell
# Open Windows PowerShell in your project directory
cd EPilot-AI

# Create virtual environment
python -m venv venv

# If script execution is disabled on your system, enable it for this process:
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Activate the virtual environment
.\venv\Scripts\Activate.ps1
```

### 2. Install Python Dependencies
```powershell
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### 3. Configure Environment Variables
```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env with your favorite editor (e.g., notepad)
notepad .env
```
Ensure your `.env` contains:
```env
GEMINI_API_KEY="your_actual_gemini_api_key"
GEMINI_MODEL="gemini-2.5-flash"
SESSION_SECRET="your_custom_64_character_random_hex_key"
# For local SQLite testing leave DATABASE_URL blank or set:
DATABASE_URL="sqlite:///./epilot_ai.db"
# Or connect to your Supabase PostgreSQL instance:
# DATABASE_URL="postgresql+psycopg://postgres:yourpassword@db.supabase.co:5432/postgres"
```

### 4. Initialize Database & Seed Administrator Account
```powershell
python scripts/create_admin.py
```
*Output will display:*
```text
==================================================
  EPILOT AI — ADMINISTRATOR ACCOUNT CREATED
  Email:    admin@epilot.ai
  Password: AdminPass123!
  Role:     admin
  Hashing:  Argon2id
==================================================
```

### 5. Launch FastAPI Application
```powershell
uvicorn main:app --reload --port 8000
```

---

## Live Web Applet (AI Studio Preview)

The interactive full-stack applet runs concurrently via:
```bash
npm run dev
```
Accessible at `http://localhost:3000` with pre-seeded student (`student@epilot.ai`) and admin (`admin@epilot.ai` / `AdminPass123!`) accounts.

---

## Key Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/health` | GET | System and database health status |
| `/api/auth/login` | POST | Authenticate user with Argon2 |
| `/api/auth/register` | POST | Register new student account |
| `/api/materials` | GET | List study materials |
| `/api/materials/upload` | POST | Upload PDF/notes with text extraction |
| `/api/materials/{id}/summary` | POST | Generate AI summary with Gemini |
| `/api/quizzes/generate` | POST | Generate quiz from uploaded notes |
| `/api/quizzes/{id}/submit` | POST | Submit quiz answers for server scoring |
| `/api/study-tasks` | GET/POST | Create and manage study planner tasks |
| `/api/tutor/chat` | POST | Socratic AI Tutor conversational mentor |
| `/api/admin/overview` | GET | Administrator platform metrics |
| `/api/admin/users` | GET | List and govern student accounts |
| `/api/admin/toggle-user` | POST | Activate/Deactivate user access |
