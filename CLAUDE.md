# LifePilot — AI Personal Life OS (Project JARVIS)

## 1. Architecture & Stack Decisions (ADR Log)

| Component | Choice | Rationale |
|---|---|---|
| **App Name** | LifePilot (AI Assistant: Orion) | Personal AI Life OS & Resume Showcase |
| **Frontend UI** | React + TypeScript + Vite | Ultra-fast single codebase, modular components |
| **Packaging** | Capacitor (Android) + Electron (macOS) | 100% shared UI codebase, hits the 1-month demo deadline |
| **Backend** | Python 3.11 + FastAPI | Async, high performance, clean REST APIs |
| **Database** | PostgreSQL 17 (Homebrew / Docker) with SQLAlchemy 2.0 (asyncpg) | Robust ACID relational storage for routines, occurrences & history |
| **Scheduler** | APScheduler (AsyncIOScheduler) | In-process cron & interval reminders for 7 AM, 11:30 PM & task alarms |
| **AI Assistant (Orion)** | Local Qwen 2.5 3B-Instruct via Ollama | Ultra-lightweight (~2.5 GB RAM), zero cloud API cost, fast local tool calling |
| **Authentication** | Single-User Master PIN / Password with JWT | Frictionless for personal daily driver; secure session storage |
| **Alarm System** | Native Android Exact Alarms + macOS Menu-bar Tray daemon | Rings even when app is closed; repeats until Start / Snooze / Complete |
| **Design Theme** | Obsidian Neon & Precision Grid | Futuristic + realistic (#0A0B0E, #00F2FE, #7928CA, Quix/Calmaria cards) |
| **Timezone** | `Asia/Kolkata` (IST) | User local timezone default |

---

## 2. Directory Layout

```
lifepilot/
├── CLAUDE.md              # Canonical project blueprint & decisions
├── README.md              # Quickstart, architecture & build guide
├── .env.example           # Environment template
├── backend/               # FastAPI backend
│   ├── __init__.py
│   ├── main.py            # API server entrypoint & router mounts
│   ├── config.py          # App settings (Pydantic Settings)
│   ├── db.py              # Async SQLAlchemy engine & session factory
│   ├── models.py          # ORM models (User, RoutineTemplate, Task, Occurrence, Reminder)
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # Master PIN verification & JWT handlers
│   ├── tasks.py           # Task CRUD & Guide.xlsx import parser
│   ├── planner.py         # Calendar scheduling & daily occurrence generator
│   ├── reminders.py       # Exact alarm scheduler & snooze/complete state machine
│   └── assistant.py       # Orion local LLM tool calling (Ollama)
├── web/                   # Shared React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable UI (Cards, Alarms, Calendar Grid, Orion Chat)
│   │   ├── pages/         # Dashboard, Calendar, Tasks, Importer, Settings, LandingPage
│   │   ├── stores/        # Local state & API client
│   │   └── styles/        # CSS variables & Obsidian Neon theme
│   ├── electron/          # macOS Menu-bar Tray & Background daemon
│   ├── capacitor.config.ts# Android native wrapper configuration
│   └── package.json
└── tests/                 # Backend automated test suite
    ├── __init__.py
    ├── conftest.py        # Test fixtures & test DB session
    ├── test_auth.py       # PIN auth tests
    ├── test_tasks.py      # Task CRUD tests
    ├── test_excel.py      # Guide.xlsx import & parsing tests
    ├── test_planner.py    # Routine generation & scheduling tests
    └── test_reminders.py  # Alarm lifecycle tests
```

---

## 3. Guide.xlsx Parsing Specifications

1. **Columns**:
   - Column A: Time string (`06:00 - 06:15`, `12:00 - 01:30`, or float `0.5` = 12:00 AM midnight sleep).
   - Column B: Activity name (e.g. `DSA + Handwritten Notes`, `Gym`, `College`).
2. **Subtasks**:
   - `+` in activity name automatically splits into structured subtasks.
3. **Routine Generation**:
   - Imports into a **Routine Template** that automatically generates daily task occurrences for the calendar.
   - Preview and confirmation step before saving to the database.

---

## 4. Orion Local AI Assistant Capabilities

Orion runs locally on the laptop with structured tool calling:
- `reschedule_task(task_id, new_start_time, new_end_time)`
- `add_task(title, start_time, end_time, category)`
- `delete_task(task_id)`
- `complete_task(task_id)`
- `get_daily_summary(date)`

---

## 5. Build, Test & Run Commands

- **Backend Setup**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  pip install -r backend/requirements.txt
  pytest tests/
  uvicorn backend.main:app --reload --port 8000
  ```
- **Frontend Setup**:
  ```bash
  cd web
  npm install
  npm run dev
  ```
- **macOS Electron Build**:
  ```bash
  cd web
  npm run electron:build
  ```
- **Android Capacitor Build**:
  ```bash
  cd web
  npm run build
  npx cap sync android
  npx cap open android
  ```

---

## 6. Implementation Sequence

1. **Step 1**: Backend + Database + Guide.xlsx Importer + Tests
2. **Step 2**: Tasks & Calendar UI (React + Obsidian Neon theme + Dashboard)
3. **Step 3**: Reminders & Alarm System (Scheduler, Snooze/Complete, Electron Tray & Android Exact Alarms)
4. **Step 4**: Daily Briefings (7:00 AM & 11:30 PM routines)
5. **Step 5**: Orion AI Chat Assistant (Ollama Tool Calling)
6. **Step 6**: Packaging (.apk for Android, .dmg for macOS)
7. **Step 7**: Landing Page Showcase & Documentation
