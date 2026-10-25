// Creates an admin account, or promotes an existing account to admin.
// Registration can never create admins, so this is the only way to get one.
//   SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... pnpm db:seed
import "dotenv/config";
import { createPrismaClient } from "@/lib/db/create-client";
import { hashPassword } from "@/lib/auth/password";

const ADMIN_PASSWORD_MIN_LENGTH = 12;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Soro Admin";

  if (!email || !password) {
    console.log("Skipping admin seed: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD to create one.");
    return;
  }
  if (password.length < ADMIN_PASSWORD_MIN_LENGTH || password.length > 72) {
    throw new Error(
      `SEED_ADMIN_PASSWORD must be ${ADMIN_PASSWORD_MIN_LENGTH}-72 characters.`,
    );
  }

  const prisma = createPrismaClient(
    process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL,
  );
  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      // Existing passwords are left unchanged.
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`Promoted existing account ${email} to ADMIN.`);
    } else {
      await prisma.user.create({
        data: { email, name, passwordHash: await hashPassword(password), role: "ADMIN" },
      });
      console.log(`Created ADMIN account ${email}.`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
