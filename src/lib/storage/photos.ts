import "server-only";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type S3Client,
} from "@aws-sdk/client-s3";
import { createStorageClient, PHOTO_BUCKET, readStorageConfig } from "./s3";
import type { PhotoMimeType } from "./image";

export class StorageUnavailableError extends Error {
  constructor() {
    super("Photo storage is not configured");
    this.name = "StorageUnavailableError";
  }
}

let client: S3Client | null | undefined;

function getClient(): S3Client {
  if (client === undefined) {
    const config = readStorageConfig();
    client = config ? createStorageClient(config) : null;
  }
  if (!client) throw new StorageUnavailableError();
  return client;
}

export function isStorageConfigured(): boolean {
  return readStorageConfig() !== null;
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
  await getClient().send(
    new PutObjectCommand({
      Bucket: PHOTO_BUCKET,
      Key: key,
      Body: bytes,
      ContentType: contentType,
      ContentLength: bytes.byteLength,
    }),
  );
}

export async function photoExists(key: string): Promise<boolean> {
  try {
    await getClient().send(
      new HeadObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }),
    );
    return true;
  } catch (error) {
    if (isNotFound(error)) return false;
    throw error;
  }
}

export async function getPhoto(key: string): Promise<{
  body: ReadableStream;
  contentType: string;
  contentLength?: number;
} | null> {
  try {
    const response = await getClient().send(
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

export async function deletePhoto(key: string): Promise<void> {
  await getClient().send(
    new DeleteObjectCommand({ Bucket: PHOTO_BUCKET, Key: key }),
  );
}
