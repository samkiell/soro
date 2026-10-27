"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Maximize2, X } from "lucide-react";

/** Loads the photo through the authorized route and displays it with a full-size modal lightbox. */
export function ReportPhoto({ reportId }: { reportId: string }) {
  const [failed, setFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const src = `/api/reports/${reportId}/photo`;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (failed) {
    return (
      <p className="rounded-md border border-dashed border-border-strong bg-white p-4 text-sm text-text-secondary">
        The photo couldn&apos;t be loaded. Try refreshing the page.
      </p>
    );
  }

  const modal = isOpen && typeof document !== "undefined"
    ? createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full photo evidence preview"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsOpen(false);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xs sm:p-6 animate-in fade-in duration-200"
        >
          <div className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-gold" />
                <h3 className="text-sm font-semibold tracking-wide text-white">Photo Evidence</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={src}
                  download={`report-evidence-${reportId}.jpg`}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                  title="Download image"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close modal"
                  className="rounded-lg border border-white/15 bg-white/5 p-1.5 text-slate-300 transition-colors hover:bg-white/15 hover:text-white focus:outline-hidden focus:ring-2 focus:ring-gold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Photo viewport */}
            <div className="flex flex-1 items-center justify-center overflow-auto bg-black/60 p-2 sm:p-6">
              {/* eslint-disable-next-line @next/next/no-img-element -- authenticated route; image optimizer cannot forward session cookies */}
              <img
                src={src}
                alt="Photo evidence attached to this report"
                className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl select-none"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/10 bg-black/40 px-4 py-2 text-[11px] text-slate-400">
              <span>Click outside or press ESC to dismiss</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-medium text-gold hover:underline"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="group relative block w-fit overflow-hidden rounded-xl border border-border bg-slate-50 text-left shadow-2xs transition-all hover:border-brand/40 hover:shadow-md focus:outline-hidden focus:ring-2 focus:ring-brand/30"
        title="Click to view full photo in modal"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- authenticated route; the image optimizer can't forward the session */}
        <img
          src={src}
          alt="Photo evidence attached to this report"
          loading="lazy"
          onError={() => setFailed(true)}
          className="max-h-96 w-auto rounded-xl object-contain transition-transform duration-200 group-hover:scale-[1.01]"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-brand/90 px-3 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-xs">
            <Maximize2 className="h-3.5 w-3.5 text-gold" /> Click to enlarge
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand underline-offset-4 hover:underline"
      >
        <Maximize2 className="h-3.5 w-3.5 text-gold" />
        View full photo
      </button>

      {modal}
    </div>
  );
}
