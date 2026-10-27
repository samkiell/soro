import "server-only";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { signInSchema } from "@/lib/validation/auth";
import { verifyPassword } from "./password";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  // Credentials sign-in requires JWT sessions. The token carries only the user id;
  // the role is re-read from the database on every request (see lib/permissions).
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { identifier: {}, email: {}, password: {} },
      async authorize(credentials) {
        const inputIdentifier = (
          (credentials?.identifier as string | undefined) ??
          (credentials?.email as string | undefined) ??
          ""
        ).trim();
        const inputPassword = (credentials?.password as string | undefined) ?? "";

        const parsed = signInSchema.safeParse({
          identifier: inputIdentifier,
          password: inputPassword,
        });
        if (!parsed.success) return null;

        const raw = parsed.data.identifier.toLowerCase();
        const normalizedMatric = parsed.data.identifier.toUpperCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: raw },
              { email: `${raw}@student.oauife.edu.ng` },
              { matricNumber: normalizedMatric },
              { matricNumber: { equals: parsed.data.identifier, mode: "insensitive" } },
            ],
          },
          select: { id: true, name: true, email: true, passwordHash: true },
        });

        const valid = await verifyPassword(
          parsed.data.password,
          user?.passwordHash,
        );
        if (!user || !valid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
  logger: {
    error(error) {
      // A wrong password is expected, not a server error.
      if (error instanceof CredentialsSignin) return;
      console.error("[auth]", error.name, error.message);
    },
  },
});
