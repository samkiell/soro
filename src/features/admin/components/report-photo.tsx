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
    <a href={src} target="_blank" rel="noopener" className="block w-fit">
      {/* eslint-disable-next-line @next/next/no-img-element -- authenticated route; the image optimizer can't forward the session */}
      <img
        src={src}
        alt="Photo attached to this report"
        loading="lazy"
        onError={() => setFailed(true)}
        className="max-h-96 w-auto rounded-md border border-border object-contain"
      />
      <span className="mt-1 block text-xs font-medium text-brand underline">Open full size</span>
    </a>
  );
}
