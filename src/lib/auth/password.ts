import bcrypt from "bcryptjs";

const BCRYPT_COST = 12;

// Hash of a random, discarded string. Comparing against it when an account doesn't
// exist keeps sign-in timing similar, so response time doesn't reveal registered emails.
const DUMMY_HASH =
  "$2b$12$39V/CqiZthEv9QelGDlviOamVhk92hAsf99F3N0FeM/LOpLp37bqm";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(
  password: string,
  passwordHash: string | null | undefined,
): Promise<boolean> {
  const matches = await bcrypt.compare(password, passwordHash ?? DUMMY_HASH);
  return matches && Boolean(passwordHash);
}
