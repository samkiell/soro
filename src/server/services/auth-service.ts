import "server-only";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { isUniqueConstraintError } from "./errors";

export type RegisterStudentResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "EMAIL_TAKEN" | "MATRIC_TAKEN" };

/** Creates a STUDENT account. The role is never taken from user input. */
export async function registerStudent(input: {
  name: string;
  matricNumber: string;
  email: string;
  password: string;
}): Promise<RegisterStudentResult> {
  const passwordHash = await hashPassword(input.password);
  const normalizedMatric = input.matricNumber.trim().toUpperCase();
  try {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        matricNumber: normalizedMatric,
        email: input.email.trim().toLowerCase(),
        passwordHash,
        role: "STUDENT",
      },
      select: { id: true },
    });
    return { ok: true, userId: user.id };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      const errStr = String(error);
      if (errStr.includes("matricNumber")) {
        return { ok: false, reason: "MATRIC_TAKEN" };
      }
      return { ok: false, reason: "EMAIL_TAKEN" };
    }
    throw error;
  }
}

export async function findRoleByIdentifier(identifier: string) {
  const raw = identifier.trim().toLowerCase();
  const normalizedMatric = identifier.trim().toUpperCase();
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: raw },
        { email: `${raw}@student.oauife.edu.ng` },
        { matricNumber: normalizedMatric },
        { matricNumber: { equals: identifier.trim(), mode: "insensitive" } },
      ],
    },
    select: { role: true },
  });
  return user?.role ?? null;
}

export const findRoleByEmail = findRoleByIdentifier;

