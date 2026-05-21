# WoW Mom App — Architecture

## System Diagram

```
  +------------------+       +----------------------+       +-----------------------+
  |  Client/UI Web   | ----> |   Express Core API   | ----> |  Service Layer Logic  |
  +------------------+       +----------------------+       +-----------------------+
                                                                        |
                                                     +------------------+------------------+
                                                     |                                     |
                                                     v                                     v
                                           +-------------------+                 +-------------------+
                                           |   Sequelize ORM   |                 |    Bull Worker    |
                                           +-------------------+                 +-------------------+
                                                     |                                     |
                                                     v                                     v
                                           +-------------------+                 +-------------------+
                                           | PostgreSQL/SQLite |                 |  Nodemailer SMTP  |
                                           +-------------------+                 +-------------------+
```

## Layers

1. **Client / UI**
   - Persona-specific views organized by role: Mother (`src/screens/mother/`), Leader (`src/screens/leader/`), and Admin (`src/screens/admin/`).
   - Built to be responsive for mobile web layouts.

2. **API Routing**
   - Implements Express-based role-gated routes (`/auth`, `/mothers`, `/groups`, `/applications`, `/admin`).
   - Secures traffic using JSON Web Token (JWT) verification middleware.

3. **Business Logic (Service Layer)**
   - Encapsulates critical domain rules: group capacity limits (BR-2/BR-3), application state transitions, interview scheduler logic, and notification triggers.

4. **Data Storage & Access**
   - Data access orchestrated via Sequelize models (`src/models/`).
   - Employs separate tables for Mothers and Leaders (enforced via ADR-001) alongside Groups and Applications entities.

## Key Patterns

- **Routes → Services → Models (Repositories)**
   - Establishes a strict unidirectional flow where controllers parse requests, delegate complex operations to services, and access data via models.
- **Pessimistic Gating Locks**
   - Ensures strict transactional safety when evaluating group capacity. Database-level row locking prevents race conditions and overbooking.
- **Asynchronous Task Queue**
   - Heavy tasks (email template compilation, SMTP dispatch) are processed out-of-band using Bull workers to maintain low API response times.

## ADRs

### ADR-001: Separate Mothers and Leaders Tables
- **Status:** Approved
- **Context:** System requires strict partitioning of authentication, profiles, and permissions between mother applicants and group leaders.
- **Decision:** Store mothers and leaders in separate tables (`MOTHERS` and `LEADERS`) rather than a single unified users table with roles. This maintains clean data isolation and simplifies schema changes specific to each persona.
