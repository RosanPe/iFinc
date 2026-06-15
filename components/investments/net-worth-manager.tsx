"use client";

import { Landmark, Save, Trash2, WalletCards } from "lucide-react";
import { useMemo } from "react";

import { LineChart } from "@/components/charts/line-chart";
import { EmptyState, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { currentDateString } from "@/lib/domain/finance/dates";
import { accountBalance } from "@/lib/domain/finance/transactions";
import { calculateNetWorth, pendingCardLiabilities } from "@/lib/domain/investments/net-worth";
import { calculatePositions, positionMarketValue } from "@/lib/domain/investments/positions";
import { formatCurrency } from "@/lib/formatters";
import type { Account } from "@/lib/repositories/accounts-repository";
import type { Asset } from "@/lib/repositories/assets-repository";
import type { CreditCard } from "@/lib/repositories/credit-cards-repository";
import type { InvestmentOperation } from "@/lib/repositories/investment-operations-repository";
import { deleteNetWorthSnapshot, type NetWorthSnapshot, saveNetWorthSnapshot } from "@/lib/repositories/net-worth-snapshots-repository";
import type { Transaction } from "@/lib/repositories/transactions-repository";

type Props = { accounts: Account[]; assets: Asset[]; cards: CreditCard[]; operations: InvestmentOperation[]; snapshots: NetWorthSnapshot[]; transactions: Transaction[]; onChange: () => Promise<void>; onError: (error: unknown) => void };

export function NetWorthManager({ accounts, assets, cards, operations, snapshots, transactions, onChange, onError }: Props) {
  const values = useMemo(() => {
    const cardAccounts = Object.fromEntries(cards.map((card) => [card.id, card.account_id]));
    const accountsValue = accounts.filter((account) => account.include_in_net_worth).reduce((sum, account) => sum + accountBalance(account, transactions, cardAccounts), 0);
    const positions = calculatePositions(operations);
    const investmentsValue = assets.filter((asset) => asset.currency === "BRL").reduce((sum, asset) => { const position = positions.find((item) => item.assetId === asset.id); if (!position) return sum; return sum + (positionMarketValue(position, asset.current_price === null ? null : Number(asset.current_price)) ?? position.investedCost); }, 0);
    const liabilitiesValue = pendingCardLiabilities(transactions);
    return { accountsValue, investmentsValue, liabilitiesValue, totalValue: calculateNetWorth({ accountsValue, investmentsValue, liabilitiesValue }) };
  }, [accounts, assets, cards, operations, transactions]);

  async function save() { try { await saveNetWorthSnapshot({ accounts_value: values.accountsValue, investments_value: values.investmentsValue, liabilities_value: values.liabilitiesValue, snapshot_date: currentDateString() }); await onChange(); } catch (error) { onError(error); } }
  async function remove(item: NetWorthSnapshot) { if (!window.confirm("Excluir este snapshot?")) return; try { await deleteNetWorthSnapshot(item.id); await onChange(); } catch (error) { onError(error); } }
  const metrics = [
    { label: "Patrimônio líquido", value: values.totalValue, icon: Landmark },
    { label: "Contas", value: values.accountsValue, icon: WalletCards },
    { label: "Investimentos", value: values.investmentsValue, icon: Landmark },
    { label: "Faturas pendentes", value: values.liabilitiesValue, icon: WalletCards },
  ];

  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Consolidação financeira</p><h1 className="mt-1 text-2xl font-bold">Patrimônio</h1></div><Button onClick={() => void save()}><Save />Registrar posição de hoje</Button></header>{assets.some((asset) => asset.currency !== "BRL") ? <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Ativos fora de BRL não entram no patrimônio até existir conversão cambial confiável.</p> : null}<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border bg-card p-4"><Icon className="mb-3 size-5 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{formatCurrency(value)}</p></div>)}</div><SectionCard title="Evolução patrimonial" description="Histórico dos snapshots registrados."><LineChart title="Evolução do patrimônio líquido" data={snapshots.map((item) => ({ label: new Date(`${item.snapshot_date}T12:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }), value: Number(item.total_value) }))} /></SectionCard><SectionCard title="Histórico">{snapshots.length ? <div className="space-y-2">{[...snapshots].reverse().map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="font-semibold">{new Date(`${item.snapshot_date}T12:00`).toLocaleDateString("pt-BR")}</p><p className="text-xs text-muted-foreground">Contas {formatCurrency(Number(item.accounts_value))} · investimentos {formatCurrency(Number(item.investments_value))} · passivos {formatCurrency(Number(item.liabilities_value))}</p></div><strong>{formatCurrency(Number(item.total_value))}</strong><Button size="icon" variant="ghost" aria-label="Excluir snapshot" onClick={() => void remove(item)}><Trash2 /></Button></div>)}</div> : <EmptyState>Nenhum snapshot patrimonial registrado.</EmptyState>}</SectionCard></div>;
}
