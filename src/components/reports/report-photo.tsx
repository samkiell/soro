"use client";

import { useState } from "react";

/** Loads the photo through the authorized route; never a storage URL. */
export function ReportPhoto({ reportId }: { reportId: string }) {
  const [failed, setFailed] = useState(false);
  const src = `/api/reports/${reportId}/photo`;

  if (failed) {
    return (
      <p className="rounded-md border border-dashed border-border-strong bg-white p-4 text-sm text-text-secondary">
        The photo couldn&apos;t be loaded. Try refreshing the page.
      </p>
    );
  }

  return (
    <a href={src} target="_blank" rel="noopener noreferrer" className="block w-fit">
      {/* eslint-disable-next-line @next/next/no-img-element -- authenticated route; the image optimizer can't forward the session */}
      <img
        src={src}
        alt="Photo evidence attached to this report"
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-96 w-auto rounded-lg border border-border object-contain shadow-2xs"
      />
      <span className="mt-1.5 block text-xs font-semibold text-brand underline-offset-4 hover:underline">
        Open full size in new tab ↗
      </span>
    </a>
  );
}
