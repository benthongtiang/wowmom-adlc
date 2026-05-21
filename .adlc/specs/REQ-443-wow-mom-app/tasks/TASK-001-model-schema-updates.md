---
id: TASK-001
title: "Update Database Schemas for Coordinates"
status: draft
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: []
---

## Description

Add latitude and longitude fields to the Mother and Group Sequelize models to enable distance-based matching.

## Files to Create/Modify

- `src/models/Mother.js` — add `latitude` and `longitude` fields to the Mother model.
- `src/models/Group.js` — add `latitude` and `longitude` fields to the Group model.

## Acceptance Criteria

- [ ] Mother model has `latitude` and `longitude` decimal fields.
- [ ] Group model has `latitude` and `longitude` decimal fields.
- [ ] Unit tests for models build and database schema synchronizes without errors.

## Technical Notes

- Define `latitude` as `DataTypes.DECIMAL(10, 8)` and `longitude` as `DataTypes.DECIMAL(11, 8)`. Both should allow null value support (`allowNull: true`).
