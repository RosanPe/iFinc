import { describe, expect, it } from "vitest";

import { buildMonthlyHistory, filterHistoryPeriod, isRelevantMonth, monthVariation, type HistoryTransaction } from "@/lib/domain/finance/history";

function transaction(input: Partial<HistoryTransaction> = {}): HistoryTransaction {
  return { amount: 100, credit_card_id: null, kind: "expense", statement_month: null, status: "paid", transaction_date: "2026-01-10", ...input };
}

describe("monthly financial history", () => {
  it("groups card expenses by statement month and summarizes status", () => {
    const history = buildMonthlyHistory([
      transaction({ kind: "income", amount: 1000 }),
      transaction({ credit_card_id: "card", statement_month: "2026-02-01", amount: 300, status: "pending" }),
    ], []);
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ month: "2026-01-01", income: 1000, balance: 1000 });
    expect(history[1]).toMatchObject({ month: "2026-02-01", expenses: 300, pendingExpenses: 300 });
  });

  it("uses the latest snapshot in a month and current values for current month", () => {
    const history = buildMonthlyHistory([], [
      { accounts_value: 100, investments_value: 50, liabilities_value: 10, snapshot_date: "2026-01-01", total_value: 140 },
      { accounts_value: 120, investments_value: 60, liabilities_value: 10, snapshot_date: "2026-01-31", total_value: 170 },
    ], { accountsValue: 200, investmentsValue: 100, liabilitiesValue: 20, month: "2026-02-01", netWorth: 280 });
    expect(history[0].netWorth).toBe(170);
    expect(history[1].netWorth).toBe(280);
    expect(monthVariation(history, "2026-02-01")).toEqual({ absolute: 110, percentage: 110 / 170 });
  });

  it("filters periods and identifies relevant changes", () => {
    const history = buildMonthlyHistory([
      transaction({ amount: 100, transaction_date: "2025-01-10" }),
      transaction({ amount: 200, transaction_date: "2026-01-10" }),
      transaction({ amount: 400, transaction_date: "2026-02-10" }),
    ], []);
    expect(filterHistoryPeriod(history, "1y", "2026-02-01").map((item) => item.month)).toEqual(["2026-01-01", "2026-02-01"]);
    expect(isRelevantMonth(history, 2)).toBe(true);
  });
});
