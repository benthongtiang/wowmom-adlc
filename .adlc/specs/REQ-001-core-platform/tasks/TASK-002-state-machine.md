---
id: TASK-002
title: "Implement Application State Machine, Services, Routes, and Middleware"
status: draft
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: ["TASK-001"]
repo: delta
---

## Description

Build the business logic layer and API routing layer. Implements the application state machine (Pending → Interview Scheduled → Accepted/Rejected → Active Participant), capacity enforcement, 30-day reapplication cooldown, interview scheduling with email dispatch, roster masking, and leader approval workflow. Exposes role-gated REST endpoints and authentication middleware.

## Files to Create/Modify

- `src/utils/stateTransitions.js` — Valid transition map; `canTransition(from, to)` guard using APPLICATION_STATES constants
- `src/utils/dateUtils.js` — `isWithinCooldown(rejectedAt, cooldownDays)` using UTC, `isWithinSLA(applicationDate, slaDays)`
- `src/utils/emailTemplates.js` — Template renderers for each notification event; dynamic slot selection link construction with HMAC-signed URLs
- `src/utils/validators.js` — Email format, phone, zip code, children ages array, preferred times enum validation
- `src/middleware/authMiddleware.js` — JWT/session validation; attaches `req.user` (id, role)
- `src/middleware/roleGuard.js` — `requireRole(allowedRoles)` middleware factory; 403 on mismatch
- `src/middleware/errorHandler.js` — Global structured error response `{ error, code, details }`
- `src/middleware/index.js` — [ADDRESS] export
- `src/services/CapacityEnforcer.js` — `validateGroupCapacity(groupId, tx)` — pessimistic SELECT FOR UPDATE, returns error if full; `validateConcurrentApplications(motherId)` — counts active apps, rejects if >= 3
- `src/services/ReapplicationCooldownService.js` — `checkCooldown(motherId, groupId)` — queries APPLICATIONS for rejection within cooldown window; throws structured error if blocked
- `src/services/ApplicationService.js` — `submitApplication(motherId, groupId)`: calls CapacityEnforcer + CooldownService + concurrency check + inserts Application in `Pending` state, enqueues ApplicationSubmitted event. `transitionState(applicationId, newStatus, actorId, payload)`: validates transition, updates record, enqueues notification event.
- `src/services/InterviewService.js` — `proposeSlots(applicationId, slots, leaderId)`: transitions to Interview Scheduled, constructs HMAC-signed confirmation URLs, enqueues InterviewProposed email. `confirmSlot(applicationId, slot, token, motherId)`: validates HMAC token + motherId, records confirmed slot.
- `src/services/NotificationService.js` — `queueEmail(userId, userType, eventType, payload)`: pushes to background queue; never blocks the calling service. Event handlers for all 5 events.
- `src/services/RosterService.js` — `getRoster(groupId, requesterId, requesterRole)`: returns full contacts for leader/admin/Active Participant; returns masked record (no phone/address) for others.
- `src/services/LeaderApprovalService.js` — `approveLeader(leaderId, adminId)`: sets approved_by_admin, logs audit event, enqueues approval notification.
- `src/services/index.js` — [ADDRESS] export
- `src/repositories/MotherRepository.js` — CRUD + query helpers (findByEmail, countActiveApplications)
- `src/repositories/GroupRepository.js` — findAvailable (filters Full), lockForUpdate (pessimistic), incrementMemberCount (transactional)
- `src/repositories/ApplicationRepository.js` — findByMotherAndGroup, countActiveByMother, findRejectedWithinWindow
- `src/repositories/LeaderRepository.js` — findPending (admin approval queue), findById
- `src/repositories/NotificationRepository.js` — insert, markRead
- `src/repositories/index.js` — [ADDRESS] export
- `src/routes/auth.js` — POST /auth/login, /auth/register (Mother and Leader with role param), /auth/logout
- `src/routes/mothers.js` — GET/PUT /mothers/:id (profile), GET /mothers/:id/applications
- `src/routes/groups.js` — GET /groups (discovery with filters), POST /groups (leader+approved only), GET /groups/:id/roster
- `src/routes/applications.js` — POST /applications (submit), POST /applications/:id/interview-slots (leader proposes), POST /applications/:id/interview-confirm (mother confirms), POST /applications/:id/accept, POST /applications/:id/reject, POST /applications/:id/activate
- `src/routes/admin.js` — GET /admin/leaders/pending, POST /admin/leaders/:id/approve, GET /admin/metrics
- `src/routes/index.js` — Route registration on Express app
- `src/app.js` — Express app initialization: middleware stack (authMiddleware, roleGuard, errorHandler), route registration, database connection
- `tests/unit/services/ApplicationService.test.js` — Tests: max 3 concurrent app block, capacity gate rejection, state transition validation, 30-day cooldown rejection
- `tests/unit/services/CapacityEnforcer.test.js` — Tests: boundary at exactly 15 (reject), exactly 2 (accept), exactly 1 (below min for group creation)
- `tests/unit/services/ReapplicationCooldownService.test.js` — Tests: exactly 30 days (blocked), 31 days (allowed), same-day rejection (blocked)
- `tests/unit/utils/stateTransitions.test.js` — Valid and invalid transition pairs
- `tests/integration/InterviewSchedulingFlow.test.js` — Full flow: submit → propose slots → confirm slot → accept → activate; verify email queue calls at each step
- `tests/integration/ApplicationStateTransition.test.js` — State machine progression with invalid transition rejection
- `tests/integration/RosterMasking.test.js` — Verify phone/address hidden for Pending/Interview Scheduled mothers; visible for Active Participant
- `tests/integration/CapacityRaceCondition.test.js` — Simulate concurrent submissions at max capacity; verify exactly one succeeds

## Acceptance Criteria

- [ ] Submitting a 4th concurrent application returns a structured 422 error.
- [ ] Submitting an application to a full group (current_member_count == max_capacity) returns a 422 error.
- [ ] Transitioning to `Interview Scheduled` enqueues an InterviewProposed email with HMAC-signed slot links.
- [ ] Re-applying to the same group within 30 days of rejection returns a structured 422 with cooldown expiry date.
- [ ] HMAC-signed slot confirmation URLs reject tampered tokens with 401.
- [ ] RosterService masks phone/address for any requester whose application is not `Active Participant`.
- [ ] Leaders with `approved_by_admin = false` receive 403 on POST /groups.
- [ ] All unit and integration tests pass.

## Technical Notes

- ApplicationService.submitApplication() must perform capacity check INSIDE a database transaction with a pessimistic lock (SELECT ... FOR UPDATE on the target group row) to prevent overbooking under concurrent load.
- NotificationService must enqueue asynchronously — never await email delivery inline in a state transition. If the queue is unavailable, log the error and continue (state transition succeeds; email is best-effort with retry).
- HMAC tokens for interview confirmation must include applicationId + slotIndex + motherId; validate all three on confirmation.
- The `canTransition(from, to)` utility must be the single source of truth for transition validity — ApplicationService and route handlers must not re-implement transition logic.
- All routes → services → repositories; no repository calls from route handlers directly.
- Error responses are always `{ error: string, code: string, details?: object }` — never expose stack traces in API responses.
