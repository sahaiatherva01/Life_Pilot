# JARVIS — Complete product blueprint (source of truth for scope)

> Product naming note: this blueprint was written under the working name **JARVIS**. The product is now named **LifePilot** and its AI assistant is named **Orion**. Wherever this document says JARVIS, read LifePilot (the app) and Orion (the assistant). Where this blueprint conflicts with `AGENTS.md`, `AGENTS.md` wins (see its Section 3b and Section 9b for locked decisions and the under-1-month cut).

The objective is to create one application that manages your daily life, understands your instructions, plans your schedule, keeps reminding you until you take action, synchronizes your calendars, helps you focus, and learns from your routines.

The design is practical for a computer science student to build: a compact codebase, clear modules, proper database design, and a realistic path toward deeper AI capabilities without making every feature dependent on an external AI API.

Pillars:

- **Life scheduling** — tasks, routines, deadlines, calendar synchronization and automatic rescheduling.
- **Persistent accountability** — alarm-style notifications, repeat reminders, acknowledgements and overdue follow-ups.
- **Personal intelligence** — natural-language commands, contextual memory, planning and personalized suggestions.
- **Controlled autonomy** — automatic execution within your rules, with approval for consequential changes.

## 1. The final product definition

JARVIS consists of three connected applications and one shared intelligence system.

| Component | Responsibility |
| --- | --- |
| Web application | Main dashboard, calendar, spreadsheet import, task editing, settings, analytics and AI chat |
| Mobile application | Notifications, alarms, quick actions, voice commands, focus sessions and daily briefings |
| Desktop companion | Optional macOS integration, system notifications, focus controls and supported application automation |
| Shared JARVIS engine | Scheduling, task state, reminders, memory, calendar synchronization, AI reasoning and automation |

All applications connect to the same cloud backend and database. Tasks must not become separate copies that disagree between Mac, phone and website.

### Permanent operating rules

- Morning briefing: 7:00 AM, Asia/Kolkata.
- Night planning: 11:30 PM, Asia/Kolkata.
- Reminder behavior: continue prompting until an action is taken, subject to configured quiet hours, maximum escalation limits and device restrictions.
- Flexible tasks: can be scheduled and rescheduled automatically within the rules.
- Fixed commitments: never moved without approval.
- Calendar integration: Google Calendar and Apple Calendar.
- Data: cloud-synchronized, with strong access controls.
- Initial routine: the uploaded `Guide.xlsx`.
- AI autonomy: proactive, but bounded by explicit permissions.

The distinction between autonomy and unrestricted access is important. The system can independently rearrange a flexible coding session, but it cannot silently move an examination, delete an important meeting or override the configured sleep schedule.

# 2. Complete feature catalogue

## A. Smart task management

Every activity in life is represented as a structured task or event.

Each task needs:

- Title and description.
- Category and optional subcategory.
- Priority and importance.
- Start time, end time and deadline.
- Estimated duration and actual time spent.
- Fixed or flexible scheduling.
- Status and completion percentage where appropriate.
- Recurrence rules.
- Reminder and escalation rules.
- Dependencies on other tasks.
- Required location, equipment or preparation.
- Energy level and concentration requirements.
- Tags, notes, attachments and subtasks.
- Source: manual, spreadsheet, voice, AI, calendar or automation.
- Creation date, last modification and change history.

### Advanced task behaviors

- Breaking a large task into actionable subtasks.
- Automatically carrying forward unfinished work.
- Detecting duplicate tasks.
- Detecting impossible deadlines and schedule conflicts.
- Estimating whether a task will fit into the available time.
- Pausing a task and resuming it later.
- Tracking actual versus estimated duration.
- Marking tasks as blocked, waiting or dependent on another person.
- Creating follow-up tasks after meetings or completed activities.
- Maintaining recurring routines without duplicating the original task definition.

For example, "Prepare for my ML interview" could become a parent task with subtasks for revision, coding practice, mock interviews and review. AI can suggest those subtasks, but the task engine stores them as ordinary, editable records.

## B. Advanced calendar and scheduling

The system needs its own internal calendar, even when Google Calendar and Apple Calendar are connected.

It combines:

- Fixed events and commitments.
- Flexible work sessions.
- Recurring personal routines.
- Deadlines and preparation time.
- Travel and transition buffers.
- Breaks and recovery time.
- Tasks imported from Excel.
- Events synchronized from external calendars.

### Intelligent scheduling rules

The scheduling engine considers these factors in order:

1. Hard commitments and fixed events.
2. Deadlines and task dependencies.
3. User-defined priorities.
4. Available time blocks.
5. Estimated duration.
6. Preferred working hours and energy levels.
7. Travel and transition time.
8. Breaks, sleep and personal boundaries.
9. Existing task history and observed duration.
10. Optional AI recommendations.

The system must detect when all tasks cannot fit. It should show what must be postponed rather than packing every minute with unrealistic work.

### Schedule protection

Every scheduled activity has a clear policy:

- Fixed: only change with approval.
- Flexible: move within permitted time windows.
- Deadline-driven: may move, but must finish before its deadline.
- Recurring: generated from a recurrence rule.
- Unscheduled: waiting for a suitable time slot.

When an event changes in Google Calendar or Apple Calendar, the system re-evaluates the affected time blocks and suggests or performs only permitted changes.

## C. Persistent alarm and reminder system

This is the most important operational component.

Every reminder is associated with a task, a scheduled time, a delivery channel, and a current state. A reminder is not simply a JavaScript timer.

Reminder settings include:

- Reminder before the activity.
- Reminder at the scheduled start.
- Repetition interval.
- Escalation rules.
- Maximum repeat count.
- Snooze duration.
- Quiet hours.
- Device-specific notification preferences.
- Whether the task requires explicit acknowledgement.
- Whether the task can be marked overdue automatically.

### Example reminder lifecycle

2:00 PM — DSA practice. The task is due. A notification is sent with quick actions:

- **Start** — stop start reminders and begin the session.
- **Snooze** — reschedule the next alert according to the rule.
- **Complete** — mark the task complete and cancel pending alerts.
- **Reschedule** — find a new suitable slot and update reminders.

If no action is received, the system follows the reminder policy. It must not create unlimited notification jobs or continue alerting for a completed or cancelled task.

Pressing Start stops start reminders, but it does not mean the task is complete. During a long session, the system can optionally provide progress check-ins or a completion reminder near the planned end.

### Multi-channel alerts

- Mobile push notifications.
- Native local notifications.
- Web push.
- In-app notifications.
- Desktop notifications.
- Sound and vibration where supported.
- Optional email summaries.
- Optional voice announcements on a configured device.

True alarm-like behavior depends on the operating system, notification permissions and platform policies. The system cannot guarantee that it can override every silent mode or device restriction. It should detect missing permissions and explain the limitation rather than pretending an alarm was delivered.

## D. Morning briefing and night planning

These are first-class scheduled workflows, not ordinary reminders.

### 07:00 AM — Morning briefing

Prepared from the latest confirmed schedule. It includes:

- Today's fixed commitments and task timeline.
- The first actionable task.
- The three most important priorities.
- Deadlines, preparation and travel requirements.
- Unfinished tasks carried over from yesterday.
- Conflicts and schedule changes.
- A realistic workload assessment.

It can be heard, read, or requested in a shorter version.

### 11:30 PM — Night planning

Prepares tomorrow's proposed schedule. It includes:

- Reviewing today's completed and unfinished work.
- Collecting new tasks from notes, chat and spreadsheets.
- Checking calendar commitments and deadlines.
- Estimating available time.
- Proposing slots for flexible tasks.
- Flagging conflicts and tasks that cannot fit.
- Asking whether to modify the plan.

Once confirmed, it schedules the relevant reminders and prepares tomorrow's briefing.

### What happens when there is no response?

The planning workflow must not assume consent to move important events. If there is no response to the night-planning prompt, the system retains the existing schedule, generates a draft plan and notifies about unresolved conflicts. It must not silently change fixed commitments or treat a proposed schedule as approved.

If the morning briefing runs while the device is offline, the server can still generate it; delivery and voice playback may wait until the device reconnects.

## E. Focus and distraction management

This feature helps start work and stay engaged, rather than simply generating statistics about procrastination.

- One-task-at-a-time focus screen.
- Pomodoro and custom-length sessions.
- Task-specific timers.
- Website and application blocking through supported integrations.
- Notification suppression during focus sessions.
- Optional distraction logging.
- Break reminders and recovery periods.
- Session notes and outcomes.
- Automatic task-time tracking, with user correction.
- Resume prompts after interruptions.
- End-of-session completion checks.

### Advanced focus behavior

Suppose a 90-minute DSA session starts. The system shows the task, starts the timer, keeps the interface focused on the next action, and avoids unnecessary notifications. If the user leaves the session, it can ask whether they were interrupted, took a break or finished early.

Website blocking requires a browser extension or supported system-level integration. A normal website cannot control every application on a Mac or phone.

## F. AI personal assistant

The assistant accepts commands in natural language through text and voice. Examples:

- "Add gym at 7 PM every weekday."
- "Move my coding session to tomorrow morning."
- "What is my next task?"
- "I finished the first two subtasks."
- "Find 90 minutes for research this week."
- "I have an exam on Friday; help me prepare."
- "What did I fail to finish yesterday?"
- "Give me a realistic plan for the next four hours."

The AI understands context, identifies relevant tasks, interprets dates using the user's time zone, and calls validated application tools. It must not invent completed work, assume ambiguous instructions, or change external records without permission.

### Memory architecture

| Memory type | What it stores |
| --- | --- |
| Profile memory | Preferences, working hours, preferred reminder behavior and long-term goals |
| Episodic memory | Past sessions, completed tasks, decisions and user corrections |
| Procedural memory | Routines, scheduling rules, automation definitions and task workflows |
| Context memory | Relevant current tasks, recent conversations and today's schedule |

Memory is editable, searchable and deletable. Structured facts live in PostgreSQL; semantic retrieval is used only where it improves retrieval of relevant notes or past conversations.

Do not send the entire database to the model for every request. Retrieve the smallest useful context, and enforce access control before the model receives it.

## G. Self-improving scheduling

The system improves its estimates from actual outcomes, with transparency. It can learn:

- How long typical activities take.
- Which time windows are preferred for demanding work.
- Which tasks are often postponed.
- How frequently a schedule becomes overloaded.
- Which reminders are acknowledged or snoozed.
- How much buffer is needed between activities.
- Which types of tasks benefit from shorter sessions.

For example, if DSA practice regularly takes longer than planned, the system can recommend increasing the estimated duration. It must distinguish between a genuine pattern and a small number of unusual days, show why it made a recommendation, and allow learned preferences to be reset.

## H. Voice and desktop control

A native desktop companion sits alongside the website and mobile app. Its responsibilities can include:

- Push-to-talk and optional wake-word detection.
- Speech-to-text and text-to-speech.
- Spoken daily briefings.
- Desktop notifications.
- Quick task actions from the menu bar.
- Launching explicitly permitted applications.
- Starting focus sessions.
- Local file and folder workflows with explicit permissions.
- A local command registry for deterministic actions.

The desktop companion remains a small client, not another independent task database. Application control is permission-based. Voice commands that delete files, send messages, modify external accounts or make consequential changes require confirmation.

# 3. Final technical architecture

A compact modular monolith, one authoritative database, a persistent background-job system and dedicated clients.

- Clients: React web, React Native mobile, macOS companion.
- FastAPI application: Auth, Tasks, Calendar, Planner, AI tools, Reminders, Memory, Import, Automation.
- PostgreSQL: permanent records and state.
- Redis + workers: scheduled and background jobs.
- Local AI runtime: model inference, intent and planning assistance.
- External integrations: Google, Apple and notification providers.

## Recommended technology stack

| Area | Technology |
| --- | --- |
| Web | React, TypeScript, Vite |
| Mobile | React Native, Expo |
| Desktop | Python companion or lightweight native macOS shell |
| Backend | Python, FastAPI, Pydantic |
| Database | PostgreSQL |
| ORM and migrations | SQLAlchemy 2, Alembic |
| Job queue | Celery and Redis |
| Scheduling | Python `datetime`, `zoneinfo`, `dateutil`; OR-Tools when needed |
| Excel | `openpyxl`, `pandas` |
| AI runtime | Self-hosted inference runtime with a local model adapter |
| Search and memory | PostgreSQL full-text search; `pgvector` when semantic retrieval is justified |
| Voice | Local speech recognition and text-to-speech components |
| Testing | Pytest, Playwright, mobile integration tests |
| Deployment | Docker, managed PostgreSQL, persistent worker hosting |
| Monitoring | Structured logs, error tracking, job health and delivery metrics |

AI privacy constraint: the core assistant must not depend on an external LLM API. Keep model inference behind an internal interface so models can run locally or on infrastructure under the owner's control. Calendar providers and push-notification services remain separate integrations, with their own authentication and data-sharing requirements.

Training a capable foundation model entirely from scratch is a much larger research and compute project. The architecture can support that long-term ambition without making foundation-model training a prerequisite.

# 4. Minimized project folder structure

Use a monorepo with three applications and a small shared backend. Avoid dozens of packages and deeply nested directories.

```
jarvis/   (renamed lifepilot/)
├── apps/
│   ├── web/                 # React website
│   ├── mobile/              # Android + iOS
│   └── desktop/             # macOS companion
│
├── server/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # Environment and settings
│   ├── db.py                # Database session and migrations setup
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Request/response validation
│   ├── api.py               # REST routes
│   ├── auth.py              # Authentication and permissions
│   ├── tasks.py             # Task and recurrence logic
│   ├── planner.py           # Scheduling and conflict detection
│   ├── reminders.py         # Reminder state machine
│   ├── calendar.py          # Google/Apple adapters and sync  (RENAME to calendar_sync.py: shadows stdlib `calendar`)
│   ├── imports.py           # Excel/CSV import
│   ├── assistant.py         # AI tools and command handling
│   ├── memory.py            # Profile and episodic memory
│   ├── notifications.py     # Push and delivery adapters
│   ├── automations.py       # Recurring workflows and triggers
│   ├── analytics.py         # Reports and behavioral metrics
│   └── workers.py           # Celery jobs and scheduled workflows
│
├── ai/
│   ├── runtime.py           # Local model inference interface
│   ├── prompts.py           # System prompts and templates
│   └── models/              # Model configuration; weights stored separately
│
├── tests/                   # Backend, integration and end-to-end tests
├── infra/
│   ├── Dockerfile
│   └── compose.yaml
├── migrations/              # Alembic database migrations
├── .env.example
├── .gitignore
├── pyproject.toml
├── package.json
└── README.md
```

### Folder rules

- `apps/` contains user interfaces, not business rules.
- `server/` contains the authoritative application logic.
- `ai/` contains model-runtime code and prompt definitions, not unrestricted access to the database.
- `tests/` covers the whole system.
- `infra/` describes reproducible deployment.
- `migrations/` records schema changes.
- Model weights, OAuth secrets and user uploads must not be committed to Git.

If the desktop companion remains a small Python process, it can share Python dependency management with the server while retaining a separate entry point and permissions.

# 5. Complete database design

The database represents not only what is planned, but also what actually happened, which reminders were delivered, why a schedule changed and what the AI was authorized to do. One PostgreSQL database.

| Table | Purpose and important fields |
| --- | --- |
| `users` | `id`, `email`, `timezone`, `preferences`, `created_at` |
| `tasks` | `id`, `user_id`, `title`, `description`, `status`, `priority`, `deadline_at`, `estimated_minutes`, `schedule_type`, `source` |
| `task_occurrences` | Individual instances of recurring tasks, with `task_id`, `starts_at`, `ends_at`, `status`, `recurrence_key` |
| `task_schedules` | Schedule history, revisions, original time, proposed time and change reason |
| `task_dependencies` | Prerequisite relationships between tasks |
| `subtasks` | Parent/child task relationships, ordering and completion |
| `recurrence_rules` | Recurrence frequency, weekdays, local time, effective dates and exceptions |
| `reminder_rules` | Lead time, repeat interval, escalation policy, maximum repeats and quiet-hours behavior |
| `reminder_instances` | Due time, delivery state, attempts, deduplication key and acknowledgement |
| `notification_deliveries` | Channel, device, provider response, error details and delivery timestamp |
| `devices` | Platform, push token, permission status, last-seen time |
| `calendar_connections` | Provider, account identity, encrypted credentials and sync state |
| `calendar_events` | External event ID, calendar ID, task link, last synchronization time and provider revision |
| `calendar_sync_cursors` | Provider-specific incremental sync token and synchronization checkpoint |
| `imports` | Original filename, processing state, validation errors and import metadata |
| `import_rows` | Parsed row data, normalized task candidate, warnings and confirmation status |
| `task_events` | Append-only history of task starts, completions, postponements and changes |
| `planning_runs` | Planning date, schedule snapshot, proposed changes, approval and outcome |
| `user_memory` | User-approved preferences, facts, memory type, confidence and expiry |
| `assistant_sessions` | Conversation metadata and references to stored messages |
| `assistant_messages` | Message content, role, timestamp and relevant tool-call references |
| `automation_rules` | Trigger, conditions, permitted actions, schedule and enabled status |
| `automation_runs` | Execution state, result, errors and idempotency key |
| `user_goals` | Goal description, target date, progress and associated tasks |
| `focus_sessions` | Task, start/end, interruptions, actual duration and outcome |
| `audit_logs` | Sensitive actions, actor, authorization context and before/after references |

### Database implementation requirements

- **IDs and ownership:** UUID primary keys. Every user-owned entity has an ownership path to `users.id`. Enforce authorization in the backend and consider PostgreSQL row-level security as an additional safeguard.
- **Time handling:** real timestamps as `TIMESTAMPTZ`. Recurrence definitions in local time with an IANA time-zone identifier. All-day events stored separately from timed events.
- **Task state:** validated enums or database constraints. Arbitrary strings must not determine business behavior.
- **Schedule history:** do not overwrite previous times. Preserve schedule revisions and the reason for each meaningful change.
- **Recurring tasks:** separate the recurrence rule from individual occurrences. Completing Monday's workout must not mark every future workout complete.
- **Reminder idempotency:** each logical reminder execution has a unique deduplication key. Database transactions prevent duplicate pending reminders.
- **Auditability:** record who or what initiated a change, whether approval was required, and the result.
- **Retention:** define how long conversation content, uploaded spreadsheets, notification logs and personal memory are retained.

## Core task statuses

`planned`, `due`, `in_progress`, `blocked`, `completed`, `skipped`, `cancelled`.

An overdue task can be represented through its due time and state, or through a derived overdue flag. Avoid too many overlapping statuses that mean the same thing.

## Core reminder statuses

`pending`, `processing`, `delivered`, `acknowledged`, `cancelled`, `failed`.

Delivery is not acknowledgement. A push provider accepting a notification does not prove the user saw it.

# 6. Complete API design

Every API uses authentication, validates input, enforces ownership, returns consistent error responses and records important changes. Use `/api/v1` as the prefix, with a single REST API shared by all clients.

| Module | Endpoints |
| --- | --- |
| Identity | `GET /me`, `PATCH /me/preferences`, `POST /auth/logout` |
| Tasks | `GET /tasks`, `POST /tasks`, `GET /tasks/{id}`, `PATCH /tasks/{id}`, `DELETE /tasks/{id}` |
| Task actions | `POST /tasks/{id}/start`, `/complete`, `/snooze`, `/skip`, `/reschedule` |
| Subtasks | `GET /tasks/{id}/subtasks`, `POST /tasks/{id}/subtasks` |
| Calendar | `GET /calendar/events`, `POST /calendar/connections`, `POST /calendar/sync` |
| Scheduling | `POST /planning/generate`, `GET /planning/{id}`, `POST /planning/{id}/approve`, `POST /planning/{id}/reject` |
| Reminders | `GET /reminders`, `PATCH /reminders/rules/{id}`, `POST /reminders/{id}/acknowledge`, `POST /reminders/test` |
| Import | `POST /imports`, `GET /imports/{id}`, `POST /imports/{id}/confirm` |
| Briefings | `GET /briefings/today`, `GET /briefings/tomorrow`, `POST /briefings/generate` |
| AI assistant | `POST /assistant/command`, `GET /assistant/sessions`, `POST /assistant/sessions` |
| Memory | `GET /memory`, `POST /memory`, `PATCH /memory/{id}`, `DELETE /memory/{id}` |
| Automation | `GET /automations`, `POST /automations`, `PATCH /automations/{id}`, `POST /automations/{id}/run` |
| Focus | `POST /focus/start`, `POST /focus/{id}/pause`, `POST /focus/{id}/finish` |
| Analytics | `GET /analytics/summary`, `GET /analytics/focus`, `GET /analytics/schedule-accuracy` |
| Devices | `POST /devices/register`, `DELETE /devices/{id}`, `POST /devices/{id}/test-notification` |

This is the endpoint inventory; each endpoint still needs a formal request schema, response schema, authorization policy and error contract.

### API engineering details

- Cursor pagination for long lists.
- Filters by date range, status, priority and category.
- Idempotency keys for retryable create and action requests.
- Optimistic concurrency (record revision or `ETag`) to avoid overwriting newer changes from another device.
- Conflicts returned as structured errors that clients can explain.
- Background jobs for long-running imports, calendar synchronization and planning.
- Never expose raw provider tokens or internal model prompts in API responses.
- Generate OpenAPI documentation from FastAPI and validate client requests against the published contract.

A task-completion request atomically updates the task, appends its event record and cancels its pending reminders. Any external notification cancellation can then be performed asynchronously and retried.

# 7. `Guide.xlsx` — exact import behavior

The uploaded workbook is the initial real-world input, not just a sample. The import system must accommodate its existing two-column routine format, repeated date headings and time ranges.

## Import workflow

1. **Upload workbook** — validate file extension, size, workbook structure and worksheet names.
2. **Parse schedule** — detect date headings, time ranges, activity text and blank or merged cells.
3. **Normalize activities** — create task candidates with start time, end time, duration and original text.
4. **Check conflicts** — identify overlaps, missing dates, ambiguous overnight times and invalid durations.
5. **Review and edit** — display all rows in an editable table with warnings and suggested corrections.
6. **Commit import** — save confirmed tasks and schedules in one controlled transaction, then create reminder jobs.

### Data normalization rules

Every parsed row preserves:

- Original sheet name and row number.
- Original date and time values.
- Original activity text.
- Normalized title.
- Parsed start and end time.
- Calculated duration.
- Warnings and validation status.
- Final task ID after import.

For example, `DSA practice` becomes a structured task. The original text remains available for auditing, while category and priority can be edited before confirmation.

### Special time rules

The importer must distinguish:

- A range crossing noon.
- A range crossing midnight.
- A duration that appears invalid.
- An actual Excel time value versus a text string.
- An overnight activity belonging to the previous or next date.

Never assume `12:30 - 01:00` means the same thing in every context. Use surrounding schedule entries, the date and explicit rules to propose an interpretation. Ask the user to resolve genuine ambiguity.

### Import safety

- Never execute macros.
- Validate workbook content before parsing.
- Do not treat cell formulas or external links as trusted input.
- Avoid creating duplicates when the same file is imported again.
- Let the user review the changes before committing them.
- Support rollback of an import without deleting unrelated tasks.
- Do not schedule notifications for unconfirmed rows.

Once confirmed, the schedule becomes ordinary editable data. The user should not need to upload the same spreadsheet every day.

# 8. The scheduling engine in detail

The AI must not be the only component deciding when activities occur. Use a deterministic scheduling engine that can be tested and audited.

## Scheduling inputs

- Fixed events and unavailable periods.
- Existing task schedules.
- Deadlines and task dependencies.
- Estimated task durations.
- Priority and importance.
- Preferred time windows.
- Sleep and break rules.
- Travel time and transition buffers.
- Recurrence rules.
- User-approved scheduling policies.
- Actual duration history, when sufficient data exists.

## Scheduling process

1. Load the confirmed calendar and task snapshot.
2. Reserve fixed commitments.
3. Calculate the remaining available time.
4. Identify tasks that are ready to schedule.
5. Respect dependencies and deadlines.
6. Rank eligible tasks by priority and urgency.
7. Allocate appropriate time blocks.
8. Preserve buffers and required breaks.
9. Detect infeasible tasks and unresolved conflicts.
10. Return a proposed schedule with an explanation for each meaningful change.
11. Apply allowed changes and request approval for protected changes.
12. Record a new schedule revision and update reminder jobs.

### Advanced optimization

For more complicated planning, model scheduling as a constraint optimization problem using Google OR-Tools. The objective can balance meeting deadlines, avoiding missed fixed commitments, minimizing unnecessary schedule changes, respecting preferred working periods, reducing fragmentation of long tasks, keeping realistic breaks and transition time, and avoiding excessive workloads.

Hard constraints must never be traded away merely to improve a score. For example, the solver must not move a fixed exam simply because that creates a mathematically better timetable.

The result includes an explanation such as: "DSA practice was moved to 3:00 PM because the earlier slot conflicts with a fixed event. Your research deadline remains unchanged."

The system also identifies tasks that cannot fit. A truthful warning is better than an attractive but impossible calendar.

# 9. Background workers and the automation engine

Use Celery with Redis for background execution, with PostgreSQL as the authoritative store of job state and reminder records.

The worker system handles:

- Due reminder processing.
- Recurring task generation.
- Morning briefing generation.
- Night planning.
- Calendar synchronization.
- Spreadsheet import processing.
- AI-assisted planning jobs.
- Retry and failure handling.
- Cleanup of expired temporary files.
- Notification permission and delivery diagnostics.
- Periodic consistency checks.

## Scheduled workflows

| Workflow | Trigger | Required behavior |
| --- | --- | --- |
| Morning briefing | Daily at 07:00 | Generate a current summary from confirmed records |
| Night planning | Daily at 23:30 | Review the next day and prepare a proposed schedule |
| Task reminders | At each configured due time | Deliver, record, and follow up according to policy |
| Recurrence generation | Scheduled background job | Create future occurrences within a configurable horizon |
| Calendar sync | Provider changes or scheduled sync | Reconcile changes without duplicating events |
| Recovery checks | Periodic | Find missed jobs, stale reminders and failed synchronization |
| Cleanup | Scheduled | Remove expired temporary data according to retention rules |

All times use `Asia/Kolkata` by default, but the stored time zone remains configurable.

### Reliability rules

- Persist reminder jobs before relying on their delivery.
- Use transactional outbox patterns where database changes must trigger external jobs.
- Make worker operations idempotent.
- Recheck task status immediately before delivering a reminder.
- Use bounded retries and a dead-letter or failed-job inspection mechanism.
- Alert the user if a worker stops processing jobs.
- Reconcile overdue reminder records after outages.
- Never assume that a queued notification has reached the device.

For this use case, these reliability mechanisms matter more than adding more AI agents.

# 10. Advanced AI architecture without external LLM APIs

The long-term goal is a system the owner controls, so the AI runtime stays independent from the rest of the application. The system must work even if the AI model is unavailable. Reminders, task completion, recurring routines and fixed scheduling rules must not depend on a language model responding.

## AI execution pipeline

1. **User command** — text, voice or a scheduled automation.
2. **Intent and context** — identify the action and retrieve relevant tasks, preferences and dates.
3. **Locally hosted model** — interpret the request and return structured tool arguments.
4. **Policy and validation engine** — check ownership, permissions, conflicts, allowed actions and approval requirements.
5. **Execute and audit** — run the approved operation, update records and explain the outcome.

### Model responsibilities

Language-understanding tasks:

- Interpreting natural-language commands.
- Extracting task details from notes and spreadsheets.
- Suggesting priorities and task breakdowns.
- Summarizing the day.
- Explaining schedule conflicts.
- Retrieving relevant personal notes.
- Drafting plans and recommendations.

Deterministic code handles:

- Time calculations.
- Recurrence rules.
- Reminder delivery.
- Calendar conflict checks.
- Permission checks.
- State transitions.
- Database updates.
- Audit logs.

This division makes the system more reliable and easier to debug.

### Local AI runtime

Create a small internal interface such as `generate_structured_response()` and `generate_text()`. The application communicates with that interface rather than depending on a specific model. The runtime can use locally hosted open-weight models initially, with a documented path toward the owner's own trained models. Model weights live outside the source repository and are loaded from controlled storage.

If the requirement is to use absolutely no third-party pretrained model weights, the model-training pipeline becomes a separate major research effort. That is compatible with the architecture, but it is not necessary to build the scheduling, reminder and application infrastructure.

### AI safety rules

- Never expose database credentials or secret tokens to the model.
- Do not allow arbitrary SQL, shell commands or unrestricted code execution.
- Validate every tool call against a strict schema.
- Treat spreadsheet text, imported notes and external calendar descriptions as untrusted content.
- Ignore instructions embedded in imported content that attempt to override system permissions.
- Require confirmation for destructive operations and protected schedule changes.
- Store a record of consequential actions and their authorization.

# 11. Calendar synchronization and conflict handling

Google Calendar and Apple Calendar connect through separate adapters, but both feed a unified internal calendar representation.

## Google Calendar

Use OAuth 2.0 and the Google Calendar API to:

- Read events.
- Create or update approved events.
- Store provider event IDs.
- Track incremental synchronization.
- Process provider change notifications where available.
- Recover from expired synchronization tokens.
- Detect events edited outside the system.

Request only the necessary OAuth scopes. Encrypt refresh tokens at rest and support disconnection and revocation.

## Apple Calendar

On macOS and iOS, use native EventKit access with the appropriate permissions. For cloud-side synchronization, implement a supported CalDAV strategy for iCloud or use a calendar subscription/export workflow where appropriate.

Do not assume that an Apple Calendar event is always directly accessible from a cloud backend. Some calendars may be local-only, and account access varies by platform and configuration.

## Conflict-resolution rules

Every external event records its source and last synchronization state. If an external event changes:

1. Compare the latest provider event with the stored snapshot.
2. Determine which tasks or schedule blocks are affected.
3. Protect fixed commitments.
4. Recalculate flexible blocks.
5. Apply permitted changes or request approval.
6. Update reminder schedules.
7. Record the result.

If both the system and an external calendar modify the same event concurrently, show a conflict rather than silently overwriting one side. Use provider IDs and synchronization tokens to avoid duplicate events. A task linked to a calendar event must not generate a second unrelated event on every synchronization.

# 12. Security, privacy and resilience

This application contains personal routines, location-related activities, goals and calendar data. Treat security as part of the architecture, not a final cosmetic feature.

| Area | Required design |
| --- | --- |
| Authentication | Secure sign-in, protected sessions and account recovery |
| Authorization | Verify user ownership on every task and calendar operation |
| Secrets | Environment-based secrets and encrypted provider credentials |
| Transport | HTTPS for all production traffic |
| Database | Managed access controls, backups and tested restoration |
| Uploads | File validation, size limits, private temporary storage and retention rules |
| AI | Minimal context retrieval, local inference and strict tool permissions |
| Audit | Track important changes and automated actions |
| Notifications | Store only necessary delivery data and protect device tokens |
| Recovery | Retry transient failures and reconcile missed jobs |
| Privacy controls | Export, deletion, memory editing and calendar disconnection |
| Monitoring | API errors, worker health, missed reminders and sync failures |

Use database migrations, automated tests and a reproducible deployment configuration. Keep personal data out of logs wherever possible.

Cloud-based application data does not mean the AI model must run in a third-party cloud. The database and API can be hosted in the cloud while inference runs on a machine the owner controls. The trade-off is that locally hosted inference is unavailable when that machine is offline unless another controlled inference host exists.

# 13. Advanced features that make the system genuinely useful

- **Goal and milestone tracking** — connect long-term goals to projects, milestones, tasks and deadlines. Identify what needs to happen today to keep a goal on track without filling the entire day with work.
- **Inbox and capture centre** — collect tasks from typed notes, voice commands, imported documents and permitted email integrations. Keep captured items in an inbox until categorized and scheduled.
- **Event-driven automation** — rules such as "When a task is completed, prepare the next task" or "When a meeting is added, check whether my schedule conflicts." Include execution history, retries and an enable/disable control for each automation.
- **Personal productivity analytics** — completion rates, schedule accuracy, overdue tasks, focus sessions and workload trends. Distinguish measured data from estimates and AI-generated interpretations.
- **Location-aware planning** — optionally use user-authorized location to suggest travel buffers or location-specific reminders. Optional and disabled by default.
- **Plugin and tool framework** — a controlled registry for integrations such as calendar, files, voice, desktop applications and future smart-home devices. Each integration declares its permissions, inputs and permitted side effects.
- **Offline resilience** — cache the current schedule on devices, support local actions where possible, queue changes and reconcile them after reconnection. Resolve conflicting edits instead of blindly overwriting the latest data.

# 14. The complete daily operating cycle

- **07:00 AM — Morning briefing:** review the confirmed schedule, deadlines, first task and important changes.
- **Throughout the day — Execute and follow up:** send reminders, track starts and completions, and reschedule flexible tasks when necessary.
- **Whenever plans change — Recalculate the schedule:** check conflicts, protect fixed commitments and update affected reminders.
- **11:30 PM — Review and plan:** summarize completed work, carry forward unfinished tasks and propose tomorrow's plan.
- **After planning — Prepare the next day:** persist approved changes, schedule reminder jobs and prepare the next briefing.

# 15. Implementation and engineering requirements

Even though this is one final target system, it is developed in dependency order, to avoid building advanced features on top of unreliable foundations.

1. **Foundation:** repository, authentication, database, migrations, API contracts and deployment configuration.
2. **Life data:** task management, recurrence, schedule history, `Guide.xlsx` import and the internal calendar.
3. **Scheduling:** deterministic planner, fixed/flexible policies, conflict detection and approval workflows.
4. **Reliability:** reminder state machine, background workers, notification adapters, retries and recovery checks.
5. **Daily intelligence:** morning and night workflows, local model runtime, memory and validated tool calling.
6. **Integrations:** Google Calendar, Apple Calendar, mobile notifications, desktop companion and voice controls.
7. **Advanced capabilities:** focus management, analytics, event-driven automation, goal tracking and offline reconciliation.
8. **Production readiness:** security testing, monitoring, backups, end-to-end tests and operational recovery procedures.

The advanced functionality belongs in the final design from the beginning, but each component must become operational before dependent components can use it reliably.

# 16. Final acceptance criteria

The system is complete only when the following behavior works in real tests. These are acceptance criteria to test, not claims that the software has been built.

**Tasks and imports**

- [ ] Guide.xlsx imports with a reviewable preview and no silent time guesses
- [ ] Manual and AI-created tasks can be edited from every connected client
- [ ] Recurring tasks generate separate occurrences correctly

**Scheduling**

- [ ] Fixed events are protected from unauthorized changes
- [ ] Flexible tasks can be automatically rescheduled within defined constraints
- [ ] Impossible schedules produce explicit conflicts

**Reminders**

- [ ] Reminders persist across backend and worker restarts
- [ ] Task actions cancel obsolete reminders
- [ ] Duplicate jobs do not create duplicate logical alerts
- [ ] Delivery failures are recorded and recoverable

**AI and autonomy**

- [ ] Natural-language commands map to validated tools
- [ ] The AI cannot bypass permissions or modify the database directly
- [ ] Protected changes require approval
- [ ] Memory can be reviewed and deleted

**Integrations and operations**

- [ ] Google Calendar synchronization handles conflicts and duplicate prevention
- [ ] Apple Calendar permissions and synchronization limitations are explicit
- [ ] Morning and night workflows respect Asia/Kolkata
- [ ] Monitoring identifies failed jobs, notification issues and sync failures

**Security and resilience**

- [ ] Every user-owned resource is protected by authorization
- [ ] Secrets and OAuth tokens are protected
- [ ] Backups can be restored
- [ ] Offline changes are reconciled without silent data loss

# 17. The final decisions locked in

- Product: personal AI operating system (now **LifePilot**, assistant **Orion**).
- Clients: website, Android, iOS and a macOS companion (see `AGENTS.md` Section 9b for what is actually built first).
- Architecture: one modular backend, one authoritative database and persistent background workers.
- AI: controlled, self-hosted inference with a path toward own models; no dependency on an external LLM API.
- Scheduling: deterministic constraint-based engine supported by AI.
- Reminders: persistent, state-aware and multi-channel, with realistic device-permission handling.
- Calendar: internal calendar plus Google and Apple integrations.
- Data: cloud synchronization, encrypted credentials and optional local AI processing.
- Daily routine: 7:00 AM briefing and 11:30 PM planning in `Asia/Kolkata`.
- Project structure: compact monorepo with only three client applications, a small backend module set, AI runtime, tests and infrastructure.
- Extensibility: explicit tool permissions, event-driven automation, memory, analytics and future device integrations.

Strongest recommendation: prioritize correctness and reliability in the scheduling and reminder engine, then layer the advanced AI capabilities on top. A system that makes excellent decisions but misses an alarm is not a good assistant. A system that reliably manages the day, remembers what happened, explains its decisions and gets more useful over time is.
