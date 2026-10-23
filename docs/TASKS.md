# Soro: Task Breakdown

**Repository:** https://github.com/samkiell/soro  
**Working rule:** Each assigned team owns implementation, scaffolding, tests, and a short handoff note. Do not build another team's area without coordinating first. Keep the locked stack in `docs/PRD.md`.

## Coordination and delivery rules

- Read `docs/PRD.md` before implementation.
- Work in focused branches and open pull requests against `main`; avoid unreviewed direct pushes for feature work.
- Keep PRs small, include screenshots for UI changes, tests or manual verification steps, and reference the relevant issue.
- Do not commit secrets or real user data.
- Agree on shared types, Prisma model names, route contracts, and environment variable names before parallel work creates conflicting assumptions.
- Backend authorization must be enforced server-side.
- Do not claim that Soro sends emergency alerts unless a real delivery integration is implemented and tested.

## Phase 1: Foundation and decisions

### Task 1 - Project setup and conventions
**Suggested owner:** Frontend/scaffolding team  
**Deliverables:**
- Scaffold Next.js App Router + TypeScript using pnpm.
- Configure Tailwind CSS and shadcn/ui.
- Add linting, formatting, and basic test commands.
- Establish a clean folder structure and responsive app shell.
- Update README with local setup instructions.
**Acceptance:** A fresh clone can install dependencies and run the app using documented commands.

### Task 2 - Database schema and Prisma
**Suggested owner:** Backend team  
**Deliverables:**
- Configure Prisma for Neon Postgres.
- Define User, Report, ReportStatusHistory, and ReportNote (or an equivalent schema agreed by the team).
- Include report type, urgency, anonymity, location, status, timestamps, and optional image URL.
- Add migrations and safe seed/setup instructions.
**Acceptance:** Migrations apply cleanly to a configured development database; schema and enums are documented.

### Task 3 - Authentication and authorization
**Suggested owner:** Backend team  
**Deliverables:**
- Implement NextAuth.js Credentials sign-in.
- Implement registration with server-side validation and password hashing.
- Add role-aware access checks for user and admin operations.
- Protect dashboard, report detail, and admin routes/actions.
**Acceptance:** Valid users can sign in; invalid credentials fail safely; protected operations reject unauthenticated or unauthorized requests.

## Phase 2: Student reporting

### Task 4 - Report submission form
**Suggested owner:** Frontend team, coordinated with backend  
**Deliverables:**
- Build `/report/new` with React Hook Form and Zod.
- Include title, description, location, incident type, urgency, anonymous flag, and optional photo.
- Connect form submission to the agreed server action/API.
- Include loading, success, validation, and error states.
**Acceptance:** Valid submissions persist; invalid submissions are rejected server-side and receive clear feedback.

### Task 5 - Report list and user dashboard
**Suggested owner:** Frontend team  
**Deliverables:**
- Build `/dashboard` with the signed-in user's reports.
- Show useful status and date information.
- Include loading, empty, and error states.
**Acceptance:** Users see only reports they are authorized to access.

### Task 6 - Report details and status history
**Suggested owner:** Frontend + backend coordination  
**Deliverables:**
- Build `/report/[id]`.
- Show report details and user-visible status history.
- Keep private administrator notes out of the student view.
**Acceptance:** Access is permission-checked on the server and status history is accurate.

## Phase 3: Emergency and administration

### Task 7 - Emergency information page
**Suggested owner:** Frontend team, with contact verification by project team  
**Deliverables:**
- Build `/emergency` with the supplied fire service contact, clear call guidance, and mobile-friendly `tel:` link.
- Explain what information to provide when calling.
- Clearly state that calling is the user's action and that the app does not itself dispatch responders.
**Acceptance:** Contact details are verified before release; call shortcut and instructions are tested on supported devices.

### Task 8 - Admin overview and report management
**Suggested owner:** Frontend + backend coordination  
**Deliverables:**
- Build `/admin`, `/admin/reports`, and `/admin/reports/[id]`.
- Add report list filters and a basic overview of report counts/statuses.
- Allow authorized administrators to update status and add internal notes.
**Acceptance:** Admin-only operations are enforced server-side; status changes and notes persist.

## Phase 4: Uploads, quality, and release

### Task 9 - Optional photo uploads
**Suggested owner:** Backend team, coordinated with report form owner  
**Deliverables:**
- Integrate Cloudinary using server-side secrets.
- Validate allowed file types and size.
- Handle upload failures without losing the rest of the report.
**Acceptance:** Only permitted files are accepted and secrets are never exposed to the browser.

### Task 10 - Validation, permissions, and regression testing
**Suggested owner:** Testing team  
**Deliverables:**
- Test registration/login, report creation, anonymous reporting, ownership boundaries, admin-only actions, status changes, and validation failures.
- Test mobile layouts and poor-network/error states.
- Log reproducible bugs as separate issues.
**Acceptance:** Critical permission and report-flow cases pass; unresolved blockers are documented.

### Task 11 - Documentation and presentation
**Suggested owner:** Research/docs/presentation team  
**Deliverables:**
- Maintain project overview, scope, architecture, user feedback summary, setup guide, limitations, and screenshots.
- Prepare a short demo script aligned with the implemented features.
- Clearly distinguish implemented features from proposed/future work.
**Acceptance:** Documentation matches the actual app and does not overstate emergency capabilities.

## Suggested ownership from the team poll

- **Frontend/scaffolding:** Haschwal th, Muheez CSE, ZariyaTech.
- **Backend:** samkiell and day_veedd.
- **Presentation/research/docs:** Sherry Chen, bee_jay, Oluwanifemi.
- **Testing:** Fiyinfoluwa, Jeffrey, Anonymous, Bhago, debby, Nathan.
- **Bug fixing:** assign one or two testers after the team confirms exact GitHub usernames.

Names above came from the task poll and may not exactly match GitHub handles. Confirm handle mappings before assigning issues. The repository collaborator list supplied for this project is the source of valid handles; do not guess a handle based on a display name.

## Suggested issue order

1. Project setup and conventions
2. Database schema and Prisma
3. Authentication and authorization
4. Report submission form
5. User dashboard and report list
6. Report details and status history
7. Emergency information page
8. Admin overview and report management
9. Optional photo uploads
10. Validation and regression testing
11. Documentation and presentation
