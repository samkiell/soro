"use client";

import { useState } from "react";
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
import { signInWithCredentials } from "@/features/auth/actions";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "That email and password don't match an account. Check them and try again.",
  ACCOUNT_UNAVAILABLE: "We couldn't sign you in. Try again.",
  VALIDATION_ERROR: "Check the highlighted fields.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again in a moment.",
} as const;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput, unknown, z.output<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: SignInInput) {
    setFormError(null);
    try {
      const result = await signInWithCredentials(values, callbackUrl);
      if (result.success) {
        setRedirecting(true);
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }
      applyFieldErrors(setError, result.fieldErrors, ["email", "password"]);
      setFormError(ERROR_MESSAGES[result.error]);
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
        </Alert>
      ) : null}

      <FormField id="email" label="Email" required error={errors.email?.message}>
        {(control) => (
          <Input {...control} {...register("email")} type="email" autoComplete="email" inputMode="email" />
        )}
      </FormField>

      <FormField id="password" label="Password" required error={errors.password?.message}>
        {(control) => (
          <Input {...control} {...register("password")} type="password" autoComplete="current-password" />
        )}
      </FormField>

      <Button type="submit" size="lg" disabled={busy} aria-disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {busy ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
