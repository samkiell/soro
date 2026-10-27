import type { z } from "zod";

/** Field errors keyed by field name, matching the contract's `fieldErrors` shape. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return fieldErrors;
}
