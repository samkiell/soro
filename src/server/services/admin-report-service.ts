import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { ReportStatus, Urgency } from "@/generated/prisma/enums";
import { canTransition, isAdmin, type Actor } from "@/lib/permissions/policies";
import { toFieldErrors } from "@/lib/validation";
import {
  addNoteSchema,
  updateStatusSchema,
  type ReportFilters,
} from "@/lib/validation/admin";
import type { AdminActionResult } from "@/types";
import { ForbiddenError } from "./errors";

export const ADMIN_PAGE_SIZE = 20;

const URGENT_LEVELS = [Urgency.HIGH, Urgency.CRITICAL];
const OPEN_STATUSES = [ReportStatus.RECEIVED, ReportStatus.IN_PROGRESS];

function assertAdmin(actor: Actor) {
  if (!isAdmin(actor)) throw new ForbiddenError();
}

const listSelect = {
  id: true,
  title: true,
  location: true,
  incidentType: true,
  urgency: true,
  status: true,
  createdAt: true,
} satisfies Prisma.ReportSelect;

export type AdminReportListItem = Prisma.ReportGetPayload<{
  select: typeof listSelect;
}>;

export async function getReportOverview(actor: Actor) {
  assertAdmin(actor);

  const [byStatusRows, openUrgentCount, urgentQueue] = await Promise.all([
    prisma.report.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.report.count({
      where: { status: { in: OPEN_STATUSES }, urgency: { in: URGENT_LEVELS } },
    }),
    prisma.report.findMany({
      where: { status: { in: OPEN_STATUSES }, urgency: { in: URGENT_LEVELS } },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: listSelect,
    }),
  ]);

  const byStatus: Record<ReportStatus, number> = {
    RECEIVED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  };
  for (const row of byStatusRows) byStatus[row.status] = row._count._all;
  const total = byStatus.RECEIVED + byStatus.IN_PROGRESS + byStatus.RESOLVED;

  return { total, byStatus, openUrgentCount, urgentQueue };
}

export async function listReports(actor: Actor, filters: ReportFilters) {
  assertAdmin(actor);

  const where: Prisma.ReportWhereInput = {
    status: filters.status,
    urgency: filters.urgency,
    incidentType: filters.type,
  };

  const [total, items] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
      select: listSelect,
    }),
  ]);

  return {
    items,
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE)),
  };
}

/**
 * Full report for admin review. The reporter's identity is removed here for
 * anonymous reports, so it never reaches a page or component.
 */
export async function getReportForAdmin(actor: Actor, reportId: string) {
  assertAdmin(actor);

  const trimmed = reportId.trim();
  const select = {
    id: true,
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
    reporter: { select: { name: true, email: true } },
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
    notes: {
      orderBy: { createdAt: "desc" as const },
      select: {
        id: true,
        body: true,
        createdAt: true,
        author: { select: { name: true } },
      },
    },
  };

  let report = await prisma.report.findUnique({
    where: { id: trimmed },
    select,
  });

  if (!report && trimmed.length === 8) {
    report = await prisma.report.findFirst({
      where: { id: { endsWith: trimmed.toLowerCase() } },
      select,
    });
  }

  if (!report) return null;

  const { reporter, photoKey, ...rest } = report;
  return {
    ...rest,
    reporter: report.isAnonymous ? null : reporter,
    hasPhoto: Boolean(photoKey),
  };
}

export type AdminReportDetail = NonNullable<
  Awaited<ReturnType<typeof getReportForAdmin>>
>;

class StatusConflictError extends Error {}

export async function updateReportStatus(
  actor: Actor,
  input: unknown,
): Promise<AdminActionResult> {
  if (!isAdmin(actor)) return { success: false, error: "FORBIDDEN" };

  const parsed = updateStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  const { reportId, status } = parsed.data;

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { status: true },
    });
    if (!report) return { success: false, error: "NOT_FOUND" };
    if (!canTransition(report.status, status)) {
      return { success: false, error: "INVALID_TRANSITION" };
    }

    await prisma.$transaction(async (tx) => {
      // Guard against a concurrent change since the status was read.
      const updated = await tx.report.updateMany({
        where: { id: reportId, status: report.status },
        data: { status },
      });
      if (updated.count === 0) throw new StatusConflictError();

      await tx.reportStatusHistory.create({
        data: {
          reportId,
          fromStatus: report.status,
          toStatus: status,
          changedById: actor.id,
        },
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof StatusConflictError) {
      return { success: false, error: "CONFLICT" };
    }
    console.error("[admin] status update failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}

export async function addReportNote(
  actor: Actor,
  input: unknown,
): Promise<AdminActionResult> {
  if (!isAdmin(actor)) return { success: false, error: "FORBIDDEN" };

  const parsed = addNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  const { reportId, body } = parsed.data;

  try {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true },
    });
    if (!report) return { success: false, error: "NOT_FOUND" };

    await prisma.reportNote.create({
      data: { reportId, authorId: actor.id, body },
    });
    return { success: true };
  } catch (error) {
    console.error("[admin] add note failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
