import { describe, expect, it } from "vitest";

import { accountBalance, buildTransactionRows, splitAmount, summarizeMonth, type TransactionDraft } from "@/lib/domain/finance/transactions";
import type { TableRow } from "@/types/database.types";

const baseDraft: TransactionDraft = {
  accountId: null,
  amount: 100,
  categoryId: "category",
  creditCardId: "card",
  description: "Compra",
  destinationAccountId: null,
  dueDate: null,
  installmentCount: 3,
  kind: "expense",
  merchant: "Loja",
  notes: null,
  status: "paid",
  transactionDate: "2026-06-20",
};

function transaction(input: Partial<TableRow<"transactions">>): TableRow<"transactions"> {
  return {
    account_id: null, amount: 0, category_id: null, created_at: "", credit_card_id: null,
    description: "", destination_account_id: null, due_date: null, entry_source: "manual", id: "id",
    installment_count: null, installment_group_id: null, installment_number: null, kind: "expense",
    merchant: null, notes: null, recurrence_date: null, recurring_transaction_id: null,
    statement_month: null, status: "paid", transaction_date: "2026-06-01", updated_at: "", user_id: "user",
    ...input,
  };
}

describe("transactions", () => {
  it("splits cents without losing the total", () => {
    expect(splitAmount(100, 3)).toEqual([33.34, 33.33, 33.33]);
    expect(splitAmount(100, 3).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100);
  });

  it("materializes installments in consecutive invoice months", () => {
    const rows = buildTransactionRows(baseDraft, { closingDay: 25, dueDay: 5 });
    expect(rows.map((row) => row.statement_month)).toEqual(["2026-07-01", "2026-08-01", "2026-09-01"]);
    expect(rows.map((row) => row.due_date)).toEqual(["2026-07-05", "2026-08-05", "2026-09-05"]);
    expect(rows.map((row) => row.installment_number)).toEqual([1, 2, 3]);
  });

  it("summarizes income, expenses, pending values and savings", () => {
    const summary = summarizeMonth([
      transaction({ amount: 5000, kind: "income" }),
      transaction({ amount: 1200, kind: "expense", status: "paid" }),
      transaction({ amount: 300, kind: "expense", status: "pending" }),
      transaction({ amount: 900, kind: "expense", status: "cancelled" }),
    ]);
    expect(summary).toMatchObject({ income: 5000, expenses: 1500, paidExpenses: 1200, pendingExpenses: 300, balance: 3500 });
    expect(summary.savingsRate).toBe(0.7);
  });

  it("derives account balance including transfers", () => {
    const items = [
      transaction({ account_id: "a", amount: 100, kind: "income" }),
      transaction({ account_id: "a", amount: 30, kind: "expense" }),
      transaction({ account_id: "a", destination_account_id: "b", amount: 20, kind: "transfer" }),
      transaction({ account_id: "b", destination_account_id: "a", amount: 10, kind: "transfer" }),
    ];
    expect(accountBalance({ id: "a", opening_balance: 50 }, items)).toBe(110);
  });

  it("deducts paid card expenses from the linked payment account", () => {
    const items = [transaction({ amount: 250, credit_card_id: "card", kind: "expense", status: "paid" })];
    expect(accountBalance({ id: "a", opening_balance: 1000 }, items, { card: "a" })).toBe(750);
  });
});
