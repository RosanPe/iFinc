import { describe, expect, it } from "vitest";

import { addFrequency, addMonths, invoiceDueDate, statementMonth } from "@/lib/domain/finance/dates";

describe("finance dates", () => {
  it("clamps month additions to the last valid day", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
  });

  it("moves a card invoice to the real due month", () => {
    expect(statementMonth("2026-06-20", 25, 5)).toBe("2026-07-01");
    expect(statementMonth("2026-06-26", 25, 5)).toBe("2026-08-01");
    expect(invoiceDueDate("2026-07-01", 5)).toBe("2026-07-05");
  });

  it("advances weekly, monthly and yearly recurrences", () => {
    expect(addFrequency("2026-06-14", "weekly")).toBe("2026-06-21");
    expect(addFrequency("2026-01-31", "monthly")).toBe("2026-02-28");
    expect(addFrequency("2024-02-29", "yearly")).toBe("2025-02-28");
  });
});
