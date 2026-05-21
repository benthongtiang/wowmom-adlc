---
id: REQ-443
title: "WoW Mom Support Group Management Platform"
status: complete
deployable: true
created: 2026-05-21
updated: 2026-05-21
component: "application-core"
domain: "onboarding"
stack: ["node", "express", "sequelize", "postgresql", "bull"]
concerns: ["privacy", "concurrency", "reliability"]
tags: ["capacity-limits", "interview-scheduling"]
---

## Description

The WoW Mom app is a web/mobile application that manages the registration and placement of new mothers into small support groups. The system caters to three user roles: Mothers (applicants), Group Leaders (group managers), and Admins (system managers). 

It enforces deterministic capacity limits, distance-based group matching, interview scheduling constraints, and status-based privacy masking of applicant contact details to facilitate secure community onboarding.

## System Model

### Entities

| Entity | Field | Type | Constraints |
|--------|-------|------|-------------|
| MOTHERS | Mother ID | ID | Unique, primary key |
| MOTHERS | Email | Text | Unique, login |
| MOTHERS | Password | Text | Secure Hash |
| MOTHERS | Full Name | Text | Required |
| MOTHERS | Phone Number | Text | Required |
| MOTHERS | Address, Zip Code | Text | Required |
| MOTHERS | Latitude | Decimal | Geocoded from address |
| MOTHERS | Longitude | Decimal | Geocoded from address |
| MOTHERS | Number of Children | Integer | Required |
| MOTHERS | Children Ages | List | Required |
| MOTHERS | Preferred Meeting Times | List | Enum (Morning, Afternoon, Evening) |
| MOTHERS | Preferred Locations | List | List of valid locations |
| MOTHERS | Account Status | Enum | Active, Inactive, Suspended |
| GROUPS | Group ID | ID | Unique, primary key |
| GROUPS | Leader ID | ID | Relation to LEADERS |
| GROUPS | Max Capacity | Integer | 2-15 |
| GROUPS | Meeting Time | Enum | Morning, Afternoon, Evening |
| GROUPS | Meeting Frequency | Enum | Weekly, Bi-weekly, Monthly |
| GROUPS | Latitude | Decimal | Meeting location coordinates |
| GROUPS | Longitude | Decimal | Meeting location coordinates |
| GROUPS | Group Status | Enum | Active, Inactive, Full |
| APPLICATIONS| Application ID | ID | Unique, primary key |
| APPLICATIONS| Application Status| Enum | Pending, Interview Scheduled, Accepted, Rejected, Active |
| LEADERS | Leader ID | ID | Unique, primary key |
| LEADERS | Approved By Admin | Boolean | Required to create groups |
| NOTIFICATIONS| Notification Type | Enum | App Status Changed, Interview Scheduled, Group Full |

### Events

| Event | Trigger | Payload |
|-------|---------|---------|
| Application Submitted | Mother applies to a group | Application ID, Mother ID, Group ID |
| Interview Scheduled | Leader proposes interview slots | Time slots, Application ID |
| Application Accepted | Leader accepts a Mother | Application ID |
| Member Activated | Mother attends first meeting | Application ID |

### Permissions

| Action | Roles Allowed |
|--------|---------------|
| Apply to Group | Mother (Max 3 active applications) |
| Schedule Interview | Group Leader (for their group) |
| Accept/Reject App | Group Leader (for their group) |
| Activate Member | Group Leader (for their group) |
| View All Data | Admin |
| Approve Leaders | Admin |

## Business Rules

- [ ] BR-1: Mothers can apply to a maximum of 3 groups simultaneously.
- [ ] BR-2: Groups have a strict minimum of 2 and a maximum of 15 members.
- [ ] BR-3: Once a group reaches max capacity, it immediately shows as "Full" and the system prevents any new applications from being submitted or processed.
- [ ] BR-4: Leaders must be explicitly approved by an admin before they can create active groups.
- [ ] BR-5: Rejected mothers are enforced a 30-day cooldown before reapplying to the same group.
- [ ] BR-6: Interview scheduling sequences must be triggered within 7 days of application creation.
- [ ] BR-7: A mother's sensitive contact info (phone/address) is masked from the group roster until she officially reaches "Active Participant" status.
- [ ] BR-8: Group search filters available support groups based on a configurable distance radius from the mother's geocoded latitude/longitude coordinates.

## Acceptance Criteria

- [ ] Mothers can complete profile (including address geocoding) and search/apply for up to 3 groups filtering by meeting times and distance radius.
- [ ] Leaders can review applications, schedule interviews, and accept/reject mothers.
- [ ] Leaders can activate accepted mothers into active participants to see full contact details on the group roster.
- [ ] Admins can view a dashboard summarizing total active mothers, active groups, pending leader applications, and average capacity utilization. Admins can approve or reject pending leader applications.
- [ ] Transactional email notifications dispatch asynchronously for all application status transitions.
- [ ] Concurrent applications are processed transactionally to ensure a group never exceeds its maximum capacity limit of 15 members.

## External Dependencies

- SMTP Provider (Email dispatch)
- Geocoding Service (Address translation to Lat/Long coordinates)
- Shared Cache/Queue Service (Asynchronous event processing)
- Relational Database

## Assumptions

- We are building the backend APIs first to support the described client user interfaces.
- Users authenticate using standard email and password credentials.

## Out of Scope

- Chat/discussion boards inside the groups.
- General peer-to-peer or leader-to-mother chat interfaces (other than automated transactional email notifications).
- Real-time websocket-based notifications or in-app instant messaging.

## Retrieved Context

No prior context retrieved — no tagged documents matched this area.
