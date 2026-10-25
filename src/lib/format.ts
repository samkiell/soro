// Fixed time zone so server-rendered and client-rendered dates match.
const dateTimeFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Africa/Lagos",
});

const dateFormat = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeZone: "Africa/Lagos",
});

export function formatDateTime(value: Date | string): string {
  return dateTimeFormat.format(new Date(value));
}

export function formatDate(value: Date | string): string {
  return dateFormat.format(new Date(value));
}

/** Short, human-friendly reference for a report ID. */
export function reportReference(id: string): string {
  return id.slice(-8).toUpperCase();
}
