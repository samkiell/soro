# Soro Architecture

**Status:** Proposed baseline for implementation  
**Applies to:** Soro Campus Safety & Incident Reporting System  
**Repository:** `samkiell/soro`

This document defines the implementation boundaries for the team. The PRD remains the source of truth for product requirements. If a requirement conflicts with this document, raise it before changing the implementation.

## 1. Architecture decision

Build a **modular monolith** with Next.js App Router. Keep the web UI, server-side application logic, authentication, validation, and database access in one repository and deployment. Do not introduce a separate backend service or microservices for the initial version.

Why: this is easier for a learner-heavy team to understand, test, deploy, and maintain, while preserving clear boundaries between features.

## 2. Locked stack

- Next.js App Router and TypeScript
- pnpm
- Tailwind CSS and shadcn/ui
- **Neon PostgreSQL** as the only application database
- Prisma ORM for schema, migrations, and database access
- NextAuth.js Credentials provider, using the version compatible with the project setup
- Zod for input validation
- React Hook Form for client-side forms
- Neon Object Storage for optional report photo uploads, using the private `assets` bucket
- Vercel for deployment
- Vitest for unit tests and Playwright for critical end-to-end flows

Do not add another database, ORM, authentication provider, UI framework, or package manager without agreement from the team.

## 3. Application structure

Use feature-oriented modules rather than putting all logic in one large file. Exact filenames can adapt to the installed framework version, but keep these responsibilities separate.

```text
src/
  app/
    (public)/
      page.tsx
      login/
      register/
      emergency/
    (student)/
      dashboard/
      report/
        new/
        [id]/
    (admin)/
      admin/
        page.tsx
        reports/
          page.tsx
          [id]/
    api/
      auth/
      reports/
      uploads/
  components/
    ui/
    layout/
    forms/
    reports/
  features/
    auth/
    reports/
    emergency/
    admin/
  lib/
    auth/
    db/
    validation/
    storage/
    permissions/
  server/
    services/
    repositories/
  types/
prisma/
  schema.prisma
  migrations/
tests/
  unit/
  e2e/
```

These folders are a responsibility map, not a requirement to create every folder on day one. Follow existing repository conventions if scaffolding has already established a consistent structure.

### Responsibilities

- `app/`: routes, layouts, loading/error states, and thin route handlers.
- `components/ui/`: shared primitives from shadcn/ui. Avoid feature-specific business logic here.
- `features/`: feature-level schemas, types, and reusable UI for auth, reports, emergency information, and admin.
- `lib/db/`: Prisma client initialization only.
- `lib/validation/`: shared Zod schemas where reuse is appropriate.
- `lib/permissions/`: server-side authorization helpers.
- `server/services/`: application use cases and business rules.
- `server/repositories/`: focused database queries when separating them improves clarity.
- `prisma/`: schema and committed migrations.
- `tests/`: unit and end-to-end tests.

Do not add abstractions just to fill this structure. Prefer a small, understandable module over a generic framework of helpers.

## 4. Request and data flow

For every protected write or read, use this sequence:

1. Receive the request or server action.
2. Validate all untrusted input with Zod on the server.
3. Resolve the authenticated session on the server.
4. Check the user's role and resource ownership.
5. Execute the relevant service and Prisma query.
6. Return only the fields needed by the caller.
7. Render a clear success, empty, or error state.

Client-side validation improves usability but is never a security boundary. A hidden button or protected page layout is not sufficient authorization.

## 5. Authentication and authorization

- Store passwords only as secure password hashes using a maintained password-hashing library. Never store or log plaintext passwords.
- Validate credentials on the server and return generic authentication errors that do not disclose whether an account exists.
- Use the session on the server to identify the current user. Never trust a client-supplied user ID as proof of identity.
- Student routes and queries must be scoped to the authenticated student's own records.
- Admin-only actions must check the admin role on the server for every request.
- Registration must never allow a user to choose or submit their own admin role.
- Protect session secrets and database credentials with environment variables. Never commit real secrets.
- Add rate limiting or equivalent abuse protection to authentication and report-submission endpoints before production release, using an approach supported by the deployment environment.
- Avoid logging incident descriptions, personal contact details, credentials, or other sensitive report content.

## 6. Core data model

**Locked integration contract:** Exact Prisma field names, enum values, create-report signature, and photo upload flow are defined in [REPORT_API_CONTRACT.md](./REPORT_API_CONTRACT.md). Frontend and backend work must follow it.

Use Prisma models with explicit relations and timestamps. The implemented schema is in `prisma/schema.prisma` (Prisma 7, `prisma-client` generator, Neon driver adapter) with the initial migration in `prisma/migrations/`.

### User
- `id` (cuid), `name`, `email` (unique, stored lowercased)
- `passwordHash` (bcrypt, cost 12)
- `role`: `STUDENT` (default for every registration) or `ADMIN` (granted only by `pnpm db:seed`)
- `createdAt`, `updatedAt`

### Report
- Fields exactly as in [REPORT_API_CONTRACT.md](./REPORT_API_CONTRACT.md): `reporterId`, `title`, `description`, `location`, `incidentType`, `urgency`, `isAnonymous`, optional `photoKey` (unique), `status`, `createdAt`, `updatedAt`.
- Indexed on `(reporterId, createdAt)`, `(status, createdAt)`, and `createdAt`.

### ReportStatusHistory (student-visible)
- Append-only: `reportId`, `fromStatus` (null for the initial entry), `toStatus`, `changedById` (the admin), `createdAt`.
- The initial `RECEIVED` entry is created in the same insert as the report and records **no actor**, so an anonymous reporter never appears in the history.

### ReportNote (admin-only)
- `reportId`, `authorId`, `body`, `createdAt`. Stored in its own table and only ever read by admin services, so notes cannot leak through student-facing queries.

### What "anonymous" means in Soro
An anonymous report still stores `reporterId` so the student can follow their own report. Admin services remove the reporter's name and email before returning an anonymous report, so they never reach a page or API response. People with direct database access can still see the link. The report form states this.

### Data-model rules
- Use database constraints for uniqueness and required relations.
- Index fields used frequently for filtering and sorting, such as report status, creation time, and reporter ID.
- Use migrations for schema changes. Do not edit a deployed database manually and forget to commit the migration.
- Never expose admin-only notes or another student's identity through student report responses.
- Define exactly what anonymity means before implementation. An anonymous flag should not be assumed to make a report untraceable if the database still stores a reporter relation. Restrict access to any retained identity and explain the actual behavior in the UI.

## 7. Report lifecycle

Use these application statuses consistently:

`RECEIVED → IN_PROGRESS → RESOLVED`

- A new report starts as `RECEIVED`.
- Only authorized admins can change status.
- Each status change creates a history entry in the same logical operation.
- The student can see their report status and the student-visible history.
- Admin notes must be separate from public status updates.
- Reject invalid transitions or malformed status values on the server.

Do not make a report appear resolved just because an admin opened it or added a note.

Implemented transitions (`src/lib/permissions/policies.ts`): `RECEIVED → IN_PROGRESS | RESOLVED`, `IN_PROGRESS → RECEIVED | RESOLVED`, and `RESOLVED → IN_PROGRESS` (reopen). A status update and its history entry are written in one transaction, guarded against concurrent changes.

## 8. File upload boundary: Neon Object Storage

Use Neon Object Storage for optional incident-photo binaries. The configured bucket name is `assets` and its visibility is **Private**. Neon Postgres stores report metadata and the storage object key, not image binaries.

- Uploads are optional and must not block a text-only report.
- Validate file type, size, and upload authorization on the server; do not trust filename extensions or client-provided MIME types alone.
- Use Neon Object Storage's supported server-side/S3-compatible credentials and API. Keep access keys and secrets in server-only environment variables; never expose them through `NEXT_PUBLIC_` variables or browser bundles.
- Confirm the current Neon Object Storage SDK/API and required environment variable names before implementation. Do not invent endpoint URLs or credentials.
- Upload to the private `assets` bucket and store only the object key plus necessary metadata in the report record. Do not treat object keys as public URLs.
- Serve or download photos only after checking the viewer's authorization for the related report. Use the provider's supported authorized access mechanism; do not make the bucket public to simplify display.
- Accept only supported image types and enforce a documented maximum file size on the server.
- Avoid embedding names, incident descriptions, or other private details in object keys or metadata.
- Handle failed uploads gracefully and allow the user to submit without a photo.
- Define cleanup behavior for abandoned uploads and deleted reports so unused objects do not accumulate.

### As implemented

- **Client:** `@aws-sdk/client-s3` pointed at Neon's S3 endpoint with `forcePathStyle`. Variables: `AWS_ENDPOINT_URL_S3`, `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (per Neon's docs).
- **Upload:** `POST /api/uploads` (FormData, one `file` field). It requires a signed-in student and same-origin request, caps size at 4 MB (under Vercel's 4.5 MB body limit), and accepts JPEG, PNG, or WebP detected from the file's bytes. It returns `{ success: true, photoKey }`.
- **Keys:** `reports/<uploaderUserId>/<uuid>.<ext>`. No names or report content. `createReport` only accepts a key under the caller's own prefix that exists in the bucket and isn't attached to another report.
- **Viewing:** `GET /api/reports/[id]/photo` checks that the viewer is the reporter or an admin, then streams the object with `Cache-Control: private, no-store`. Keys and storage URLs never reach the browser. Unauthorized and missing photos both return 404.
- **Cleanup:** `pnpm storage:cleanup [--apply]` deletes objects older than 24 hours that no report references. That covers abandoned uploads and photos of deleted reports.
- **Not yet done:** photo metadata (EXIF location, device) is not stripped. The form warns students about this.

## 9. Route and permission matrix

| Area | Anonymous visitor | Student | Admin |
|---|---|---|---|
| Landing page | View | View | View |
| Register / login | Use | Use or redirect appropriately | Use or redirect appropriately |
| Submit report | Sign-in required | Create report | Only if explicitly supported |
| Student dashboard | No | Own reports only | Admin area |
| Report details | No | Own report only | Authorized report access |
| Emergency information | View | View | View |
| Admin overview | No | No | View |
| Admin report management | No | No | View and manage all reports |

Always enforce this matrix in server-side code, not only in navigation or UI rendering.

## 10. Emergency information

The initial emergency page provides clear guidance and verified contact information. A `tel:` link only opens the device's calling interface; it does not notify campus security, share live location, or dispatch responders.

Before publishing a number, verify that it is current and authorized for the stated purpose. Make emergency instructions readable on small screens and usable on a slow connection. Do not label the page as a live alert service unless such a service is actually implemented and tested.

## 11. UI and rendering rules

- Prefer Server Components for data-driven pages by default.
- Add Client Components only where interaction or browser APIs require them.
- Keep database access in server-only modules; never import Prisma into client components.
- Keep route handlers thin and delegate business rules to feature services.
- Use the shared design tokens and component patterns in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).
- Provide loading, empty, success, validation, and error states for each important workflow.
- Do not put secrets or sensitive report data in URL query strings.

## 12. Testing and quality gates

Before merging a feature:

- Run linting, type checking, and the available test suite.
- Test server-side authorization for both allowed and denied cases.
- Test invalid input and database failure paths.
- Test the core report lifecycle and verify status history is recorded.
- Test that one student cannot access another student's report by changing an ID.
- Test that students cannot access admin routes or internal notes.
- Test upload failure and text-only report submission.
- Keep a Playwright smoke test for registration/login, report submission, student status viewing, and admin status updates where the test environment supports it.

Never use real incident reports or real credentials in test fixtures.

## 13. Environment variables and service setup

Document required variables in `.env.example` using placeholder values only. Never commit `.env`, production credentials, or real user data.

### Neon PostgreSQL

- Create the project and database in Neon.
- Set `DATABASE_URL` to the Neon connection string used by the deployed application. Use the provider-recommended pooled connection string for normal serverless application traffic where appropriate.
- If Prisma migrations require a separate direct connection, configure `DIRECT_URL` only when supported and needed by the installed Prisma version; keep the runtime and migration connection roles clear.
- Keep credentials server-side. Do not expose either connection string through a `NEXT_PUBLIC_` variable.
- Run schema changes through committed Prisma migrations. Never rely on a local-only schema change.

### Neon Object Storage

- Configure the Neon Object Storage credentials and endpoint using the current provider documentation and the project's chosen SDK/API.
- Use the private bucket named `assets`.
- Keep storage credentials server-only. Never expose them in client components, browser bundles, or `NEXT_PUBLIC_` variables.
- Use a server-authorized upload and retrieval flow with explicit format, size, and report-access checks. Store the object key in Neon only after upload succeeds.

### Application authentication

- Set `AUTH_SECRET` or the exact secret variable required by the installed NextAuth.js version.
- Finalize variable names against the actual installed auth and Prisma versions before implementation. Keep `.env.example` limited to variable names and safe placeholders.

## 14. Team conventions

- Use TypeScript; avoid `any` unless documented and unavoidable.
- Keep components small and name them by their responsibility.
- Use consistent, descriptive names for database fields and enum values.
- Prefer shared schemas and types where both client and server genuinely need them.
- Do not duplicate authorization logic across pages. Use tested server-side helpers.
- Use descriptive branches and commit messages. Open focused pull requests and reference the issue being completed.
- Do not introduce a new library without explaining the need and checking compatibility with the locked stack.

## 15. Decision changes

This architecture is the baseline for the first release. A change to authentication, database, ORM, deployment model, report privacy, or authorization must be documented in a pull request with the reason, impact, and team approval before implementation.
