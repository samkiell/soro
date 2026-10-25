import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => {
  const client = {
    report: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    reportStatusHistory: { create: vi.fn() },
    reportNote: { create: vi.fn() },
    $transaction: vi.fn(),
  };
  client.$transaction.mockImplementation((fn: (tx: typeof client) => unknown) => fn(client));
  return client;
});
const permissions = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const nextCache = vi.hoisted(() => ({ refresh: vi.fn() }));

vi.mock("@/lib/db/prisma", () => ({ prisma }));
vi.mock("next/cache", () => nextCache);
vi.mock("@/lib/permissions", async () => ({
  ...(await vi.importActual<object>("@/lib/permissions/policies")),
  ...permissions,
}));

import { changeReportStatus, createReportNote } from "@/features/admin/actions";
import {
  addReportNote,
  getReportForAdmin,
  getReportOverview,
  listReports,
  updateReportStatus,
} from "@/server/services/admin-report-service";

const admin = { id: "cadmin1", role: "ADMIN" as const };
const student = { id: "cstudent1", role: "STUDENT" as const };
const reportId = "creport1234567890abcdefgh";

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  prisma.$transaction.mockImplementation((fn: (tx: typeof prisma) => unknown) => fn(prisma));
});

describe("updateReportStatus", () => {
  it("denies non-admins without touching the database", async () => {
    expect(await updateReportStatus(student, { reportId, status: "RESOLVED" })).toEqual({
      success: false,
      error: "FORBIDDEN",
    });
    expect(prisma.report.findUnique).not.toHaveBeenCalled();
  });

  it("rejects statuses outside the allowed set", async () => {
    const result = await updateReportStatus(admin, { reportId, status: "CLOSED" });
    expect(result).toMatchObject({ success: false, error: "VALIDATION_ERROR" });
  });

  it("returns NOT_FOUND for a missing report", async () => {
    prisma.report.findUnique.mockResolvedValue(null);
    expect(await updateReportStatus(admin, { reportId, status: "RESOLVED" })).toEqual({
      success: false,
      error: "NOT_FOUND",
    });
  });

  it("rejects invalid transitions", async () => {
    prisma.report.findUnique.mockResolvedValue({ status: "RESOLVED" });
    expect(await updateReportStatus(admin, { reportId, status: "RECEIVED" })).toEqual({
      success: false,
      error: "INVALID_TRANSITION",
    });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("updates the status and records history with the acting admin", async () => {
    prisma.report.findUnique.mockResolvedValue({ status: "RECEIVED" });
    prisma.report.updateMany.mockResolvedValue({ count: 1 });

    expect(await updateReportStatus(admin, { reportId, status: "IN_PROGRESS" })).toEqual({ success: true });
    expect(prisma.report.updateMany).toHaveBeenCalledWith({
      where: { id: reportId, status: "RECEIVED" },
      data: { status: "IN_PROGRESS" },
    });
    expect(prisma.reportStatusHistory.create).toHaveBeenCalledWith({
      data: { reportId, fromStatus: "RECEIVED", toStatus: "IN_PROGRESS", changedById: admin.id },
    });
  });

  it("reports a conflict if the status changed concurrently", async () => {
    prisma.report.findUnique.mockResolvedValue({ status: "RECEIVED" });
    prisma.report.updateMany.mockResolvedValue({ count: 0 });
    expect(await updateReportStatus(admin, { reportId, status: "IN_PROGRESS" })).toEqual({
      success: false,
      error: "CONFLICT",
    });
    expect(prisma.reportStatusHistory.create).not.toHaveBeenCalled();
  });
});

describe("addReportNote", () => {
  it("denies non-admins", async () => {
    expect(await addReportNote(student, { reportId, body: "hi" })).toEqual({ success: false, error: "FORBIDDEN" });
    expect(prisma.reportNote.create).not.toHaveBeenCalled();
  });

  it("stores the note separately with the admin as author", async () => {
    prisma.report.findUnique.mockResolvedValue({ id: reportId });
    expect(await addReportNote(admin, { reportId, body: "  Called estate office.  " })).toEqual({ success: true });
    expect(prisma.reportNote.create).toHaveBeenCalledWith({
      data: { reportId, authorId: admin.id, body: "Called estate office." },
    });
  });
});

describe("admin queries", () => {
  it("refuse non-admin callers", async () => {
    await expect(getReportOverview(student)).rejects.toThrow("Forbidden");
    await expect(listReports(student, { page: 1 })).rejects.toThrow("Forbidden");
    await expect(getReportForAdmin(student, reportId)).rejects.toThrow("Forbidden");
  });

  it("computes overview counts from stored data", async () => {
    prisma.report.groupBy.mockResolvedValue([
      { status: "RECEIVED", _count: { _all: 3 } },
      { status: "RESOLVED", _count: { _all: 2 } },
    ]);
    prisma.report.count.mockResolvedValue(1);
    prisma.report.findMany.mockResolvedValue([]);
    const overview = await getReportOverview(admin);
    expect(overview).toMatchObject({
      total: 5,
      byStatus: { RECEIVED: 3, IN_PROGRESS: 0, RESOLVED: 2 },
      openUrgentCount: 1,
    });
  });

  it("applies filters and pagination", async () => {
    prisma.report.count.mockResolvedValue(45);
    prisma.report.findMany.mockResolvedValue([]);
    const result = await listReports(admin, { status: "RECEIVED", urgency: "HIGH", page: 2 });
    const args = prisma.report.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ status: "RECEIVED", urgency: "HIGH", incidentType: undefined });
    expect(args).toMatchObject({ skip: 20, take: 20 });
    expect(result.pageCount).toBe(3);
  });

  const storedReport = (isAnonymous: boolean) => ({
    id: reportId,
    isAnonymous,
    photoKey: "reports/cstudent1/123e4567-e89b-42d3-a456-426614174000.jpg",
    reporter: { name: "Ada Student", email: "ada@example.com" },
    statusHistory: [],
    notes: [],
  });

  it("hides the reporter of anonymous reports", async () => {
    prisma.report.findUnique.mockResolvedValue(storedReport(true));
    const report = await getReportForAdmin(admin, reportId);
    expect(report?.reporter).toBeNull();
    expect(JSON.stringify(report)).not.toContain("ada@example.com");
  });

  it("shows the reporter of named reports, and never the storage key", async () => {
    prisma.report.findUnique.mockResolvedValue(storedReport(false));
    const report = await getReportForAdmin(admin, reportId);
    expect(report?.reporter).toEqual({ name: "Ada Student", email: "ada@example.com" });
    expect(report?.hasPhoto).toBe(true);
    expect(report).not.toHaveProperty("photoKey");
  });
});

describe("admin server actions", () => {
  it("reject signed-out callers", async () => {
    permissions.getCurrentUser.mockResolvedValue(null);
    expect(await changeReportStatus({ reportId, status: "RESOLVED" })).toEqual({
      success: false,
      error: "UNAUTHENTICATED",
    });
    expect(await createReportNote({ reportId, body: "x" })).toEqual({ success: false, error: "UNAUTHENTICATED" });
  });

  it("reject students calling them directly", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    expect(await changeReportStatus({ reportId, status: "RESOLVED" })).toEqual({
      success: false,
      error: "FORBIDDEN",
    });
    expect(await createReportNote({ reportId, body: "x" })).toEqual({ success: false, error: "FORBIDDEN" });
    expect(nextCache.refresh).not.toHaveBeenCalled();
  });

  it("refresh the page after a successful change", async () => {
    permissions.getCurrentUser.mockResolvedValue(admin);
    prisma.report.findUnique.mockResolvedValue({ status: "RECEIVED" });
    prisma.report.updateMany.mockResolvedValue({ count: 1 });
    expect(await changeReportStatus({ reportId, status: "IN_PROGRESS" })).toEqual({ success: true });
    expect(nextCache.refresh).toHaveBeenCalledTimes(1);
  });
});
