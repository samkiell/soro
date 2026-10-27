// Shared, client-safe types. Report types follow docs/REPORT_API_CONTRACT.md exactly.
import type {
  IncidentType,
  ReportStatus,
  Role,
  Urgency,
} from "@/generated/prisma/enums";

export type { IncidentType, ReportStatus, Role, Urgency };

export type CreateReportInput = {
  title: string;
  description: string;
  location: string;
  incidentType: IncidentType;
  urgency: Urgency;
  isAnonymous: boolean;
  photoKey?: string;
};

export type CreateReportError =
  | "UNAUTHENTICATED"
  | "VALIDATION_ERROR"
  | "UPLOAD_NOT_FOUND"
  | "FORBIDDEN"
  | "INTERNAL_ERROR";

export type CreateReportResult =
  | {
      success: true;
      report: { id: string; status: ReportStatus; createdAt: string };
    }
  | {
      success: false;
      error: CreateReportError;
      fieldErrors?: Record<string, string[]>;
    };

export type UploadPhotoError =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "INVALID_REQUEST"
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_FILE_TYPE"
  | "STORAGE_UNAVAILABLE"
  | "UPLOAD_FAILED";

export type UploadPhotoResult =
  | { success: true; photoKey: string }
  | { success: false; error: UploadPhotoError };

export type ActionFailure<TError extends string> = {
  success: false;
  error: TError;
  fieldErrors?: Record<string, string[]>;
};

export type AuthActionResult =
  | { success: true; redirectTo: string }
  | ActionFailure<
      | "VALIDATION_ERROR"
      | "INVALID_CREDENTIALS"
      | "ACCOUNT_UNAVAILABLE"
      | "INTERNAL_ERROR"
    >;

export type AdminActionError =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "CONFLICT"
  | "INTERNAL_ERROR";

export type AdminActionResult = { success: true } | ActionFailure<AdminActionError>;
