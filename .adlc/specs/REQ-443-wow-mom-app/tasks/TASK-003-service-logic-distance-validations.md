---
id: TASK-003
title: "Update Service Layer for Distance and Validations"
status: draft
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: [TASK-001, TASK-002]
---

## Description

Extend the service layer to perform geodistance calculation, enforce leader admin approval validation on application submission, and trigger group full notifications.

## Files to Create/Modify

- `src/services/ApplicationService.js` — check if group leader is approved in `submitApplication`. Dispatch `GROUP_FULL` notification on member count reaching maximum.
- `src/utils/distance.js` — **[NEW]** implement Haversine formula distance calculation in miles.

## Acceptance Criteria

- [ ] `ApplicationService.submitApplication` throws an error if the target group leader is not approved by an admin (`approved_by_admin === false`).
- [ ] `ApplicationService.activateParticipant` triggers a `GROUP_FULL` notification via `NotificationService` when member count reaches capacity.
- [ ] Haversine formula correctly computes distance in miles between coordinates.
- [ ] Add unit tests covering leader approval validations and group full notifications.

## Technical Notes

- Look up leader in database with row locking inside `submitApplication` transaction.
- Dispatch `GROUP_FULL` notification inside `activateParticipant` transaction asynchronously.
