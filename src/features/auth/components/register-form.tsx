"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { applyFieldErrors } from "@/components/forms/apply-field-errors";
import { FormField } from "@/components/forms/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerAccount } from "@/features/auth/actions";
import {
  PASSWORD_MIN_LENGTH,
  registerSchema,
  type RegisterInput,
} from "@/lib/validation/auth";

const ERROR_MESSAGES = {
  ACCOUNT_UNAVAILABLE: "We couldn't create an account with these details.",
  INVALID_CREDENTIALS: "Your account was created, but we couldn't sign you in. Try signing in.",
  VALIDATION_ERROR: "Check the highlighted fields.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again in a moment.",
} as const;

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignInHint, setShowSignInHint] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    setShowSignInHint(false);
    try {
      const result = await registerAccount(values, callbackUrl);
      if (result.success) {
        setRedirecting(true);
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }
      applyFieldErrors(setError, result.fieldErrors, [
        "name",
        "email",
        "password",
        "confirmPassword",
      ]);
      setFormError(ERROR_MESSAGES[result.error]);
      setShowSignInHint(result.error === "ACCOUNT_UNAVAILABLE");
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? (
        <Alert variant="danger" role="alert">
          {formError}
          {showSignInHint ? (
            <>
              {" "}
              If you already have an account,{" "}
              <Link href="/login" className="font-semibold text-brand underline">
                sign in
              </Link>
              .
            </>
          ) : null}
        </Alert>
      ) : null}

      <FormField id="name" label="Full name" required error={errors.name?.message}>
        {(control) => <Input {...control} {...register("name")} autoComplete="name" />}
      </FormField>

      <FormField
        id="email"
        label="Email"
        required
        hint="We use this to sign you in. It isn't shown on anonymous reports."
        error={errors.email?.message}
      >
        {(control) => (
          <Input {...control} {...register("email")} type="email" autoComplete="email" inputMode="email" />
        )}
      </FormField>

      <FormField
        id="password"
        label="Password"
        required
        hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        error={errors.password?.message}
      >
        {(control) => (
          <Input {...control} {...register("password")} type="password" autoComplete="new-password" />
        )}
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirm password"
        required
        error={errors.confirmPassword?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
          />
        )}
      </FormField>

      <Button type="submit" size="lg" disabled={busy} aria-disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {busy ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
