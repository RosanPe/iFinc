import { describe, expect, it } from "vitest";

import { calculateNetWorth, pendingCardLiabilities } from "@/lib/domain/investments/net-worth";

describe("net worth", () => {
  it("consolidates accounts, investments and liabilities", () => {
    expect(calculateNetWorth({ accountsValue: 5000, investmentsValue: 3000, liabilitiesValue: 700 })).toBe(7300);
  });

  it("counts only pending credit card expenses as liabilities", () => {
    expect(pendingCardLiabilities([
      { amount: 300, credit_card_id: "card", kind: "expense", status: "pending" },
      { amount: 100, credit_card_id: "card", kind: "expense", status: "paid" },
      { amount: 50, credit_card_id: null, kind: "expense", status: "pending" },
    ])).toBe(300);
  });
});
