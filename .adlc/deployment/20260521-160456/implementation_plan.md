# Implementation Plan - Orchestrate DevOps /deploy Pipeline

Orchestrate the end-to-end auto-deployment pipeline for the **WoW Mom Support Group Management Platform** (`mom_app1`) as guided by the `/deploy` skill.

## User Review Required

> [!IMPORTANT]
> The target deployment environment needs to be resolved during **Phase 0: Preflight**. 
> As there is currently no deployment config `.adlc/config.yml` in the workspace, we will present target options to choose from, or choose to "Create a New Deployment Destination" (e.g. VPS SSH or Coolify API target).
> If you have a specific Coolify API instance or VPS destination, please provide it when prompted. Alternatively, we can scaffold a mock deployment target profile under `.adlc/config.yml` for local sandbox deployment.

## Proposed Changes

We will execute the pipeline phases sequentially in accordance with [deploy/SKILL.md](file:///Users/ben/Desktop/Work/AgentDeploy/deploy/SKILL.md):

### Phase 0: Preflight & Resolve Target
- Generate a unique Run ID (e.g. `20260521-160100`).
- Create run directory under `.adlc/deployment/<run-id>/`.
- Save active `implementation_plan.md` and `task.md` to `.adlc/deployment/<run-id>/`.
- Prompt the user to select or create a deployment target (e.g., Local Sandbox, Coolify, or VPS).
- Register the target profile inside `.adlc/config.yml` if creating a new one.
- Initialize `.adlc/deployment/<run-id>/deploy-status.json` with status `in-progress`.

### Phase 1: Codebase Analysis
- Invoke `/deploy-analyze` to scan the codebase (`mom_app1`).
- Detect JS/TS (Node.js) runtime, listening ports, and database dependencies (PostgreSQL/Redis).
- Scrutinize/validate the existing `Dockerfile` and `docker-compose.yml` to ensure compatibility.
- Log status and tech stack details to `deploy-status.json`.

### Phase 2: Environment Configuration
- Invoke `/deploy-env` on `mom_app1`.
- Auto-discover required variables (e.g. `DATABASE_URL`, `REDIS_URL`, `PORT`, `SMTP_*`, `GEOCODING_API_KEY`).
- Prompt user for inputs or generate secure defaults for credentials/secrets.
- Save configuration list (with redacted secrets) in `deploy-status.json`.

### Phase 3: Service Provisioning
- Invoke `/deploy-provision` with resolved variables and target details.
- Query/create database services (PostgreSQL, Redis) and application services.
- Map the public domain (e.g. `wowmom-adlc.lanna.engineer`) and exposure port (3000).
- Inject environment variables.

### Phase 4: Trigger & Build Monitor
- Invoke `/deploy-trigger` to start the build.
- Stream build and runtime logs to `.adlc/deployment/<run-id>/deploy.log`.
- Perform HTTP health checks to verify successful deployment.

### Phase 5: Self-Healing & Redeployment Loop (If Needed)
- If build/health check fails, invoke `/deploy-heal` on `.adlc/deployment/<run-id>/deploy.log`.
- Auto-diagnose error logs, apply code/config corrections, commit/push, and re-trigger Phase 4.
- Halt after 3 failed healing iterations.

### Phase 6: Health Verification & Handover
- Perform final GET verification check.
- Output a handover summary report with online status, URL link, port, DB connections, and applied heals.

---

## Verification Plan

### Automated/Manual Verification
- Verify directories are created under `.adlc/deployment/<run-id>/`.
- Verify log files (`deploy.log` and `deploy-status.json`) are correctly created and updated.
- Verify final application deployment by performing HTTP GET request on the assigned domain.
