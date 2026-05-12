# WoW Mom App — Architecture

## System Diagram
```
  +-----------------------------------------------------------------------+
  |                              Client Layer                             |
  |    [ Mother UI ]            [ Group Leader UI ]         [ Admin UI ]  |
  +-----------------------------------------------------------------------+
         |                               |                       |
         v                               v                       v
  +-----------------------------------------------------------------------+
  |                            API Routing Layer                          |
  |   /auth   |   /mothers   |   /groups   |   /applications  |  /admin   |
  +-----------------------------------------------------------------------+
         |                               |                       |
         v                               v                       v
  +-----------------------------------------------------------------------+
  |                          Business Logic Layer                         |
  |  - Capacity Enforcer         - Interview Scheduler   - Roster Access  |
  |  - Application Gatekeeper    - State Transitioner    - Notification   |
  +-----------------------------------------------------------------------+
         |                               |                       |
         v                               v                       v
  +-----------------------------------------------------------------------+
  |                           Data Storage Layer                          |
  |  [ Mothers ]    [ Groups ]    [ Applications ]    [ Leaders ]         |
  +-----------------------------------------------------------------------+
```

## Layers
1. **Client / UI Layer**: Dedicated presentation views tailored to each user persona. Leverages responsive design patterns ensuring full usability on mobile devices for mothers searching for groups, while offering detailed operational lists for group leaders and analytics tables for administrators.
2. **API Routing Layer**: Secure endpoints implementing strong session-based or token-based user authentication. Ensures strict role-based access control (RBAC) validation before forwarding payloads to core services.
3. **Business Logic Layer**: Centralized rule execution domain responsible for validating capacity constraints (2-15 members), enforcing the maximum application ceiling (up to 3 concurrent applications per mother), processing state machine updates, formatting automated email messages, and logging audit events.
4. **Data Storage Layer**: Normalized relational or document storage architecture ensuring strict foreign key mapping, index-optimized searches (by location/time), and transactional consistency during capacity increments.

## Key Patterns
- **Strict Application State Machine**: Applications must traverse specific lifecycle checkpoints (`Pending` → `Interview Scheduled` → `Accepted` → `Active Participant` / `Rejected`). State transitions trigger immediate background notifications.
- **Role-Gated Data Hydration**: Roster contact fields (phone numbers, full addresses) are masked from group members until their application achieves `Active Participant` status. Group leaders are blocked from creating active groups until explicitly approved by an administrator.
- **Pessimistic Capacity Locking**: Group available slots are validated transactionally at the time of application submission and double-checked upon acceptance to completely eliminate race conditions resulting in group overbooking.

## ADRs
### ADR 001: Separation of Leader Entity from Mother Entity
- **Status**: Accepted
- **Context**: Group Leaders have distinct system lifecycles requiring administrative verification, group roster management access, and scheduling capabilities that standard applicants do not possess.
- **Decision**: Establish independent database tables/models for `Mothers` and `Leaders` rather than utilizing a shared user profile table with polymorphic roles.
- **Consequences**: Streamlines authentication query scopes, simplifies data model column definitions, and ensures absolute isolation of administrative authorization workflows.
