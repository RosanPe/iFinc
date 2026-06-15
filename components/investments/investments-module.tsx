"use client";

import { CalendarDays, ChartPie, Landmark, ListPlus, LoaderCircle, Settings2, Target } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AssetsManager } from "@/components/investments/assets-manager";
import { IncomeManager } from "@/components/investments/income-manager";
import { InvestmentsOverview } from "@/components/investments/investments-overview";
import { NetWorthManager } from "@/components/investments/net-worth-manager";
import { OperationsManager } from "@/components/investments/operations-manager";
import { StrategyManager } from "@/components/investments/strategy-manager";
import { DataError, OfflineNotice } from "@/components/shared/data-status";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { listAccounts, type Account } from "@/lib/repositories/accounts-repository";
import { listAssetClasses, type AssetClass } from "@/lib/repositories/asset-classes-repository";
import { listAssets, type Asset } from "@/lib/repositories/assets-repository";
import { RepositoryError } from "@/lib/repositories/base-repository";
import { listCreditCards, type CreditCard } from "@/lib/repositories/credit-cards-repository";
import { listInvestmentIncome, type InvestmentIncome } from "@/lib/repositories/investment-income-repository";
import { listInvestmentOperations, type InvestmentOperation } from "@/lib/repositories/investment-operations-repository";
import { listInvestmentTargets, type InvestmentTarget } from "@/lib/repositories/investment-targets-repository";
import { listNetWorthSnapshots, type NetWorthSnapshot } from "@/lib/repositories/net-worth-snapshots-repository";
import { listAllTransactions, type Transaction } from "@/lib/repositories/transactions-repository";
import { cn } from "@/lib/utils";

type View = "overview" | "operations" | "income" | "strategy" | "netWorth" | "assets";
type Data = { accounts: Account[]; assetClasses: AssetClass[]; assets: Asset[]; cards: CreditCard[]; income: InvestmentIncome[]; operations: InvestmentOperation[]; snapshots: NetWorthSnapshot[]; targets: InvestmentTarget[]; transactions: Transaction[] };

const views = [
  { id: "overview" as const, label: "Carteira", icon: ChartPie },
  { id: "operations" as const, label: "Operações", icon: ListPlus },
  { id: "income" as const, label: "Proventos", icon: CalendarDays },
  { id: "strategy" as const, label: "Estratégia", icon: Target },
  { id: "netWorth" as const, label: "Patrimônio", icon: Landmark },
  { id: "assets" as const, label: "Ativos", icon: Settings2 },
];
const emptyData: Data = { accounts: [], assetClasses: [], assets: [], cards: [], income: [], operations: [], snapshots: [], targets: [], transactions: [] };

function errorMessage(error: unknown) { return error instanceof RepositoryError || error instanceof Error ? error.message : "Ocorreu um erro inesperado."; }
async function fetchData(): Promise<Data> {
  const [accounts, assetClasses, assets, cards, income, operations, snapshots, targets, transactions] = await Promise.all([
    listAccounts(), listAssetClasses(), listAssets(), listCreditCards(), listInvestmentIncome(), listInvestmentOperations(), listNetWorthSnapshots(), listInvestmentTargets(), listAllTransactions(),
  ]);
  return { accounts, assetClasses, assets, cards, income, operations, snapshots, targets, transactions };
}

export function InvestmentsModule() {
  const online = useOnlineStatus();
  const [view, setView] = useState<View>("overview");
  const [data, setData] = useState<Data>(emptyData);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const load = useCallback(async () => { setMessage(null); try { setData(await fetchData()); } catch (error) { setMessage(errorMessage(error)); } finally { setLoading(false); } }, []);

  useEffect(() => { let active = true; void fetchData().then((result) => { if (active) setData(result); }).catch((error: unknown) => { if (active) setMessage(errorMessage(error)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);
  const handleError = useCallback((error: unknown) => setMessage(errorMessage(error)), []);

  return <div className="min-w-0 space-y-5"><nav aria-label="Seções de investimentos" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"><div className="flex min-w-max gap-1 rounded-2xl bg-muted p-1 sm:grid sm:min-w-0 sm:grid-cols-6">{views.map(({ id, label, icon: Icon }) => <button key={id} type="button" aria-pressed={view === id} className={cn("flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors", view === id && "bg-background text-foreground shadow-sm")} onClick={() => { setView(id); setMessage(null); }}><Icon className="size-4" />{label}</button>)}</div></nav>{!online ? <OfflineNotice /> : null}{message ? <DataError message={message} onRetry={() => void load()} /> : null}{loading ? <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />Carregando carteira...</div> : <>{view === "overview" ? <InvestmentsOverview assetClasses={data.assetClasses} assets={data.assets} operations={data.operations} /> : null}{view === "operations" ? <OperationsManager accounts={data.accounts} assets={data.assets} operations={data.operations} onChange={load} onError={handleError} /> : null}{view === "income" ? <IncomeManager accounts={data.accounts} assets={data.assets} income={data.income} onChange={load} onError={handleError} /> : null}{view === "strategy" ? <StrategyManager assetClasses={data.assetClasses} assets={data.assets} operations={data.operations} targets={data.targets} onChange={load} onError={handleError} /> : null}{view === "netWorth" ? <NetWorthManager accounts={data.accounts} assets={data.assets} cards={data.cards} operations={data.operations} snapshots={data.snapshots} transactions={data.transactions} onChange={load} onError={handleError} /> : null}{view === "assets" ? <AssetsManager assetClasses={data.assetClasses} assets={data.assets} onChange={load} onError={handleError} /> : null}</>}</div>;
}
