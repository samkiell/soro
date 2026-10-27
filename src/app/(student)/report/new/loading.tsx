import { Skeleton } from "@/components/ui/skeleton";

export default function NewReportLoading() {
  return (
    <div
      className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading report form"
    >
      {/* Emergency Alert Skeleton */}
      <div className="flex flex-col gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      {/* Form Fields Skeletons */}
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-white p-6 shadow-2xs">
        {/* Title Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-64" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-80 max-w-full" />
          <Skeleton className="h-32 w-full rounded-md" />
        </div>

        {/* Location Field with buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded" />
              <Skeleton className="h-6 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-10 w-full rounded-md" />
          <div className="flex gap-1.5 pt-1">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>

        {/* Incident Type Select */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Urgency Radio Grid */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-36" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 rounded-md border border-border p-3">
                <Skeleton className="h-4 w-4 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymous Checkbox Card */}
        <div className="flex items-start gap-3 rounded-md border border-border p-3">
          <Skeleton className="h-4 w-4 rounded mt-1" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>

        {/* Photo Upload Area */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8">
            <Skeleton className="h-10 w-10 rounded-full mb-2" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Submit Button */}
        <Skeleton className="h-11 w-full rounded-lg sm:w-44" />
      </div>
    </div>
  );
}
