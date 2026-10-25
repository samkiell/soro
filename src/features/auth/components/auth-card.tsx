import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-4 py-10 sm:py-16">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-brand sm:text-3xl">
          {title}
        </h1>
        <p className="text-base text-text-secondary">{description}</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-xs sm:p-6">
        {children}
      </div>
      <div className="text-center text-sm text-text-secondary">{footer}</div>
    </div>
  );
}

export function FormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading form">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-surface-muted" />
          <div className="h-11 rounded-md bg-surface-muted" />
        </div>
      ))}
      <div className="h-11 rounded-md bg-surface-muted" />
    </div>
  );
}
