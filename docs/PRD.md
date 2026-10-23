# Soro: Product Requirements Document

**Project:** Soro  
**Project type:** Campus Safety & Incident Reporting System  
**Team:** SWEP 200, Group 10, Obafemi Awolowo University (OAU)  
**Supervisor:** Dr. A. Akinwale  
**Repository:** https://github.com/samkiell/soro

## 1. Problem

Students may not know which emergency contacts to use, may report incidents informally to friends or student representatives, and need a way to report incidents while protecting their privacy. Poor network conditions also mean that the reporting experience must be simple and lightweight.

## 2. Goals

- Let students submit and track campus incident reports.
- Support anonymous reports without exposing the reporter's identity in normal report views.
- Give authorized administrators a central place to review reports, update statuses, and add notes.
- Make emergency contact information easy to find on mobile.
- Communicate report status clearly and avoid promising emergency response capabilities that have not been implemented.

## 3. Roles and permissions

### Student / User
- Register and sign in.
- Submit an incident report.
- View reports they are permitted to access.
- View status updates for their own reports.
- Choose anonymous reporting.
- Access emergency contact information.

### Administrator
- View all reports.
- Review report details.
- Update report status.
- Add administrative notes.
- View a basic overview of report counts and statuses.

Authorization must be enforced on the server for every protected operation, not only by hiding UI elements.

## 4. Required pages

- `/` - public landing page and clear entry points to report an incident or view emergency contacts.
- `/login` - sign in.
- `/register` - create an account.
- `/dashboard` - user dashboard and their reports.
- `/report/new` - submit a report.
- `/report/[id]` - report detail and status history, accessible only to an authorized viewer.
- `/emergency` - emergency contact information and guidance.
- `/admin` - administrator overview.
- `/admin/reports` - administrator report list and filters.
- `/admin/reports/[id]` - administrator report review, status updates, and notes.

## 5. Incident report fields

Required:
- Title
- Description
- Location
- Incident type
- Urgency

Optional:
- Photo evidence
- Anonymous flag

Suggested incident types should be configurable or defined centrally, and the form should explain what information is useful to include. The interface should encourage exact location and relevant details without making the form unnecessarily long.

## 6. Report statuses

- `received` - submitted and recorded.
- `in progress` - being reviewed or acted on.
- `resolved` - marked as resolved by an authorized administrator.

Record status changes with timestamps and the responsible administrator where appropriate. User-facing status history must not reveal private internal notes.

## 7. Emergency contacts and alert scope

The supplied fire service contact is **08162214241**. It is a contact number, not a toll-free number. Users should be guided to provide their name if available, exact location, and the nature/cause of the emergency when contacting the service.

The emergency page should provide one-tap calling on supported devices and clear instructions. A `tel:` link is a phone-call shortcut, not an in-app alert system. Do not describe the app as dispatching an emergency alert or placing a call automatically unless a real, tested notification/delivery integration is separately approved and implemented. Emergency contact details must be verified before release.

## 8. Student feedback and usability requirements

Feedback gathered for the project indicates:
- Students want emergency contacts to be easy to find.
- In-app alerts and calls are preferred for urgent situations; online forms suit non-emergency reports.
- Anonymous reporting is important.
- Students want confirmation, status updates, and clear privacy expectations.
- Network quality may be poor.
- The core reporting flow should be short and usable on mobile.
- Students may currently report incidents to friends or Student Union representatives first.
- Useful report details include location, urgency, people involved where relevant, and photo evidence when safe and appropriate.

## 9. Locked technology stack

- Next.js App Router
- TypeScript
- Tailwind CSS and shadcn/ui
- Neon Postgres
- Prisma
- NextAuth.js Credentials
- Cloudinary for optional photo uploads
- React Hook Form and Zod
- pnpm
- Vercel deployment

Do not substitute the locked stack without team approval.

## 10. Privacy and security requirements

- Hash passwords using a suitable password-hashing algorithm; never store plaintext passwords.
- Validate all user input on the server with schemas.
- Protect authenticated routes and enforce role-based authorization on the server.
- A user must not be able to view another user's private report by changing an ID.
- Anonymous reports must not display reporter identity to ordinary users or expose it through public-facing APIs/UI. Define the minimum internal access needed for safety and abuse handling.
- Keep administrator notes separate from user-visible status history.
- Restrict photo upload type and size; use secure Cloudinary configuration and do not expose secrets in client code.
- Store secrets in environment variables and document required variables without committing values.
- Avoid collecting unnecessary personal data.
- Provide clear limitations: this system does not replace calling emergency services.

## 11. Acceptance criteria

- A user can register and sign in with valid credentials.
- Invalid input produces understandable validation messages.
- An authenticated user can submit a report and see a confirmation.
- A user can view only reports they are authorized to access.
- Anonymous reporting does not expose the reporter's identity in user-facing report details.
- An administrator can list reports, open a report, update its status, and add an internal note.
- Status changes are persisted and visible in the appropriate report history.
- Emergency contact information is visible and the call shortcut works on supported devices.
- Core pages work on mobile and handle loading, empty, and error states.
- Automated checks cover important validation, permissions, and report workflows.
- The README documents local setup, environment variables, migrations, test commands, and deployment.

## 12. Out of scope unless separately approved

- Guaranteed emergency dispatch or response.
- Automatic calls to emergency services.
- SMS, WhatsApp, push, or in-app alert delivery to responders without a defined recipient, delivery provider, consent/privacy plan, and tested integration.
- Public browsing of incident reports.
- Claims of official OAU emergency-service integration unless authorization is confirmed.
