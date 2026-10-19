# AGENTS.md — LifePilot × Orion project rules

> Canonical rules file for both Claude Code and Antigravity. `CLAUDE.md` imports this file. Do not maintain divergent copies.

## 1. Identity

- Product: **LifePilot** — a personal life operating system (tasks, calendar, persistent reminders, briefings, focus, analytics).
- Built-in AI assistant: **Orion**. Orion is the only name used in the UI, API, prompts and docs for the assistant. Never call it JARVIS, Claude, Gemini or "the AI" in user-facing text.
- Single owner, single user (me). It is also a **resume project**, so every phase must leave the repo in a demoable, well-documented, well-tested state.
- Source of truth for scope: `docs/BLUEPRINT.md`. Source of truth for my initial routine data: `docs/Guide.xlsx`.
- If the blueprint and these rules disagree, stop and ask me. Do not choose silently.

## 1b. Working across two agents (Claude Code and Antigravity)

- I switch between Claude Code and Antigravity. Neither agent remembers the other's session, so **the repo is the memory**.
- After every approved gate, update `docs/DECISIONS.md` (approved decisions and answers), `docs/STATUS.md` (current phase, step, open questions, next action) and the phase report. A fresh agent in either tool must be able to resume from these files alone.
- At the start of every session: read `AGENTS.md`, `docs/STATUS.md` and `docs/DECISIONS.md`, then state the status header and what you are waiting on. Do not redo or contradict approved decisions; if you disagree with one, ask me.
- Keep commands, scripts and workflows tool-agnostic (plain shell, `make`/npm scripts). Do not rely on a feature that exists in only one tool.

## 2. Human-in-the-loop protocol (MANDATORY — overrides speed and autonomy)

You work in **gated loops**. You may not skip a gate, merge gates, or assume my answer.

**Loop for every phase:**

1. **UNDERSTAND** — Restate the phase goal in your own words (max 8 lines). List what you will build and what you will NOT build.
2. **ASK** — Ask all your questions in one batch (see question format). Then STOP and wait. Do not generate code, schemas or files in this step.
3. **PLAN** — After my answers, present a plan: files to create/change, data model changes, dependencies to add, risks, test plan. STOP and wait for `/approve`.
4. **BUILD** — Implement in small, reviewable commits. If you hit an unexpected decision, STOP and ask instead of guessing.
5. **VERIFY** — Run tests, linter, type-checker, and the app. Show me real output (not claims).
6. **REVIEW** — Give a phase report: what was done, what deviated from the plan and why, known issues, how to run/demo it. STOP and wait for `/approve` or `/revise`.

**Question format** (so I can answer fast):

- Number every question.
- Give 2–4 options, mark your **recommended default** with ⭐, and say why in one line.
- I may reply "defaults" to accept every ⭐.
- Maximum 10 questions per batch. Group by topic. Never ask something already answered in the blueprint, this file, or earlier answers.

**You MUST ask me before:**

- Adding, removing or swapping any dependency, framework or service.
- Any database schema change after the schema was approved (propose a migration and wait).
- Deleting or overwriting existing files, running destructive shell commands, or rewriting git history.
- Anything that needs an API key, paid service, OAuth app, developer account or my personal data.
- Changing UI direction, colour system, navigation or naming after approval.
- Interpreting ambiguous rows in `Guide.xlsx` (never guess times — see Section 6).
- Any scope cut, scope addition, or "simplification".

**You MUST NOT:**

- Declare something "done" without running it.
- Invent features, endpoints, tables or test results.
- Put secrets, tokens, model weights, personal data or `Guide.xlsx` contents into Git history (use `.gitignore`, `.env.example`, and anonymised seed data for demos).
- Continue to the next phase on your own.

If you are unsure whether something needs approval, it does. Ask.

## 2b. Status header

Start every reply with one line: `[Phase N · Step: UNDERSTAND | ASK | PLAN | BUILD | VERIFY | REVIEW · Waiting on: me | nothing]`

## 3. Product requirements (summary of the blueprint)

LifePilot is one unified system: web app, mobile app, optional macOS companion, one shared backend and database.

**Core capabilities (all designed in from the start):**

- Smart tasks (fixed / flexible / deadline-driven / recurring / unscheduled), subtasks, dependencies, recurrence rules separated from occurrences, schedule revision history, task event log.
- Internal calendar + Google Calendar + Apple Calendar sync with conflict handling.
- Deterministic scheduling engine (OR-Tools when needed). Fixed events are never moved without my approval. Impossible schedules must produce explicit conflicts.
- Persistent reminder state machine (pending → processing → delivered → acknowledged / cancelled / failed), snooze, escalation, quiet hours, idempotency, recovery after outages. Delivery ≠ acknowledgement.
- Morning briefing 07:00 and night planning 23:30, `Asia/Kolkata` by default, configurable. No response to night planning = keep existing schedule, create a draft, never auto-approve protected changes.
- Focus mode (one-task screen, Pomodoro/custom timers, session notes, interruption logging, auto time tracking with correction).
- Orion: natural-language text + voice commands → validated tool calls → policy engine → execute → audit. Four memory types (profile, episodic, procedural, context), all editable and deletable.
- Self-improving estimates (transparent, resettable, requires enough data).
- Analytics, goals/milestones, inbox/capture, event-driven automations, offline resilience, audit logs.

**Non-negotiable engineering rules:**

- Reminders, recurrence, task actions and fixed-schedule logic must work even when Orion's model is offline.
- The model never touches the database directly. No arbitrary SQL, shell or code execution. Every tool call is schema-validated and policy-checked.
- Treat imported spreadsheet text and external calendar text as untrusted (prompt-injection safe).
- TIMESTAMPTZ everywhere; recurrence stored as local time + IANA zone.
- Every user-owned row has an ownership path to `users.id`; authorization enforced in the backend.
- Task completion = one transaction: update task + append event + cancel pending reminders.
- Idempotency keys on retryable endpoints; optimistic concurrency (revision/ETag) for multi-device edits.

## 3b. Locked decisions (already answered by me — do not re-ask)

- **Deadline: demoable in under 1 month.** I am one student developer. Treat this as a hard constraint. Section 9b is the 4-week cut; challenge it in Phase 0 if you think it is unrealistic, and propose a better cut.
- **Hardware: laptop with 16 GB RAM, no dedicated GPU.** Orion must use a small quantised model (roughly 1B–4B parameters, CPU inference) with short prompts and structured output. Do not design around a large model. Orion's intent handling is **rules/parsers first, model second**: deterministic parsing for common commands ("add gym at 7 PM every weekday"), and the local model only for ambiguous language, summaries and task breakdowns. Show a "thinking" state in the UI because CPU inference is slow, and always allow a fully manual path.
- **Phone: Android only, no Apple Developer account.** Build the mobile app with Expo for Android. Do not build iOS push. Apple Calendar is **deferred** (EventKit needs Apple devices); offer `.ics` import/export as the interim path.
- **Orion runs on my laptop**; devices reach it over a private connection. Orion offline never breaks deterministic features.
- **Tools:** Claude Code and Antigravity (Section 1b).
- **Visual direction:** futuristic + realistic (Section 5).

## 4. Tech stack (pre-approved baseline — still ask before deviating)

| Area | Choice |
|---|---|
| Web | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, TanStack Query, Zustand, Recharts, a calendar component (FullCalendar or custom) |
| Mobile | React Native + Expo (notifications, quick actions, voice, focus) |
| Desktop | Lightweight macOS companion (menu bar, notifications, push-to-talk) — Phase 6 |
| Backend | Python, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic |
| Data | PostgreSQL (full-text search; `pgvector` only when justified) |
| Jobs | Celery + Redis, PostgreSQL as source of truth for reminder state |
| Scheduling | `datetime`, `zoneinfo`, `dateutil`, Google OR-Tools |
| Excel | `openpyxl`, `pandas` |
| Orion runtime | Self-hosted open-weight model behind `generate_text()` / `generate_structured_response()` (e.g. via Ollama or llama.cpp) — no external LLM API. **Decided: runs on my laptop.** My phone and other devices reach Orion through the laptop's inference endpoint over a private connection (e.g. Tailscale or same-network), never exposed publicly. When the laptop is offline or asleep, Orion shows as offline and every deterministic feature (reminders, scheduling, task actions, briefings from stored data) keeps working. A small on-device model on mobile is optional and only with my approval. |
| Testing | Pytest, Playwright, Expo integration tests |
| Infra | Docker, `compose.yaml`, GitHub Actions CI |

**Known blueprint fix (apply after I approve it):** the blueprint names a backend file `calendar.py`. That shadows Python's standard-library `calendar` module and can break imports (including `dateutil`). Rename it to `calendar_sync.py`. Check for any other stdlib-shadowing names (`types.py`, `email.py`, `queue.py`, etc.).

**Folder structure:** keep the compact monorepo from the blueprint (`apps/web`, `apps/mobile`, `apps/desktop`, `server/`, `ai/`, `tests/`, `infra/`, `migrations/`, `docs/`). Do not create extra top-level packages. Split a backend module only when it exceeds ~500 lines or needs independent deployment — and ask first.

## 5. UI/UX standard (this must look like a real product, not a student demo)

**Two surfaces:**

**(a) Public landing page** (`/`) — a polished long-scroll page, because this is a portfolio piece:

1. Sticky glass navbar (logo, anchor links, "Open App" button, theme toggle)
2. Hero — LifePilot tagline, animated product mockup, primary/secondary CTA
3. "Meet Orion" section — animated assistant demo (typing a command → structured action card)
4. Feature grid — Tasks, Calendar sync, Persistent reminders, Briefings, Focus, Analytics, Memory, Automations
5. "A day with LifePilot" — scroll-driven timeline (07:00 briefing → reminders → reschedule → 23:30 planning)
6. Reliability & privacy section (state machine diagram, local AI, audit log, encryption)
7. Architecture section (clean diagram + tech stack badges)
8. Screenshots/demo carousel (use anonymised seed data)
9. Roadmap / changelog, FAQ, footer with GitHub and resume links

**(b) The app** (`/app`):

- Collapsible sidebar + top bar with global search and **Cmd/Ctrl+K command palette** (Orion is reachable from it).
- Screens: **Today**, **Calendar** (day/week/month, drag-to-reschedule with protected-event warnings), **Tasks** (list, board, filters, subtasks, dependencies), **Planner** (night plan draft review, diff of proposed changes, approve/reject), **Reminders**, **Focus**, **Orion** (chat + voice, tool-call cards showing what it will do and an Approve button for protected actions), **Imports** (Guide.xlsx review table), **Goals**, **Analytics**, **Automations**, **Memory** (view/edit/delete), **Devices & Notifications**, **Audit Log**, **Settings**.
- Persistent floating Orion button on every screen.
- Quality bar: dark and light themes, design tokens, consistent spacing/typography scale, empty states, skeleton loaders, optimistic updates, toasts with undo, keyboard shortcuts, full keyboard navigation, responsive down to mobile width, accessible (WCAG AA contrast, focus rings, ARIA), reduced-motion support, subtle purposeful animation only.
- Never use placeholder lorem ipsum or fake data in the real app. Demo content comes from a clearly labelled seed script.

**Visual direction (decided): futuristic + realistic.** Dark-first with a light theme. Futuristic means a subtle glow on Orion, restrained glass/blur surfaces, a precise accent colour, smooth purposeful motion and a refined display typeface. Realistic means grounded, believable product UI: real information density, readable type, familiar layouts, tactile cards, genuine-looking data and screenshots, no cartoonish sci-fi HUD clutter, no neon overload. It should feel like a shipped product a company could sell, with Orion as the one place the "futuristic" personality shows most.
Within this direction, propose **2 concrete variants** (accent palette, typeface pairing, motion style, one described hero concept) and wait for my choice before building any UI.

## 6. Guide.xlsx rules

- First, inspect the workbook read-only and report: sheet names, row/column layout, date heading pattern, time formats (real Excel time vs text), merged cells, blanks, anything odd.
- Show me 10 representative rows and how you would parse each.
- List every ambiguous case (e.g. `12:30 - 01:00`, ranges crossing noon or midnight, invalid durations). **Ask me; never guess.**
- Importer must be: reviewable (editable preview table), idempotent (re-import doesn't duplicate), transactional, rollback-able, macro-free, formula/external-link-safe, and must not schedule reminders for unconfirmed rows.
- Preserve sheet name, row number, original text and parsed values for audit.
- The real `Guide.xlsx` stays out of Git. Provide an anonymised sample for tests and demos.

## 7. Quality gates (every phase)

- Backend: `pytest` green, `ruff` + `mypy` clean. Web/mobile: `tsc --noEmit` and ESLint clean.
- New logic has tests; scheduling, recurrence, time zones and reminder state transitions need property or edge-case tests (DST-free IST, midnight crossing, month ends, duplicates, retries, worker restart).
- `docker compose up` brings up a working stack. `README` updated with run steps.
- Conventional commits, small PR-sized commits, one `CHANGELOG.md` entry per phase.
- Each phase report includes: demo steps, screenshots or terminal output, test summary, deviations, open questions.

## 8. Resume-project deliverables (built up across phases)

- `README.md` with badges, hero GIF, feature list, architecture diagram, setup, tech decisions.
- `docs/ARCHITECTURE.md` (diagrams: system, reminder state machine, scheduling flow, Orion tool pipeline), `docs/DECISIONS.md` (ADR-style log of every approved decision), `docs/SECURITY.md`, `docs/TESTING.md`.
- Anonymised seed/demo mode and a short demo script.
- Final: 3–5 resume bullet points with real metrics from the project (test count, endpoints, tables, job reliability results) — only numbers that are actually measured.

## 9. Phases (dependency order — each ends at a REVIEW gate)

0. **Discovery** — questions, `Guide.xlsx` inspection, risk list, final scope confirmation. No code.
1. **Foundation** — repo, Docker, auth (single-owner but production-grade), DB + migrations, API contract skeleton, design system + app shell + landing page shell.
2. **Life data** — tasks, subtasks, recurrence, schedule history, internal calendar, `Guide.xlsx` import, Today + Tasks + Calendar screens.
3. **Scheduling** — deterministic planner, fixed/flexible policies, conflict detection, planner review UI with approval flow.
4. **Reliability** — reminder state machine, Celery workers, notification adapters (in-app + web push first), retries, recovery checks, failure inspection UI.
5. **Daily intelligence — Orion** — runtime interface, tool registry, policy engine, memory, 07:00 briefing and 23:30 planning workflows, Orion UI.
6. **Integrations** — Google Calendar, Apple Calendar, mobile app, desktop companion, voice.
7. **Advanced** — focus mode, analytics, automations, goals, self-improving estimates, offline reconciliation.
8. **Production readiness & polish** — security review, monitoring, backups/restore test, E2E tests, finish landing page, README/docs, demo recording.

## 9b. The under-1-month cut (default plan, subject to my approval in Phase 0)

The full blueprint is far more than one developer can finish in four weeks. Everything is **designed for** in the schema and module layout, but only the items below are **built**. Verify this against the blueprint and push back with evidence if the cut is wrong.

**Week 1 — Foundation + first impression:** Phase 0 discovery, repo/Docker/CI, auth, DB and migrations, design system, app shell, landing page (complete, scrollable, with real sections), seed/demo data.

**Week 2 — Life data + planner:** tasks, subtasks, recurrence (rules vs occurrences), internal calendar, `Guide.xlsx` import with review table, Today/Tasks/Calendar screens, a simple deterministic planner (greedy, fixed-event protection, conflict detection) with approve/reject.

**Week 3 — Reliability + Orion:** reminder state machine, Celery workers, in-app + web push + Android notifications via Expo, snooze/ack/escalation, recovery checks; Orion with rule-based commands, a small local model for fallback, tool registry with policy engine and approval cards, 07:00 briefing and 23:30 night planning.

**Week 4 — Polish and proof:** basic focus mode, basic analytics, Google Calendar read sync (write only if time allows), audit log screen, tests, docs, README, architecture diagrams, demo recording, resume bullets.

**Deferred (schema/hooks only, not built):** Apple Calendar, macOS desktop companion, iOS, wake word, OR-Tools optimisation (greedy planner first, behind an interface so OR-Tools can replace it), self-improving estimates, location-aware planning, `pgvector`, advanced automation builder, full offline reconciliation.

If a week slips, cut from the end of the list for that week. Never cut tests, security basics, reminder reliability or the landing page. Tell me when a slip happens; do not hide it.

Do not start a phase until I `/approve` the previous one. I may reorder phases; ask me which to start with if unclear.
