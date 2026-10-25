import type { AdminActionError } from "@/types";

export const ADMIN_ERROR_MESSAGES: Record<AdminActionError, string> = {
  UNAUTHENTICATED: "Your session has ended. Sign in again to continue.",
  FORBIDDEN: "Your account doesn't have permission to do this.",
  VALIDATION_ERROR: "Check the details and try again.",
  NOT_FOUND: "This report no longer exists.",
  INVALID_TRANSITION: "That status change isn't allowed from the current status.",
  CONFLICT: "Someone else changed this report's status. The page has the latest status; try again if needed.",
  INTERNAL_ERROR: "Something went wrong on our side. Try again in a moment.",
};

export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
