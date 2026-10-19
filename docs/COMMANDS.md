# Control commands

Use these every time. They are plain text, so they work in both Claude Code and Antigravity.

- `/approve` — Gate passed. Proceed to the next step of the loop. If this was the PLAN gate, begin BUILD. If it was REVIEW, ask Phase N+1's questions (UNDERSTAND → ASK) and stop.
- `/revise <feedback>` — Do not proceed. Apply my feedback, show what changed, and return to the same gate.
- `/defaults` — Accept every ⭐ recommended answer in the current question batch and continue to PLAN.
- `/ask` — Before continuing, list any doubts or assumptions you are currently carrying and ask me about them.
- `/status` — Show the status header, completed work, open decisions (from `docs/DECISIONS.md`), failing tests, and next gate.
- `/explain <thing>` — Explain a design decision or file in plain language, with trade-offs, without changing anything.
- `/demo` — Give me exact steps to run and see the current state, and fix anything that does not run.
- `/audit` — Re-check the repo against Part A (security, secrets, stdlib-shadowing names, tests, docs) and report violations without changing code.
- `/pause` — Stop, summarise state, and write a handoff note to `docs/HANDOFF.md` so a fresh session can continue.

**Reminder to the agent on every message:** when in doubt, ask. A wrong assumption costs me more than a question.
