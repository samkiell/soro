import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI commands (migrate, db seed, studio) need a direct, unpooled Neon
// connection. The app itself uses the pooled DATABASE_URL via the Neon adapter.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
  },
});
