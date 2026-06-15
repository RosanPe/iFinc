"use client";

import { ArrowDownRight, ArrowUpRight, ChartNoAxesCombined, Landmark, Wallet, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { EmptyState, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import type { MonthlyHistory } from "@/lib/domain/finance/history";
import { monthVariation } from "@/lib/domain/finance/history";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { Transaction } from "@/lib/repositories/transactions-repository";

export type DetailKind = "all" | "netWorth" | "accounts" | "income" | "expenses" | "pending" | "balance";

export function MonthConsolidation({ detail, history, month, onClose, transactions }: { detail: DetailKind; history: MonthlyHistory[]; month: string; onClose: () => void; transactions: Transaction[] }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const selected = history.find((item) => item.month === month);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    function handleKeyDown(event: KeyboardEvent) { if (event.key === "Escape") onClose(); }
    window.addEventListener("keydown", handleKeyDown);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", handleKeyDown); };
  }, [onClose]);

  if (!selected) return null;
  const variation = monthVariation(history, month);
  const monthTransactions = transactions.filter((transaction) => {
    const transactionMonth = transaction.credit_card_id && transaction.statement_month ? transaction.statement_month : `${transaction.transaction_date.slice(0, 7)}-01`;
    if (transactionMonth !== month || transaction.status === "cancelled") return false;
    if (detail === "income") return transaction.kind === "income";
    if (detail === "expenses") return transaction.kind === "expense";
    if (detail === "pending") return transaction.kind === "expense" && transaction.status === "pending";
    return true;
  });
  const title = new Date(`${month}T12:00`).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const metrics = [
    { label: "Patrimônio", value: selected.netWorth, icon: Landmark },
    { label: "Investimentos", value: selected.investmentsValue, icon: ChartNoAxesCombined },
    { label: "Saldo em contas", value: selected.accountsValue, icon: Wallet },
    { label: "Receitas", value: selected.income, icon: ArrowUpRight },
    { label: "Despesas", value: selected.expenses, icon: ArrowDownRight },
    { label: "Pendências", value: selected.pendingExpenses, icon: ArrowDownRight },
    { label: "Saldo mensal", value: selected.balance, icon: Wallet },
  ];

  return <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section role="dialog" aria-modal="true" aria-labelledby="month-dialog-title" className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl border bg-background shadow-2xl sm:rounded-3xl"><header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b bg-background/95 p-5 backdrop-blur"><div><p className="text-sm text-muted-foreground">Consolidado selecionado</p><h2 id="month-dialog-title" className="capitalize text-xl font-bold">{title}</h2>{variation ? <p className="mt-1 text-sm text-muted-foreground">Variação patrimonial: <strong className={variation.absolute >= 0 ? "text-emerald-600" : "text-red-600"}>{formatCurrency(variation.absolute)}{variation.percentage === null ? "" : ` (${formatPercent(variation.percentage)})`}</strong></p> : null}</div><Button ref={closeButtonRef} type="button" size="icon" variant="ghost" aria-label="Fechar consolidado" onClick={onClose}><X /></Button></header><div className="space-y-5 p-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <div key={label} className="rounded-xl border bg-card p-3"><Icon className="mb-2 size-4 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><strong className="mt-1 block">{value === null ? "Sem snapshot" : formatCurrency(value)}</strong></div>)}</div><SectionCard title={detail === "all" || detail === "netWorth" || detail === "accounts" ? "Movimentações do mês" : `Detalhes de ${detail === "income" ? "receitas" : detail === "pending" ? "pendências" : detail === "balance" ? "saldo" : "despesas"}`}>{monthTransactions.length ? <div className="space-y-2">{monthTransactions.slice(0, 20).map((transaction) => <div key={transaction.id} className="flex items-center gap-3 rounded-xl border p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description}</p><p className="text-xs text-muted-foreground">{new Date(`${transaction.transaction_date}T12:00`).toLocaleDateString("pt-BR")} · {transaction.status === "paid" ? "Pago" : "Pendente"}</p></div><strong className={transaction.kind === "income" ? "text-emerald-600" : transaction.kind === "expense" ? "text-red-600" : ""}>{transaction.kind === "income" ? "+" : transaction.kind === "expense" ? "-" : ""}{formatCurrency(Number(transaction.amount))}</strong></div>)}</div> : <EmptyState>Nenhuma movimentação para este detalhe no mês.</EmptyState>}</SectionCard></div></section></div>;
}
