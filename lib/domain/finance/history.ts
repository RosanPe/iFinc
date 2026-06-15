import { monthStart } from "@/lib/domain/finance/dates";

export type HistoryTransaction = {
  amount: number;
  credit_card_id: string | null;
  kind: "income" | "expense" | "transfer";
  statement_month: string | null;
  status: "pending" | "paid" | "cancelled";
  transaction_date: string;
};

export type HistorySnapshot = {
  accounts_value: number;
  investments_value: number;
  liabilities_value: number;
  snapshot_date: string;
  total_value: number;
};

export type MonthlyHistory = {
  accountsValue: number | null;
  balance: number;
  expenses: number;
  income: number;
  investmentsValue: number | null;
  liabilitiesValue: number | null;
  month: string;
  netWorth: number | null;
  paidExpenses: number;
  pendingExpenses: number;
};

function transactionMonth(transaction: HistoryTransaction) {
  return transaction.credit_card_id && transaction.statement_month
    ? monthStart(transaction.statement_month)
    : monthStart(transaction.transaction_date);
}

export function buildMonthlyHistory(
  transactions: HistoryTransaction[],
  snapshots: HistorySnapshot[],
  current?: { accountsValue: number; investmentsValue: number; liabilitiesValue: number; month: string; netWorth: number },
) {
  const months = new Set<string>();
  transactions.forEach((transaction) => months.add(transactionMonth(transaction)));
  snapshots.forEach((snapshot) => months.add(monthStart(snapshot.snapshot_date)));
  if (current) months.add(monthStart(current.month));

  return [...months].sort().map<MonthlyHistory>((month) => {
    const monthTransactions = transactions.filter((transaction) => transactionMonth(transaction) === month && transaction.status !== "cancelled");
    const income = monthTransactions.filter((transaction) => transaction.kind === "income").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const expenses = monthTransactions.filter((transaction) => transaction.kind === "expense").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const paidExpenses = monthTransactions.filter((transaction) => transaction.kind === "expense" && transaction.status === "paid").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    const snapshot = [...snapshots].filter((item) => monthStart(item.snapshot_date) === month).sort((a, b) => b.snapshot_date.localeCompare(a.snapshot_date))[0];
    const currentPoint = current && monthStart(current.month) === month ? current : null;

    return {
      accountsValue: currentPoint?.accountsValue ?? (snapshot ? Number(snapshot.accounts_value) : null),
      balance: income - expenses,
      expenses,
      income,
      investmentsValue: currentPoint?.investmentsValue ?? (snapshot ? Number(snapshot.investments_value) : null),
      liabilitiesValue: currentPoint?.liabilitiesValue ?? (snapshot ? Number(snapshot.liabilities_value) : null),
      month,
      netWorth: currentPoint?.netWorth ?? (snapshot ? Number(snapshot.total_value) : null),
      paidExpenses,
      pendingExpenses: expenses - paidExpenses,
    };
  });
}

export type HistoryPeriod = "6m" | "1y" | "5y" | "10y" | "all";

export function filterHistoryPeriod(history: MonthlyHistory[], period: HistoryPeriod, referenceMonth: string) {
  if (period === "all") return history;
  const months = period === "6m" ? 6 : period === "1y" ? 12 : period === "5y" ? 60 : 120;
  const [year, month] = monthStart(referenceMonth).split("-").map(Number);
  const start = new Date(year, month - 1 - (months - 1), 1);
  const startValue = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-01`;
  return history.filter((item) => item.month >= startValue);
}

export function monthVariation(history: MonthlyHistory[], selectedMonth: string) {
  const index = history.findIndex((item) => item.month === selectedMonth);
  const current = history[index];
  const previous = index > 0 ? history[index - 1] : null;
  if (!current || current.netWorth === null || previous?.netWorth === null || previous?.netWorth === undefined) return null;
  return { absolute: current.netWorth - previous.netWorth, percentage: previous.netWorth !== 0 ? (current.netWorth - previous.netWorth) / Math.abs(previous.netWorth) : null };
}

export function isRelevantMonth(history: MonthlyHistory[], index: number) {
  const current = history[index];
  const previous = index > 0 ? history[index - 1] : null;
  if (!previous) return false;
  const expenseChange = previous.expenses > 0 ? Math.abs(current.expenses - previous.expenses) / previous.expenses : current.expenses > 0 ? 1 : 0;
  const balanceSignChanged = (current.balance < 0) !== (previous.balance < 0);
  return expenseChange >= 0.3 || balanceSignChanged;
}
