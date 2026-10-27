import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverviewLoading() {
  return (
    <div
      className="flex flex-col gap-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading admin overview"
    >
      <Skeleton className="h-8 w-40" />

      {/* 4 Stat Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-white p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-14" />
          </div>
        ))}
      </div>

      {/* Urgent Queue Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-white">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <Skeleton className="h-5 w-64 max-w-sm" />
                <Skeleton className="h-3.5 w-40" />
              </div>
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
