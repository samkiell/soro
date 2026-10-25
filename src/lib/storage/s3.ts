import { S3Client } from "@aws-sdk/client-s3";

// Neon Object Storage is S3-compatible. Variable names follow Neon's docs
// (https://neon.com/docs/storage/authentication) and are server-only.
// Kept free of "server-only" so CLI scripts can reuse it; app code should use
// "@/lib/storage/photos" instead.

/** Private bucket for report photos. See docs/REPORT_API_CONTRACT.md. */
export const PHOTO_BUCKET = "assets";

export type StorageConfig = {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
};

export function readStorageConfig(
  env: Record<string, string | undefined> = process.env,
): StorageConfig | null {
  const endpoint = env.AWS_ENDPOINT_URL_S3;
  const region = env.AWS_REGION;
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  if (!endpoint || !region || !accessKeyId || !secretAccessKey) return null;
  return { endpoint, region, accessKeyId, secretAccessKey };
}

export function createStorageClient(config: StorageConfig): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    // Required by Neon for custom S3 endpoints.
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}
