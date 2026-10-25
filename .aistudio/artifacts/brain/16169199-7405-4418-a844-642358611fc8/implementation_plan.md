# EPilot AI — AI-Powered Learning Platform & Admin Portal

EPilot AI is a modern, responsive educational dashboard and administration platform designed to turn static study materials into interactive learning experiences. It combines PDF text extraction, automated quiz generation, Socratic AI tutoring, smart study scheduling, and a secure administrator portal with role-based access control.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and UX choices have been confirmed and incorporated into this specification:

- **Confirmed — Backend Architecture**: Complete deployable Python FastAPI architecture (`main.py`, `models.py`, `database.py`, `schemas.py`, `auth.py`, routers, services, PyMuPDF, and Argon2) provided alongside an interactive web runtime so you can test all features live in the browser immediately and also run the Python server locally via PowerShell.
- **Confirmed — Admin Credentials Initialization**: Pre-seeded admin account (`admin@epilot.ai` / `AdminPass123!`) with Argon2 hashing and a quick-fill testing card on the secure `/admin/login` page for immediate validation.
- **Confirmed — AI Tutor Pedagogy**: Socratic mentor persona configured on Gemini (`gemini-3.8-flash`) delivering guided discovery, contextual hints, and structured conceptual breakdowns rather than passive answer dumping.

---

### 1. Overview & Core Concept

- **What It Does**: EPilot AI allows students to upload PDF textbooks and lecture notes, automatically extract text and generate study summaries, generate timed multiple-choice quizzes with server-verified scoring, organize personalized study plans, and chat with an interactive Socratic AI tutor. Administrators have an isolated portal to inspect platform analytics, manage student accounts, moderate study materials, and audit activity.
- **Target Audience / Persona**: Students preparing for exams or reviewing coursework, independent lifelong learners, and academic administrators overseeing curriculum materials.
- **Key Value**: Closes the loop between passive reading and active recall by converting course documents into quizzes, study calendars, and guided tutoring dialogs without leaving the platform.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Student Onboarding & Dashboard**: Users enter their study hub displaying real-time metrics (materials uploaded, quizzes taken, average mastery score, upcoming tasks), recent files, and 1-click quick actions.
2. **Document Management & AI Summarization**: Students upload study materials (PDF/text), view extracted content, and trigger AI-generated summaries, key concepts, and revision cards.
3. **Adaptive Quiz Generation & Taking**: Students select study materials and difficulty (Easy, Medium, Hard), take generated quizzes with clean single-select options, and submit for server-side evaluation with instant score breakdowns and explanations.
4. **Interactive Study Planner**: Students create study tasks with deadlines, duration, and priority, or click "AI Study Plan" to receive a tailored study schedule based on upcoming tests.
5. **Socratic AI Tutor**: Real-time conversational interface where students ask questions about their notes; the tutor asks probing questions, tests understanding, and guides them step by step.
6. **Isolated Admin Portal (`/admin/login`)**: Role-guarded admin console displaying system health, user management with status toggles, uploaded content moderation, platform analytics, and audit logs.

#### Visual Identity & Theme
- **Aesthetic Direction**: High-focus academic aerospace / dark navy theme with crisp cyan/sky blue accents, minimal borders, and generous whitespace.
- **Color Palette**:
  - Dominant Canvas (60%): Deep dark navy (`#0a0e17` and `#0b1120`).
  - Structural Surfaces (30%): Deep slate cards (`#111827`), hairline borders (`#1e293b`), subtle hover states (`#1e293b`).
  - Accent Budget (10%): Electric Sky Blue (`#0ea5e9`) and Cyan (`#06b6d4`) for primary CTAs and active indicators; Emerald (`#10b981`) for completed tasks/high scores; Crimson (`#ef4444`) for errors.
- **Typography & Hierarchy**:
  - Headings: `Plus Jakarta Sans`, 600/700 weight, balanced line wraps.
  - Body: `DM Sans`, 400/500 weight, 15px with 1.6 line height.
  - Numeric & Metric Data: Monospace tabular numerals (`font-mono tabular-nums`).
- **Anti-Slop Discipline**:
  - Zero pill-badge sandwiches on cards; metadata formatted with clean dot separators (`Biology · 14 pages · Uploaded 2h ago`).
  - No decorative pulsing dots on static text; no fake telemetry tickers or pseudo-code headers (`// 01_CORE`).
  - Every button, dropdown, and tab possesses active click handlers and real state transitions.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Interactive Application + Deployable Python Stack**
  - *Chosen Approach*: Deliver the complete Python FastAPI application suite (`main.py`, `models.py`, `database.py`, `schemas.py`, `auth.py`, `routers/`, `services/`, `scripts/`, `requirements.txt`) so it can be deployed directly to Supabase/PostgreSQL with PyMuPDF, while powering the live AI Studio environment with rich, fully functional client/server flows and zero broken endpoints.
  - *Why*: Ensures immediate interactive testability in the current AI Studio workspace while fulfilling 100% of the user's Python/FastAPI technical stack requirements.
  - *Alternatives Considered*: Providing only Python source files without an active web preview would leave the user unable to interactively test the UI and Gemini features in the AI Studio environment.
- **Decision 2: Server-Authoritative Quiz Scoring & Integrity**
  - *Chosen Approach*: Questions and answer options are delivered to the student, but the correct answer keys and scoring logic remain strictly on the backend.
  - *Why*: Prevents client-side tampering or inspecting DOM attributes to reveal correct answers before submission.
- **Decision 3: Untrusted Document Handling for Gemini Prompts**
  - *Chosen Approach*: Document text passed to Gemini is quarantined inside strict delimiter boundaries with system instructions forbidding override commands.
  - *Why*: Prevents prompt injection attacks embedded inside student-uploaded PDF notes.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          EPilot AI Platform                            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│        Student Dashboard        │   │       Admin Portal (/admin)      │
│  • Overview & Quick Actions     │   │  • System Health & Diagnostics   │
│  • Notes & PDF Text Extraction  │   │  • User Management (Deactivate)  │
│  • Quiz Generator & Solver      │   │  • Content Moderation            │
│  • Study Planner & AI Scheduler │   │  • Analytics & Audit Logs        │
│  • Socratic AI Tutor (Chat)     │   │  • Role-Guarded Access (Argon2)  │
└────────────────┬────────────────┘   └────────────────┬─────────────────┘
                 │                                     │
                 └──────────────────┬──────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        API & Service Layer                             │
│  • Auth Service (Argon2, Session Tokens, Role Verification)            │
│  • Document Service (PyMuPDF / Text Extraction, Token Validation)      │
│  • Gemini Service (gemini-3.8-flash for Socratic Chat, Quizzes, Notes) │
│  • Quiz Evaluation Engine (Server-side score calculation)              │
│  • Study Plan Generator (Schedule balancing & task tracking)           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 Database Layer (SQLAlchemy / PostgreSQL)               │
│  • users               • study_materials        • quizzes              │
│  • quiz_attempts       • study_tasks            • chat_sessions        │
│  • chat_messages       • admin_activity_logs                           │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **User**: `id`, `name`, `email`, `password_hash`, `role` (`student` | `admin`), `status` (`active` | `deactivated`), `created_at`.
- **StudyMaterial**: `id`, `user_id`, `title`, `file_name`, `file_size`, `extracted_text`, `summary`, `created_at`.
- **Quiz**: `id`, `user_id`, `material_id`, `title`, `difficulty`, `questions` (JSON), `created_at`.
- **QuizAttempt**: `id`, `quiz_id`, `user_id`, `user_answers` (JSON), `score`, `total_questions`, `correct_count`, `completed_at`.
- **StudyTask**: `id`, `user_id`, `subject`, `topic`, `due_date`, `duration_minutes`, `priority`, `status`, `is_ai_suggested`, `created_at`.
- **ChatSession & ChatMessage**: `id`, `user_id`, `title`, `role`, `content`, `created_at`.
- **AdminActivityLog**: `id`, `admin_id`, `action`, `target_entity`, `details`, `created_at`.

#### Interactive Component & State Mapping
- **Tab Switching**: Active view state transitions smoothly between Dashboard, Notes, Quiz Center, Study Planner, AI Tutor, and Progress without full page reloads.
- **PDF Upload & Extraction**: Upload triggers file validation (size <= 10MB, valid PDF/text), extracts text, stores records, and presents summary generation options with loading states.
- **Quiz Taking**: Real-time option selection, progress indicator (`Question 3 of 5`), instant submission, server score calculation, and detailed answer review.
- **AI Tutor Interface**: Chat log with Socratic guidance, markdown rendering for equations and code, typing indicator, and clear error recovery if quota or network issues occur.
- **Admin Management**: Tabular view of all registered users with search, status toggling (Active / Deactivated), content moderation, and real-time database health check.
