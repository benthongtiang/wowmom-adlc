---
id: TASK-003
title: "Implement Persona UI Screens and Discovery Components"
status: draft
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: ["TASK-002"]
repo: delta
---

## Description

Build all persona-specific React screens and reusable UI components. Implements group discovery with filter controls (time, location, capacity), application state dashboards for mothers, leader candidate management and roster views, and admin metrics with leader approval queue. Enforces data masking rules in the UI layer (masked contacts until Active Participant).

## Files to Create/Modify

- `src/components/GroupCard.js` — Displays group summary; shows `Full` badge and disables Apply button when capacity exhausted; shows meeting time, location, and open slot count
- `src/components/ApplicationStatusBadge.js` — Color-coded status chip for all 5 application states using APPLICATION_STATES constants
- `src/components/CapacityIndicator.js` — Visual representation of current_member_count / max_capacity; reflects Full status
- `src/components/TimeSlotSelector.js` — Renders 2–3 proposed interview time slots; handles mother's selection and confirmation POST
- `src/components/RosterListItem.js` — Displays roster member; conditionally renders phone and address only when `showContacts` prop is true (driven by Active Participant status from API)
- `src/screens/mother/DiscoveryScreen.js` — Group search with filter bar (meeting time checkboxes, location input); renders GroupCard list; excludes Full groups; calls GET /groups with query params; disables Apply on Full or already-applied groups
- `src/screens/mother/ApplicationListScreen.js` — Lists mother's active applications with ApplicationStatusBadge; shows next-step guidance per state; links to TimeSlotSelector when Interview Scheduled
- `src/screens/mother/ProfileScreen.js` — Profile completion form: children ages array input (add/remove entries), preferred meeting times (multi-select), preferred locations; client-side validation before submit
- `src/screens/leader/DashboardScreen.js` — Pending and in-progress candidate cards; Propose Interview button (opens slot picker); Accept/Reject actions; displays leader_notes input on reject
- `src/screens/leader/RosterScreen.js` — Active group members list; full contact details visible (leader always sees unmasked); shows member activation date
- `src/screens/leader/GroupManagementScreen.js` — Create/edit group form: name, description, capacity (2–15 validated), meeting_time (Morning/Afternoon/Evening), address, frequency; blocks creation if leader not yet approved
- `src/screens/admin/MetricsScreen.js` — Platform stats: active groups, total applications, acceptance rate, capacity utilization; manual pipeline remediation controls
- `src/screens/admin/LeaderApprovalQueueScreen.js` — Pending leader list with profile details; Approve/Reject actions calling POST /admin/leaders/:id/approve
- `tests/unit/components/GroupCard.test.js` — Full badge rendering and Apply button disabled state when capacity exhausted
- `tests/unit/components/RosterListItem.test.js` — Contact fields masked when showContacts=false, visible when showContacts=true
- `tests/unit/screens/DiscoveryScreen.test.js` — Filter controls update rendered group list; Full groups excluded

## Acceptance Criteria

- [ ] Discovery filter controls (meeting time, location) immediately update displayed group results without page reload.
- [ ] GroupCard shows `Full` badge and disabled Apply button when current_member_count == max_capacity.
- [ ] Mothers with 3 active applications see a clear inline message blocking further application attempts.
- [ ] ApplicationListScreen shows state-appropriate next steps (e.g., slot selector link when status is `Interview Scheduled`).
- [ ] RosterListItem hides phone and address when `showContacts` is false; reveals them when true.
- [ ] GroupManagementScreen validates capacity input within [2, 15] client-side before API submission.
- [ ] LeaderApprovalQueueScreen displays pending leaders and triggers approve action via API.
- [ ] All layouts use CSS flexbox/grid and are responsive for mobile portrait screens.
- [ ] Component unit tests for GroupCard (Full state) and RosterListItem (masking) pass.

## Technical Notes

- Never hardcode state strings in JSX conditionals — import APPLICATION_STATES and MEETING_TIMES from `src/models/constants.js`.
- RosterListItem `showContacts` prop must be computed from the API response, not client-side logic — the server determines masking eligibility and the UI renders accordingly.
- Discovery filter state should be local component state (no global store needed for baseline); filter params are passed as query strings to GET /groups.
- GroupManagementScreen must check the authenticated leader's `approved_by_admin` flag from the user context before rendering the Create button — show a pending approval notice instead.
- Use the `logger` utility for any client-side diagnostic events (not console.log).
- CSS should target mobile-first breakpoints: base styles for portrait mobile, media queries for tablet/desktop widths.
