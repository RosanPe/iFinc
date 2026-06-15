"use client";

import { ArrowDownRight, ArrowUpRight, Landmark, LoaderCircle, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { FinancialHistoryChart } from "@/components/charts/financial-history-chart";
import { MetricCard } from "@/components/dashboard/metric-card";
import { type DetailKind, MonthConsolidation } from "@/components/dashboard/month-consolidation";
import { DataError, OfflineNotice } from "@/components/shared/data-status";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { monthStart } from "@/lib/domain/finance/dates";
import { buildMonthlyHistory, filterHistoryPeriod, type HistoryPeriod } from "@/lib/domain/finance/history";
import { accountBalance, summarizeMonth } from "@/lib/domain/finance/transactions";
import { calculateNetWorth, pendingCardLiabilities } from "@/lib/domain/investments/net-worth";
import { calculatePositions, positionMarketValue } from "@/lib/domain/investments/positions";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { listAccounts, type Account } from "@/lib/repositories/accounts-repository";
import { listAssets, type Asset } from "@/lib/repositories/assets-repository";
import { listCreditCards, type CreditCard } from "@/lib/repositories/credit-cards-repository";
import { listInvestmentOperations, type InvestmentOperation } from "@/lib/repositories/investment-operations-repository";
import { listNetWorthSnapshots, type NetWorthSnapshot } from "@/lib/repositories/net-worth-snapshots-repository";
import { listAllTransactions, type Transaction } from "@/lib/repositories/transactions-repository";

type DashboardData = { accounts: Account[]; assets: Asset[]; cards: CreditCard[]; operations: InvestmentOperation[]; snapshots: NetWorthSnapshot[]; transactions: Transaction[] };
const emptyData: DashboardData = { accounts: [], assets: [], cards: [], operations: [], snapshots: [], transactions: [] };
const periods: { id: HistoryPeriod; label: string }[] = [{ id: "6m", label: "6M" }, { id: "1y", label: "1A" }, { id: "5y", label: "5A" }, { id: "10y", label: "10A" }, { id: "all", label: "Tudo" }];

async function fetchDashboardData(): Promise<DashboardData> {
  const [transactions, accounts, cards, assets, operations, snapshots] = await Promise.all([listAllTransactions(), listAccounts(), listCreditCards(), listAssets(), listInvestmentOperations(), listNetWorthSnapshots()]);
  return { accounts, assets, cards, operations, snapshots, transactions };
}

export function DashboardOverview() {
  const { user } = useAuth(); const online = useOnlineStatus();
  const [data, setData] = useState<DashboardData>(emptyData); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<HistoryPeriod>("1y"); const currentMonth = monthStart(new Date()); const [selectedMonth, setSelectedMonth] = useState(currentMonth); const [detail, setDetail] = useState<DetailKind>("all"); const [showConsolidation, setShowConsolidation] = useState(false);
  const displayName = typeof user?.user_metadata.display_name === "string" ? user.user_metadata.display_name.split(" ")[0] : null;
  const load = useCallback(async () => { setLoading(true); setError(null); try { setData(await fetchDashboardData()); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o painel."); } finally { setLoading(false); } }, []);

  useEffect(() => { let active = true; void fetchDashboardData().then((result) => { if (active) setData(result); }).catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar o painel."); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  const monthlyTransactions = useMemo(() => data.transactions.filter((transaction) => { const transactionMonth = transaction.credit_card_id && transaction.statement_month ? transaction.statement_month : `${transaction.transaction_date.slice(0, 7)}-01`; return transactionMonth === currentMonth; }), [currentMonth, data.transactions]);
  const summary = useMemo(() => summarizeMonth(monthlyTransactions), [monthlyTransactions]);
  const accountsBalance = useMemo(() => { const cardAccounts = Object.fromEntries(data.cards.map((card) => [card.id, card.account_id])); return data.accounts.filter((account) => account.include_in_net_worth).reduce((total, account) => total + accountBalance(account, data.transactions, cardAccounts), 0); }, [data.accounts, data.cards, data.transactions]);
  const investmentsValue = useMemo(() => { const positions = calculatePositions(data.operations); return data.assets.filter((asset) => asset.currency === "BRL").reduce((total, asset) => { const position = positions.find((item) => item.assetId === asset.id); if (!position) return total; return total + (positionMarketValue(position, asset.current_price === null ? null : Number(asset.current_price)) ?? position.investedCost); }, 0); }, [data.assets, data.operations]);
  const liabilitiesValue = useMemo(() => pendingCardLiabilities(data.transactions), [data.transactions]);
  const netWorth = calculateNetWorth({ accountsValue: accountsBalance, investmentsValue, liabilitiesValue });
  const history = useMemo(() => buildMonthlyHistory(data.transactions, data.snapshots, { accountsValue: accountsBalance, investmentsValue, liabilitiesValue, month: currentMonth, netWorth }), [accountsBalance, currentMonth, data.snapshots, data.transactions, investmentsValue, liabilitiesValue, netWorth]);
  const visibleHistory = useMemo(() => filterHistoryPeriod(history, period, currentMonth), [currentMonth, history, period]);

  function select(month: string, nextDetail: DetailKind = "all") { setSelectedMonth(month); setDetail(nextDetail); setShowConsolidation(true); }
  const metrics = [
    { label: "Patrimônio total", value: netWorth, helper: `${formatCurrency(investmentsValue)} investidos`, icon: Landmark, detail: "netWorth" as const },
    { label: "Saldo em contas", value: accountsBalance, helper: `${data.accounts.filter((item) => item.is_active).length} contas ativas`, icon: Wallet, detail: "accounts" as const },
    { label: "Despesas do mês", value: summary.expenses, helper: `${formatCurrency(summary.pendingExpenses)} pendente`, icon: TrendingUp, detail: "expenses" as const },
    { label: "Economia do mês", value: summary.balance, helper: `${formatPercent(summary.savingsRate)} da renda`, icon: PiggyBank, detail: "balance" as const },
  ];

  if (loading && !data.transactions.length) return <div className="flex min-h-72 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />Carregando seu painel...</div>;

  return <div className="min-w-0 space-y-6"><section><p className="text-sm text-muted-foreground">Visão geral do mês atual</p><h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{displayName ? `Olá, ${displayName}` : "Olá"}</h1></section>{!online ? <OfflineNotice /> : null}{error ? <DataError message={error} onRetry={() => void load()} /> : null}<section aria-label="Indicadores principais" className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map((metric, index) => <MetricCard key={metric.label} {...metric} value={formatCurrency(metric.value)} tone={index === 0 || index === 3 ? "positive" : "default"} selected={showConsolidation && selectedMonth === currentMonth && detail === metric.detail} onClick={() => select(currentMonth, metric.detail)} />)}</section><Card><CardHeader className="gap-4"><div><CardTitle>Evolução financeira e patrimonial</CardTitle><CardDescription>Receitas, despesas, saldo, investimentos e patrimônio mês a mês. Selecione um mês para abrir o consolidado.</CardDescription></div><div role="group" aria-label="Período do gráfico" className="flex flex-wrap gap-1">{periods.map((item) => <Button key={item.id} type="button" size="sm" variant={period === item.id ? "default" : "outline"} aria-pressed={period === item.id} onClick={() => setPeriod(item.id)}>{item.label}</Button>)}</div></CardHeader><CardContent><FinancialHistoryChart data={visibleHistory} selectedMonth={showConsolidation ? selectedMonth : null} onSelect={(month) => select(month)} /></CardContent></Card>{showConsolidation ? <MonthConsolidation detail={detail} history={history} month={selectedMonth} transactions={data.transactions} onClose={() => setShowConsolidation(false)} /> : null}<section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]"><Card><CardHeader><CardTitle>Fluxo de caixa</CardTitle><CardDescription>Receitas e despesas do mês atual</CardDescription></CardHeader><CardContent className="space-y-4"><SummaryBar label="Receitas" value={summary.income} total={Math.max(summary.income, summary.expenses)} color="bg-emerald-500" /><SummaryBar label="Despesas" value={summary.expenses} total={Math.max(summary.income, summary.expenses)} color="bg-red-500" /><div className="flex justify-between border-t pt-4 text-sm"><span className="text-muted-foreground">Taxa de poupança</span><strong>{formatPercent(summary.savingsRate)}</strong></div></CardContent></Card><Card><CardHeader><CardTitle>Últimos lançamentos</CardTitle><CardDescription>Movimentações mais recentes do mês</CardDescription></CardHeader><CardContent className="space-y-4">{monthlyTransactions.slice(0, 5).map((transaction) => { const Icon = transaction.kind === "income" ? ArrowUpRight : ArrowDownRight; return <div key={transaction.id} className="flex items-center gap-3"><span className="rounded-xl bg-muted p-2.5"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{transaction.description}</p><p className="text-xs text-muted-foreground">{transaction.status === "paid" ? "Pago" : "Pendente"}</p></div><p className="text-sm font-semibold">{transaction.kind === "income" ? "+" : transaction.kind === "expense" ? "-" : ""}{formatCurrency(Number(transaction.amount))}</p></div>; })}{!monthlyTransactions.length ? <p className="py-8 text-center text-sm text-muted-foreground">Nenhum lançamento no mês.</p> : null}</CardContent></Card></section></div>;
}

function SummaryBar({ color, label, total, value }: { color: string; label: string; total: number; value: number }) { return <div><div className="mb-2 flex justify-between text-sm"><span>{label}</span><strong>{formatCurrency(value)}</strong></div><div className="h-3 overflow-hidden rounded-full bg-muted"><div className={`h-full ${color}`} style={{ width: `${total > 0 ? value / total * 100 : 0}%` }} /></div></div>; }
