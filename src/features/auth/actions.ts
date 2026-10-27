"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/lib/auth";
import { defaultPathForRole, safeCallbackPath } from "@/lib/safe-redirect";
import { toFieldErrors } from "@/lib/validation";
import {
  registerSchema,
  signInSchema,
  type RegisterInput,
  type SignInInput,
} from "@/lib/validation/auth";
import { findRoleByEmail, registerStudent } from "@/server/services/auth-service";
import type { AuthActionResult } from "@/types";

async function startSession(
  email: string,
  password: string,
  callbackUrl: string | undefined,
): Promise<AuthActionResult> {
  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError && error.type === "CredentialsSignin") {
      // Same message whether the email or the password is wrong.
      return { success: false, error: "INVALID_CREDENTIALS" };
    }
    console.error("[auth] sign-in failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }

  const role = (await findRoleByEmail(email)) ?? "STUDENT";
  return {
    success: true,
    redirectTo: safeCallbackPath(callbackUrl, defaultPathForRole(role)),
  };
}

export async function signInWithCredentials(
  input: SignInInput,
  callbackUrl?: string,
): Promise<AuthActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }
  return startSession(parsed.data.email, parsed.data.password, callbackUrl);
}

export async function registerAccount(
  input: RegisterInput,
  callbackUrl?: string,
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "VALIDATION_ERROR",
      fieldErrors: toFieldErrors(parsed.error),
    };
  }

  try {
    const result = await registerStudent(parsed.data);
    // Deliberately vague so the form can't be used to discover registered emails.
    if (!result.ok) return { success: false, error: "ACCOUNT_UNAVAILABLE" };
  } catch (error) {
    console.error("[auth] registration failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }

  return startSession(parsed.data.email, parsed.data.password, callbackUrl);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
