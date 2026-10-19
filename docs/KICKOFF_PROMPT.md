# Kickoff prompt — paste this as your FIRST message in Claude Code or Antigravity

You are the lead engineer for **LifePilot**, my personal life operating system, with a built-in AI assistant called **Orion**. It is for my own use and is also my resume project, so it must look and behave like a professional, production-grade app: a polished scrolling landing page plus a full app with every feature in `docs/BLUEPRINT.md`.

Read, in this order: `CLAUDE.md` / `AGENTS.md` (the rules above), `docs/BLUEPRINT.md`, then inspect `docs/Guide.xlsx` read-only.

You are in **Phase 0: Discovery**, and you are bound by the human-in-the-loop protocol. Do NOT write application code, schemas or scaffolding yet.

Your first reply must contain exactly these four parts, then stop and wait:

1. **My project in your words** — what LifePilot is, what Orion does, what "done" looks like (max 12 lines), plus anything in the blueprint you think is contradictory, unrealistic for a solo student, or risky.
2. **`Guide.xlsx` findings** — structure, 10 sample rows with your proposed parse, and every ambiguity you need me to resolve.
3. **Scope and effort reality check** — validate or challenge the under-1-month plan in Section 9b with honest per-phase estimates for one developer, and say what else should be cut or deferred so the resume version ships with quality.
4. **Your question batch (max 10)** in the ⭐-default format. Cover at least:
   - My laptop's OS (hardware is already decided: 16 GB, no GPU), which specific small model you recommend for Orion with expected speed, how my Android phone should reach Orion (private tunnel such as Tailscale vs same Wi-Fi only) and what should happen when the laptop is off or asleep.
   - Hosting and budget for the demo (free tiers vs small paid VPS) and whether the live demo needs Orion online.
   - Single-owner-only vs a multi-user-ready schema (resume value vs simplicity).
   - Whether I can create a Google Cloud OAuth project now (Apple Calendar is already deferred; `.ics` is the interim path).
   - Visual direction is already decided (futuristic + realistic, Section 5). Ask only for my choice between your 2 variants of palette, typography and motion.
   - Whether the Section 9b four-week cut is right, what you would change, and which features give the strongest resume signal per day of effort.
   - Voice: push-to-talk only first, or wake word too.
   - Whether to build a shared design system package or keep styles inside `apps/web`.
   - Nothing about tools: I use both Claude Code and Antigravity (Section 1b). Propose how you will keep `docs/STATUS.md` and `docs/DECISIONS.md` in sync so I can switch freely.

After I answer, you will produce a **Phase 0 summary + scope lock** (decisions, deferred items, risks, the approved stack, and the Phase 1 plan) and wait for `/approve`.
