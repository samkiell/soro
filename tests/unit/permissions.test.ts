import { describe, expect, it } from "vitest";
import {
  allowedNextStatuses,
  canCreateReport,
  canTransition,
  canViewReport,
  isAdmin,
} from "@/lib/permissions/policies";
import { defaultPathForRole, safeCallbackPath } from "@/lib/safe-redirect";

const student = { id: "cstudent1", role: "STUDENT" as const };
const otherStudent = { id: "cstudent2", role: "STUDENT" as const };
const admin = { id: "cadmin1", role: "ADMIN" as const };

describe("report access", () => {
  const report = { reporterId: student.id };

  it("lets a student view only their own report", () => {
    expect(canViewReport(student, report)).toBe(true);
    expect(canViewReport(otherStudent, report)).toBe(false);
  });

  it("lets admins view any report and denies signed-out users", () => {
    expect(canViewReport(admin, report)).toBe(true);
    expect(canViewReport(null, report)).toBe(false);
  });

  it("only lets students create reports", () => {
    expect(canCreateReport(student)).toBe(true);
    expect(canCreateReport(admin)).toBe(false);
    expect(canCreateReport(null)).toBe(false);
  });

  it("identifies admins", () => {
    expect(isAdmin(admin)).toBe(true);
    expect(isAdmin(student)).toBe(false);
    expect(isAdmin(undefined)).toBe(false);
  });
});

describe("status transitions", () => {
  it("allows the normal lifecycle and reopening", () => {
    expect(canTransition("RECEIVED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "RESOLVED")).toBe(true);
    expect(canTransition("RESOLVED", "IN_PROGRESS")).toBe(true);
  });

  it("rejects no-op and invalid changes", () => {
    expect(canTransition("RECEIVED", "RECEIVED")).toBe(false);
    expect(canTransition("RESOLVED", "RECEIVED")).toBe(false);
    expect(allowedNextStatuses("RESOLVED")).toEqual(["IN_PROGRESS"]);
  });
});

describe("safeCallbackPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeCallbackPath("/report/new", "/")).toBe("/report/new");
    expect(safeCallbackPath("/admin/reports?status=RECEIVED", "/")).toBe("/admin/reports?status=RECEIVED");
  });

  it("blocks open redirects and loops", () => {
    for (const value of ["https://evil.example", "//evil.example", "/\\evil.example", "javascript:alert(1)", "/login", "/api/auth/signout", 42, undefined]) {
      expect(safeCallbackPath(value, "/fallback")).toBe("/fallback");
    }
  });

  it("sends admins and students to different defaults", () => {
    expect(defaultPathForRole("ADMIN")).toBe("/admin");
    expect(defaultPathForRole("STUDENT")).toBe("/report/new");
  });
});
