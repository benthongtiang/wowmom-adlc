---
id: TASK-002
title: "Implement Application State Machine and Notification Triggers"
status: complete
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: ["TASK-001"]
---

## Description

Develop the core service layer managing application state lifecycle mutations (`Pending` → `Interview Scheduled` → `Accepted` → `Active Participant` / `Rejected`). Integrate event listeners triggering structured email dispatches upon state changes while enforcing business logic rules including the concurrency ceiling and 30-day reapplication cooldowns.

## Files to Create/Modify

- `src/services/ApplicationService.js` — Core gateway evaluating the 3-application rule and validating state transition safety.
- `src/services/InterviewService.js` — Handles email link construction capturing selected slots and timestamp mapping.
- `src/services/NotificationService.js` — Dispatches event-driven email templates to designated persona endpoints.

## Acceptance Criteria

- [ ] Submitting a new application correctly resolves `Current Member Count` against `Max Capacity` prior to returning a success payload.
- [ ] Transitioning state to `Interview Scheduled` triggers an event-driven email delivery containing dynamic time block selection paths.
- [ ] A rejected profile re-applying before the 30-day expiration window is blocked with structured user feedback.

## Technical Notes

- Isolate notification dispatch inside asynchronous background workers/queues to maintain highly responsive API endpoints for client requests.
