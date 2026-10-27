import { Skeleton } from "@/components/ui/skeleton";

export default function RegisterLoading() {
  return (
    <div
      className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-12 sm:px-6 animate-in fade-in duration-150"
      aria-busy="true"
      aria-label="Loading registration"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-6 shadow-2xs">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="h-10 w-full rounded-md mt-2" />
      </div>
    </div>
  );
}
