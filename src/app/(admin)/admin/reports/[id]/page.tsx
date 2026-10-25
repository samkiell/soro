import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ArrowLeft, EyeOff, Lock } from "lucide-react";
import { StatusBadge, UrgencyBadge } from "@/components/reports/report-badges";
import { NoteForm } from "@/features/admin/components/note-form";
import { ReportPhoto } from "@/features/admin/components/report-photo";
import { StatusUpdateForm } from "@/features/admin/components/status-update-form";
import { INCIDENT_TYPE_LABELS, STATUS_LABELS } from "@/features/reports/labels";
import { formatDateTime, reportReference } from "@/lib/format";
import { requireAdmin } from "@/lib/permissions";
import {
  getReportForAdmin,
  type AdminReportDetail,
} from "@/server/services/admin-report-service";

export const metadata: Metadata = { title: "Report review · Soro admin" };

type Params = Promise<{ id: string }>;

export default function AdminReportPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/reports"
        className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-brand underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All reports
      </Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ReportReview params={params} />
      </Suspense>
    </div>
  );
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

async function ReportReview({ params }: { params: Params }) {
  const { id } = await params;
  const admin = await requireAdmin(`/admin/reports/${id}`);
  const report = await getReportForAdmin(admin, id);
  if (!report) notFound();

  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="font-mono text-xs font-semibold text-text-muted">
          Ref {reportReference(report.id)}
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{report.title}</h1>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={report.status} />
          <UrgencyBadge urgency={report.urgency} />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <Section title="Details">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[auto_1fr]">
              <dt className="font-medium text-text-secondary">Incident type</dt>
              <dd className="text-ink">{INCIDENT_TYPE_LABELS[report.incidentType]}</dd>
              <dt className="font-medium text-text-secondary">Location</dt>
              <dd className="text-ink">{report.location}</dd>
              <dt className="font-medium text-text-secondary">Submitted</dt>
              <dd className="text-ink">{formatDateTime(report.createdAt)}</dd>
              <dt className="font-medium text-text-secondary">Reporter</dt>
              <dd className="text-ink">
                <Reporter report={report} />
              </dd>
            </dl>
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              <h3 className="text-sm font-medium text-text-secondary">Description</h3>
              <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                {report.description}
              </p>
            </div>
          </Section>

          <Section title="Photo">
            {report.hasPhoto ? (
              <ReportPhoto reportId={report.id} />
            ) : (
              <p className="text-sm text-text-secondary">No photo was attached.</p>
            )}
          </Section>

          <Section title="Status history">
            <ol className="flex flex-col gap-3 border-l-2 border-border pl-4">
              {report.statusHistory.map((entry) => (
                <li key={entry.id} className="flex flex-col gap-0.5 text-sm">
                  <span className="font-medium text-ink">
                    {entry.fromStatus
                      ? `${STATUS_LABELS[entry.fromStatus]} → ${STATUS_LABELS[entry.toStatus]}`
                      : `Report submitted (${STATUS_LABELS[entry.toStatus]})`}
                  </span>
                  <span className="text-text-secondary">
                    {formatDateTime(entry.createdAt)}
                    {entry.fromStatus
                      ? ` · by ${entry.changedBy?.name ?? "a former admin"}`
                      : ""}
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section title="Update status">
            <StatusUpdateForm reportId={report.id} currentStatus={report.status} />
          </Section>

          <Section
            title="Internal notes"
            aside={
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-text-secondary">
                <Lock className="h-3 w-3" aria-hidden="true" /> Admins only
              </span>
            }
          >
            <NoteForm reportId={report.id} />
            {report.notes.length === 0 ? (
              <p className="text-sm text-text-secondary">No internal notes yet.</p>
            ) : (
              <ul className="flex flex-col gap-3 border-t border-border pt-3">
                {report.notes.map((note) => (
                  <li key={note.id} className="flex flex-col gap-1 rounded-md bg-light-gold p-3 text-sm">
                    <p className="whitespace-pre-wrap break-words text-ink">{note.body}</p>
                    <p className="text-xs text-text-secondary">
                      {note.author.name} · {formatDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function Reporter({ report }: { report: AdminReportDetail }) {
  if (!report.reporter) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <EyeOff className="h-4 w-4 text-text-muted" aria-hidden="true" />
        Anonymous. The reporter&apos;s identity is hidden.
      </span>
    );
  }
  return (
    <span>
      {report.reporter.name}{" "}
      <span className="text-text-secondary">({report.reporter.email})</span>
    </span>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading report">
      <div className="h-8 w-2/3 rounded bg-white" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-64 rounded-lg border border-border bg-white" />
        <div className="h-64 rounded-lg border border-border bg-white" />
      </div>
    </div>
  );
}
