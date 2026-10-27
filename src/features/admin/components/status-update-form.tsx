"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { changeReportStatus } from "@/features/admin/actions";
import { ADMIN_ERROR_MESSAGES, NETWORK_ERROR_MESSAGE } from "@/features/admin/messages";
import { STATUS_LABELS } from "@/features/reports/labels";
import { allowedNextStatuses } from "@/lib/permissions/policies";
import type { ReportStatus } from "@/types";

type Message = { variant: "success" | "danger"; text: string };

export function StatusUpdateForm({
  reportId,
  currentStatus,
}: {
  reportId: string;
  currentStatus: ReportStatus;
}) {
  const [next, setNext] = useState<ReportStatus | "">("");
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();
  const options = allowedNextStatuses(currentStatus);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!next) {
      setMessage({ variant: "danger", text: "Choose a new status first." });
      return;
    }
    const target = next;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await changeReportStatus({ reportId, status: target });
        if (result.success) {
          setNext("");
          setMessage({ variant: "success", text: `Status changed to ${STATUS_LABELS[target]}.` });
        } else {
          setMessage({ variant: "danger", text: ADMIN_ERROR_MESSAGES[result.error] });
        }
      } catch {
        setMessage({ variant: "danger", text: NETWORK_ERROR_MESSAGE });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="next-status">Change status</Label>
        <p id="next-status-hint" className="text-sm text-text-secondary">
          Currently <strong>{STATUS_LABELS[currentStatus]}</strong>. The change and your
          name are added to the report&apos;s history.
        </p>
        <Select
          id="next-status"
          value={next}
          onChange={(event) => setNext(event.target.value as ReportStatus | "")}
          aria-describedby="next-status-hint"
          disabled={pending}
        >
          <option value="">Choose a new status</option>
          {options.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" disabled={pending} aria-disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving…" : "Update status"}
      </Button>
      <div aria-live="polite">
        {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}
      </div>
    </form>
  );
}
