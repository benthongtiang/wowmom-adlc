# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is the **WoW Mom App** — a platform for registering and placing new mothers into small support groups. Three user roles: **Mothers** (applicants), **Group Leaders** (facilitators), and **Admins** (operators). The project is currently in spec-driven development using the ADLC workflow (see below).

The `adlc-toolkit/` subdirectory is the shared ADLC toolkit (symlinked to `~/.claude/skills/`). Project specs, architecture, and knowledge artifacts live in `.adlc/`.

## ADLC Workflow

All feature work goes through the ADLC pipeline. The canonical sequence:

```
/spec → /validate → /architect → /validate → implement → /reflect → /review → merge → /wrapup
```

- **`/proceed REQ-xxx`** — runs the full pipeline end-to-end (validate → architect → implement → reflect → review → PR → wrapup)
- **`/sprint`** — parallel `/proceed` across multiple REQs
- **`/bugfix <description>`** — streamlined bug fix with the same deploy strategy as a feature
- **`/status`** — show current state of all ADLC work
- **`/spec <feature request>`** — write a new requirement spec
- **`/architect REQ-xxx`** — break a spec into tasks
- **`/validate`** — gate-check any ADLC phase output before advancing
- **`/reflect`** — post-implementation self-review
- **`/review`** — multi-agent code review (correctness, quality, architecture, tests, security)
- **`/wrapup REQ-xxx`** — commit, merge, deploy, capture knowledge
- **`/analyze`** — codebase health audit
- **`/canary`** — canary deploy with smoke tests

Never implement without a validated spec. Never skip a gate. If a step doesn't apply, say so explicitly — don't silently omit it.

## Project Structure

```
.adlc/
  context/           # project-overview.md, architecture.md, conventions.md, taxonomy.md
  specs/             # REQ-xxx-*/ directories (requirement.md + tasks/)
  templates/         # local copies of toolkit templates
adlc-toolkit/        # toolkit source (symlinked to ~/.claude/skills/)
  agents/            # sub-agent definitions for /proceed phases
  */SKILL.md         # skill definitions
  templates/         # canonical templates
  presets/           # stack-specific config starters
```

## Architecture

Four layers (see `.adlc/context/architecture.md`):

1. **Client/UI** — persona-specific views (`screens/mother/`, `screens/leader/`, `screens/admin/`), responsive for mobile
2. **API Routing** — role-gated endpoints at `/auth`, `/mothers`, `/groups`, `/applications`, `/admin`
3. **Business Logic** — capacity enforcer, application state machine, interview scheduler, notification triggers
4. **Data Storage** — separate `Mothers` and `Leaders` tables (ADR-001); `Groups`, `Applications` entities

**Key constraints enforced everywhere:**
- Applications: max 3 concurrent per mother; states `Pending → Interview Scheduled → Accepted/Rejected → Active Participant`
- Groups: capacity 2–15; pessimistic locking on slot allocation to prevent overbooking
- Roster data (phone, address) is masked until a mother reaches `Active Participant`
- Leaders cannot create active groups until admin-approved

## Conventions

Source layout: `src/components/`, `src/screens/{mother,leader,admin}/`, `src/services/`, `src/models/`, `src/utils/`

- Entity names: pluralized PascalCase (`MOTHERS`, `GROUPS`, `APPLICATIONS`)
- Application states: exact string constants (`Pending`, `Interview Scheduled`, `Accepted`, `Rejected`, `Active Participant`)
- Meeting time identifiers: `Morning` (9am–12pm), `Afternoon` (1pm–4pm), `Evening` (6pm–8pm)
- Use `logger`, not `console.log`
- Config values in config files, never hardcoded
- Architecture: routes → services → repositories

## Tests

- Unit: capacity boundary checks (min 2, max 15), concurrent application limits (max 3), 30-day re-application cooldown
- Integration: multi-step interview scheduling flows, transactional member activation
- Run tests before every commit; never commit with failing tests

## Git / PR Conventions

- Branch per REQ, format: `feat/REQ-xxx-slug` or `agent/REQ-xxx-slug`
- Commit format: `feat(scope): description [TASK-xxx]`
- PRs require validated test coverage for state-modifying logic
- Merge order for cross-repo work is declared in `.adlc/config.yml`

## Retrieval Taxonomy

When writing specs or tagging artifacts, use values from `.adlc/context/taxonomy.md`:
- **component**: `API/auth`, `API/groups`, `API/applications`, `UI/mother`, `UI/leader`, `UI/admin`, `services/notifications`
- **domain**: `auth`, `discovery`, `applications`, `interviews`, `roster`, `analytics`
- **stack**: `react`, `react-native`, `nodejs`, `express`, `sql`
- **concerns**: `security`, `capacity-enforcement`, `state-consistency`, `mobile-responsiveness`, `notifications`
