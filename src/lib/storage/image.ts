// Photo validation shared by the upload route (authoritative) and the form (early feedback).

/** 4 MB keeps uploads under Vercel's 4.5 MB serverless request body limit. */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type PhotoMimeType = keyof typeof PHOTO_TYPES;

export const ACCEPTED_PHOTO_TYPES = Object.keys(PHOTO_TYPES).join(",");

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, i) => bytes[offset + i] === byte);
}

/**
 * Detects the image type from the file's leading bytes ("magic numbers").
 * Filename extensions and client-supplied MIME types are not trusted.
 */
export function detectImageType(bytes: Uint8Array): PhotoMimeType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  // RIFF....WEBP
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return "image/webp";
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
