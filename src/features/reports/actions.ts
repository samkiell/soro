"use server";

import { getCurrentUser } from "@/lib/permissions";
import { toFieldErrors } from "@/lib/validation";
import { createReportSchema } from "@/lib/validation/report";
import { createReportForUser } from "@/server/services/report-service";
import type { CreateReportInput, CreateReportResult } from "@/types";

/** Locked contract: see docs/REPORT_API_CONTRACT.md. */
export async function createReport(
  input: CreateReportInput,
): Promise<CreateReportResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "UNAUTHENTICATED" };

    const parsed = createReportSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    return await createReportForUser(user, parsed.data);
  } catch (error) {
    console.error("[reports] createReport failed", (error as Error).name);
    return { success: false, error: "INTERNAL_ERROR" };
  }
}
