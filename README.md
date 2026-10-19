# LifePilot × Orion — project starter kit

Personal AI life operating system (tasks, calendar, persistent reminders, briefings, focus, analytics) with a built-in assistant named **Orion**. This folder is the **starter kit**: rules, blueprint, kickoff prompt and control commands for building the app with Claude Code or Antigravity using a human-in-the-loop workflow.

## What is in here

| File | Purpose |
|---|---|
| `AGENTS.md` | Canonical rules for the agent: protocol, locked decisions, stack, UI standard, phases, 4-week cut |
| `CLAUDE.md` | One line, `@AGENTS.md`, so Claude Code loads the same rules |
| `docs/BLUEPRINT.md` | Your original JARVIS blueprint, the scope source of truth |
| `docs/Guide.xlsx` | Your real routine (git-ignored, never commit it) |
| `docs/KICKOFF_PROMPT.md` | The first message to paste into the agent |
| `docs/COMMANDS.md` | `/approve`, `/revise`, `/defaults`, `/ask`, `/status`, `/explain`, `/demo`, `/audit`, `/pause` |
| `docs/STATUS.md`, `docs/DECISIONS.md` | The agent's shared memory, so you can switch tools freely |
| `.gitignore`, `.env.example` | Safe defaults for secrets, personal data and model weights |

## How to start

1. Unzip, open this folder in Claude Code or Antigravity, and run `git init`.
2. If Antigravity does not load `AGENTS.md` automatically, add it as a workspace rule.
3. Paste the contents of `docs/KICKOFF_PROMPT.md` as your first message.
4. Answer the agent's Phase 0 questions (or send `/defaults`).
5. Approve each gate with `/approve`. Nothing proceeds without you.

## Switching between tools

The repo is the memory. Before you switch, send `/pause`. The new agent reads `AGENTS.md`, `docs/STATUS.md` and `docs/DECISIONS.md` and continues.
