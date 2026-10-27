# Soro AI Agent Guidelines

Before coding, read `README.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md`, `docs/TASKS.md`, and the complete issue assigned by the user. Inspect existing code and follow the acceptance criteria.

## Git workflow
- Work on a focused branch created from the latest `main` branch.
- All completed work must land on `main`. Open pull requests with base `main`.
- Never push feature work directly to `main`; use a focused branch and a pull request.
- If `main` is missing or inaccessible, stop and ask. Do not substitute another branch.
- Preserve unrelated changes. Do not reset or discard work from others.
- Commit only relevant files, push the branch, and open a PR targeting `main`.
- Every PR that addresses a GitHub issue must include the exact closing keyword and issue number in its description, e.g. `Closes #123`. Include the issue link as well. Do not use “when appropriate” for issue-linked work; if the PR fixes or completes an issue, the closing reference is mandatory.
- If one PR addresses multiple issues, include a separate closing reference for each, such as `Closes #123` and `Fixes #124`.
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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
