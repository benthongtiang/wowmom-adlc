---
id: TASK-006
title: "Update React Screen Components & Unit Tests"
status: complete
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: [TASK-003]
---

## Description

Enhance the React UI screens to support distance filters and update their unit tests.

## Files to Create/Modify

- `src/screens/mother/DiscoveryScreen.js` — add distance filtering state, dropdown elements, and distance tag rendering to group cards.
- `src/screens/admin/MetricsScreen.js` — align display fields with spec metrics (Active mothers, conversion rate, capacity utilization).
- `tests/unit/screens/DiscoveryScreen.test.js` — add unit test for distance filtering logic.

## Acceptance Criteria

- [x] `DiscoveryScreen.js` supports distance filters and renders distances on cards.
- [x] `MetricsScreen.js` matches updated dashboard definitions.
- [x] `DiscoveryScreen.test.js` has a test asserting that groups filter correctly based on distance threshold.
- [x] All Jest screen tests pass successfully.

## Technical Notes

- The test environment in `DiscoveryScreen.test.js` is pure Node (no JSX), so implement filter tests using plain JavaScript functions matching the screen's filter logic.
