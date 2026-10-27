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
import { prisma } from "@/lib/db/prisma";
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
  // Always configured: S3 (if credentials provided), Postgres DB (in production/serverless), or local filesystem fallback
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

  // Database storage: durable store for Vercel/serverless environments without external S3
  if (process.env.DATABASE_URL) {
    try {
      await prisma.photoAsset.upsert({
        where: { key },
        create: {
          key,
          bytes: Buffer.from(bytes),
          contentType,
          size: bytes.byteLength,
        },
        update: {
          bytes: Buffer.from(bytes),
          contentType,
          size: bytes.byteLength,
        },
      });
      return;
    } catch (dbError) {
      console.error("[storage] Database photo write failed:", dbError);
      if (process.env.VERCEL) {
        throw dbError;
      }
    }
  }

  // Local filesystem fallback (offline local dev / unit tests)
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

  if (process.env.DATABASE_URL) {
    try {
      const asset = await prisma.photoAsset.findUnique({
        where: { key },
        select: { key: true },
      });
      if (asset) return true;
    } catch {
      // Fall through to filesystem
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

  if (process.env.DATABASE_URL) {
    try {
      const asset = await prisma.photoAsset.findUnique({
        where: { key },
      });
      if (asset) {
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(asset.bytes);
            controller.close();
          },
        });
        return {
          body: stream,
          contentType: asset.contentType,
          contentLength: asset.size,
        };
      }
    } catch (err) {
      console.error("[storage] Database photo read failed:", err);
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

  if (process.env.DATABASE_URL) {
    try {
      await prisma.photoAsset.delete({ where: { key } });
    } catch {
      // Ignore if not present
    }
  }

  // Local filesystem fallback
  try {
    const filePath = getLocalFilePath(key);
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
