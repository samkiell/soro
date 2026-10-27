import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  PhoneCall,
  Plus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StudentReportList } from "@/features/reports/components/student-report-list";
import { requireUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { listReportsForStudent } from "@/server/services/report-service";

export const metadata: Metadata = {
  title: "Student Dashboard · Soro",
  description: "Track and manage your submitted campus incident reports and safety inquiries.",
};

export default function StudentDashboardPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const user = await requireUser("/dashboard");
  const reports = await listReportsForStudent(user);

  const total = reports.length;
  const received = reports.filter((r) => r.status === "RECEIVED").length;
  const inProgress = reports.filter((r) => r.status === "IN_PROGRESS").length;
  const resolved = reports.filter((r) => r.status === "RESOLVED").length;

  return (
    <>
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand">
            Student Portal
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            My Incident Reports
          </h1>
          <p className="text-sm text-text-secondary">
            Follow up on your submitted reports, track status changes, and submit new incidents.
          </p>
        </div>
        <Link
          href="/report/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "inline-flex items-center gap-2 self-start font-semibold shadow-xs sm:self-center",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Report new incident
        </Link>
      </header>

      {/* Safety Notice Banner */}
      <aside
        aria-label="Campus emergency notice"
        className="flex flex-col gap-3 rounded-xl border border-gold/40 bg-light-gold/60 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 h-5 w-5 shrink-0 text-brand"
            aria-hidden="true"
          />
          <div className="text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <strong className="font-semibold text-ink">
                OAU Campus Fire Service
              </strong>
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 border border-amber-300">
                Fire & Rescue Only
              </span>
            </div>
            <p className="text-text-secondary mt-0.5">
              08162214241 is strictly for active fires or rescue hazards (not general emergency dispatch). For security or medical help, view directory.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">
          <a
            href="tel:08162214241"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "border-danger/30 bg-white font-semibold text-danger hover:bg-red-50",
            )}
          >
            <PhoneCall className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Fire Service: 08162214241
          </a>
          <Link
            href="/emergency"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-xs font-semibold text-brand underline-offset-4 hover:underline",
            )}
          >
            Emergency directory
          </Link>
        </div>
      </aside>

      {/* Overview Metric Stats */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Report summary statistics
        </h2>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white p-4 shadow-2xs">
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <FileText className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
              Total reports
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-ink sm:text-3xl">
              {total}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white p-4 shadow-2xs">
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
              Received
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-brand sm:text-3xl">
              {received}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white p-4 shadow-2xs">
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <Clock className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
              In progress
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-amber-700 sm:text-3xl">
              {inProgress}
            </span>
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-border bg-white p-4 shadow-2xs">
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-secondary">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              Resolved
            </span>
            <span className="text-2xl font-extrabold tabular-nums text-emerald-700 sm:text-3xl">
              {resolved}
            </span>
          </div>
        </div>
      </section>

      {/* Reports List Section */}
      <section aria-labelledby="reports-list-heading" className="flex flex-col gap-4">
        <h2 id="reports-list-heading" className="text-lg font-bold text-ink">
          Submitted Reports
        </h2>
        <StudentReportList reports={reports} />
      </section>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div
      className="flex flex-col gap-8"
      aria-busy="true"
      aria-label="Loading student dashboard"
    >
      <div className="flex flex-col gap-2">
        <div className="h-4 w-28 rounded bg-surface-muted" />
        <div className="h-8 w-64 rounded bg-surface-muted" />
        <div className="h-4 w-96 max-w-full rounded bg-surface-muted" />
      </div>

      <div className="h-20 rounded-xl bg-surface-muted" />

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-white" />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-white" />
        ))}
      </div>
    </div>
  );
}
