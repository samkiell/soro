import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/generated/prisma/enums";

export * from "./policies";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

/**
 * Resolves the signed-in user from the session, re-reading the role from the
 * database so a changed role takes effect immediately. Returns null when signed out.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Session checks run per request: NextAuth generates random CSRF values, which
  // Cache Components rejects during prerendering and runtime prefetches.
  await connection();
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });
});

export function loginPath(returnTo?: string): string {
  return returnTo
    ? `/login?callbackUrl=${encodeURIComponent(returnTo)}`
    : "/login";
}

/** For pages: redirects to sign-in when signed out. */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath(returnTo));
  return user;
}

/** For admin pages: signed-out users go to sign-in; non-admins get a 404. */
export async function requireAdmin(returnTo: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (user.role !== "ADMIN") notFound();
  return user;
}
