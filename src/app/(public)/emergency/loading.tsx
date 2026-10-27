import { Skeleton } from "@/components/ui/skeleton";

export default function EmergencyLoading() {
  return (
    <div
      className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading emergency contacts"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-4 w-full" />
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-xs space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>
    </div>
  );
}
