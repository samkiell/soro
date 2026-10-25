// Object keys for report photos in the private "assets" bucket.
// Format: reports/<uploaderUserId>/<uuid>.<ext>
// The uploader prefix lets the server verify ownership before a key is attached to a
// report. Keys never reach anyone other than the uploader: photos are served through
// /api/reports/[id]/photo, never by key or public URL.

export const PHOTO_KEY_PREFIX = "reports/";

export const PHOTO_KEY_PATTERN =
  /^reports\/[a-z0-9]{1,64}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

const OWNER_ID_PATTERN = /^[a-z0-9]{1,64}$/;

export function buildPhotoKey(
  ownerId: string,
  extension: "jpg" | "png" | "webp",
  id: string = crypto.randomUUID(),
): string {
  if (!OWNER_ID_PATTERN.test(ownerId)) {
    throw new Error("Invalid owner id for photo key");
  }
  return `${PHOTO_KEY_PREFIX}${ownerId}/${id}.${extension}`;
}

export function isPhotoKeyOwnedBy(key: string, userId: string): boolean {
  return (
    PHOTO_KEY_PATTERN.test(key) &&
    key.startsWith(`${PHOTO_KEY_PREFIX}${userId}/`)
  );
}
