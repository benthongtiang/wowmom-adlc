# WoW Mom App — Conventions

## File Organization
```
src/
  ├── components/        # Reusable UI blueprints (Cards, Modals, Forms)
  ├── screens/           # Persona-specific top-level views
  │     ├── mother/      # Discovery, Application lists, Profile completion
  │     ├── leader/      # Group management, Candidate dashboard, Roster
  │     └── admin/       # Platform analytics, Leader approval queues
  ├── services/          # API integrations, core scheduling workflows
  ├── models/            # Entity interfaces and validation schemas
  └── utils/             # Helper formats (date/time parsing, validation)
```

## Naming
- **Entities & Tables**: Pluralized PascalCase or UPPERCASE block definitions in specifications (e.g., `MOTHERS`, `GROUPS`, `APPLICATIONS`).
- **Application States**: Explicit string constants utilized across all components (e.g., `Pending`, `Interview Scheduled`, `Accepted`, `Rejected`, `Active Participant`).
- **Meeting Times**: Standardized identifiers mapping to distinct ranges (`Morning` for 9am-12pm, `Afternoon` for 1pm-4pm, `Evening` for 6pm-8pm).

## Testing
- **Unit Testing**: Focuses on core business validations including capacity boundary checks (min 2, max 15), concurrent application limits (max 3), and date interval rules (re-applications restricted for 30 days post-rejection).
- **Integration Testing**: Verifies end-to-end multi-step flows including interview scheduling selection sequences and transactional member activation increments.

## Error Handling
- User inputs trigger localized client-side form validations (email pattern verification, required array limits for children ages) prior to server submission.
- Backend validations gracefully return structured error messages preventing capacity race conditions from corrupting group rosters.

## Git Conventions
- Feature tasks must map to a specific Requirement identifier (`REQ-xxx`) and follow modular task tracking models.
- Pull requests require validated test coverage for state-modifying logic.
