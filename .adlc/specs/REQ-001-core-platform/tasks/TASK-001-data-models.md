---
id: TASK-001
title: "Implement Core Database Models and Capacity Constraints"
status: complete
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: []
---

## Description

Scaffold and validate the primary database table schemas mapping the core entity specifications (`MOTHERS`, `GROUPS`, `APPLICATIONS`, `LEADERS`, `NOTIFICATIONS`). The task ensures strict index constraints, non-nullable boundary checks, and pessimistic table/row locks to prevent group overbooking during application state transitions.

## Files to Create/Modify

- `src/models/Mother.js` — Define schema layout capturing demographic arrays (children ages) and time preferences.
- `src/models/Group.js` — Implement table design with capacity bounds verification (2-15 members).
- `src/models/Application.js` — Establish foreign key indices and standard state strings.
- `src/models/Leader.js` — Implement schema layout capturing admin verification gates.
- `src/models/Notification.js` — Define polymorphic delivery queues.

## Acceptance Criteria

- [ ] Schema indices successfully enforce unique identity constraints on email fields.
- [ ] Attempting to persist a group model with `Max Capacity` exceeding 15 throws a clear schema validation failure.
- [ ] Relationships properly cascade delete or protect references between Groups and Applications.

## Technical Notes

- Leverage database transactions when evaluating and incrementing `Current Member Count` to guarantee thread safety and prevent capacity race conditions.
