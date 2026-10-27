import { describe, expect, it, vi } from "vitest";
import { findOrphanedPhotoKeys, type StoredObject } from "@/server/services/photo-cleanup";

const now = new Date("2026-10-25T12:00:00Z");
const hoursAgo = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

function deps(objects: StoredObject[], referenced: string[]) {
  return {
    async *listObjects() {
      yield* objects;
    },
    findReferencedKeys: vi.fn(async (keys: string[]) => new Set(keys.filter((k) => referenced.includes(k)))),
  };
}

describe("findOrphanedPhotoKeys", () => {
  it("returns old, unreferenced photos only", async () => {
    const result = await findOrphanedPhotoKeys(
      deps(
        [
          { key: "reports/u/attached.jpg", lastModified: hoursAgo(48) },
          { key: "reports/u/abandoned.jpg", lastModified: hoursAgo(48) },
          { key: "reports/u/fresh.jpg", lastModified: hoursAgo(1) },
          { key: "reports/u/no-date.jpg" },
        ],
        ["reports/u/attached.jpg"],
      ),
      { prefix: "reports/", now },
    );
    expect(result).toEqual(["reports/u/abandoned.jpg"]);
  });

  it("checks references in batches", async () => {
    const objects = Array.from({ length: 1200 }, (_, i) => ({
      key: `reports/u/${i}.jpg`,
      lastModified: hoursAgo(30),
    }));
    const d = deps(objects, []);
    const result = await findOrphanedPhotoKeys(d, { prefix: "reports/", now });
    expect(result).toHaveLength(1200);
    expect(d.findReferencedKeys).toHaveBeenCalledTimes(3);
  });
});
