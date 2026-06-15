"use client";

import { ArrowDownRight, ArrowUpRight, Clock3, LoaderCircle, PiggyBank, Plus, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, MonthInput, SectionCard } from "@/components/finance/finance-shared";
import { MetricCard } from "@/components/dashboard/metric-card";
import { DataError, OfflineNotice } from "@/components/shared/data-status";
import { Button } from "@/components/ui/button";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { monthStart } from "@/lib/domain/finance/dates";
import { accountBalance, summarizeMonth } from "@/lib/domain/finance/transactions";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { listAccounts, type Account } from "@/lib/repositories/accounts-repository";
import { listCreditCards, type CreditCard } from "@/lib/repositories/credit-cards-repository";
import { listAllTransactions, listTransactions, type Transaction } from "@/lib/repositories/transactions-repository";

export function FinanceOverview({ onAdd }: { onAdd: () => void }) {
  const online = useOnlineStatus();
  const [month, setMonth] = useState(monthStart(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<"income" | "expenses" | "balance" | "accounts" | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let active = true;
    void Promise.all([listTransactions({ month }), listAllTransactions(), listAccounts(), listCreditCards()])
      .then(([monthTransactions, everyTransaction, nextAccounts, nextCards]) => {
        if (!active) return;
        setTransactions(monthTransactions);
        setAllTransactions(everyTransaction);
        setAccounts(nextAccounts);
        setCards(nextCards);
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o resumo financeiro."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month, refresh]);

  const summary = useMemo(() => summarizeMonth(transactions), [transactions]);
  const totalBalance = useMemo(
    () => {
      const cardAccounts = Object.fromEntries(cards.map((card) => [card.id, card.account_id]));
      return accounts.filter((account) => account.include_in_net_worth).reduce((total, account) => total + accountBalance(account, allTransactions, cardAccounts), 0);
    },
    [accounts, allTransactions, cards],
  );
  const detailTransactions = detail === "income" ? transactions.filter((item) => item.kind === "income") : detail === "expenses" ? transactions.filter((item) => item.kind === "expense") : transactions;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Controle financeiro</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Resumo mensal</h1></div><div className="flex gap-2"><div className="w-40"><MonthInput id="overview-month" value={month} onChange={(value) => { setError(null); setLoading(true); setMonth(value); }} /></div><Button onClick={onAdd}><Plus />Lançar</Button></div></header>
      {!online ? <OfflineNotice /> : null}
      {error ? <DataError message={error} onRetry={() => { setError(null); setLoading(true); setRefresh((value) => value + 1); }} /> : null}
      {loading ? <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />Calculando...</div> : <>
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Receitas" value={formatCurrency(summary.income)} helper="No mês selecionado" icon={ArrowUpRight} tone="positive" selected={detail === "income"} onClick={() => setDetail("income")} />
          <MetricCard label="Despesas" value={formatCurrency(summary.expenses)} helper={`${formatCurrency(summary.pendingExpenses)} pendente`} icon={ArrowDownRight} selected={detail === "expenses"} onClick={() => setDetail("expenses")} />
          <MetricCard label="Saldo mensal" value={formatCurrency(summary.balance)} helper={`${formatPercent(summary.savingsRate)} de poupança`} icon={PiggyBank} tone={summary.balance >= 0 ? "positive" : "default"} selected={detail === "balance"} onClick={() => setDetail("balance")} />
          <MetricCard label="Saldo em contas" value={formatCurrency(totalBalance)} helper={`${accounts.filter((item) => item.is_active).length} contas ativas`} icon={Wallet} selected={detail === "accounts"} onClick={() => setDetail("accounts")} />
        </section>
        {detail ? <SectionCard title={detail === "income" ? "Receitas do mês" : detail === "expenses" ? "Despesas do mês" : detail === "balance" ? "Composição do saldo mensal" : "Saldos por conta"}>{detail === "accounts" ? <div className="space-y-2">{accounts.filter((item) => item.include_in_net_worth).map((account) => { const cardAccounts = Object.fromEntries(cards.map((card) => [card.id, card.account_id])); return <div key={account.id} className="flex justify-between rounded-xl border p-3 text-sm"><span>{account.name}</span><strong>{formatCurrency(accountBalance(account, allTransactions, cardAccounts))}</strong></div>; })}</div> : detailTransactions.length ? <div className="space-y-2">{detailTransactions.map((transaction) => <div key={transaction.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description}</p><p className="text-xs text-muted-foreground">{transaction.status === "paid" ? "Pago" : "Pendente"}</p></div><strong>{transaction.kind === "income" ? "+" : transaction.kind === "expense" ? "-" : ""}{formatCurrency(Number(transaction.amount))}</strong></div>)}</div> : <EmptyState>Sem dados para este detalhe.</EmptyState>}</SectionCard> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard title="Situação do mês" description="Despesas pagas e ainda pendentes."><div className="space-y-4"><ProgressRow label="Pagas" value={summary.paidExpenses} total={summary.expenses} color="bg-emerald-500" /><ProgressRow label="Pendentes" value={summary.pendingExpenses} total={summary.expenses} color="bg-amber-500" /></div></SectionCard>
          <SectionCard title="Últimos lançamentos">{transactions.length ? <div className="space-y-3">{transactions.slice(0, 5).map((transaction) => <div key={transaction.id} className="flex items-center gap-3"><span className="rounded-xl bg-muted p-2"><Clock3 className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{transaction.description}</p><p className="text-xs text-muted-foreground">{transaction.status === "paid" ? "Pago" : "Pendente"}</p></div><strong className="text-sm">{formatCurrency(Number(transaction.amount))}</strong></div>)}</div> : <EmptyState>Sem movimentações no mês.</EmptyState>}</SectionCard>
        </div>
      </>}
    </div>
  );
}

function ProgressRow({ color, label, total, value }: { color: string; label: string; total: number; value: number }) {
  const width = total > 0 ? Math.min(100, value / total * 100) : 0;
  return <div><div className="mb-2 flex justify-between text-sm"><span>{label}</span><strong>{formatCurrency(value)}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full ${color}`} style={{ width: `${width}%` }} /></div></div>;
}
