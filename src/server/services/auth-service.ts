import "server-only";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { isUniqueConstraintError } from "./errors";

export type RegisterStudentResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "EMAIL_TAKEN" };

/** Creates a STUDENT account. The role is never taken from user input. */
export async function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterStudentResult> {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: "STUDENT",
      },
      select: { id: true },
    });
    return { ok: true, userId: user.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) return { ok: false, reason: "EMAIL_TAKEN" };
    throw error;
  }
}

export async function findRoleByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  });
  return user?.role ?? null;
}
