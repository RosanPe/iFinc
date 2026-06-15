export function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthStart(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return toDateString(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function monthEnd(value: string | Date) {
  const date = typeof value === "string" ? parseDate(value) : value;
  return toDateString(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function addMonths(value: string, months: number, preferredDay?: number) {
  const date = parseDate(value);
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(preferredDay ?? date.getDate(), lastDay));
  return toDateString(target);
}

export function addFrequency(value: string, frequency: "weekly" | "monthly" | "yearly") {
  const date = parseDate(value);
  if (frequency === "weekly") {
    date.setDate(date.getDate() + 7);
    return toDateString(date);
  }
  return addMonths(value, frequency === "monthly" ? 1 : 12);
}

export function statementMonth(transactionDate: string, closingDay: number, dueDay: number) {
  const date = parseDate(transactionDate);
  const nextClosingCycle = date.getDate() > closingDay ? 1 : 0;
  const dueAfterClosing = dueDay <= closingDay ? 1 : 0;
  const offset = nextClosingCycle + dueAfterClosing;
  return monthStart(addMonths(transactionDate, offset));
}

export function invoiceDueDate(statement: string, dueDay: number) {
  return addMonths(statement, 0, dueDay);
}

export function currentDateString() {
  return toDateString(new Date());
}
