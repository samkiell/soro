"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Refresh, WarningTriangle } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateStudentReportStatus } from "@/features/reports/actions";
import type { ReportStatus } from "@/types";

type Props = {
  reportId: string;
  currentStatus: ReportStatus;
  isOwner: boolean;
};

export function StudentStatusUpdate({ reportId, currentStatus, isOwner }: Props) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!isOwner) return null;

  const isResolved = currentStatus === "RESOLVED";

  function handleToggleStatus(targetStatus: ReportStatus) {
    setFeedback(null);
    startTransition(async () => {
      const res = await updateStudentReportStatus({
        reportId,
        status: targetStatus,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          text:
            targetStatus === "RESOLVED"
              ? "Status updated. You marked this incident as ended."
              : "Status updated. Report reopened for active response.",
        });
      } else {
        setFeedback({
          type: "error",
          text: "Could not update status. Please try again or refresh the page.",
        });
      }
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-3 rounded-xl border border-brand/20 bg-warm-cream/40 p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-gold">
          {isResolved ? (
            <Refresh className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-ink sm:text-base">
            {isResolved ? "Incident Reopen Option" : "Is this incident still happening?"}
          </h3>
          <p className="mt-0.5 text-xs text-text-secondary leading-relaxed">
            {isResolved
              ? "If this issue has resumed or requires immediate follow-up assistance, you can reopen it for responders."
              : "If the situation has been cleared, ended, or is no longer occurring, you can mark it as resolved so responders know."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        {isResolved ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus("IN_PROGRESS")}
            disabled={pending}
            className="w-full sm:w-auto justify-center border-brand/40 text-brand hover:bg-brand/5 gap-1.5 font-bold"
          >
            <Refresh className={`h-3.5 w-3.5 ${pending ? "animate-spin" : ""}`} />
            {pending ? "Updating status..." : "Reopen: Still happening"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => handleToggleStatus("RESOLVED")}
            disabled={pending}
            className="w-full sm:w-auto justify-center bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 font-bold shadow-xs"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {pending ? "Updating status..." : "Mark as Ended / No Longer Happening"}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Alert variant={feedback.type === "success" ? "success" : "danger"}>
              <div className="flex items-center gap-2">
                {feedback.type === "success" ? (
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-700" />
                ) : (
                  <WarningTriangle className="h-4 w-4 shrink-0 text-danger" />
                )}
                <span>{feedback.text}</span>
              </div>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
