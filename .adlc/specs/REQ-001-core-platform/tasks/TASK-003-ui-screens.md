---
id: TASK-003
title: "Implement Persona UI Navigation and Discovery Screens"
status: complete
parent: REQ-001
created: 2026-05-12
updated: 2026-05-12
dependencies: ["TASK-002"]
---

## Description

Construct responsive React/Mobile frontend components mirroring the persona-specific presentation matrices. Implement interactive group discovery views with parameter filtering (time, location, capacity status), dynamic dashboard monitoring layouts, and detail displays masking sensitive peer contacts until membership activation.

## Files to Create/Modify

- `src/screens/mother/DiscoveryScreen.js` — Renders group filter bars and available target capacity cards.
- `src/screens/leader/DashboardScreen.js` — Lists pending candidate cards alongside automated scheduling prompt buttons.
- `src/screens/leader/RosterScreen.js` — Displays activated peer groups while enforcing conditional contact hydration.
- `src/screens/admin/MetricsScreen.js` — Visualizes global platform conversion metrics and manual authorization gateways.

## Acceptance Criteria

- [ ] Discovery filter controls immediately update display results matching preferred meeting ranges.
- [ ] Group cards visually tag listings as `Full` and disable application interactions when capacity is exhausted.
- [ ] Active mothers successfully view clear pipeline progression steps inside their localized application logs.

## Technical Notes

- Ensure comprehensive CSS flexbox/grid layout design optimized for mobile portrait display screens.
