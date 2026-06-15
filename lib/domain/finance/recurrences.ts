import { addFrequency } from "@/lib/domain/finance/dates";

export function recurrenceDates(
  nextRunDate: string,
  frequency: "weekly" | "monthly" | "yearly",
  throughDate: string,
  endDate?: string | null,
) {
  const dates: string[] = [];
  let cursor = nextRunDate;

  while (cursor <= throughDate && (!endDate || cursor <= endDate)) {
    dates.push(cursor);
    cursor = addFrequency(cursor, frequency);
  }

  return { dates, nextRunDate: cursor };
}
