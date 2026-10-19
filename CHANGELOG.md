# Changelog

All notable changes to the LifePilot × Orion project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
