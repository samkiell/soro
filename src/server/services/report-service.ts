import "server-only";
import { prisma } from "@/lib/db/prisma";
import {
  canCreateReport,
  canTransition,
  canUpdateReportStatus,
  canViewReport,
  type Actor,
} from "@/lib/permissions/policies";
import type { IncidentType, ReportStatus, Urgency } from "@/generated/prisma/enums";
import { isPhotoKeyOwnedBy } from "@/lib/storage/keys";
import { photoExists } from "@/lib/storage/photos";
import type { ValidCreateReportInput } from "@/lib/validation/report";
import type { CreateReportResult } from "@/types";
import { isUniqueConstraintError } from "./errors";

/**
 * Creates a report for an authenticated student. `input` must already be validated
 * with createReportSchema. reporterId and status are set here, never by the client.
 */
export async function createReportForUser(
  actor: Actor,
  input: ValidCreateReportInput,
): Promise<CreateReportResult> {
  if (!canCreateReport(actor)) return { success: false, error: "FORBIDDEN" };

  if (input.photoKey) {
    // The key must belong to this user and the upload must actually exist.
    if (!isPhotoKeyOwnedBy(input.photoKey, actor.id)) {
      return { success: false, error: "UPLOAD_NOT_FOUND" };
    }
    try {
      if (!(await photoExists(input.photoKey))) {
        return { success: false, error: "UPLOAD_NOT_FOUND" };
      }
    } catch (error) {
      console.error("[reports] photo lookup failed", (error as Error).name);
      return { success: false, error: "UPLOAD_NOT_FOUND" };
    }
  }

  try {
    const report = await prisma.report.create({
      data: {
        reporterId: actor.id,
        title: input.title,
        description: input.description,
        location: input.location,
        incidentType: input.incidentType,
        urgency: input.urgency,
        isAnonymous: input.isAnonymous,
        photoKey: input.photoKey ?? null,
        status: "RECEIVED",
        // Initial history entry, created atomically with the report. No actor is
        // recorded so an anonymous reporter never appears in the history.
        statusHistory: { create: { fromStatus: null, toStatus: "RECEIVED" } },
      },
      select: { id: true, status: true, createdAt: true },
    });

    return {
      success: true,
      report: {
        id: report.id,
        status: report.status,
        createdAt: report.createdAt.toISOString(),
      },
    };
  } catch (error) {
    // A photo key can be attached to only one report.
    if (isUniqueConstraintError(error)) {
      return { success: false, error: "UPLOAD_NOT_FOUND" };
    }
    // Never log report content.
    console.error("[reports] create failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}

/** Minimal lookup for authorizing access to a report's photo. */
export async function findReportPhotoRef(reportIdOrRef: string) {
  const trimmed = reportIdOrRef.trim();
  let report = await prisma.report.findUnique({
    where: { id: trimmed },
    select: { reporterId: true, photoKey: true },
  });
  if (!report && trimmed.length === 8) {
    report = await prisma.report.findFirst({
      where: { id: { endsWith: trimmed.toLowerCase() } },
      select: { reporterId: true, photoKey: true },
    });
  }
  return report;
}

export type StudentReportListItem = {
  id: string;
  title: string;
  location: string;
  incidentType: IncidentType;
  urgency: Urgency;
  status: ReportStatus;
  isAnonymous: boolean;
  hasPhoto: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Returns all incident reports submitted by the given student, newest first.
 * The internal storage photoKey is never exposed; hasPhoto indicates photo presence.
 */
export async function listReportsForStudent(
  actor: Actor,
): Promise<StudentReportListItem[]> {
  const reports = await prisma.report.findMany({
    where: { reporterId: actor.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      location: true,
      incidentType: true,
      urgency: true,
      status: true,
      isAnonymous: true,
      photoKey: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return reports.map(({ photoKey, ...rest }) => ({
    ...rest,
    hasPhoto: Boolean(photoKey),
  }));
}

export type StudentReportDetail = {
  id: string;
  title: string;
  description: string;
  location: string;
  incidentType: IncidentType;
  urgency: Urgency;
  status: ReportStatus;
  isAnonymous: boolean;
  hasPhoto: boolean;
  isOwner?: boolean;
  createdAt: Date;
  updatedAt: Date;
  statusHistory: Array<{
    id: string;
    fromStatus: ReportStatus | null;
    toStatus: ReportStatus;
    createdAt: Date;
    changedBy: { name: string } | null;
  }>;
};

/**
 * Returns a report and its user-visible status history for the student who submitted it,
 * or for any viewer tracking via a valid 8-character reference code.
 * Internal admin notes are completely excluded from the query so they cannot leak.
 * Non-owners and non-existent reports return null to protect privacy.
 */
export async function getReportForStudent(
  actor: Actor | null | undefined,
  reportIdOrRef: string,
): Promise<StudentReportDetail | null> {
  const trimmed = reportIdOrRef.trim();
  const isRefQuery = trimmed.length === 8;

  const select = {
    id: true,
    reporterId: true,
    title: true,
    description: true,
    location: true,
    incidentType: true,
    urgency: true,
    status: true,
    isAnonymous: true,
    photoKey: true,
    createdAt: true,
    updatedAt: true,
    statusHistory: {
      orderBy: { createdAt: "asc" as const },
      select: {
        id: true,
        fromStatus: true,
        toStatus: true,
        createdAt: true,
        changedBy: { select: { name: true } },
      },
    },
  };

  let report = await prisma.report.findUnique({
    where: { id: trimmed },
    select,
  });

  let matchedByRef = false;
  if (!report && isRefQuery) {
    report = await prisma.report.findFirst({
      where: { id: { endsWith: trimmed.toLowerCase() } },
      select,
    });
    if (report) matchedByRef = true;
  }

  if (!report) {
    return null;
  }

  // If queried by exact database ID, enforce actor ownership/admin permissions.
  // If queried by valid 8-char reference code, allow viewing status & public details.
  if (!matchedByRef && (!actor || !canViewReport(actor, report))) {
    return null;
  }

  const { reporterId, photoKey, ...rest } = report;
  const isOwner = Boolean(actor && reporterId === actor.id);
  return {
    ...rest,
    isOwner,
    hasPhoto: Boolean(photoKey),
  };
}

export async function updateReportStatusForStudent(
  actor: Actor,
  input: { reportId: string; status: ReportStatus },
): Promise<{ success: true } | { success: false; error: string }> {
  const { reportId, status } = input;
  const trimmed = reportId.trim();
  const cleaned = trimmed.replace(/^REF-?/i, "").replace(/^#/i, "");

  const report = await prisma.report.findFirst({
    where: {
      OR: [
        { id: trimmed },
        { id: { equals: cleaned, mode: "insensitive" } },
        { id: { endsWith: cleaned.toLowerCase() } },
      ],
    },
    select: { id: true, reporterId: true, status: true },
  });

  if (!report) return { success: false, error: "NOT_FOUND" };
  if (!canUpdateReportStatus(actor, report)) return { success: false, error: "FORBIDDEN" };
  if (!canTransition(report.status, status)) return { success: false, error: "INVALID_TRANSITION" };

  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: report.id },
      data: { status },
    });

    await tx.reportStatusHistory.create({
      data: {
        reportId: report.id,
        fromStatus: report.status,
        toStatus: status,
        changedById: actor.id,
      },
    });
  });

  return { success: true };
}
