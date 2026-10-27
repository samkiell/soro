"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createReportNote } from "@/features/admin/actions";
import { ADMIN_ERROR_MESSAGES, NETWORK_ERROR_MESSAGE } from "@/features/admin/messages";
import { NOTE_MAX_LENGTH } from "@/lib/validation/admin";

type Message = { variant: "success" | "danger"; text: string };

export function NoteForm({ reportId }: { reportId: string }) {
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<Message | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!body.trim()) {
      setMessage({ variant: "danger", text: "Write a note before saving." });
      return;
    }
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await createReportNote({ reportId, body });
        if (result.success) {
          setBody("");
          setMessage({ variant: "success", text: "Note saved." });
        } else {
          setMessage({
            variant: "danger",
            text: result.fieldErrors?.body?.[0] ?? ADMIN_ERROR_MESSAGES[result.error],
          });
        }
      } catch {
        setMessage({ variant: "danger", text: NETWORK_ERROR_MESSAGE });
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="note-body">Add an internal note</Label>
        <p id="note-body-hint" className="text-sm text-text-secondary">
          Visible to admins only. Students never see internal notes.
        </p>
        <Textarea
          id="note-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          maxLength={NOTE_MAX_LENGTH}
          aria-describedby="note-body-hint"
          disabled={pending}
        />
      </div>
      <Button type="submit" variant="outline" disabled={pending} aria-disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {pending ? "Saving…" : "Save note"}
      </Button>
      <div aria-live="polite">
        {message ? <Alert variant={message.variant}>{message.text}</Alert> : null}
      </div>
    </form>
  );
}
