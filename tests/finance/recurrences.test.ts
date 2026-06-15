import { describe, expect, it } from "vitest";

import { recurrenceDates } from "@/lib/domain/finance/recurrences";

describe("recurrences", () => {
  it("generates occurrences through a limit and returns the next date", () => {
    expect(recurrenceDates("2026-01-31", "monthly", "2026-04-30")).toEqual({
      dates: ["2026-01-31", "2026-02-28", "2026-03-28", "2026-04-28"],
      nextRunDate: "2026-05-28",
    });
  });

  it("respects the recurrence end date", () => {
    expect(recurrenceDates("2026-06-01", "weekly", "2026-07-31", "2026-06-15").dates).toEqual([
      "2026-06-01", "2026-06-08", "2026-06-15",
    ]);
  });
});
