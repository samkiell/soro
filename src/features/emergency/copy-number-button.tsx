"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Desktop fallback for devices without a calling app. */
export function CopyNumberButton({ number }: { number: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(number);
      setState("copied");
    } catch {
      setState("failed");
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button type="button" variant="outline" size="lg" onClick={copy}>
        {state === "copied" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {state === "copied" ? "Number copied" : "Copy number"}
      </Button>
      <p aria-live="polite" className="text-xs text-text-secondary">
        {state === "failed"
          ? "Couldn't copy automatically. Select the number above and copy it."
          : ""}
      </p>
    </div>
  );
}
