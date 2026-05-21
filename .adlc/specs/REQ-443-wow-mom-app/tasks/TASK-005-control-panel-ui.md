---
id: TASK-005
title: "Enhance Interactive Control Panel UI"
status: draft
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: [TASK-004]
---

## Description

Update the embedded control panel at `server.js` (`/`) to integrate distance filters for mothers, display group distance tags, and add the Admin Oversight dashboard with the Leader approval queue.

## Files to Create/Modify

- `src/server.js` — enhance HTML structure and javascript logic served at `GET /`.

## Acceptance Criteria

- [ ] Interactive UI contains a **Distance Filter** dropdown under the active groups listing (with options "Any Distance", "Within 2 miles", "Within 5 miles", "Within 10 miles").
- [ ] Active groups table displays computed distance for each group (e.g. `📍 0.9 miles away`).
- [ ] Active groups table correctly filters rows based on distance selections.
- [ ] Admin oversight section displays global funnel metrics and a list of pending leaders waiting for approval.
- [ ] Admin approval queue allows clicking "Approve Leader" to call `POST /api/leaders/:leaderId/approve` and successfully transition the leader to authorized status.

## Technical Notes

- Keep HTML styling within premium dark-themed layout variables (e.g., using `--primary`, `--surface`, outfit font).
- Re-use the existing `showToast` and `showError` methods for feedback.
