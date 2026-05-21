---
id: TASK-004
title: "Implement Leader Approval Endpoints & Coordinate Seeding"
status: draft
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: [TASK-003]
---

## Description

Create a REST API route to approve leaders, update `GET /api/state` to return distance metadata, and update database seed scripts with geocoded coordinates and unapproved leaders.

## Files to Create/Modify

- `src/server.js` — add `POST /api/leaders/:leaderId/approve` route. Update `GET /api/state` to calculate distances from seeded mother candidate. Update `seedInitialData` with coordinates and a pending leader.
- `src/index.js` — update demo script with coordinates and geocoding verification.
- `src/scripts/migrate.js` — **[NEW]** create simple database sync script to satisfy package.json.

## Acceptance Criteria

- [ ] `POST /api/leaders/:leaderId/approve` successfully updates `approved_by_admin: true` and `leader_status: "Active"`.
- [ ] `GET /api/state` calculates and attaches `distance` to each group relative to the seeded mother candidate.
- [ ] `seedInitialData` seeds a pending leader "Marie Curie" with status "Pending Approval" and an unapproved group. Seeds coordinates for Grace Hopper, Ada Lovelace, and Downtown Sunrise Circle.
- [ ] Database sync script `src/scripts/migrate.js` runs cleanly.

## Technical Notes

- Ensure `GET /api/state` handles cases where a group does not have coordinates.
- Seed data coordinates must be realistic (e.g., Ada Lovelace at 37.7749/-122.4194 and Downtown Sunrise Circle at 37.7850/-122.4294, distance ~0.9 miles).
- The pending leader Marie Curie should have an unapproved group, making application submission fail by default until the leader is approved.
