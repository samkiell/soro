// Deletes report photos that no report references and that are older than 24 hours:
// uploads abandoned before submitting, and photos left after a report was deleted.
//   pnpm storage:cleanup           # dry run: prints how many would be deleted
//   pnpm storage:cleanup --apply   # deletes them
import "dotenv/config";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { createPrismaClient } from "@/lib/db/create-client";
import { PHOTO_KEY_PREFIX } from "@/lib/storage/keys";
import { createStorageClient, PHOTO_BUCKET, readStorageConfig } from "@/lib/storage/s3";
import { findOrphanedPhotoKeys, type StoredObject } from "@/server/services/photo-cleanup";

const DELETE_BATCH_SIZE = 1000; // S3 DeleteObjects limit

async function main() {
  const apply = process.argv.includes("--apply");
  const config = readStorageConfig();
  if (!config) throw new Error("Storage is not configured. Set the AWS_* variables from .env.example.");

  const s3 = createStorageClient(config);
  const prisma = createPrismaClient();

  async function* listObjects(prefix: string): AsyncIterable<StoredObject> {
    let token: string | undefined;
    do {
      const page = await s3.send(
        new ListObjectsV2Command({ Bucket: PHOTO_BUCKET, Prefix: prefix, ContinuationToken: token }),
      );
      for (const object of page.Contents ?? []) {
        if (object.Key) yield { key: object.Key, lastModified: object.LastModified };
      }
      token = page.IsTruncated ? page.NextContinuationToken : undefined;
    } while (token);
  }

  try {
    const orphaned = await findOrphanedPhotoKeys(
      {
        listObjects,
        async findReferencedKeys(keys) {
          const rows = await prisma.report.findMany({
            where: { photoKey: { in: keys } },
            select: { photoKey: true },
          });
          return new Set(rows.flatMap((row) => (row.photoKey ? [row.photoKey] : [])));
        },
      },
      { prefix: PHOTO_KEY_PREFIX },
    );

    console.log(`Found ${orphaned.length} orphaned photo(s) older than 24 hours.`);
    if (!apply || orphaned.length === 0) {
      if (!apply && orphaned.length > 0) console.log("Dry run. Re-run with --apply to delete them.");
      return;
    }

    let deleted = 0;
    for (let i = 0; i < orphaned.length; i += DELETE_BATCH_SIZE) {
      const batch = orphaned.slice(i, i + DELETE_BATCH_SIZE);
      const result = await s3.send(
        new DeleteObjectsCommand({
          Bucket: PHOTO_BUCKET,
          Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
        }),
      );
      const failed = result.Errors?.length ?? 0;
      deleted += batch.length - failed;
      if (failed > 0) console.error(`${failed} object(s) in this batch could not be deleted.`);
    }
    console.log(`Deleted ${deleted} orphaned photo(s).`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
