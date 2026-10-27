import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { ListSkeleton, ReportList } from "@/features/admin/components/report-list";
import { STATUS_LABELS, STATUS_ORDER } from "@/features/reports/labels";
import { requireAdmin } from "@/lib/permissions";
import { getReportOverview } from "@/server/services/admin-report-service";

export const metadata: Metadata = { title: "Admin overview · Soro" };

export default function AdminOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">Overview</h1>
      <Suspense fallback={<OverviewSkeleton />}>
        <Overview />
      </Suspense>
    </div>
  );
}

async function Overview() {
  const admin = await requireAdmin("/admin");
  const { total, byStatus, openUrgentCount, urgentQueue } = await getReportOverview(admin);

  const stats = [
    { label: "Total reports", value: total, href: "/admin/reports" },
    ...STATUS_ORDER.map((status) => ({
      label: STATUS_LABELS[status],
      value: byStatus[status],
      href: `/admin/reports?status=${status}`,
    })),
  ];

  return (
    <>
      <section aria-labelledby="counts-heading">
        <h2 id="counts-heading" className="sr-only">Report counts</h2>
        <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label}>
              <Link
                href={stat.href}
                className="flex flex-col gap-1 rounded-lg border border-border bg-white p-4 transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                <span className="text-sm font-medium text-text-secondary">{stat.label}</span>
                <span className="text-3xl font-bold tabular-nums text-ink">{stat.value}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="urgent-heading" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="urgent-heading" className="text-lg font-semibold text-ink">
            Needs attention{" "}
            <span className="font-normal text-text-secondary">
              ({openUrgentCount} open high or critical)
            </span>
          </h2>
          <Link
            href="/admin/reports"
            className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            All reports <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {total === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-white p-6 text-center text-sm text-text-secondary">
            No reports have been submitted yet.
          </p>
        ) : urgentQueue.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border-strong bg-white p-6 text-center text-sm text-text-secondary">
            No open high or critical reports right now.
          </p>
        ) : (
          <ReportList reports={urgentQueue} />
        )}
      </section>
    </>
  );
}

function OverviewSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-24 rounded-lg border border-border bg-white" />
        ))}
      </div>
      <ListSkeleton rows={3} />
    </div>
  );
}
