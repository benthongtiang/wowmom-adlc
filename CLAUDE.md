# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is the **WoW Mom App** — a platform for registering and placing new mothers into small support groups. Three user roles: **Mothers** (applicants), **Group Leaders** (facilitators), and **Admins** (operators).


## Architecture

Four layers:

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
