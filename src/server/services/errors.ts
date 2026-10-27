/** True for Prisma's unique-constraint violation (P2002). */
export function isUniqueConstraintError(error: unknown): boolean {
  return (error as { code?: unknown } | null)?.code === "P2002";
}

export class ForbiddenError extends Error {
  constructor() {
    super("Forbidden");
    this.name = "ForbiddenError";
  }
}
