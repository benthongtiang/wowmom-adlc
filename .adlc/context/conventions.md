# WoW Mom App — Conventions

## File Organization

The source code is structured as follows:

```
src/
  components/            # Reusable UI elements
  screens/               # Persona-specific screen views
    mother/
    leader/
    admin/
  services/              # Business logic and services
  models/                # Sequelize database models
  utils/                 # Shared utilities and helper functions
tests/                   # Unit and integration test suites
```

## Naming

- **Entity & Table Names:** Database models and tables must use pluralized PascalCase (e.g., `MOTHERS`, `GROUPS`, `APPLICATIONS`).
- **Application States:** State transitions must use exact string constants:
  - `Pending`
  - `Interview Scheduled`
  - `Accepted`
  - `Rejected`
  - `Active Participant`
- **Meeting Time Identifiers:** Meeting time blocks must use exact string constants:
  - `Morning` (9am–12pm)
  - `Afternoon` (1pm–4pm)
  - `Evening` (6pm–8pm)

## Testing

- **Framework:** Automated testing is built using `Jest` and `Supertest`.
- **Unit Tests:** Must cover capacity boundary constraints (min 2, max 15), concurrent application limits (max 3), and the 30-day re-application cooldown rule.
- **Integration Tests:** Must validate end-to-end interview scheduling flows and transactional group member activation.
- **Commit Rule:** Always run tests locally before making a commit. Never commit with failing tests.

## Error Handling & Logging

- **Logging:** Use the project's `logger` service; do not use raw `console.log` statements in production code.
- **Configuration:** Keep environment/configuration values in configuration files or `.env`. Never hardcode secrets, ports, or API credentials.
- **API Responses:** Return structured JSON error messages with appropriate HTTP status codes (e.g., `400 Bad Request` for validation, `422 Unprocessable Entity` for business rule violations).

## Git Conventions

- **Branch Naming:** Create a separate branch per requirement (REQ), using the format:
  - `feat/REQ-xxx-slug` or `agent/REQ-xxx-slug`
- **Commit Messages:** Commit messages must follow this structure:
  - `feat(scope): description [TASK-xxx]` or `fix(scope): description [TASK-xxx]`
- **Pull Requests:** PRs must pass the CI test suite and maintain/validate test coverage for state-modifying logic.
