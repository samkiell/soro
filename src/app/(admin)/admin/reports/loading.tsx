import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading admin reports"
    >
      <Skeleton className="h-8 w-36" />

      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4">
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>

      <Skeleton className="h-4 w-40" />

      {/* Reports Table Skeleton */}
      <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-white shadow-2xs">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2.5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-20 rounded-full" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-72 max-w-md" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="h-3.5 w-28" />
              </div>
            </div>
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
