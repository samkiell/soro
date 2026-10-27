import { describe, expect, it } from "vitest";
import { toFieldErrors } from "@/lib/validation";
import { addNoteSchema, reportFiltersSchema, updateStatusSchema } from "@/lib/validation/admin";
import { registerSchema, signInSchema } from "@/lib/validation/auth";
import { createReportSchema } from "@/lib/validation/report";

const validReport = {
  title: "  Phone stolen at library  ",
  description: "My phone was taken from the reading room table.",
  location: "Hezekiah Oluwasanmi Library, 2nd floor",
  incidentType: "THEFT",
  urgency: "MEDIUM",
  isAnonymous: true,
};

describe("createReportSchema", () => {
  it("accepts a valid report and trims text", () => {
    const result = createReportSchema.parse(validReport);
    expect(result.title).toBe("Phone stolen at library");
    expect(result.isAnonymous).toBe(true);
  });

  it("requires title, description, location, type, and urgency", () => {
    const result = createReportSchema.safeParse({ isAnonymous: false });
    expect(result.success).toBe(false);
    const fields = Object.keys(toFieldErrors(result.error!));
    expect(fields).toEqual(
      expect.arrayContaining(["title", "description", "location", "incidentType", "urgency"]),
    );
  });

  it("rejects values outside the locked enums", () => {
    expect(createReportSchema.safeParse({ ...validReport, incidentType: "ROBBERY" }).success).toBe(false);
    expect(createReportSchema.safeParse({ ...validReport, urgency: "low" }).success).toBe(false);
  });

  it("rejects client-supplied reporterId, status, or ids", () => {
    for (const extra of [{ reporterId: "c123" }, { status: "RESOLVED" }, { id: "x" }, { createdAt: "2026-01-01" }]) {
      expect(createReportSchema.safeParse({ ...validReport, ...extra }).success).toBe(false);
    }
  });

  it("only accepts photo keys in the expected format", () => {
    const key = "reports/cuser123/123e4567-e89b-42d3-a456-426614174000.jpg";
    expect(createReportSchema.safeParse({ ...validReport, photoKey: key }).success).toBe(true);
    for (const bad of ["https://evil.example/x.jpg", "reports/../secrets.jpg", "reports/u/x.gif"]) {
      expect(createReportSchema.safeParse({ ...validReport, photoKey: bad }).success).toBe(false);
    }
  });

  it("rejects text over the length limits", () => {
    expect(createReportSchema.safeParse({ ...validReport, title: "x".repeat(121) }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  it("normalizes email to lowercase", () => {
    const result = signInSchema.parse({ email: "  Ada@Student.OAUIFE.edu.ng ", password: "x" });
    expect(result.email).toBe("ada@student.oauife.edu.ng");
  });

  it("rejects invalid emails and short passwords on registration", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "not-an-email",
      password: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    expect(Object.keys(toFieldErrors(result.error!))).toEqual(expect.arrayContaining(["email", "password"]));
  });

  it("requires matching passwords", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "long-enough-1",
      confirmPassword: "long-enough-2",
    });
    expect(toFieldErrors(result.error!).confirmPassword).toBeDefined();
  });

  it("does not allow choosing a role at registration", () => {
    const result = registerSchema.safeParse({
      name: "Ada",
      email: "ada@example.com",
      password: "long-enough-1",
      confirmPassword: "long-enough-1",
      role: "ADMIN",
    });
    expect(result.success).toBe(false);
  });
});

describe("admin schemas", () => {
  it("accepts only the three statuses", () => {
    const reportId = "cmabc1234567890abcdefghij";
    expect(updateStatusSchema.safeParse({ reportId, status: "IN_PROGRESS" }).success).toBe(true);
    expect(updateStatusSchema.safeParse({ reportId, status: "CLOSED" }).success).toBe(false);
  });

  it("requires a non-empty note", () => {
    expect(addNoteSchema.safeParse({ reportId: "cmabc1234567890abcdefghij", body: "   " }).success).toBe(false);
  });

  it("drops invalid list filters instead of failing", () => {
    expect(reportFiltersSchema.parse({ status: "BOGUS", page: "-3" })).toEqual({
      status: undefined,
      urgency: undefined,
      type: undefined,
      page: 1,
    });
    expect(reportFiltersSchema.parse({ status: "RESOLVED", page: "2" })).toMatchObject({
      status: "RESOLVED",
      page: 2,
    });
  });
});
