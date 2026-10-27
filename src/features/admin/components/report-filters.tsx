import Form from "next/form";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  INCIDENT_TYPE_OPTIONS,
  STATUS_LABELS,
  STATUS_ORDER,
  URGENCY_OPTIONS,
} from "@/features/reports/labels";
import type { ReportFilters as Filters } from "@/lib/validation/admin";

/** GET form, so filters work without JavaScript and the URL can be shared. */
export function ReportFilters({ filters }: { filters: Filters }) {
  return (
    <Form
      action="/admin/reports"
      className="grid gap-3 rounded-lg border border-border bg-white p-4 sm:grid-cols-2 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto] lg:items-end"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-status">Status</Label>
        <Select id="filter-status" name="status" defaultValue={filters.status ?? ""}>
          <option value="">All statuses</option>
          {STATUS_ORDER.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-urgency">Urgency</Label>
        <Select id="filter-urgency" name="urgency" defaultValue={filters.urgency ?? ""}>
          <option value="">All urgencies</option>
          {URGENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="filter-type">Incident type</Label>
        <Select id="filter-type" name="type" defaultValue={filters.type ?? ""}>
          <option value="">All types</option>
          {INCIDENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Apply</Button>
        <Link href="/admin/reports" className={buttonVariants({ variant: "outline" })}>
          Clear
        </Link>
      </div>
    </Form>
  );
}
