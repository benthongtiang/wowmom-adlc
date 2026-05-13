---
id: TASK-001
title: "Scaffold Project and Implement Core Data Models"
status: draft
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: []
repo: delta
---

## Description

Bootstrap the project with package.json, directory structure, config files, DB migration scripts, and all five entity models (MOTHERS, GROUPS, APPLICATIONS, LEADERS, NOTIFICATIONS). Defines shared constants for application states and meeting time identifiers. Establishes pessimistic locking patterns in the data layer.

## Files to Create/Modify

- `package.json` — Dependencies: express, sequelize (or knex), jest, supertest, jsonwebtoken, nodemailer, bull; scripts for test and start
- `.env.example` — Template for DATABASE_URL, SMTP_*, JWT_SECRET, SESSION_SECRET, MAX_CONCURRENT_APPS_PER_MOTHER, GROUP_MIN/MAX_CAPACITY, REAPP_COOLDOWN_DAYS, INTERVIEW_SLA_DAYS, APP_URL
- `jest.config.js` — Test runner configuration with coverage threshold
- `src/config/appConfig.js` — Runtime config values read from process.env (capacity bounds, cooldown duration, SLA days); never hardcode
- `src/config/database.js` — DB connection and connection pool setup
- `src/utils/logger.js` — Winston/Pino structured logger wrapper (no console.log anywhere)
- `src/models/constants.js` — Exact string constants: APPLICATION_STATES (`Pending`, `Interview Scheduled`, `Accepted`, `Rejected`, `Active Participant`), MEETING_TIMES (`Morning`, `Afternoon`, `Evening`), ACCOUNT_STATUSES, LEADER_STATUSES
- `src/models/Mother.js` — Schema: mother_id (UUID PK), email (unique), password_hash, full_name, phone, address, zip_code, num_children, children_ages (JSON), preferred_times (JSON), preferred_locations (JSON), account_status, registration_date, created_at, updated_at
- `src/models/Group.js` — Schema: group_id (UUID PK), group_name (unique per location), description, leader_id (FK→LEADERS), meeting_time (enum), address, max_capacity (CHECK 2–15), current_member_count, meeting_frequency, group_status, created_at, updated_at
- `src/models/Application.js` — Schema: application_id (UUID PK), mother_id (FK→MOTHERS), group_id (FK→GROUPS), application_date, status (enum), interview_date, interview_time_slot, interview_confirmed_by_mother, rejection_reason, accepted_date, activated_date, leader_notes, updated_at
- `src/models/Leader.js` — Schema: leader_id (UUID PK), email (unique), password_hash, full_name, phone, leader_status, approved_by_admin (BOOLEAN), approved_by_admin_id, created_at, updated_at
- `src/models/Notification.js` — Schema: notification_id (UUID PK), user_id, user_type (Mother|Leader), notification_type, message, email_sent, read, created_at
- `src/models/index.js` — Barrel export for all models + associations (Mother hasMany Applications, Group hasMany Applications, Leader hasMany Groups)
- `database/migrations/001-create-mothers.sql` — MOTHERS table with email UNIQUE, NOT NULL constraints
- `database/migrations/002-create-leaders.sql` — LEADERS table with email UNIQUE
- `database/migrations/003-create-groups.sql` — GROUPS table with capacity CHECK and FK to LEADERS
- `database/migrations/004-create-applications.sql` — APPLICATIONS table with FKs and state enum
- `database/migrations/005-create-notifications.sql` — NOTIFICATIONS table (polymorphic user_id)
- `database/migrations/006-create-indices.sql` — Indices: (mother_id, status) composite on APPLICATIONS, (group_id) on APPLICATIONS, (leader_id) on GROUPS, (rejected_at) for cooldown queries, (created_at) for SLA checks
- `tests/unit/models/Group.test.js` — Capacity boundary unit tests
- `tests/unit/models/Application.test.js` — State constant validation tests

## Acceptance Criteria

- [ ] Schema indices enforce unique email constraints on MOTHERS and LEADERS.
- [ ] Persisting a Group with max_capacity outside [2, 15] throws a validation error.
- [ ] All APPLICATION_STATES and MEETING_TIMES are defined as exact string constants and no other string values are accepted.
- [ ] Foreign key associations are defined: Applications cascade-restrict on Group and Mother deletion.
- [ ] Config values (capacity bounds, cooldown days) read from process.env, not hardcoded.
- [ ] Unit tests for Group capacity boundary (min 2, max 15) pass.
- [ ] `logger` is exported and used instead of console.log throughout.

## Technical Notes

- Use database transactions and SELECT ... FOR UPDATE when reading Current Member Count in the application acceptance path to prevent capacity race conditions.
- All DB string enum values must reference constants from `src/models/constants.js` — never use inline strings.
- `current_member_count` is a derived/maintained integer, not auto-calculated — it is incremented transactionally when a mother reaches Active Participant and decremented on removal.
- The polymorphic NOTIFICATIONS.user_id does not have a DB-level FK constraint; integrity is enforced at the service layer.
