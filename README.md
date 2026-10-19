# LifePilot (Project JARVIS) 🚀

> **The Personal AI Life Operating System**: Converts your `Guide.xlsx` routine into an active calendar, wakes and reminds you with relentless alarm-style alerts, and adjusts your schedule on command via Orion, your private on-device AI assistant.

Built from a **single shared codebase** powering both a **macOS menu-bar daemon (.dmg)** and an **Android application (.apk)**.

---

## 🌟 Visual Theme: Obsidian Neon & Precision Grid
- **Design Philosophy**: Futuristic yet pragmatic dark-mode interface (`#0A0B0E`) accented with electric cyan (`#00F2FE`), galactic violet (`#7928CA`), and emerald focus status.
- **Glassmorphic Cards**: Depth-blurred surfaces, responsive hover states, and live Indian Standard Time (IST) synchronized time tracking.
- **Web Audio Engine**: Built-in sound synthesizer for relentless alarm chime loops, tactile UI clicks, and task completion celebratory fanfares without external audio file dependencies.

---

## 🏗 System Architecture & Technology Stack

```
lifepilot/
├── backend/                   # Python 3.11 + FastAPI
│   ├── main.py                # Server entrypoint, CORS, router mounts
│   ├── config.py              # Pydantic Settings (.env configuration)
│   ├── db.py                  # SQLAlchemy 2.0 async engine & sessionmaker
│   ├── models.py              # UserConfig, RoutineTemplate, Task, Reminder, DailyBriefing
│   ├── schemas.py             # Pydantic v2 schemas
│   ├── auth.py                # Master PIN verification & JWT handlers
│   ├── tasks.py               # Task CRUD & Guide.xlsx Excel parser
│   ├── planner.py             # Calendar scheduling & daily occurrence generator
│   ├── reminders.py           # APScheduler alarm loop & 7 AM / 11:30 PM briefings
│   └── assistant.py           # Orion local LLM tool calling via Ollama (Qwen 2.5 3B)
├── web/                       # Single Shared React + TypeScript + Vite Codebase
│   ├── src/
│   │   ├── components/        # TopNav, TodayTimeline, CalendarView, AlarmModal, OrionDrawer, etc.
│   │   ├── services/api.ts    # Configurable API client (supports local Wi-Fi & Tailscale IPs)
│   │   ├── utils/audio.ts     # Web Audio API chime synthesizer
│   │   ├── index.css          # Obsidian Neon design system tokens
│   │   └── App.tsx            # Main state manager, PIN lock, alarm poller
│   ├── electron/              # macOS Menu-bar Tray daemon
│   │   └── main.cjs           # Background daemon keeping alarms active when window closes
│   ├── android/               # Capacitor Android native project with exact alarm permissions
│   ├── dist-electron/         # Packaged macOS LifePilot-1.0.0-arm64.dmg installer
│   └── package.json
├── tests/                     # Pytest automated test suite (12 passed in 0.18s)
├── .env.example               # Environment variables template
├── CLAUDE.md                  # Canonical decisions & developer commands
└── README.md
```

---

## 🚀 Quickstart & Setup

### 1. Backend (Python + FastAPI + PostgreSQL 17)

```bash
# Clone and enter workspace
cd lifepilot

# Activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Create .env from template
cp .env.example .env

# Verify database connection (PostgreSQL 17 running on localhost:5432)
python3 -c "import asyncio; from backend.db import init_db; asyncio.run(init_db()); print('DB Connected!')"

# Run backend unit tests (12 tests)
pytest -v

# Start FastAPI dev server
uvicorn backend.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/api/health`

### 2. Frontend (React + TypeScript + Vite)

```bash
cd web
npm install
npm run dev
```
Open `http://localhost:5173`. Default Master PIN is **`1234`**.

---

## 📊 Guide.xlsx Routine Importer

LifePilot accepts your personal routine spreadsheet:
- **Column A**: Time ranges (e.g. `06:00 - 06:15`, `12:00 - 01:30` with automatic PM meridian inference, or float `0.5` = 12:00 AM bedtime).
- **Column B**: Activity title (e.g. `DSA + Handwritten Notes`, `Gym + Workout`). Activities with `+` automatically split into actionable subtasks.
- **Category Inference**: Semantic classification into `Fitness`, `Study`, `Projects`, `Career`, `Sleep`, `Skill`, or `Routine`.
- **Live Preview & Confirmation**: Review rows, adjust categories, and seed into recurring `RoutineTemplates` that automatically generate daily calendar occurrences.

---

## ⏰ Relentless Alarms & Reminders System

- **Ringing State Machine**: When task time arrives, the alarm fires with sound and visual pulsation.
- **Enforced Action**: The alert repeats until you explicitly tap:
  - `[▶ Start Task]`: Transitions task to `in_progress`.
  - `[⏰ Snooze 10m]`: Snoozes notification for 10 minutes (increments snooze count).
  - `[✓ Mark Done]`: Marks completed, stops alarm, triggers fanfare sound & confetti.
- **macOS Menu-Bar Tray**: Closing the window hides it into the macOS top menu-bar. Background poller continues firing system notifications on time.
- **Android Exact Alarms**: Manifest configured with `SCHEDULE_EXACT_ALARM`, `USE_EXACT_ALARM`, and `WAKE_LOCK` to alert even in Android Doze mode.

---

## 🤖 Orion AI Assistant (Local LLM Tool Calling)

Orion runs locally on your laptop using **Qwen 2.5 3B-Instruct** via Ollama on `http://localhost:11434`.
- **Zero Cloud API Costs**: 100% private, runs smoothly on 16GB RAM Mac with ~2.5 GB RAM footprint.
- **Supported Commands**:
  - *"JARVIS, shift gym to 7 PM"* ➡️ Reschedules task, recalculates duration, updates alarms.
  - *"Complete DSA Study"* ➡️ Marks completed with timestamp.
  - *"What is my schedule today?"* ➡️ Summarizes completed and pending agenda.
  - *"Add Project Dev at 3 PM to 5 PM"* ➡️ Adds block and schedules alarm.
- **Offline Fallback Engine**: If Ollama is offline or not installed, Orion features a built-in deterministic heuristic parser ensuring commands always succeed.

---

## 🌅 Circadian Briefings

1. **7:00 AM Morning Briefing**: Summarizes today's agenda, priorities, and focus blocks.
2. **11:30 PM Night Review**: Calculates daily adherence score (% tasks completed) and previews tomorrow's kickoff.
- Test immediately via the Calendar view or `POST /api/reminders/briefings/trigger-now`.

---

## 📦 Packaging & Distribution

### macOS (.dmg Installer & Menu-Bar App)

LifePilot packages as an unsigned/ad-hoc `.dmg` for macOS Apple Silicon:
```bash
cd web
npm run electron:build
```
The output installer is generated at:
`web/dist-electron/LifePilot-1.0.0-arm64.dmg`

> **Note for Unsigned macOS Apps**:
> When opening for the first time, macOS Gatekeeper may show an untrusted developer dialog.
> **Workaround**: Right-click (or Control-click) `LifePilot.app` > Click **Open** > Click **Open**.

### Android (.apk Debug Build)

```bash
cd web
# Build web assets and sync to native Android project
npm run android:sync

# To open in Android Studio:
npm run android:open

# Or to build debug .apk directly with Gradle (requires JDK 17+):
cd android && ./gradlew assembleDebug
```
The debug `.apk` is created at:
`web/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 Security & Networking

- **Master PIN Security**: Master PIN hashed with salted SHA-256; sessions authenticated via stateless JWT bearer tokens.
- **Configurable Host**: API base URL is stored in settings; seamlessly switch between `http://localhost:8000`, your laptop's local Wi-Fi IP (e.g. `http://192.168.1.15:8000`), or Tailscale mesh IP.

---

*LifePilot © 2026 Atherva Sahai. Personal AI Life Operating System.*
