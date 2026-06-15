import { addMonths, invoiceDueDate, statementMonth } from "@/lib/domain/finance/dates";
import type { TableInsert, TableRow } from "@/types/database.types";

export type Transaction = TableRow<"transactions">;
export type TransactionKind = "income" | "expense" | "transfer";

export type TransactionDraft = {
  accountId: string | null;
  amount: number;
  categoryId: string | null;
  creditCardId: string | null;
  description: string;
  destinationAccountId: string | null;
  dueDate: string | null;
  installmentCount: number;
  kind: TransactionKind;
  merchant: string | null;
  notes: string | null;
  status: "pending" | "paid";
  transactionDate: string;
};

export type CardCycle = { closingDay: number; dueDay: number };

export function splitAmount(amount: number, count: number) {
  const cents = Math.round(amount * 100);
  const base = Math.floor(cents / count);
  const remainder = cents - base * count;
  return Array.from({ length: count }, (_, index) => (base + (index < remainder ? 1 : 0)) / 100);
}

export function buildTransactionRows(draft: TransactionDraft, card?: CardCycle) {
  const count = draft.kind === "expense" ? Math.max(1, draft.installmentCount) : 1;
  const groupId = count > 1 ? crypto.randomUUID() : null;
  const amounts = splitAmount(draft.amount, count);

  return amounts.map<TableInsert<"transactions">>((amount, index) => {
    const cardStatement = draft.creditCardId && card
      ? addMonths(statementMonth(draft.transactionDate, card.closingDay, card.dueDay), index)
      : null;

    return {
      account_id: draft.accountId,
      amount,
      category_id: draft.kind === "transfer" ? null : draft.categoryId,
      credit_card_id: draft.creditCardId,
      description: count > 1
        ? `${draft.description} (${index + 1}/${count})`
        : draft.description,
      destination_account_id: draft.destinationAccountId,
      due_date: cardStatement && card
        ? invoiceDueDate(cardStatement, card.dueDay)
        : draft.dueDate,
      entry_source: "manual",
      installment_count: groupId ? count : null,
      installment_group_id: groupId,
      installment_number: groupId ? index + 1 : null,
      kind: draft.kind,
      merchant: draft.merchant,
      notes: draft.notes,
      statement_month: cardStatement,
      status: draft.creditCardId ? "pending" : draft.status,
      transaction_date: draft.transactionDate,
    };
  });
}

export function summarizeMonth(transactions: Transaction[]) {
  const active = transactions.filter((transaction) => transaction.status !== "cancelled");
  const income = active
    .filter((transaction) => transaction.kind === "income")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const expenses = active
    .filter((transaction) => transaction.kind === "expense")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const paidExpenses = active
    .filter((transaction) => transaction.kind === "expense" && transaction.status === "paid")
    .reduce((total, transaction) => total + Number(transaction.amount), 0);
  const pendingExpenses = expenses - paidExpenses;
  const balance = income - expenses;

  return {
    balance,
    expenses,
    income,
    paidExpenses,
    pendingExpenses,
    savingsRate: income > 0 ? balance / income : 0,
  };
}

export function accountBalance(
  account: { id: string; opening_balance: number },
  transactions: Transaction[],
  cardAccountById: Record<string, string | null> = {},
) {
  return transactions.reduce((balance, transaction) => {
    if (transaction.status !== "paid") return balance;
    if (
      transaction.kind === "expense" &&
      transaction.credit_card_id &&
      cardAccountById[transaction.credit_card_id] === account.id
    ) return balance - Number(transaction.amount);
    if (transaction.credit_card_id) return balance;
    if (transaction.kind === "income" && transaction.account_id === account.id) return balance + Number(transaction.amount);
    if (transaction.kind === "expense" && transaction.account_id === account.id) return balance - Number(transaction.amount);
    if (transaction.kind === "transfer" && transaction.account_id === account.id) return balance - Number(transaction.amount);
    if (transaction.kind === "transfer" && transaction.destination_account_id === account.id) return balance + Number(transaction.amount);
    return balance;
  }, Number(account.opening_balance));
}
