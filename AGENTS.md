# Soro AI Agent Guidelines

Before coding, read `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/TASKS.md`, and the complete issue assigned by the user. Inspect existing code and follow the acceptance criteria.

## Git workflow
- Work on a focused branch created from the latest `dev` branch.
- Never push feature work directly to `main` and never open a PR targeting `main`.
- If `dev` is missing, stop and ask. Do not substitute `main`.
- Preserve unrelated changes. Do not reset or discard work from others.
- Commit only relevant files, push the branch, and open a PR with base `dev`.
- Link the relevant issue and include `Closes #N` when appropriate.
- Do not merge or deploy unless explicitly authorized.

## Implementation
- Follow the PRD, architecture, design system, task list, and existing code. Do not change the stack or expand scope without approval.
- Coordinate shared API contracts, Prisma fields, route names, types, and status values with related owners before integration.
- Validate inputs on the server. Enforce authentication, ownership, anonymity, and admin permissions on every protected server operation.
- Keep secrets server-side. Never commit real credentials or expose private notes, reporter identity, or sensitive incident data.
- A `tel:` link does not dispatch emergency responders.
- Build accessible responsive UI and include appropriate loading, empty, success, and error states.

## Checks and handoff
Run relevant lint, type-check, tests, Prisma checks, and build where practical. Report only checks actually run and explain anything skipped. Review the diff for unrelated changes and secrets. The PR description must summarize changes, link the issue, list test outcomes, give manual verification steps, and state known limitations.

Do not run destructive operations, change production data, rewrite shared history, merge, or deploy without explicit authorization. Ask when requirements materially conflict or remain ambiguous.