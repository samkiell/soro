import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  EyeClosed,
  MapPin,
  Phone,
  ShieldCheck,
  WarningTriangle,
} from "iconoir-react";
import { StatusBadge, UrgencyBadge } from "@/components/reports/report-badges";
import { ReportPhoto } from "@/components/reports/report-photo";
import { buttonVariants } from "@/components/ui/button";
import { StudentStatusUpdate } from "@/features/reports/components/student-status-update";
import { INCIDENT_TYPE_LABELS, STATUS_LABELS } from "@/features/reports/labels";
import { formatDateTime, reportReference } from "@/lib/format";
import { getCurrentUser } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { getReportForStudent } from "@/server/services/report-service";
import type { ReportStatus } from "@/types";

export const metadata: Metadata = {
  title: "Report Details & Status · Soro",
  description: "View incident report details and verified status history.",
};

type Params = Promise<{ id: string }>;

export default function StudentReportDetailPage({ params }: { params: Params }) {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6">
      <Suspense fallback={<div className="h-5 w-32 rounded bg-surface-muted" />}>
        <BackLink />
      </Suspense>

      <Suspense fallback={<DetailSkeleton />}>
        <ReportDetailContent params={params} />
      </Suspense>
    </div>
  );
}

async function BackLink() {
  const user = await getCurrentUser().catch(() => null);
  return (
    <Link
      href={user ? "/dashboard" : "/"}
      className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-brand underline-offset-4 hover:underline"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {user ? "Back to my reports" : "Back to home"}
    </Link>
  );
}

function Section({
  title,
  children,
  badge,
}: {
  title: string;
  children: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs sm:p-6">
      <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-3">
        <h2 className="text-base font-bold text-ink sm:text-lg">{title}</h2>
        {badge}
      </div>
      {children}
    </section>
  );
}

async function ReportDetailContent({ params }: { params: Params }) {
  const { id } = await params;
  const user = await getCurrentUser().catch(() => null);
  const report = await getReportForStudent(user, id);

  if (!report) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted">
            Ref {reportReference(report.id)}
          </span>
          <StatusBadge status={report.status} />
          <UrgencyBadge urgency={report.urgency} />
          {report.isAnonymous && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
              <EyeClosed className="h-3 w-3 text-text-muted" aria-hidden="true" />
              Anonymous report
            </span>
          )}
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {report.title}
        </h1>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            Reported on {formatDateTime(report.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
            {report.location}
          </span>
        </div>
      </header>

      {/* Visual Status Progress Tracker */}
      <StatusProgressTracker currentStatus={report.status} />

      {/* Student/Reporter Incident Status Control */}
      {report.isOwner && (
        <StudentStatusUpdate
          reportId={report.id}
          currentStatus={report.status}
          isOwner={report.isOwner}
        />
      )}

      {/* Admin Link if viewing as admin */}
      {user?.role === "ADMIN" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div>
            <p className="text-sm font-bold text-brand">Admin Console Access</p>
            <p className="text-xs text-text-secondary">You are viewing this report as an administrator.</p>
          </div>
          <Link
            href={`/admin/reports/${report.id}`}
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Review & Update in Admin
          </Link>
        </div>
      )}

      {/* Main Grid: Details + Timeline */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column: Core Report Details */}
        <div className="flex flex-col gap-6">
          <Section title="Incident Details">
            <dl className="grid gap-x-6 gap-y-3.5 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="font-medium text-text-secondary">Incident category</dt>
              <dd className="font-semibold text-ink">
                {INCIDENT_TYPE_LABELS[report.incidentType]}
              </dd>

              <dt className="font-medium text-text-secondary">Location</dt>
              <dd className="font-semibold text-ink">{report.location}</dd>

              <dt className="font-medium text-text-secondary">First recorded</dt>
              <dd className="text-ink">{formatDateTime(report.createdAt)}</dd>

              <dt className="font-medium text-text-secondary">Last updated</dt>
              <dd className="text-ink">{formatDateTime(report.updatedAt)}</dd>

              <dt className="font-medium text-text-secondary">Reporting privacy</dt>
              <dd className="text-ink">
                {report.isAnonymous ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    Anonymous — your personal identity is withheld from reviewing staff.
                  </span>
                ) : (
                  <span className="text-text-secondary">
                    Named submission — linked to your verified student account.
                  </span>
                )}
              </dd>
            </dl>

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                Detailed Description
              </h3>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink sm:text-base">
                {report.description}
              </p>
            </div>
          </Section>

          {/* Photo Evidence Section */}
          <Section title="Photo Evidence">
            {report.hasPhoto ? (
              <div className="flex flex-col gap-2">
                <ReportPhoto reportId={report.id} />
                <p className="text-xs text-text-secondary">
                  Photos are stored in private secure storage and accessible only by you and authorized campus responders.
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">
                No photo evidence was attached to this report.
              </p>
            )}
          </Section>
        </div>

        {/* Right Column: User-Visible Status History & Emergency Support */}
        <div className="flex flex-col gap-6">
          {/* Status History Audit Timeline */}
          <Section
            title="Status History"
            badge={
              <span className="text-xs font-semibold text-brand">
                {report.statusHistory.length} milestone{report.statusHistory.length === 1 ? "" : "s"}
              </span>
            }
          >
            <p className="text-xs text-text-secondary">
              Chronological log of verified status updates made by campus safety responders:
            </p>

            <ol className="relative flex flex-col gap-5 border-l-2 border-border pl-4">
              {report.statusHistory.map((entry, index) => {
                const isInitial = !entry.fromStatus;
                const isLatest = index === report.statusHistory.length - 1;

                return (
                  <li key={entry.id} className="relative flex flex-col gap-1 text-sm">
                    {/* Timeline bullet dot */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white ring-2",
                        isLatest
                          ? "bg-brand ring-brand/30"
                          : "bg-border-strong ring-border",
                      )}
                    />

                    <div className="flex flex-wrap items-center gap-1.5 font-bold text-ink">
                      {isInitial ? (
                        <span>Report Logged ({STATUS_LABELS[entry.toStatus]})</span>
                      ) : (
                        <span>
                          {STATUS_LABELS[entry.fromStatus!]} → {STATUS_LABELS[entry.toStatus]}
                        </span>
                      )}
                    </div>

                    <span className="text-xs text-text-secondary">
                      {formatDateTime(entry.createdAt)}
                    </span>

                    <span className="text-xs text-text-muted">
                      {isInitial
                        ? "Submitted via student portal"
                        : `Updated by ${entry.changedBy?.name ?? "Campus safety staff"}`}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Section>

          {/* Urgent Assistance Reminder */}
          <section
            aria-labelledby="emergency-card-heading"
            className="flex flex-col gap-3 rounded-xl border border-gold/40 bg-light-gold/50 p-5 shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <WarningTriangle className="h-5 w-5 text-brand" aria-hidden="true" />
              <h3 id="emergency-card-heading" className="font-bold text-ink">
                Active Fire or Structural Hazard?
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              If this incident involves an active fire, smoke outbreak, or structural rescue, contact the <strong>OAU Campus Fire Service</strong> directly (hotline is strictly for fire/rescue). For medical or security response, consult the emergency guide.
            </p>
            <a
              href="tel:08162214241"
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "mt-1 inline-flex w-full items-center justify-center gap-2 font-bold shadow-xs",
              )}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Fire Service (08162214241)
            </a>
            <Link
              href="/emergency"
              className="text-center text-xs font-semibold text-brand underline-offset-4 hover:underline"
            >
              View campus emergency guide
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusProgressTracker({ currentStatus }: { currentStatus: ReportStatus }) {
  const steps: Array<{
    status: ReportStatus;
    title: string;
    description: string;
  }> = [
    {
      status: "RECEIVED",
      title: "1. Received",
      description: "Logged and queued for staff review",
    },
    {
      status: "IN_PROGRESS",
      title: "2. In Progress",
      description: "Under active investigation",
    },
    {
      status: "RESOLVED",
      title: "3. Resolved",
      description: "Action taken and concluded",
    },
  ];

  function getStepState(stepStatus: ReportStatus): "completed" | "current" | "upcoming" {
    if (currentStatus === "RESOLVED") {
      return "completed";
    }
    if (currentStatus === "IN_PROGRESS") {
      if (stepStatus === "RECEIVED") return "completed";
      if (stepStatus === "IN_PROGRESS") return "current";
      return "upcoming";
    }
    // RECEIVED
    if (stepStatus === "RECEIVED") return "current";
    return "upcoming";
  }

  return (
    <div
      aria-label="Report progress tracker"
      className="rounded-xl border border-border bg-white p-5 shadow-2xs"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {steps.map((step) => {
          const state = getStepState(step.status);
          const isCurrent = state === "current";
          const isCompleted = state === "completed";

          return (
            <div
              key={step.status}
              className={cn(
                "relative flex flex-col gap-1 rounded-lg border p-3.5 transition-all",
                isCurrent && "border-brand bg-brand/5 shadow-2xs",
                isCompleted && "border-emerald-200 bg-emerald-50/50",
                state === "upcoming" && "border-border bg-surface-muted/50 opacity-70",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    isCurrent && "text-brand",
                    isCompleted && "text-emerald-700",
                    state === "upcoming" && "text-text-muted",
                  )}
                >
                  {step.title}
                </span>
                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                )}
                {isCurrent && (
                  <Clock className="h-4 w-4 text-brand animate-pulse" aria-hidden="true" />
                )}
              </div>
              <p className="text-xs text-text-secondary">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div
      className="flex flex-col gap-6"
      aria-busy="true"
      aria-label="Loading report details"
    >
      <div className="flex flex-col gap-2">
        <div className="h-4 w-28 rounded bg-surface-muted" />
        <div className="h-8 w-80 rounded bg-surface-muted" />
        <div className="h-4 w-48 rounded bg-surface-muted" />
      </div>

      <div className="h-28 rounded-xl border border-border bg-white" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="h-80 rounded-xl border border-border bg-white" />
        <div className="h-80 rounded-xl border border-border bg-white" />
      </div>
    </div>
  );
}
