# Changelog

All notable changes to the LifePilot × Orion project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Phase 2: Life Data] - 2026-10-19

### Added
- **Core Life Data Domain Models:** SQLAlchemy 2 async models in `server/models.py` for `Task`, `Subtask`, `TaskDependency`, `RecurrenceRule`, `TaskOccurrence`, `TaskSchedule`, `TaskEvent`, `Import`, and `ImportRow`.
- **Alembic Migration:** Database migration `migrations/versions/002_life_data_schema.py` creating tables, foreign keys, indexes, and cascades.
- **Task Lifecycle & Subtasks Service:** `server/tasks.py` implementing task CRUD, atomic status transitions, subtask toggle, and audit logging into `TaskEvent`.
- **30-Day Rolling Recurrence Engine:** `server/recurrence.py` supporting `daily`, `weekly`, `weekdays`, and `monthly` recurrence rules with deterministic occurrence keying (`recurrence_key`) for idempotency.
- **Stdlib-Safe Calendar Aggregator:** `server/calendar_sync.py` unifying fixed commitments, flexible tasks, and sleep anchors without stdlib namespace collision.
- **Formula-Safe Guide.xlsx Parser:** `server/imports.py` implementing ADR 019 normalization rules (chronological meridian inference, 0.5 bedtime anchor to 12:00 AM, point milestone handling, and compound task subtask decomposition).
- **Life Data REST APIs:** `/api/v1/tasks`, `/api/v1/tasks/{id}`, `/api/v1/tasks/{id}/subtasks`, `/api/v1/calendar/events`, `/api/v1/imports/upload`, `/api/v1/imports/{id}`, and `/api/v1/imports/{id}/commit`.
- **Frontend Screens:**
  - **Today Screen (`TodayScreen.tsx`):** Real-time execution trajectory, IST timeline stream, routine completion progress metrics, and task action triggers.
  - **Tasks Screen (`TasksScreen.tsx`):** Dual List View and Kanban Board View (Planned, In Progress, Completed), category filtering, subtask checklist drawer, and task creation modal.
  - **Calendar Screen (`CalendarScreen.tsx`):** Bespoke Obsidian Grid across Day, Week, and Month modes, featuring color-coded policy badges and a Protected Commitment modal that prevents unintended moves of fixed routines.
  - **Imports Review Screen (`ImportsScreen.tsx`):** Reviewable table displaying all 115 genuine activities parsed from `Guide.xlsx`, inline cell editing, category and date filters, and 1-click batch commit.
- **Automated Verification:** 5/5 passing Pytest suites in 0.60s (`test_tasks.py`, `test_recurrence.py`, `test_imports.py`), clean Ruff linting, zero TypeScript errors (`npm run typecheck`), and successful Vite production build.

## [Phase 1: Foundation] - 2026-10-19

### Added
- **Monorepo Architecture:** npm workspaces configured for `apps/web` and `packages/ui` (`@lifepilot/ui`).
- **Shared Design System:** `@lifepilot/ui` package implementing the approved Obsidian Neon & Precision Grid theme (`#0A0B0E`, electric cyan `#00F2FE`, Orion violet `#7928CA`, Outfit/Inter/JetBrains Mono typography).
- **Backend API & Database:** FastAPI modular application with PostgreSQL models, SQLAlchemy 2 async engine, Alembic migrations (`001_initial_users.py`), and Argon2id password hashing with JWT authentication.
- **REST Endpoints:** `/api/v1/health`, `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/me`, and `/api/v1/audit`.
- **Scrolling Landing Page (`/`):** Complete 9-section long-scroll portfolio landing page featuring sticky glass navbar, interactive hero schedule preview, Meet Orion terminal with Hinglish command demo, 8-item feature grid, Day in the Life scroll-driven timeline, reliability state machine diagram, architecture topology, demo carousel, and FAQ accordion.
- **Authenticated App Shell (`/app`):** Collapsible sidebar, top bar with Orion status pill, theme switcher (dark & light), global `Cmd+K` command palette, and persistent floating Orion trigger button.
- **Infrastructure:** Multi-container `infra/compose.yaml` with PostgreSQL 16, Redis 7, and FastAPI service with health checks.
- **Verification Suite:** Pytest async test suite (`test_auth.py`, `test_health.py`), TypeScript typecheck (`tsc --noEmit`), and Vite production bundle build.
