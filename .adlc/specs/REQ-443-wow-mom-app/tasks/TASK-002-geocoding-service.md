---
id: TASK-002
title: "Implement Geocoding Service"
status: draft
parent: REQ-443
created: 2026-05-21
updated: 2026-05-21
dependencies: []
---

## Description

Create a service to resolve physical addresses and zip codes into coordinates.

## Files to Create/Modify

- `src/services/GeocodingService.js` — **[NEW]** geocoding logic with local dictionary lookup and fallback deterministic coordinate generator.
- `src/services/index.js` — export the new GeocodingService.

## Acceptance Criteria

- [ ] GeocodingService resolves `"42 Babbage Way"` and `"94102"` to SF coordinates (`{ latitude: 37.7749, longitude: -122.4194 }`).
- [ ] GeocodingService resolves `"100 Peace Plaza"` to coordinates (`{ latitude: 37.7850, longitude: -122.4294 }`).
- [ ] Any other address resolves to a deterministic SF-centered coordinate using string hashing, ensuring repeatable coordinates without network requests.
- [ ] Add unit tests verifying geocoding returns expected lat/long coordinates.

## Technical Notes

- Keep logic hermetic and completely offline. Hashing function can sum charCodes to jitter base SF coordinates.
