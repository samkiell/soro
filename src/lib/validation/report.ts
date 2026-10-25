import { z } from "zod";
import { IncidentType, Urgency } from "@/generated/prisma/enums";
import { PHOTO_KEY_PATTERN } from "@/lib/storage/keys";

export const REPORT_LIMITS = {
  title: { min: 5, max: 120 },
  description: { min: 10, max: 4000 },
  location: { min: 3, max: 200 },
} as const;

/** Fields the student fills in. The photo is uploaded separately (see /api/uploads). */
export const reportFieldsSchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(
      REPORT_LIMITS.title.min,
      `Give a short summary of at least ${REPORT_LIMITS.title.min} characters.`,
    )
    .max(
      REPORT_LIMITS.title.max,
      `Keep the title to ${REPORT_LIMITS.title.max} characters or fewer.`,
    ),
  description: z
    .string()
    .trim()
    .min(
      REPORT_LIMITS.description.min,
      `Describe what happened in at least ${REPORT_LIMITS.description.min} characters.`,
    )
    .max(
      REPORT_LIMITS.description.max,
      `Keep the description to ${REPORT_LIMITS.description.max} characters or fewer.`,
    ),
  location: z
    .string()
    .trim()
    .min(
      REPORT_LIMITS.location.min,
      "Say where it happened, as specifically as you can.",
    )
    .max(
      REPORT_LIMITS.location.max,
      `Keep the location to ${REPORT_LIMITS.location.max} characters or fewer.`,
    ),
  incidentType: z.enum(IncidentType, "Choose an incident type."),
  urgency: z.enum(Urgency, "Choose how urgent this is."),
  isAnonymous: z.boolean(),
});

/**
 * Server-side schema for createReport. Strict, so client-supplied reporterId,
 * status, IDs, or timestamps are rejected rather than silently ignored.
 */
export const createReportSchema = reportFieldsSchema.extend({
  photoKey: z
    .string()
    .regex(PHOTO_KEY_PATTERN, "Photo reference is invalid.")
    .optional(),
});

export type ReportFieldsInput = z.input<typeof reportFieldsSchema>;
export type ReportFields = z.output<typeof reportFieldsSchema>;
export type ValidCreateReportInput = z.output<typeof createReportSchema>;
