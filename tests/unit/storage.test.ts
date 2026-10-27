import { describe, expect, it } from "vitest";
import { detectImageType } from "@/lib/storage/image";
import { buildPhotoKey, isPhotoKeyOwnedBy, PHOTO_KEY_PATTERN } from "@/lib/storage/keys";
import { readStorageConfig } from "@/lib/storage/s3";

const bytes = (...values: number[]) => new Uint8Array(values);
const ascii = (text: string) => [...text].map((c) => c.charCodeAt(0));

describe("detectImageType", () => {
  it("recognizes JPEG, PNG, and WebP by their contents", () => {
    expect(detectImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0, 0))).toBe("image/jpeg");
    expect(detectImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0))).toBe("image/png");
    expect(detectImageType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WEBPVP8 ")))).toBe("image/webp");
  });

  it("rejects other files, whatever their name or declared type", () => {
    expect(detectImageType(bytes(...ascii("GIF89a")))).toBeNull();
    expect(detectImageType(bytes(...ascii("<svg xmlns=")))).toBeNull();
    expect(detectImageType(bytes(...ascii("%PDF-1.7")))).toBeNull();
    expect(detectImageType(bytes(...ascii("RIFF"), 0, 0, 0, 0, ...ascii("WAVE")))).toBeNull();
    expect(detectImageType(bytes())).toBeNull();
  });
});

describe("photo keys", () => {
  const uuid = "123e4567-e89b-42d3-a456-426614174000";

  it("builds keys under the uploader's prefix", () => {
    const key = buildPhotoKey("cuser123", "png", uuid);
    expect(key).toBe(`reports/cuser123/${uuid}.png`);
    expect(PHOTO_KEY_PATTERN.test(key)).toBe(true);
  });

  it("refuses owner ids that could change the key path", () => {
    expect(() => buildPhotoKey("../other", "jpg", uuid)).toThrow();
    expect(() => buildPhotoKey("a/b", "jpg", uuid)).toThrow();
  });

  it("checks ownership by prefix", () => {
    const key = buildPhotoKey("cuser123", "jpg", uuid);
    expect(isPhotoKeyOwnedBy(key, "cuser123")).toBe(true);
    expect(isPhotoKeyOwnedBy(key, "cuser12")).toBe(false);
    expect(isPhotoKeyOwnedBy(key, "cother")).toBe(false);
    expect(isPhotoKeyOwnedBy(`reports/cuser123/../x/${uuid}.jpg`, "cuser123")).toBe(false);
  });
});

describe("readStorageConfig", () => {
  it("returns null unless every storage variable is set", () => {
    expect(readStorageConfig({ AWS_REGION: "us-east-2" })).toBeNull();
    expect(
      readStorageConfig({
        AWS_ENDPOINT_URL_S3: "https://br-x.storage.example",
        AWS_REGION: "us-east-2",
        AWS_ACCESS_KEY_ID: "id",
        AWS_SECRET_ACCESS_KEY: "secret",
      }),
    ).toMatchObject({ region: "us-east-2", accessKeyId: "id" });
  });
});

describe("local storage fallback", () => {
  it("uploads, verifies, reads, and deletes a photo locally when S3 is unconfigured", async () => {
    const { uploadPhoto, photoExists, getPhoto, deletePhoto } = await import("@/lib/storage/photos");
    const testKey = buildPhotoKey("cstudent1", "png", "123e4567-e89b-42d3-a456-426614174999");
    const sampleBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

    expect(await photoExists(testKey)).toBe(false);

    await uploadPhoto(testKey, sampleBytes, "image/png");
    expect(await photoExists(testKey)).toBe(true);

    const photo = await getPhoto(testKey);
    expect(photo).not.toBeNull();
    expect(photo?.contentType).toBe("image/png");
    expect(photo?.contentLength).toBe(sampleBytes.byteLength);

    await deletePhoto(testKey);
    expect(await photoExists(testKey)).toBe(false);
  });
});
