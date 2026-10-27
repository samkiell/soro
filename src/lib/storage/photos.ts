import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import { Readable } from "node:stream";
import path from "node:path";
import { createStorageClient, PHOTO_BUCKET, readStorageConfig } from "./s3";
import type { PhotoMimeType } from "./image";
import { PHOTO_KEY_PATTERN } from "./keys";

export class StorageUnavailableError extends Error {
  constructor() {
    super("Photo storage is not configured");
    this.name = "StorageUnavailableError";
  }
}

let client: S3Client | null | undefined;

function getClient(): S3Client | null {
  if (client === undefined) {
    const config = readStorageConfig();
    client = config ? createStorageClient(config) : null;
  }
  return client;
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".storage", "assets");

function getLocalFilePath(key: string): string {
  if (!PHOTO_KEY_PATTERN.test(key)) {
    throw new Error("Invalid storage key");
  }
  return path.join(LOCAL_STORAGE_DIR, key);
}

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function isStorageConfigured(): boolean {
  // Configured if S3 credentials exist OR local storage is enabled as fallback
  return true;
}

function isNotFound(error: unknown): boolean {
  const err = error as { name?: string; $metadata?: { httpStatusCode?: number } };
  return (
    err?.name === "NotFound" ||
    err?.name === "NoSuchKey" ||
    err?.$metadata?.httpStatusCode === 404
  );
}

export async function uploadPhoto(
  key: string,
  bytes: Uint8Array,
  contentType: PhotoMimeType,
): Promise<void> {
  const s3 = getClient();
  if (s3) {
    await s3.send(
      new PutObjectCommand({
        Bucket: PHOTO_BUCKET,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        ContentLength: bytes.byteLength,
      }),
    );
    return;
  }

  // Local filesystem fallback
  const filePath = getLocalFilePath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, bytes);
}

export async function photoExists(key: string): Promise<boolean> {
  const s3 = getClient();
  if (s3) {
    try {
      await s3.send(
        new HeadObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }),
      );
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }

  // Local filesystem fallback
  try {
    const filePath = getLocalFilePath(key);
    return existsSync(filePath);
  } catch {
    return false;
  }
}

export async function getPhoto(key: string): Promise<{
  body: ReadableStream;
  contentType: string;
  contentLength?: number;
} | null> {
  const s3 = getClient();
  if (s3) {
    try {
      const response = await s3.send(
        new GetObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }),
      );
      if (!response.Body) return null;
      return {
        body: response.Body.transformToWebStream(),
        contentType: response.ContentType ?? "application/octet-stream",
        contentLength: response.ContentLength,
      };
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  // Local filesystem fallback
  try {
    const filePath = getLocalFilePath(key);
    if (!existsSync(filePath)) return null;
    const stat = await fs.stat(filePath);
    const ext = key.split(".").pop()?.toLowerCase();
    const contentType = (ext && EXT_TO_MIME[ext]) || "application/octet-stream";
    const nodeStream = createReadStream(filePath);
    return {
      body: Readable.toWeb(nodeStream) as ReadableStream,
      contentType,
      contentLength: stat.size,
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function deletePhoto(key: string): Promise<void> {
  const s3 = getClient();
  if (s3) {
    await s3.send(
      new DeleteObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }),
    );
    return;
  }

  // Local filesystem fallback
  try {
    const filePath = getLocalFilePath(key);
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
