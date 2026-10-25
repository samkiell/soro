# Soro: Feature Status and Demo Script

This page is for the documentation and presentation team (issue #11) and for anyone preparing a demo. It records what is actually built, a reliable demo path through it, and what Soro does not do. Update it whenever a feature lands or changes.

## Feature status

| Feature | Status | Where |
|---|---|---|
| Landing page | Implemented | `/` |
| Emergency contacts and calling guidance | Implemented. The number still needs team verification before release. | `/emergency` |
| Registration and sign-in (student accounts) | Implemented | `/register`, `/login` |
| Admin accounts | Implemented, created only by the seed script | `pnpm db:seed` |
| Submit an incident report, including anonymously | Implemented | `/report/new` |
| Optional photo evidence (private storage) | Implemented | `/report/new` |
| Admin overview with live counts | Implemented | `/admin` |
| Admin report list with status, urgency, and type filters | Implemented | `/admin/reports` |
| Admin report review, status updates, and internal notes | Implemented | `/admin/reports/[id]` |
| Student dashboard (list of my reports) | Planned (issue #5) | `/dashboard` |
| Student report details and status history | Planned (issue #6) | `/report/[id]` |
| Rate limiting on sign-in and report submission | Planned | |
| Removing hidden photo metadata (location, device) | Planned | |

## Before the demo

1. Use a **development** Neon branch, never production data.
2. `pnpm install`, fill in `.env` (see the README), then `pnpm db:deploy`.
3. Create the demo admin: set `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`, then run `pnpm db:seed`.
4. `pnpm dev`, or use the deployed preview.
5. Use made-up incidents only. Don't use real names, real incidents, or real photos of people.

## Demo script (about 6 minutes)

1. **Problem (landing page).** Students don't always know who to call, and they want a private way to report incidents. Open `/`.
2. **Emergency first (`/emergency`).** Show the fire service number, the one-tap call button, and what to say when calling. Point out the notice that the button only opens the phone's dialer and Soro doesn't alert anyone.
3. **Register a student (`/register`).** Show validation by submitting an empty form, then create a demo account.
4. **Submit a report (`/report/new`).**
   - Show the required-field messages first.
   - Fill in a made-up incident, for example "Streetlight out near Moremi Hall", type *Facility*, urgency *Low*.
   - Tick **Report anonymously** and read out what anonymity means.
   - Optionally attach a harmless photo, such as a picture of a lamp post.
   - Submit and show the confirmation with its reference number.
5. **Switch to the admin (`/login`).** Sign out, then sign in as the seeded admin.
6. **Admin overview (`/admin`).** The counts come from the database, and the new report appears in the totals.
7. **Find the report (`/admin/reports`).** Filter by status *Received*, then open the report.
8. **Review it.** The reporter shows as *Anonymous*. The photo loads only for signed-in authorized users.
9. **Update the status.** Change it to *In progress* and show the new history entry with the admin's name and time.
10. **Add an internal note.** Show the "Admins only" label. Explain that notes live in a separate table and are never sent to students.
11. **Access control (optional).** Sign in as the student and visit `/admin`: the page is not found. Signed out, `/report/new` redirects to sign-in.

## Known limitations (state these honestly)

- **No emergency dispatch.** The call button opens the phone's dialer. Soro does not place calls, send alerts, share location, or notify responders.
- **Emergency number not yet verified.** The number 08162214241 comes from the project brief and must be verified by the team before release.
- **Students can't yet view their submitted reports** (issues #5 and #6). The confirmation screen shows a reference number in the meantime.
- **Anonymity is limited to the app.** Anonymous reports hide the reporter from admins in Soro, but the database still links the report to the student's account.
- **Photo metadata is kept.** Photos may contain hidden location or device details. The form warns about this.
- **No rate limiting yet** on sign-in, registration, or report submission.
- **No email verification or password reset.**
- **No automated end-to-end (browser) tests yet.** Unit tests cover validation, permissions, uploads, and admin actions.

## Screenshots

Take screenshots from the running app after setup, using demo data only. Don't use design mock-ups as evidence of finished features.
