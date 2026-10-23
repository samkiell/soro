# Report Data and API Contract

**Status: Locked for frontend/backend integration.** Keep this contract aligned with prisma/schema.prisma and shared Zod schemas.

## Prisma model: Report

| Field | Type | Rules |
|---|---|---|
| id | String | Primary key, cuid |
| reporterId | String | Required User relation; derive from authenticated session |
| title | String | Required |
| description | String | Required |
| location | String | Required |
| incidentType | IncidentType | Required enum |
| urgency | Urgency | Required enum |
| isAnonymous | Boolean | Default false |
| photoKey | String? | Optional object key in private Neon Object Storage bucket assets; never a public URL |
| status | ReportStatus | Default RECEIVED |
| createdAt | DateTime | Default now |
| updatedAt | DateTime | Updated automatically |

Keep status history and admin-only notes separate from student-visible report data.

## Exact enum values

IncidentType: SAFETY, THEFT, HARASSMENT, MEDICAL, FIRE, SUSPICIOUS_ACTIVITY, FACILITY, OTHER.

Urgency: LOW, MEDIUM, HIGH, CRITICAL.

ReportStatus: RECEIVED, IN_PROGRESS, RESOLVED.

UI labels may be human-readable, but API and database values must use these exact identifiers. New reports always start as RECEIVED. Only authorized admins may update status.

## Create-report server action

Use createReport with a typed object, not raw FormData:

```ts
 type CreateReportInput = {
  title: string;
  description: string;
  location: string;
  incidentType: IncidentType;
  urgency: Urgency;
  isAnonymous: boolean;
  photoKey?: string;
};

type CreateReportResult =
  | { success: true; report: { id: string; status: ReportStatus; createdAt: string } }
  | { success: false; error: "UNAUTHENTICATED" | "VALIDATION_ERROR" | "UPLOAD_NOT_FOUND" | "FORBIDDEN" | "INTERNAL_ERROR"; fieldErrors?: Record<string, string[]> };

export async function createReport(input: CreateReportInput): Promise<CreateReportResult>;
```

Validate input with shared Zod schema on the server. Derive reporterId from the authenticated session. Never accept client-supplied reporterId, status, IDs, timestamps, or role. Verify an optional photoKey refers to an authorized upload in the private assets bucket. Create with status RECEIVED and persist status history consistently. Return only the fields in the contract.

## Photo upload contract

Use a separate server endpoint/action. The browser sends FormData with one file field. The handler authenticates the user, validates actual file type and size, and uploads to private Neon Object Storage bucket assets.

Success response: { success: true, photoKey: string }, where photoKey is an object key, not a URL. Failures must be typed and must not expose credentials or internal provider errors. Pass photoKey to createReport. Photo upload is optional. Verify ownership of the upload before attaching it to a report, and authorize report access before retrieving/displaying an image.

## Frontend rules

Use exact enum identifiers for form values and readable labels in the UI. Display fieldErrors and handle other error codes with safe messages. Keep shared types and schemas server-safe. Do not invent a competing contract.