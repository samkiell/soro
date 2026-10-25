import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge, UrgencyBadge } from "@/components/reports/report-badges";
import { INCIDENT_TYPE_LABELS } from "@/features/reports/labels";
import { formatDateTime } from "@/lib/format";
import type { AdminReportListItem } from "@/server/services/admin-report-service";

/** Table on wider screens, stacked cards on phones. */
export function ReportList({ reports }: { reports: AdminReportListItem[] }) {
  return (
    <>
      <ul className="flex flex-col gap-3 md:hidden">
        {reports.map((report) => (
          <li key={report.id}>
            <Link
              href={`/admin/reports/${report.id}`}
              className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4 transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-ink">{report.title}</span>
                <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />
              </span>
              <span className="flex flex-wrap gap-2">
                <StatusBadge status={report.status} />
                <UrgencyBadge urgency={report.urgency} />
              </span>
              <span className="text-sm text-text-secondary">
                {INCIDENT_TYPE_LABELS[report.incidentType]} · {report.location}
              </span>
              <span className="text-xs text-text-muted">{formatDateTime(report.createdAt)}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-lg border border-border bg-white md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface-muted text-xs uppercase tracking-wide text-text-secondary">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold">Report</th>
              <th scope="col" className="px-4 py-3 font-semibold">Type</th>
              <th scope="col" className="px-4 py-3 font-semibold">Urgency</th>
              <th scope="col" className="px-4 py-3 font-semibold">Status</th>
              <th scope="col" className="px-4 py-3 font-semibold">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((report) => (
              <tr key={report.id} className="align-top hover:bg-surface-muted/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    {report.title}
                  </Link>
                  <p className="mt-0.5 text-text-secondary">{report.location}</p>
                </td>
                <td className="px-4 py-3 text-text-primary">{INCIDENT_TYPE_LABELS[report.incidentType]}</td>
                <td className="px-4 py-3"><UrgencyBadge urgency={report.urgency} /></td>
                <td className="px-4 py-3"><StatusBadge status={report.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-text-secondary">
                  {formatDateTime(report.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading reports">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-20 rounded-lg border border-border bg-white" />
      ))}
    </div>
  );
}
