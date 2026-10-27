// Finds report photos in storage that no report references: uploads abandoned before
// a report was submitted, and photos left behind after a report was deleted.
// Dependencies are injected so the logic can be tested without storage or a database.

export type StoredObject = { key: string; lastModified?: Date };

export type PhotoCleanupDeps = {
  listObjects(prefix: string): AsyncIterable<StoredObject>;
  /** Returns the subset of `keys` that are attached to a report. */
  findReferencedKeys(keys: string[]): Promise<Set<string>>;
};

/** Uploads younger than this may still be attached by a student mid-submission. */
export const DEFAULT_MIN_AGE_MS = 24 * 60 * 60 * 1000;

const BATCH_SIZE = 500;

export async function findOrphanedPhotoKeys(
  deps: PhotoCleanupDeps,
  options: { prefix: string; now?: Date; minAgeMs?: number },
): Promise<string[]> {
  const cutoff =
    (options.now ?? new Date()).getTime() - (options.minAgeMs ?? DEFAULT_MIN_AGE_MS);
  const orphaned: string[] = [];
  let batch: string[] = [];

  const flush = async () => {
    if (batch.length === 0) return;
    const referenced = await deps.findReferencedKeys(batch);
    orphaned.push(...batch.filter((key) => !referenced.has(key)));
    batch = [];
  };

  for await (const object of deps.listObjects(options.prefix)) {
    // Skip objects without a timestamp rather than risk deleting a fresh upload.
    if (!object.lastModified || object.lastModified.getTime() > cutoff) continue;
    batch.push(object.key);
    if (batch.length >= BATCH_SIZE) await flush();
  }
  await flush();

  return orphaned;
}
