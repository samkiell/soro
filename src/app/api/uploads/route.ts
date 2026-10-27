import { NextResponse } from "next/server";
import { canCreateReport, getCurrentUser } from "@/lib/permissions";
import { detectImageType, MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/storage/image";
import { buildPhotoKey } from "@/lib/storage/keys";
import { isStorageConfigured, uploadPhoto } from "@/lib/storage/photos";
import type { UploadPhotoError, UploadPhotoResult } from "@/types";

// Multipart boundaries and headers add a little to the declared request size.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

function respond(body: UploadPhotoResult, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function fail(error: UploadPhotoError, status: number) {
  return respond({ success: false, error }, status);
}

function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

/**
 * Uploads one optional report photo to the private "assets" bucket.
 * Request: multipart FormData with a single `file` field.
 * Response: { success: true, photoKey } (an object key, not a URL), or a typed error.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("FORBIDDEN", 403);

  let user;
  try {
    user = await getCurrentUser();
  } catch {
    return fail("UPLOAD_FAILED", 500);
  }
  if (!user) return fail("UNAUTHENTICATED", 401);
  if (!canCreateReport(user)) return fail("FORBIDDEN", 403);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_PHOTO_BYTES + MULTIPART_OVERHEAD_BYTES) {
    return fail("FILE_TOO_LARGE", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("INVALID_REQUEST", 400);
  }

  const files = formData.getAll("file");
  const file = files[0];
  if (files.length !== 1 || !(file instanceof File) || file.size === 0) {
    return fail("INVALID_REQUEST", 400);
  }
  if (file.size > MAX_PHOTO_BYTES) return fail("FILE_TOO_LARGE", 413);

  // Check the real file contents, not the filename or the browser's MIME type.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return fail("UNSUPPORTED_FILE_TYPE", 415);

  if (!isStorageConfigured()) return fail("STORAGE_UNAVAILABLE", 503);

  const photoKey = buildPhotoKey(user.id, PHOTO_TYPES[type]);
  try {
    await uploadPhoto(photoKey, bytes, type);
  } catch (error) {
    // Don't leak provider details to the client.
    console.error("[uploads] storage put failed:", (error as Error).message || (error as Error).name);
    return fail("UPLOAD_FAILED", 502);
  }

  return respond({ success: true, photoKey }, 201);
}
