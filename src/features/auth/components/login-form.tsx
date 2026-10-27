"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, WarningTriangle } from "iconoir-react";
import { applyFieldErrors } from "@/components/forms/apply-field-errors";
import { FormField } from "@/components/forms/form-field";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signInWithCredentials } from "@/features/auth/actions";
import { signInSchema, type SignInInput } from "@/lib/validation/auth";

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: "That matric number/email and password don't match an account. Check them and try again.",
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
    defaultValues: { identifier: "", password: "" },
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
      applyFieldErrors(setError, result.fieldErrors, ["identifier", "password"]);
      setFormError(ERROR_MESSAGES[result.error]);
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    }
  }

  const busy = isSubmitting || redirecting;

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
    >
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Alert variant="danger" role="alert">
              <div className="flex items-center gap-2">
                <WarningTriangle className="h-4 w-4 shrink-0 text-danger" />
                <span>{formError}</span>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <FormField
        id="identifier"
        label="Matric Number or OAU Email"
        required
        hint="Sign in using either your matric number (e.g. swe/2023/001) or your official OAU student email."
        error={errors.identifier?.message}
      >
        {(control) => (
          <div className="relative flex items-center">
            <Input
              {...control}
              {...register("identifier")}
              type="text"
              autoComplete="username"
              placeholder="e.g. swe/2023/001 or j.doe2023001@student.oauife.edu.ng"
              className="pr-4"
            />
          </div>
        )}
      </FormField>

      <FormField id="password" label="Password" required error={errors.password?.message}>
        {(control) => (
          <Input
            {...control}
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
          />
        )}
      </FormField>

      <Button
        type="submit"
        size="lg"
        disabled={busy}
        aria-disabled={busy}
        className="font-bold gap-2 shadow-xs"
      >
        {busy ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing in…
          </span>
        ) : (
          <>
            <LogIn className="h-4 w-4 text-gold" /> Sign in
          </>
        )}
      </Button>
    </motion.form>
  );
}
