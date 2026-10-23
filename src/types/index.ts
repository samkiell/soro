export type Role = "USER" | "ADMIN";

export type ReportUrgency = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ReportStatus = "RECEIVED" | "IN_PROGRESS" | "RESOLVED";

export type IncidentCategory =
  | "THEFT"
  | "HARASSMENT"
  | "PHYSICAL_ASSAULT"
  | "HAZARD"
  | "MEDICAL_EMERGENCY"
  | "OTHER";

export interface UserSummary {
  id: string;
  name: string | null;
  email: string;
  role: Role;
}

export interface ReportItem {
  id: string;
  title: string;
  description: string;
  category: IncidentCategory;
  urgency: ReportUrgency;
  status: ReportStatus;
  location: string;
  isAnonymous: boolean;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}
