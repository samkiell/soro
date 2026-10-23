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
- Cloudinary for optional report photo uploads
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
    cloudinary/
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

Use Prisma models with explicit relations and timestamps. Final field names and optional profile fields must be agreed in the Prisma schema before migrations are created.

### User
- Unique ID
- Name and normalized email
- Password hash
- Role: `STUDENT` or `ADMIN`
- Created and updated timestamps

### IncidentReport
- Unique ID
- Reporter relation when the report is attributable
- Title and description
- Location
- Incident type
- Urgency
- Anonymous flag
- Optional photo URL and provider asset identifier
- Status: `RECEIVED`, `IN_PROGRESS`, or `RESOLVED`
- Created and updated timestamps

### Report status history
Keep an append-only history of status changes, including the report, previous and new status where applicable, actor, timestamp, and an optional internal note. If the PRD requires separate student-visible updates, distinguish them from admin-only notes at the data-model and API levels.

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

## 8. File upload boundary: Cloudinary

Cloudinary is the approved image storage and delivery provider for optional incident photos. Neon stores application records and Cloudinary asset references; image binaries do not belong in PostgreSQL.

- Uploads are optional and must not block a text-only report.
- Validate file type, size, and upload authorization on the server; do not trust filename extensions or client-provided MIME types alone.
- Use server-side Cloudinary credentials. Never expose `CLOUDINARY_API_SECRET` in browser code or prefix it with `NEXT_PUBLIC_`.
- Prefer a server-created signed upload flow or a server-side upload endpoint. Generate signatures on the server and enforce allowed formats, size limits, and an appropriate upload folder.
- Accept only the supported image types and document the maximum size before implementation.
- Store the Cloudinary `public_id`, secure delivery URL, and only other metadata the application genuinely needs.
- Avoid embedding names, incident descriptions, or other private details in public asset URLs or filenames.
- Decide whether assets must be private or access-controlled before production. Do not assume an unlisted URL makes sensitive incident photos private.
- Handle failed uploads gracefully and allow the user to submit without a photo.
- Define cleanup behavior for abandoned uploads and deleted reports so unused assets do not accumulate.

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

### Cloudinary

- Configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in local environment settings and the deployment provider's secret settings.
- Keep the API secret server-only. Do not expose it to client components or browser bundles.
- Use a server-authorized upload flow with explicit format and size limits. Store the resulting asset reference in Neon only after the upload succeeds.

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
