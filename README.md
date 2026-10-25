# Soro

**Campus Safety & Incident Reporting System**  
SWEP 200 · Group 10 · Obafemi Awolowo University (OAU)

Soro is a campus safety project designed to help students submit incident reports, follow their status, and find emergency contact information in one place. It also provides an administrative workspace for authorized staff to review reports and record progress.

> **Project status:** In development. Sign-in, report submission, emergency information, photo uploads, and admin report management are implemented. The student dashboard and student report-detail pages are still in progress. See [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) for the current feature status.

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
- [Architecture](docs/ARCHITECTURE.md) and [Report API contract](docs/REPORT_API_CONTRACT.md): how the system fits together and the locked data contract.
- [Demo script and feature status](docs/DEMO_SCRIPT.md): what is implemented, how to demo it, and known limitations.
- [GitHub Issues](https://github.com/samkiell/soro/issues): task-specific instructions and progress.

## Getting started

### Prerequisites

Install:
- Node.js 22 LTS (22.12+) or 24 LTS. Prisma 7 and Vitest 5 require one of these.
- pnpm 11 (`corepack enable` picks up the version pinned in `package.json`).
- Git.
- A [Neon](https://neon.com) project in a region that supports Neon Object Storage (for example AWS US East (Ohio)), with a **private** bucket named `assets`.

### Get the code and install

```bash
git clone https://github.com/samkiell/soro.git
cd soro
pnpm install        # also runs `prisma generate`
```

### Environment variables

Copy the template and fill in your own **development** values:

```bash
cp .env.example .env
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon **pooled** connection string (host contains `-pooler`). Used by the app. |
| `DATABASE_URL_UNPOOLED` | Neon **direct** connection string. Used by Prisma CLI for migrations and seeding. |
| `AUTH_SECRET` | Session signing secret. Generate with `openssl rand -base64 32`. `NEXTAUTH_SECRET` also works. |
| `AUTH_URL` | The app's base URL, for example `http://localhost:3000`. Needed for `pnpm start` outside Vercel. |
| `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Neon Object Storage credentials with `storage:read` and `storage:write` (Neon Console → Connect → Storage, or `neon env pull`). |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME` | Optional. Used once by `pnpm db:seed` to create the first admin. |

**Never commit `.env` files, database passwords, authentication secrets, or Neon Object Storage credentials.** The `assets` bucket is private. Do not expose server-only secrets through variables prefixed with `NEXT_PUBLIC_`.

If storage variables are missing, the app still works and reports can be submitted without photos; uploads return a clear "not available" message.

### Set up the database

```bash
pnpm db:deploy      # apply committed migrations (prisma migrate deploy)
pnpm db:seed        # optional: create or promote the admin in SEED_ADMIN_EMAIL
```

Registration always creates **student** accounts. The seed script is the only way to create an admin; it never changes an existing account's password.

When you change `prisma/schema.prisma`, create a migration with `pnpm db:migrate` against a development branch, never production, and commit the generated folder in `prisma/migrations/`.

### Run the app

```bash
pnpm dev
```

Open `http://localhost:3000`.

### Checks

```bash
pnpm lint
pnpm typecheck
pnpm test          # Vitest unit tests in tests/unit
pnpm db:validate   # Prisma schema validation
pnpm build
```

### Photo storage maintenance

Abandoned uploads (a photo uploaded but the report never submitted) and photos of deleted reports are removed by a cleanup script. It only deletes objects older than 24 hours that no report references.

```bash
pnpm storage:cleanup           # dry run: reports how many would be deleted
pnpm storage:cleanup --apply   # deletes them
```

### Deploying to Vercel

1. Import the repository in Vercel. The default build (`pnpm install` → `next build`) works; `prisma generate` runs on install.
2. Add the environment variables above in Project Settings. `AUTH_URL` is optional on Vercel.
3. Run `pnpm db:deploy` against the production database before (or as part of) the first deploy.
4. Uploads are limited to 4 MB per photo to stay within Vercel's request size limit.

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
