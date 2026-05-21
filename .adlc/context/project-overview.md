# WoW Mom App — Project Overview

## What It Does

The **WoW Mom App** is a highly deterministic, event-driven platform designed to orchestrate the registration, interview scheduling, and structured placement of new mothers into localized peer support groups. It serves three primary user personas:

- 🤱 **Mothers (Applicants):** Search available support groups, manage meeting preferences, and track application status.
- 🤝 **Group Leaders (Facilitators):** Facilitate peer-to-peer interviews, evaluate candidates, and oversee group rosters.
- 🛡️ **System Administrators (Operators):** Authorize onboarding pipelines, inspect system throughput, and monitor overall community health.

## Tech Stack

| Layer | Component Technology | Role & Responsibility |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js (>=18.0.0) | Core execution runtime. |
| **API Framework** | Express.js | REST routing and handling client communications. |
| **ORM / Data Tier** | Sequelize | Object-Relational Mapping supporting PostgreSQL & SQLite. |
| **Databases** | PostgreSQL / SQLite | Persistent storage with thread-safe pessimistic locking for capacity checks. |
| **Task Queue** | Bull | Offloads resource-heavy template rendering and transactional email dispatch. |
| **Authentication** | bcrypt + jsonwebtoken | Secures routes via hashed credentials and signed tokens. |
| **Testing Suite** | Jest + Supertest | Unit & Integration testing suite. |

## Project Scope

### In Scope
- **Mother Onboarding:** Registration, group search, and application tracking.
- **Support Group Management:** Group creation, leader assignment, and roster management.
- **Strict Capacity Enforcement:** Enforcing minimum of 2 and maximum of 15 active participants per group.
- **Pessimistic Gating Locks:** Preventing overbooking by locking slot allocation requests.
- **Interview Orchestration:** Dynamic scheduling of interviews within 7 days of application submission.
- **Asynchronous Notifications:** Dispatching templated candidate invite links via Bull and Nodemailer.
- **Built-in Privacy Constraints:** Concealing sensitive candidate contacts (phone/address) until "Active Participant" status is reached.
- **Application Flow Control:** Enforcing a maximum of 3 concurrent active pipelines per mother, and a 30-day cooldown period for re-applying to rejected groups.

### Out of Scope
- **Real-Time Messaging:** General peer-to-peer or leader-to-mother chat interfaces (other than automated transactional notifications).
- **Manual Onboarding Override:** Bypassing onboarding rules or capacity thresholds (except through explicit admin tools).
