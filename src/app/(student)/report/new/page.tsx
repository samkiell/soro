import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Alert } from "@/components/ui/alert";
import { FormSkeleton } from "@/features/auth/components/auth-card";
import { ReportForm } from "@/features/reports/components/report-form";
import { canCreateReport, requireUser } from "@/lib/permissions";

export const metadata: Metadata = { title: "Report an incident · Soro" };

export default function NewReportPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
          Report an incident
        </h1>
        <p className="text-base text-text-secondary">
          Tell us what happened. It takes a few minutes, and you can report anonymously.
        </p>
      </header>

      <Alert variant="warning" title="Is anyone in danger right now?">
        Call for help first. Submitting this form doesn&apos;t alert responders.{" "}
        <Link href="/emergency" className="font-semibold text-brand underline">
          See emergency contacts
        </Link>
        .
      </Alert>

      <Suspense fallback={<FormSkeleton fields={5} />}>
        <ReportFormGate />
      </Suspense>
    </div>
  );
}

async function ReportFormGate() {
  const user = await requireUser("/report/new");

  if (!canCreateReport(user)) {
    return (
      <Alert variant="info" title="Reports are submitted from student accounts">
        Admin accounts review reports rather than submitting them.{" "}
        <Link href="/admin" className="font-semibold text-brand underline">
          Go to the admin overview
        </Link>
        .
      </Alert>
    );
  }

  return <ReportForm />;
}
