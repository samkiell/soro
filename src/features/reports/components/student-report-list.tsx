"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Camera,
  ChevronRight,
  EyeOff,
  FileQuestion,
  Filter,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { StatusBadge, UrgencyBadge } from "@/components/reports/report-badges";
import { buttonVariants } from "@/components/ui/button";
import { INCIDENT_TYPE_LABELS } from "@/features/reports/labels";
import { formatDate, reportReference } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StudentReportListItem } from "@/server/services/report-service";
import type { ReportStatus } from "@/types";

type StatusFilter = "ALL" | ReportStatus;

export function StudentReportList({ reports }: { reports: StudentReportListItem[] }) {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputId = useId();

  const counts = useMemo(() => {
    return {
      ALL: reports.length,
      RECEIVED: reports.filter((r) => r.status === "RECEIVED").length,
      IN_PROGRESS: reports.filter((r) => r.status === "IN_PROGRESS").length,
      RESOLVED: reports.filter((r) => r.status === "RESOLVED").length,
    };
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        selectedStatus === "ALL" || report.status === selectedStatus;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        report.title.toLowerCase().includes(q) ||
        report.location.toLowerCase().includes(q) ||
        report.id.toLowerCase().includes(q) ||
        reportReference(report.id).toLowerCase().includes(q) ||
        INCIDENT_TYPE_LABELS[report.incidentType].toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [reports, selectedStatus, searchQuery]);

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-light-gold text-brand">
          <FileQuestion className="h-8 w-8" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-xl font-bold tracking-tight text-ink">
          No incident reports yet
        </h3>
        <p className="mt-2 max-w-md text-sm text-text-secondary leading-relaxed">
          When you report safety concerns, facility hazards, or incidents on campus, you can follow their real-time investigation and status updates here.
        </p>
        <Link
          href="/report/new"
          className={cn(
            buttonVariants({ variant: "default" }),
            "mt-6 inline-flex items-center gap-2 font-semibold shadow-xs",
          )}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Submit your first report
        </Link>
      </div>
    );
  }

  const tabs: Array<{ id: StatusFilter; label: string; count: number }> = [
    { id: "ALL", label: "All reports", count: counts.ALL },
    { id: "RECEIVED", label: "Received", count: counts.RECEIVED },
    { id: "IN_PROGRESS", label: "In progress", count: counts.IN_PROGRESS },
    { id: "RESOLVED", label: "Resolved", count: counts.RESOLVED },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Controls: Search and Status Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Filter Tabs */}
        <div
          role="tablist"
          aria-label="Filter reports by status"
          className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-surface-muted p-1"
        >
          {tabs.map((tab) => {
            const isActive = selectedStatus === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSelectedStatus(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-brand",
                  isActive
                    ? "bg-white text-ink shadow-2xs"
                    : "text-text-secondary hover:text-ink hover:bg-white/50",
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[10px] font-bold tabular-nums",
                    isActive
                      ? "bg-brand/10 text-brand"
                      : "bg-border text-text-secondary",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <label htmlFor={searchInputId} className="sr-only">
            Search your reports
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
          <input
            id={searchInputId}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, location, or ref..."
            className="h-9 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm text-ink placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
      </div>

      {/* Report Cards List */}
      {filteredReports.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-white px-6 py-12 text-center">
          <Filter className="h-8 w-8 text-text-muted" aria-hidden="true" />
          <p className="mt-2 text-sm font-medium text-ink">
            No reports match your search or filter
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus("ALL");
              setSearchQuery("");
            }}
            className="mt-3 text-xs font-semibold text-brand underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3.5" role="list">
          {filteredReports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/report/${reportReference(report.id)}`}
                className="group relative flex flex-col justify-between gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs transition-all hover:border-brand/40 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-brand sm:flex-row sm:items-center sm:p-6"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  {/* Top metadata row: Ref + Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-text-muted">
                      Ref {reportReference(report.id)}
                    </span>
                    <StatusBadge status={report.status} />
                    <UrgencyBadge urgency={report.urgency} />

                    {report.isAnonymous && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium text-text-secondary">
                        <EyeOff className="h-3 w-3" aria-hidden="true" />
                        Anonymous
                      </span>
                    )}

                    {report.hasPhoto && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-light-gold px-2 py-0.5 text-xs font-medium text-ink">
                        <Camera className="h-3 w-3 text-brand" aria-hidden="true" />
                        Photo evidence
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-ink transition-colors group-hover:text-brand sm:text-lg">
                    {report.title}
                  </h3>

                  {/* Incident type, Location, Date */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                    <span className="font-medium text-ink">
                      {INCIDENT_TYPE_LABELS[report.incidentType]}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      {report.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-text-muted" aria-hidden="true" />
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Right Arrow / CTA */}
                <div className="flex items-center gap-2 self-end text-sm font-semibold text-brand transition-transform group-hover:translate-x-1 sm:self-center">
                  <span className="hidden md:inline">View status history</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
