import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard, FormSkeleton } from "@/features/auth/components/auth-card";
import { RegisterForm } from "@/features/auth/components/register-form";
import { getCurrentUser } from "@/lib/permissions";
import { defaultPathForRole, safeCallbackPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Create an account · Soro" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthCard
      title="Create your account"
      description="Student accounts can submit reports, including anonymous ones."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-brand underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton fields={4} />}>
        <RegisterFormGate searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function RegisterFormGate({ searchParams }: { searchParams: SearchParams }) {
  const { callbackUrl } = await searchParams;
  const callback = typeof callbackUrl === "string" ? callbackUrl : undefined;

  const user = await getCurrentUser();
  if (user) redirect(safeCallbackPath(callback, defaultPathForRole(user.role)));

  return <RegisterForm callbackUrl={callback} />;
}
