import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthCard, FormSkeleton } from "@/features/auth/components/auth-card";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/lib/permissions";
import { defaultPathForRole, safeCallbackPath } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Sign in · Soro" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <AuthCard
      title="Sign in"
      description="Sign in to report an incident and follow its progress."
      footer={
        <>
          New to Soro?{" "}
          <Link href="/register" className="font-semibold text-brand underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense fallback={<FormSkeleton />}>
        <LoginFormGate searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LoginFormGate({ searchParams }: { searchParams: SearchParams }) {
  const { callbackUrl } = await searchParams;
  const callback = typeof callbackUrl === "string" ? callbackUrl : undefined;

  const user = await getCurrentUser();
  if (user) redirect(safeCallbackPath(callback, defaultPathForRole(user.role)));

  return <LoginForm callbackUrl={callback} />;
}
