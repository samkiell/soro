import { Skeleton } from "@/components/ui/skeleton";

export default function ReportDetailLoading() {
  return (
    <div
      className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading report details"
    >
      {/* Back link skeleton */}
      <Skeleton className="h-5 w-36 self-start rounded" />

      {/* Header Skeleton */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-3/4 max-w-xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      {/* Progress Tracker Skeleton (3 Steps) */}
      <div className="rounded-xl border border-border bg-white p-5 shadow-2xs">
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-3.5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40" />
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left Column: Details & Photo */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs sm:p-6">
            <Skeleton className="h-6 w-36 border-b border-border/70 pb-3" />
            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="contents">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-48" />
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs sm:p-6">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column: Timeline & Support */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-2xs sm:p-6">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <div className="flex flex-col gap-4 border-l-2 border-border pl-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-gold/40 bg-light-gold/50 p-5 shadow-2xs">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="mt-2 h-9 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
