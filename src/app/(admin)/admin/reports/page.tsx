import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { buttonVariants } from "@/components/ui/button";
import { ReportFilters } from "@/features/admin/components/report-filters";
import { ListSkeleton, ReportList } from "@/features/admin/components/report-list";
import { requireAdmin } from "@/lib/permissions";
import { reportFiltersSchema, type ReportFilters as Filters } from "@/lib/validation/admin";
import { listReports } from "@/server/services/admin-report-service";

export const metadata: Metadata = { title: "Reports · Soro admin" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function AdminReportsPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">Reports</h1>
      <Suspense fallback={<ListSkeleton />}>
        <Reports searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(filters: Filters, page: number) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.urgency) params.set("urgency", filters.urgency);
  if (filters.type) params.set("type", filters.type);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/reports?${query}` : "/admin/reports";
}

async function Reports({ searchParams }: { searchParams: SearchParams }) {
  const admin = await requireAdmin("/admin/reports");
  const raw = await searchParams;
  const filters = reportFiltersSchema.parse({
    status: firstValue(raw.status) || undefined,
    urgency: firstValue(raw.urgency) || undefined,
    type: firstValue(raw.type) || undefined,
    page: firstValue(raw.page),
  });
  const { items, total, page, pageCount } = await listReports(admin, filters);
  const filtered = Boolean(filters.status || filters.urgency || filters.type);

  return (
    <>
      {/* Keyed so the uncontrolled selects reset when the URL's filters change. */}
      <ReportFilters
        key={`${filters.status}-${filters.urgency}-${filters.type}`}
        filters={filters}
      />

      <p className="text-sm text-text-secondary" aria-live="polite">
        {total === 1 ? "1 report" : `${total} reports`}
        {filtered ? " match these filters" : ""}
        {pageCount > 1 ? ` · page ${page} of ${pageCount}` : ""}
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border-strong bg-white p-8 text-center">
          <p className="text-sm text-text-secondary">
            {filtered
              ? "No reports match these filters."
              : page > 1
                ? "There are no reports on this page."
                : "No reports have been submitted yet."}
          </p>
          {filtered || page > 1 ? (
            <Link href="/admin/reports" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Show all reports
            </Link>
          ) : null}
        </div>
      ) : (
        <ReportList reports={items} />
      )}

      {pageCount > 1 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={pageHref(filters, page - 1)} className={buttonVariants({ variant: "outline" })}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          {page < pageCount ? (
            <Link href={pageHref(filters, page + 1)} className={buttonVariants({ variant: "outline" })}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
