# WoW Mom App — Project Overview

## What It Does
WoW Mom is a comprehensive platform (supporting responsive web and mobile interfaces) designed to streamline the registration, application, and placement of new mothers into small support groups. The system coordinates three core user roles: Mothers (applicants seeking support groups), Group Leaders (approved facilitators managing group capacity and interviewing candidates), and Admins (system operators overseeing platform metrics, leader approvals, and communications pipeline). By automating the discovery filters, application state pipelines, multi-slot interview scheduling, and enrollment caps, WoW Mom ensures balanced group utilization while preventing overbooking.

## Tech Stack
| Layer | Technology | Description |
|---|---|---|
| **Frontend** | Responsive Web & Mobile UI | Cross-platform UI optimized for mobile discovery and dashboard management. |
| **Backend** | API / Cloud Services | RESTful/GraphQL endpoints driving business logic and access control gates. |
| **Database** | Relational / Document Store | Highly structured tables/collections modeling users, groups, applications, and notifications. |
| **Authentication** | Secure Auth Provider | Email and password authentication with hashed credentials and password reset workflows. |

## Project Scope
### In Scope
- **User Role Management & Auth**: Fully distinct feature matrices for Mothers, Group Leaders, and Admins.
- **Dynamic Group Discovery**: Filtering available groups by location, preferred meeting times (Morning, Afternoon, Evening), and real-time capacity checks.
- **Application Pipeline Tracking**: Restricting mothers to a maximum of 3 concurrent applications and advancing statuses through a strict state machine (`Pending` → `Interview Scheduled` → `Accepted` → `Rejected` / `Active`).
- **Leader Interview Orchestration**: Proposing 2-3 time slots via email triggers, capturing candidate confirmations, and recording review decisions with optional rejection feedback.
- **Participant Activation & Rosters**: Promoting accepted candidates to `Active Participant` upon first meeting attendance, unlocking full group rosters and contact details.
- **Admin Oversight & Controls**: Comprehensive statistic dashboards (acceptance rates, capacity utilization), leader authorization workflows, and manual pipeline remediation tools.
- **Automated Notifications**: Event-driven email dispatch for state progression triggers.

### Out of Scope
- Native in-app video conferencing for interviews (interviews are scheduled within the app but conducted externally).
- Native payment processing for group participation fees in the initial baseline release.
- Advanced automated recurring SMS follow-ups (targeted as an optional enhancement phase).
