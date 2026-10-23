# Soro

**Campus Safety & Incident Reporting System**  
SWEP 200 · Group 10 · Obafemi Awolowo University (OAU)

Soro is a campus safety project designed to help students submit incident reports, follow their status, and find emergency contact information in one place. It also provides an administrative workspace for authorized staff to review reports and record progress.

> **Project status:** In development. Features described here are the intended scope and may not all be implemented yet. Check the GitHub issues for current work.

## Why Soro?

Students may not know which contact to use during an incident, may report concerns informally, and may need a way to report sensitive incidents without their identity being displayed. Soro aims to make reporting straightforward while giving students clearer feedback about what happens after a report is submitted.

The project is being designed around student feedback that emphasizes:
- Simple, mobile-friendly reporting.
- Anonymous reporting options.
- Clear confirmation and status updates.
- Easy-to-find emergency contact information.
- A lightweight experience that considers poor network conditions.

## Planned features

### For students
- Create an account and sign in.
- Submit a campus incident report with a title, description, location, incident type, and urgency.
- Choose anonymous reporting.
- Optionally attach photo evidence when it is safe and appropriate.
- View their own reports and follow status updates.
- Find emergency contact details and guidance.

### For administrators
- View and filter submitted reports.
- Review report details.
- Update a report's status.
- Add internal notes that are not shown to students.
- View a basic overview of reports and their statuses.

### Report statuses
- **Received:** the report has been submitted and recorded.
- **In progress:** the report is being reviewed or acted on.
- **Resolved:** an authorized administrator has marked the report as resolved.

## Technology stack

The project stack is defined as:

- **Framework:** Next.js App Router
- **Language:** TypeScript
- **UI:** Tailwind CSS and shadcn/ui
- **Database:** Neon Postgres
- **ORM:** Prisma
- **Authentication:** NextAuth.js Credentials
- **Photo uploads:** Neon Object Storage (private bucket: `assets`)
- **Forms and validation:** React Hook Form and Zod
- **Package manager:** pnpm
- **Deployment target:** Vercel

Please coordinate with the team before changing these choices.

## Project documentation

- [Product Requirements Document](docs/PRD.md): project scope, users, requirements, privacy, and acceptance criteria.
- [Task Breakdown](docs/TASKS.md): implementation tasks, suggested ownership, and delivery checks.
- [GitHub Issues](https://github.com/samkiell/soro/issues): task-specific instructions and progress.

## Getting started

The application scaffold is being handled in [Issue #1](https://github.com/samkiell/soro/issues/1). Once the scaffold and dependency files are committed, use the following workflow.

### Prerequisites

Install:
- A supported Node.js LTS version.
- pnpm.
- Git.

### Get the code

```bash
git clone https://github.com/samkiell/soro.git
cd soro
```

### Install dependencies and start development

After the project scaffold and `package.json` are available:

```bash
pnpm install
pnpm dev
```

Open the local URL printed in your terminal, usually `http://localhost:3000`.

> These commands depend on the scaffold being merged. If the repository does not yet contain a `package.json`, follow Issue #1 rather than assuming the app is ready to run.

### Environment variables

Features such as the database, authentication, and photo uploads will require environment variables. The team should maintain an `.env.example` listing required variable names and safe placeholders. Create your local `.env` file from that template and supply your own development credentials.

**Never commit `.env` files, database passwords, authentication secrets, or Neon Object Storage credentials.** The `assets` bucket is private. Do not expose server-only secrets through variables prefixed with `NEXT_PUBLIC_`.

Exact variable names and database migration commands should be documented here once the corresponding setup issues are implemented.

## How to contribute

This project is being built by a team, including contributors who are still learning. Keep changes small, communicate early, and use the task issues as the source of truth.

1. Read [the PRD](docs/PRD.md) and [the task breakdown](docs/TASKS.md).
2. Open the GitHub issue assigned to you and review its goal, scope, and acceptance checklist.
3. Coordinate shared interfaces and data structures with the relevant frontend/backend contributors before coding against them.
4. Create a focused branch for your task, for example:

   ```bash
   git checkout -b feat/short-task-name
   ```

5. Implement only the agreed scope. Do not commit secrets or unrelated changes.
6. Run the checks available for the project, such as linting, type-checking, tests, and a local build.
7. Open a pull request against `main`, link the issue, explain what changed, and include screenshots for UI changes.
8. In the PR description, list the checks you ran and anything that remains incomplete.

If you are stuck, add a comment to the issue describing what you tried, the error you encountered, and what help you need.

## Privacy and safety principles

- Reports may contain sensitive information. Do not expose one student's reports to another student.
- Anonymous reporting must not reveal the reporter's identity in student-facing pages or responses.
- Only authorized administrators should be able to view all reports, change statuses, or write internal notes.
- Enforce permissions on the server; hiding a button in the UI is not sufficient.
- Collect only the information needed to handle a report.
- Do not upload images unless it is safe and appropriate to do so.

## Emergency information: important limitation

The project brief supplies the fire service contact **08162214241**, which must be verified by the project team before release. When contacting emergency services, be ready to provide your name if available, the exact location, and the nature of the emergency.

A phone link in the app can open the device's calling interface. It does **not** automatically call emergency services, alert campus responders, or guarantee a response. Soro does not replace contacting the appropriate emergency service directly in an urgent or life-threatening situation.

## Team and academic context

- **Project:** Soro, Campus Safety & Incident Reporting System
- **Course:** SWEP 200
- **Group:** 10
- **Institution:** Obafemi Awolowo University
- **Supervisor:** Dr. A. Akinwale

## License

No license has been specified yet. Do not assume that the repository is open for reuse or redistribution until the project team adds and approves a license.
