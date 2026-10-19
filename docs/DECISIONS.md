# DECISIONS (ADR-style log)

Every approved decision goes here with date, context, options considered and consequences. Agents must not contradict an approved decision without asking.

| # | Decision | Status |
|---|---|---|
| 001 | Product name LifePilot; AI assistant name Orion | Approved |
| 002 | Single owner, personal use, resume project | Approved |
| 003 | Build with both Claude Code and Antigravity; `AGENTS.md` is canonical, `CLAUDE.md` imports it | Approved |
| 004 | Orion runs locally on the owner's laptop (16 GB RAM, no GPU): small quantised model, rules/parsers first, model second; devices reach it over a private connection | Approved |
| 005 | Visual direction: futuristic + realistic, dark-first with light theme | Approved (agent proposes 2 variants for final choice) |
| 006 | Demoable in under 1 month; follow the 4-week cut in `AGENTS.md` Section 9b | Approved, subject to Phase 0 review |
| 007 | Mobile: Expo for Android only; no iOS push; Apple Calendar deferred (`.ics` interim) | Approved |
| 008 | Rename `server/calendar.py` to `server/calendar_sync.py` (stdlib shadowing) | Approved |
| 009 | Orion Model: Qwen2.5-3B-Instruct (4-bit quantized) via Ollama/llama-cpp on macOS Apple Silicon | Approved |
| 010 | Networking: Tailscale mesh VPN; laptop sleep triggers "Orion Offline" badge, deterministic features continue | Approved |
| 011 | Hosting: $0 expenditure budget (Render/Fly.io/Supabase free tiers + Cloudflare Tunnel + local Docker) | Approved |
| 012 | Data Model: Multi-user-ready schema with `user_id` ownership paths, locked to single owner | Approved |
| 013 | Google Calendar: Free GCP project with Google Calendar OAuth 2.0 read-only sync | Approved |
| 014 | Voice: Push-to-talk only via Web Audio / native speech recognition (wake-word deferred) | Approved |
| 015 | Visual Theme: Variant A "Obsidian Neon & Precision Grid" (#0A0B0E, #00F2FE, #7928CA, Outfit/Inter/JetBrains Mono) | Approved |
| 016 | UI Architecture: Separate shared `@lifepilot/ui` package in monorepo root | Approved |
| 017 | Scope Cut: Section 9b approved with greedy scheduler (W2), Google read-only (W4), Postgres FTS (pgvector deferred) | Approved |
| 018 | Cross-Agent Protocol: Strict Git commit and status hook across Claude Code and Antigravity | Approved |
| 019 | Guide.xlsx Parsing: Chronological AM/PM inference, `0.5` = 12:00 AM bedtime, `+` split into subtasks, seeds routine template | Approved |
| 020 | Phase 1 Tech Choices: Argon2id hashing, pyproject.toml with pip/venv, Guide.xlsx seed for landing page, Lucide React | Approved |
| 021 | Phase 1 Foundation: Monorepo, @lifepilot/ui, FastAPI backend, landing page, and app shell approved | Approved |
| 022 | Phase 2 Life Data Choices: Custom Calendar Grid, List+Kanban view, 30-day recurrence horizon, editable import review table, semantic Hinglish category mapper | Approved |
