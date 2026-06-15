import { describe, expect, it } from "vitest";

import { budgetProgress } from "@/lib/domain/finance/budgets";
import type { TableRow } from "@/types/database.types";

describe("budgets", () => {
  it("counts only active expenses from the selected category", () => {
    const budget = { amount: 500, category_id: "food" } as TableRow<"budgets">;
    const transactions = [
      { amount: 200, category_id: "food", kind: "expense", status: "paid" },
      { amount: 100, category_id: "food", kind: "expense", status: "pending" },
      { amount: 80, category_id: "other", kind: "expense", status: "paid" },
      { amount: 90, category_id: "food", kind: "expense", status: "cancelled" },
    ] as TableRow<"transactions">[];
    expect(budgetProgress(budget, transactions)).toEqual({ spent: 300, remaining: 200, percentage: 0.6 });
  });
});
