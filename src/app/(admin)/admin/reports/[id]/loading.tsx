import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportReviewLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading report for review"
    >
      <Skeleton className="h-5 w-28 rounded" />

      {/* Header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-2/3 max-w-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>

      {/* 2-Column Review Layout */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Left Column: Details, Photo, Status History */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
            <Skeleton className="h-6 w-24 border-b border-border/70 pb-2" />
            <div className="grid gap-2.5 sm:grid-cols-[auto_1fr]">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="contents">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-44" />
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
            <Skeleton className="h-6 w-32" />
            <div className="flex flex-col gap-3 border-l-2 border-border pl-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status Update & Notes */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
