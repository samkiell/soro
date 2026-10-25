import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Kept free of "server-only" so CLI scripts (seed, cleanup) can reuse it.
// App code should import `prisma` from "@/lib/db/prisma" instead.
export function createPrismaClient(connectionString = process.env.DATABASE_URL) {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
}
