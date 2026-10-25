import { beforeEach, describe, expect, it, vi } from "vitest";

const prisma = vi.hoisted(() => ({
  report: { create: vi.fn() },
}));
const storage = vi.hoisted(() => ({ photoExists: vi.fn() }));
const permissions = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));

vi.mock("@/lib/db/prisma", () => ({ prisma }));
vi.mock("@/lib/storage/photos", () => storage);
vi.mock("@/lib/permissions", async () => ({
  ...(await vi.importActual<object>("@/lib/permissions/policies")),
  ...permissions,
}));

import { createReport } from "@/features/reports/actions";
import { createReportForUser } from "@/server/services/report-service";

const student = { id: "cstudent1", role: "STUDENT" as const };
const admin = { id: "cadmin1", role: "ADMIN" as const };
const ownKey = "reports/cstudent1/123e4567-e89b-42d3-a456-426614174000.jpg";
const otherKey = "reports/cstudent2/123e4567-e89b-42d3-a456-426614174000.jpg";

const input = {
  title: "Broken street light",
  description: "The light outside Moremi Hall has been out for a week.",
  location: "Moremi Hall entrance",
  incidentType: "FACILITY" as const,
  urgency: "LOW" as const,
  isAnonymous: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  prisma.report.create.mockResolvedValue({
    id: "creport1",
    status: "RECEIVED",
    createdAt: new Date("2026-10-25T10:00:00Z"),
  });
});

describe("createReportForUser", () => {
  it("saves the report with the session user as reporter and RECEIVED status", async () => {
    const result = await createReportForUser(student, input);

    expect(result).toEqual({
      success: true,
      report: { id: "creport1", status: "RECEIVED", createdAt: "2026-10-25T10:00:00.000Z" },
    });
    const { data } = prisma.report.create.mock.calls[0][0];
    expect(data).toMatchObject({
      reporterId: student.id,
      status: "RECEIVED",
      isAnonymous: true,
      photoKey: null,
      statusHistory: { create: { fromStatus: null, toStatus: "RECEIVED" } },
    });
    // The initial history entry records no actor, so anonymous reporters stay hidden.
    expect(data.statusHistory.create).not.toHaveProperty("changedById");
  });

  it("does not let admins submit reports", async () => {
    expect(await createReportForUser(admin, input)).toEqual({ success: false, error: "FORBIDDEN" });
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it("rejects a photo uploaded by someone else", async () => {
    const result = await createReportForUser(student, { ...input, photoKey: otherKey });
    expect(result).toEqual({ success: false, error: "UPLOAD_NOT_FOUND" });
    expect(storage.photoExists).not.toHaveBeenCalled();
  });

  it("rejects a photo key that was never uploaded", async () => {
    storage.photoExists.mockResolvedValue(false);
    const result = await createReportForUser(student, { ...input, photoKey: ownKey });
    expect(result).toEqual({ success: false, error: "UPLOAD_NOT_FOUND" });
  });

  it("attaches a verified photo key", async () => {
    storage.photoExists.mockResolvedValue(true);
    await createReportForUser(student, { ...input, photoKey: ownKey });
    expect(prisma.report.create.mock.calls[0][0].data.photoKey).toBe(ownKey);
  });

  it("rejects a photo already attached to another report", async () => {
    storage.photoExists.mockResolvedValue(true);
    prisma.report.create.mockRejectedValue(Object.assign(new Error("unique"), { code: "P2002" }));
    const result = await createReportForUser(student, { ...input, photoKey: ownKey });
    expect(result).toEqual({ success: false, error: "UPLOAD_NOT_FOUND" });
  });

  it("returns INTERNAL_ERROR on database failure", async () => {
    prisma.report.create.mockRejectedValue(new Error("db down"));
    expect(await createReportForUser(student, input)).toEqual({ success: false, error: "INTERNAL_ERROR" });
  });
});

describe("createReport server action", () => {
  it("requires a signed-in user", async () => {
    permissions.getCurrentUser.mockResolvedValue(null);
    expect(await createReport(input)).toEqual({ success: false, error: "UNAUTHENTICATED" });
  });

  it("validates on the server and ignores no client-supplied fields", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const result = await createReport({
      ...input,
      title: "",
      reporterId: "cattacker",
    } as never);
    expect(result).toMatchObject({ success: false, error: "VALIDATION_ERROR" });
    expect(result.success === false && result.fieldErrors?.title).toBeTruthy();
    expect(prisma.report.create).not.toHaveBeenCalled();
  });

  it("creates the report for the session user", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const result = await createReport(input);
    expect(result.success).toBe(true);
    expect(prisma.report.create.mock.calls[0][0].data.reporterId).toBe(student.id);
  });
});
