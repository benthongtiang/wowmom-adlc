# Architecture Design — REQ-443 Support Group Management Platform

This document describes the technical architecture and design decisions for implementing the geocoding matching, capacity gating, leader validation, and dashboard oversight requirements defined in [requirement.md](file:///Users/ben/Desktop/Work/mom_app1/.adlc/specs/REQ-443-wow-mom-app/requirement.md).

---

## 1. Data Model Changes

We will update the Sequelize schemas for `Mothers` and `Groups` to store latitude and longitude coordinate columns for distance-based geocoding:

### `Mothers` Model Updates (`src/models/Mother.js`)
- `latitude`: `DataTypes.DECIMAL(10, 8)`, `allowNull: true` (geocoded coordinate)
- `longitude`: `DataTypes.DECIMAL(11, 8)`, `allowNull: true` (geocoded coordinate)

### `Groups` Model Updates (`src/models/Group.js`)
- `latitude`: `DataTypes.DECIMAL(10, 8)`, `allowNull: true` (meeting location coordinate)
- `longitude`: `DataTypes.DECIMAL(11, 8)`, `allowNull: true` (meeting location coordinate)

---

## 2. Geocoding Service (`src/services/GeocodingService.js`)

We will create a new geocoding service to translate addresses and zip codes into coordinates:

- **Method**: `static async geocode(address, zipCode)`
- **Behavior**:
  - Checks a local lookup map of seeded addresses (e.g., `"42 Babbage Way"`, `"100 Peace Plaza"`) and returns their true coordinate mappings.
  - If the address/zip is not in the lookup map, it uses a deterministic string hashing fallback to generate coordinates within the San Francisco metropolitan area. This keeps tests stable, repeatable, and completely offline.

---

## 3. Distance-Based Matching & Filtering

We will implement the Haversine formula in a utility helper to calculate distance in miles between coordinates:

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
```

- When returning the system state for a mother, we calculate each group's distance from her geocoded coordinates and append it as `distance` on the Group payload.
- Filtering is done at the controller/service level or in the client view by comparing the calculated distance to the preferred threshold.

---

## 4. Business Logic Extensions

### Leader Approval Enforcement (BR-4)
- In `ApplicationService.submitApplication`, we will load the target group's leader and check if `leader.approved_by_admin === true`.
- If the leader is not approved, we throw a Validation Error: `Cannot apply to a group whose leader is not approved by an admin.`

### Group Full Notification (NOTIFICATIONS)
- In `ApplicationService.activateParticipant`, if the addition of a member causes `group.current_member_count === group.max_capacity`, we will trigger a background notification of type `GROUP_FULL` to the group leader:
  ```javascript
  await NotificationService.dispatch({
    userId: group.leader_id,
    userType: USER_TYPES.LEADER,
    notificationType: 'GROUP_FULL',
    message: `Notice: Your group "${group.group_name}" has reached its maximum capacity of ${group.max_capacity} active participants.`
  });
  ```

---

## 5. API Endpoints

We will modify and extend the Express endpoints:

| Method | Route | Description |
| :--- | :--- | :--- |
| **GET** | `/api/state` | Appends calculated distance to all groups based on the simulated mother's coordinates. |
| **POST** | `/api/leaders/:leaderId/approve` | **[NEW]** Approves a pending leader, updating their status to `Active` and setting `approved_by_admin: true`. |

---

## 6. UI Updates (HTML & React)

### Express Control Panel (`src/server.js`)
- Add a **Distance Filter** dropdown to the active groups table.
- Display distances (e.g. `📍 1.2 miles away`) on each group row.
- Integrate an **Admin Dashboard Screen** displaying:
  - Global funnel metrics (Conversion rate, capacity utilization bar).
  - An interactive **Leader Authorization Queue** showing pending leaders with an "Approve" button.
- Seed a pending leader ("Marie Curie") and an unapproved group in `seedInitialData` to demonstrate the admin approval feature.

### React Screen Components (`src/screens/`)
- **`DiscoveryScreen.js`**: Add distance filter state and select dropdown. Update rendering to display distances.
- **`MetricsScreen.js`**: Align layout styling and fields with the spec's dashboard requirements.

---

## 7. ADR-002: Distance Filtering Location Strategy
- **Context**: In-memory DB runs SQLite while production uses PostgreSQL. SQL-level geodistances (`acos`, `cos`) can throw syntax errors on SQLite without custom math extensions loaded.
- **Decision**: Perform Haversine distance calculations in the Node.js application layer after fetching active groups. This is database-agnostic, ensures unit tests run cleanly on in-memory SQLite, and is highly performant given the small size of individual group listings.
