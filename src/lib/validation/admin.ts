import { z } from "zod";
import { IncidentType, ReportStatus, Urgency } from "@/generated/prisma/enums";

export const NOTE_MAX_LENGTH = 2000;

const reportId = z.cuid("Report not found.");

export const updateStatusSchema = z.strictObject({
  reportId,
  status: z.enum(ReportStatus, "Choose a valid status."),
});

export const addNoteSchema = z.strictObject({
  reportId,
  body: z
    .string()
    .trim()
    .min(1, "Write a note before saving.")
    .max(NOTE_MAX_LENGTH, `Keep notes to ${NOTE_MAX_LENGTH} characters or fewer.`),
});

/** Parses admin list filters from URL search params. Invalid values are dropped. */
export const reportFiltersSchema = z.object({
  status: z.enum(ReportStatus).optional().catch(undefined),
  urgency: z.enum(Urgency).optional().catch(undefined),
  type: z.enum(IncidentType).optional().catch(undefined),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

export type UpdateStatusInput = z.input<typeof updateStatusSchema>;
export type AddNoteInput = z.input<typeof addNoteSchema>;
export type ReportFilters = z.output<typeof reportFiltersSchema>;
