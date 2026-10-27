"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, WarningTriangle } from "iconoir-react";
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
  OAU_STUDENT_DOMAIN,
} from "@/lib/validation/auth";

const ERROR_MESSAGES = {
  ACCOUNT_UNAVAILABLE: "An account with this matric number or email already exists.",
  INVALID_CREDENTIALS: "Your account was created, but we couldn't sign you in. Try signing in directly.",
  VALIDATION_ERROR: "Please check the highlighted fields below.",
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
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput, unknown, z.output<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      matricNumber: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    setShowSignInHint(false);

    // Auto-append student domain if user only entered username prefix
    let email = values.email.trim().toLowerCase();
    if (!email.includes("@")) {
      email = `${email}${OAU_STUDENT_DOMAIN}`;
      setValue("email", email);
    }

    try {
      const result = await registerAccount({ ...values, email }, callbackUrl);
      if (result.success) {
        setRedirecting(true);
        router.replace(result.redirectTo);
        router.refresh();
        return;
      }
      applyFieldErrors(setError, result.fieldErrors, [
        "name",
        "matricNumber",
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
                <div>
                  {formError}
                  {showSignInHint && (
                    <span className="block mt-1">
                      Already registered?{" "}
                      <Link href="/login" className="font-bold text-brand underline underline-offset-2">
                        Sign in to your account
                      </Link>
                    </span>
                  )}
                </div>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <FormField id="name" label="Full name" required error={errors.name?.message}>
        {(control) => (
          <Input
            {...control}
            {...register("name")}
            autoComplete="name"
            placeholder="e.g. John Doe"
          />
        )}
      </FormField>

      <FormField
        id="matricNumber"
        label="Student Matric Number"
        required
        hint="Used to identify your student record and enable matric-based sign in."
        error={errors.matricNumber?.message}
      >
        {(control) => (
          <Input
            {...control}
            {...register("matricNumber")}
            autoComplete="off"
            placeholder="e.g. swe/2023/001"
            className="uppercase font-mono text-sm"
          />
        )}
      </FormField>

      <FormField
        id="email"
        label="OAU Student Email"
        required
        hint="Only official OAU student email addresses are allowed (e.g. j.doe2023001@student.oauife.edu.ng)."
        error={errors.email?.message}
      >
        {(control) => (
          <div className="flex items-stretch rounded-lg shadow-2xs">
            <Input
              {...control}
              {...register("email", {
                setValueAs: (v: string) => {
                  const trimmed = (v ?? "").trim().toLowerCase();
                  if (!trimmed) return "";
                  return trimmed.includes("@") ? trimmed : `${trimmed}${OAU_STUDENT_DOMAIN}`;
                },
              })}
              type="text"
              autoComplete="email"
              placeholder="j.doe2023001"
              className="min-w-0 flex-1 rounded-r-none border-r-0 text-sm"
            />
            <span className="inline-flex shrink-0 select-none items-center rounded-r-lg border border-border bg-warm-cream/70 px-2 text-[11px] font-semibold text-text-secondary sm:px-3 sm:text-xs">
              @student.oauife.edu.ng
            </span>
          </div>
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
          <Input
            {...control}
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
          />
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
            Creating account…
          </span>
        ) : (
          <>
            <UserPlus className="h-4 w-4 text-gold" /> Create student account
          </>
        )}
      </Button>
    </motion.form>
  );
}
