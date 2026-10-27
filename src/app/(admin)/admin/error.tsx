"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Alert variant="danger" title="This page couldn't be loaded" role="alert">
      <p>Something went wrong while loading report data. Check your connection and try again.</p>
      <Button type="button" variant="outline" size="sm" className="mt-3" onClick={reset}>
        Try again
      </Button>
    </Alert>
  );
}
