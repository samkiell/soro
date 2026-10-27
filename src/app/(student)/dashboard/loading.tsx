import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading student dashboard"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-8 w-60 sm:w-72" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-44 rounded-lg" />
      </div>

      {/* Emergency Notification Banner Skeleton */}
      <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-warm-cream/50 p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-64 max-w-xs" />
          </div>
        </div>
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>

      {/* 4 Stat Metric Cards Skeleton */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-xl border border-border bg-white p-4 shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <Skeleton className="h-7 w-12" />
          </div>
        ))}
      </div>

      {/* Reports Section Skeleton */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-9 w-64 rounded-md" />
        </div>

        {/* Tab Pills Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* 3 Report Cards Skeletons */}
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col justify-between gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs sm:flex-row sm:items-center sm:p-6"
            >
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 max-w-md" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3.5 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-32 self-end sm:self-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
