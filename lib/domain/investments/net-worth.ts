export type NetWorthInput = {
  accountsValue: number;
  investmentsValue: number;
  liabilitiesValue: number;
};

export function calculateNetWorth(input: NetWorthInput) {
  return input.accountsValue + input.investmentsValue - input.liabilitiesValue;
}

export function pendingCardLiabilities(transactions: { amount: number; credit_card_id: string | null; kind: string; status: string }[]) {
  return transactions
    .filter((transaction) => transaction.kind === "expense" && transaction.credit_card_id && transaction.status === "pending")
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
}
