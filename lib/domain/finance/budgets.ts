import type { TableRow } from "@/types/database.types";

export function budgetProgress(
  budget: TableRow<"budgets">,
  transactions: TableRow<"transactions">[],
) {
  const spent = transactions
    .filter((transaction) =>
      transaction.kind === "expense" &&
      transaction.status !== "cancelled" &&
      transaction.category_id === budget.category_id,
    )
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const percentage = Number(budget.amount) > 0 ? spent / Number(budget.amount) : 0;
  return { percentage, remaining: Number(budget.amount) - spent, spent };
}
