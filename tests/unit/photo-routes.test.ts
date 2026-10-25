import { beforeEach, describe, expect, it, vi } from "vitest";

const permissions = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
const storage = vi.hoisted(() => ({
  isStorageConfigured: vi.fn(),
  uploadPhoto: vi.fn(),
  getPhoto: vi.fn(),
}));
const reports = vi.hoisted(() => ({ findReportPhotoRef: vi.fn() }));

vi.mock("@/lib/permissions", async () => ({
  ...(await vi.importActual<object>("@/lib/permissions/policies")),
  ...permissions,
}));
vi.mock("@/lib/storage/photos", () => storage);
vi.mock("@/server/services/report-service", () => reports);

import { POST as upload } from "@/app/api/uploads/route";
import { GET as getPhoto } from "@/app/api/reports/[id]/photo/route";

const student = { id: "cstudent1", role: "STUDENT" as const };
const otherStudent = { id: "cstudent2", role: "STUDENT" as const };
const admin = { id: "cadmin1", role: "ADMIN" as const };

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

function uploadRequest(file?: Blob, name = "photo.png", headers: Record<string, string> = {}) {
  const body = new FormData();
  if (file) body.append("file", file, name);
  return new Request("http://localhost:3000/api/uploads", { method: "POST", body, headers });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
  storage.isStorageConfigured.mockReturnValue(true);
  storage.uploadPhoto.mockResolvedValue(undefined);
});

describe("POST /api/uploads", () => {
  it("requires sign-in", async () => {
    permissions.getCurrentUser.mockResolvedValue(null);
    const response = await upload(uploadRequest(new Blob([PNG])));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ success: false, error: "UNAUTHENTICATED" });
  });

  it("rejects cross-origin requests", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const response = await upload(uploadRequest(new Blob([PNG]), "p.png", { origin: "https://evil.example" }));
    expect(response.status).toBe(403);
  });

  it("uploads a valid image under the user's prefix and returns only a key", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const response = await upload(uploadRequest(new Blob([PNG], { type: "image/png" })));
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.photoKey).toMatch(/^reports\/cstudent1\/[0-9a-f-]{36}\.png$/);
    expect(body.photoKey).not.toMatch(/^https?:/);
    expect(storage.uploadPhoto).toHaveBeenCalledWith(body.photoKey, expect.any(Uint8Array), "image/png");
  });

  it("rejects files that aren't images, even with an image name and type", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const fake = new Blob(["<script>alert(1)</script>"], { type: "image/png" });
    const response = await upload(uploadRequest(fake, "evil.png"));
    expect(response.status).toBe(415);
    expect(storage.uploadPhoto).not.toHaveBeenCalled();
  });

  it("rejects oversized files", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    const big = new Uint8Array(4 * 1024 * 1024 + 1);
    big.set(PNG);
    const response = await upload(uploadRequest(new Blob([big])));
    expect(response.status).toBe(413);
  });

  it("rejects a request without a file", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    expect((await upload(uploadRequest())).status).toBe(400);
  });

  it("reports storage problems without leaking details", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    storage.uploadPhoto.mockRejectedValue(new Error("SignatureDoesNotMatch secret=abc"));
    const response = await upload(uploadRequest(new Blob([PNG])));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("Signature");

    storage.isStorageConfigured.mockReturnValue(false);
    expect((await upload(uploadRequest(new Blob([PNG])))).status).toBe(503);
  });

  it("doesn't let admins upload report photos", async () => {
    permissions.getCurrentUser.mockResolvedValue(admin);
    expect((await upload(uploadRequest(new Blob([PNG])))).status).toBe(403);
  });
});

describe("GET /api/reports/[id]/photo", () => {
  const params = Promise.resolve({ id: "creport1" });
  const ref = { reporterId: student.id, photoKey: "reports/cstudent1/x.png" };

  beforeEach(() => {
    reports.findReportPhotoRef.mockResolvedValue(ref);
    storage.getPhoto.mockResolvedValue({
      body: new Blob([PNG]).stream(),
      contentType: "image/png",
      contentLength: PNG.byteLength,
    });
  });

  it("requires sign-in", async () => {
    permissions.getCurrentUser.mockResolvedValue(null);
    expect((await getPhoto(new Request("http://localhost/x"), { params })).status).toBe(401);
  });

  it("hides another student's photo behind a 404", async () => {
    permissions.getCurrentUser.mockResolvedValue(otherStudent);
    const response = await getPhoto(new Request("http://localhost/x"), { params });
    expect(response.status).toBe(404);
    expect(storage.getPhoto).not.toHaveBeenCalled();
  });

  it("serves the photo to its reporter and to admins, privately", async () => {
    for (const viewer of [student, admin]) {
      permissions.getCurrentUser.mockResolvedValue(viewer);
      const response = await getPhoto(new Request("http://localhost/x"), { params });
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("image/png");
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    }
  });

  it("returns 404 when the report has no photo", async () => {
    permissions.getCurrentUser.mockResolvedValue(student);
    reports.findReportPhotoRef.mockResolvedValue({ reporterId: student.id, photoKey: null });
    expect((await getPhoto(new Request("http://localhost/x"), { params })).status).toBe(404);
  });
});
