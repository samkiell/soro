import { ReportStatus, Role } from "@/generated/prisma/enums";

// Pure authorization rules. Server code must call these after resolving the
// session; they are never a substitute for checking on the server.

export type Actor = { id: string; role: Role };

export function isAdmin(actor: Actor | null | undefined): boolean {
  return actor?.role === Role.ADMIN;
}

/** Only students submit reports; admin submission is not supported (route matrix). */
export function canCreateReport(actor: Actor | null | undefined): boolean {
  return actor?.role === Role.STUDENT;
}

/** Admins can view any report; students only their own. */
export function canViewReport(
  actor: Actor | null | undefined,
  report: { reporterId: string },
): boolean {
  if (!actor) return false;
  return isAdmin(actor) || report.reporterId === actor.id;
}

const ALLOWED_TRANSITIONS: Record<ReportStatus, readonly ReportStatus[]> = {
  [ReportStatus.RECEIVED]: [ReportStatus.IN_PROGRESS, ReportStatus.RESOLVED],
  [ReportStatus.IN_PROGRESS]: [ReportStatus.RECEIVED, ReportStatus.RESOLVED],
  // A resolved report can be reopened, but goes back to "in progress", not "received".
  [ReportStatus.RESOLVED]: [ReportStatus.IN_PROGRESS],
};

export function allowedNextStatuses(from: ReportStatus): readonly ReportStatus[] {
  return ALLOWED_TRANSITIONS[from];
}

export function canTransition(from: ReportStatus, to: ReportStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
