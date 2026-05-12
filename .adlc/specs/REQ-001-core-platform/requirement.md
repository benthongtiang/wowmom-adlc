---
id: REQ-001
title: "WoW Mom Support Group Platform Core"
status: approved
deployable: true
created: 2026-05-12
updated: 2026-05-12
component: "Core/Platform"
domain: "applications"
stack: ["react", "nodejs", "sql"]
concerns: ["capacity-enforcement", "security", "state-consistency"]
tags: ["interview-scheduling", "roster-masking", "admin-approval"]
---

## Description

WoW Mom is a foundational application lifecycle solution engineered to support the seamless placement of registering new mothers into local, small support groups. The feature addresses the operational bottlenecks of manual discovery, scheduling ambiguity, and group overloading by orchestrating automated multi-variable search filtering, rigorous application state pipeline verification, coordinated interview slot selection, and pessimistic capacity limits. Three distinct user personas interact within this ecosystem: Mothers seeking community support, verified Group Leaders facilitating peer connection, and System Administrators governing global metadata and pipeline throughput.

## System Model

### Entities

#### MOTHERS
| Field | Type | Constraints |
|---|---|---|
| Mother ID | string | Primary Key, Unique, UUID |
| Email | string | Unique, User Login Identifier, valid email format |
| Password | string | Securely Hashed credential |
| Full Name | string | Required, min length 2 |
| Phone Number | string | Required, valid numeric/telephonic sequence |
| Address | string | Required |
| Zip Code | string | Required, alphanumeric postal layout |
| Number of Children | integer | Required, min value 0 |
| Children Ages | array of integers | Required, represents ages of dependents |
| Preferred Meeting Times | array of strings | Permitted subset: `Morning`, `Afternoon`, `Evening` |
| Preferred Locations | array of strings | References active system locations |
| Registration Date | timestamp | Auto-generated upon creation |
| Account Status | string | `Active`, `Inactive`, `Suspended` |
| Created At / Updated At | timestamp | Standard audit tracking timestamps |

#### GROUPS
| Field | Type | Constraints |
|---|---|---|
| Group ID | string | Primary Key, Unique, UUID |
| Group Name | string | Required, Unique within locality |
| Group Description | string | Required, descriptive summary |
| Leader ID | string | Foreign Key referencing `LEADERS.Leader ID` |
| Meeting Time | string | Enum: `Morning`, `Afternoon`, `Evening` |
| Meeting Location | string | Combined specific street address or zip code area |
| Max Capacity | integer | Configurable upper bound: min 2, max 15 |
| Current Member Count| integer | Auto-calculated dynamically based on `Active` applications |
| Meeting Frequency | string | Enum: `Weekly`, `Bi-weekly`, `Monthly` |
| Group Status | string | Dynamically resolved: `Active`, `Inactive`, `Full` |
| Created At / Updated At | timestamp | Standard audit tracking timestamps |

#### APPLICATIONS
| Field | Type | Constraints |
|---|---|---|
| Application ID | string | Primary Key, Unique, UUID |
| Mother ID | string | Foreign Key referencing `MOTHERS.Mother ID` |
| Group ID | string | Foreign Key referencing `GROUPS.Group ID` |
| Application Date | timestamp | Auto-recorded upon submission |
| Application Status | string | Enum: `Pending`, `Interview Scheduled`, `Accepted`, `Rejected`, `Active Participant` |
| Interview Date | timestamp | Nullable, finalized appointment timestamp |
| Interview Time Slot | string | Nullable, designated block selection |
| Interview Confirmed By Mother | boolean | Flag identifying explicit candidate verification |
| Rejection Reason | string | Nullable, feedback message text |
| Accepted Date | timestamp | Nullable, records positive leader evaluation |
| Activated Date | timestamp | Nullable, records first-meeting attendance milestone |
| Notes from Leader | string | Nullable, internal evaluation documentation |
| Updated At | timestamp | Standard audit tracking timestamp |

#### LEADERS
| Field | Type | Constraints |
|---|---|---|
| Leader ID | string | Primary Key, Unique, UUID |
| Email | string | Unique, User Login Identifier |
| Password | string | Securely Hashed credential |
| Full Name | string | Required |
| Phone Number | string | Required |
| Leader Status | string | Enum: `Active`, `Inactive`, `Pending Approval` |
| Approved By Admin | boolean | Gateway verification gate |
| Created At / Updated At | timestamp | Standard audit tracking timestamps |

#### NOTIFICATIONS
| Field | Type | Constraints |
|---|---|---|
| Notification ID | string | Primary Key, Unique, UUID |
| User ID | string | Polymorphic identifier (Mother or Leader) |
| User Type | string | Enum: `Mother`, `Leader` |
| Notification Type | string | Enum identifying trigger event context |
| Message | string | Rendered template text |
| Email Sent | boolean | Delivery success flag |
| Read | boolean | Client consumption flag |
| Created At | timestamp | Timestamp of creation |

### Events

| Event | Trigger | Payload |
|---|---|---|
| `ApplicationSubmitted` | Mother completes application form targeting an available Group. | `Application ID`, `Mother ID`, `Group ID` |
| `InterviewProposed` | Group Leader submits 2-3 scheduling alternatives for a pending application. | `Application ID`, proposed `TimeSlots` array |
| `InterviewConfirmed` | Mother selects and locks a designated time option. | `Application ID`, `ConfirmedSlot` timestamp |
| `ApplicationEvaluated` | Leader executes an `Accept` or `Reject` workflow choice. | `Application ID`, `DecisionOutcome`, optional `Reason` |
| `ParticipantActivated` | Leader confirms initial meeting presence. | `Application ID`, `Group ID`, `Mother ID` |

### Permissions

| Action | Roles Allowed |
|---|---|
| Authenticate Account | Mother, Group Leader, Admin |
| Complete / Edit Profile | Self (Mother or Group Leader) |
| Discover & Apply to Groups | Active Mother |
| Manage Group Listing Details | Assigned Approved Group Leader |
| View Application Pipeline | Target Group Leader, Admin |
| Update Application Statuses | Target Group Leader, Admin |
| View Complete Group Roster | Target Group Leader, Active Participant Mother |
| Authorize / Deactivate Leaders| Admin |
| Issue Templated Requests | Admin |

## Business Rules

- [ ] **BR-1 Application Concurrency Ceiling**: A single Mother profile is strictly blocked from maintaining more than three (3) active applications simultaneously across all groups.
- [ ] **BR-2 Group Capacity Boundaries**: Every operational group must maintain an explicit membership range defining a minimum threshold of two (2) and an absolute ceiling limit of up to fifteen (15) active participants.
- [ ] **BR-3 Dynamic Capacity Gate**: Immediate systemic rejection or blocking of new inbound application requests targeting any Group entity where `Current Member Count` equals `Max Capacity`. The UI dynamically tags the listing as `Full`.
- [ ] **BR-4 Authorization Gateway**: Group Leaders must achieve positive administrative confirmation (`Approved By Admin = true`) prior to unlocking group generation pipelines.
- [ ] **BR-5 Re-application Cooldown Window**: A Mother rejected from a specific Group is restricted from submitting subsequent applications to that exact Group identifier for a duration of exactly thirty (30) consecutive calendar days.
- [ ] **BR-6 SLA Scheduling Timeline**: Submitted application pipelines must initiate interview scheduling loops within seven (7) days of creation.
- [ ] **BR-7 Data Masking Policy**: Peer roster directory attributes including full telephone contacts and detailed home routing layouts remain completely concealed from candidate inspection until their application completes the `Active Participant` lifecycle step.

## Acceptance Criteria

- [ ] Registration flows successfully persist profile arrays including multiple age integer entries for dependents.
- [ ] Group search matrices correctly exclude listings tagged as `Full` or those conflicting with preferred meeting times/locations.
- [ ] Attempting to submit a fourth concurrent application returns a clear user-facing validation rejection.
- [ ] Interview scheduling loops correctly dispatch formatted email prompts populated with dynamic selection links.
- [ ] Activating an accepted mother instantly increments the calculated `Current Member Count` attribute on the target group record.
- [ ] Admin oversight views aggregate and visualize active leadership validation queues.

## External Dependencies

- Dedicated SMTP/Email delivery provider supporting transactional template rendering.

## Assumptions

- Users maintain active email access to verify multi-slot interview configurations.
- Support meetings adhere to standard localized recurring day/time structures.

## Open Questions

- [ ] Are custom group header banner uploads supported in the baseline storage architecture?
- [ ] Should platform metrics dashboards cache aggregated statistics periodically or compute queries dynamically on load?

## Out of Scope

- Comprehensive automated recurring calendar platform integrations (Apple/Google integration links).
- Automated SMS follow-ups for non-responsive candidates.

## Retrieved Context
No prior context retrieved — no tagged documents matched this area.
