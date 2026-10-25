import type { IncidentType, ReportStatus, Urgency } from "@/types";

// Human-readable labels. API and database values stay as the exact enum identifiers.

type Option<T extends string> = { value: T; label: string; description: string };

export const INCIDENT_TYPE_OPTIONS: Option<IncidentType>[] = [
  { value: "SAFETY", label: "General safety concern", description: "Unsafe conditions or behaviour that could put people at risk." },
  { value: "THEFT", label: "Theft or robbery", description: "Stolen property, break-ins, or robbery." },
  { value: "HARASSMENT", label: "Harassment or abuse", description: "Threats, intimidation, bullying, or other unwanted conduct." },
  { value: "MEDICAL", label: "Medical", description: "An injury or illness that needs attention." },
  { value: "FIRE", label: "Fire or smoke", description: "Fire, smoke, or a burning smell." },
  { value: "SUSPICIOUS_ACTIVITY", label: "Suspicious activity", description: "People or behaviour that seem out of place and worry you." },
  { value: "FACILITY", label: "Facility or hazard", description: "Broken lights, exposed wires, flooding, or damaged buildings." },
  { value: "OTHER", label: "Other", description: "Anything that doesn't fit the options above." },
];

export const URGENCY_OPTIONS: Option<Urgency>[] = [
  { value: "LOW", label: "Low", description: "No one is at risk right now. It can be looked at later." },
  { value: "MEDIUM", label: "Medium", description: "Needs attention soon, but not immediately." },
  { value: "HIGH", label: "High", description: "Someone could be hurt or property lost if it isn't handled quickly." },
  { value: "CRITICAL", label: "Critical", description: "People are in danger now. Call for help first, then report." },
];

export const INCIDENT_TYPE_LABELS = Object.fromEntries(
  INCIDENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
) as Record<IncidentType, string>;

export const URGENCY_LABELS = Object.fromEntries(
  URGENCY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<Urgency, string>;

export const STATUS_LABELS: Record<ReportStatus, string> = {
  RECEIVED: "Received",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
};

export const STATUS_ORDER: ReportStatus[] = ["RECEIVED", "IN_PROGRESS", "RESOLVED"];
