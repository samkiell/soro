"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/permissions";
import type { AddNoteInput, UpdateStatusInput } from "@/lib/validation/admin";
import {
  addReportNote,
  updateReportStatus,
} from "@/server/services/admin-report-service";
import type { AdminActionResult } from "@/types";

// Each action re-checks the session and admin role; the services check the role again.

export async function changeReportStatus(
  input: UpdateStatusInput,
): Promise<AdminActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "UNAUTHENTICATED" };

  const result = await updateReportStatus(user, input);
  if (result.success) refresh();
  return result;
}

export async function createReportNote(
  input: AddNoteInput,
): Promise<AdminActionResult> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "UNAUTHENTICATED" };

  const result = await addReportNote(user, input);
  if (result.success) refresh();
  return result;
}
