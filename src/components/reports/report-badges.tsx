import { Badge, type BadgeProps } from "@/components/ui/badge";
import { STATUS_LABELS, URGENCY_LABELS } from "@/features/reports/labels";
import type { ReportStatus, Urgency } from "@/types";

const STATUS_VARIANTS: Record<ReportStatus, BadgeProps["variant"]> = {
  RECEIVED: "received",
  IN_PROGRESS: "inProgress",
  RESOLVED: "resolved",
};

const URGENCY_VARIANTS: Record<Urgency, BadgeProps["variant"]> = {
  LOW: "urgencyLow",
  MEDIUM: "urgencyMedium",
  HIGH: "urgencyHigh",
  CRITICAL: "urgencyCritical",
};

// Text labels always accompany the colour, so meaning doesn't rely on colour alone.

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      <span className="sr-only">Status: </span>
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  return (
    <Badge variant={URGENCY_VARIANTS[urgency]}>
      <span className="sr-only">Urgency: </span>
      {URGENCY_LABELS[urgency]}
      <span aria-hidden="true">&nbsp;urgency</span>
    </Badge>
  );
}
