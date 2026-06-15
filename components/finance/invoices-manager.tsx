"use client";

import { CheckCircle2, CreditCard, LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { EmptyState, MonthInput, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { monthStart } from "@/lib/domain/finance/dates";
import { formatCurrency } from "@/lib/formatters";
import { repositoryErrorMessage } from "@/lib/repositories/base-repository";
import { listTransactions, setTransactionStatus, type Transaction } from "@/lib/repositories/transactions-repository";
import { useFinanceCatalogs } from "@/hooks/use-finance-catalogs";

export function InvoicesManager() {
  const { cards } = useFinanceCatalogs();
  const [month, setMonth] = useState(monthStart(new Date()));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  async function load() {
    setLoading(true);
    try { setTransactions((await listTransactions({ month })).filter((item) => item.credit_card_id)); } catch (error) { setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar as faturas."), tone: "error" }); } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    void listTransactions({ month }).then((data) => { if (active) setTransactions(data.filter((item) => item.credit_card_id)); }).catch((error: unknown) => { if (active) setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar as faturas."), tone: "error" }); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month]);

  const groups = useMemo(() => cards.map((card) => ({ card, items: transactions.filter((item) => item.credit_card_id === card.id) })).filter((group) => group.items.length), [cards, transactions]);

  async function payInvoice(items: Transaction[]) {
    try { await Promise.all(items.filter((item) => item.status === "pending").map((item) => setTransactionStatus(item.id, "paid"))); await load(); setFeedback({ message: "Fatura marcada como paga.", tone: "success" }); } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); }
  }

  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Cartões de crédito</p><h1 className="mt-1 text-2xl font-bold">Faturas</h1></div><div className="w-44"><MonthInput id="invoice-month" value={month} onChange={setMonth} /></div></header><AuthMessage message={feedback?.message} tone={feedback?.tone} />{loading ? <div className="flex min-h-56 items-center justify-center"><LoaderCircle className="animate-spin" /></div> : groups.length ? <div className="grid gap-4 lg:grid-cols-2">{groups.map(({ card, items }) => { const total = items.reduce((sum, item) => sum + Number(item.amount), 0); const pending = items.some((item) => item.status === "pending"); return <SectionCard key={card.id} title={card.name} description={`Fecha dia ${card.closing_day} · vence dia ${card.due_day}`}><div className="mb-4 flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total da fatura</p><p className="text-2xl font-bold">{formatCurrency(total)}</p></div><CreditCard className="size-7 text-primary" /></div><div className="space-y-2">{items.map((item) => <div key={item.id} className="flex justify-between gap-3 rounded-lg bg-muted/60 p-3 text-sm"><span className="truncate">{item.description}</span><strong>{formatCurrency(Number(item.amount))}</strong></div>)}</div>{pending ? <Button className="mt-4 w-full" onClick={() => void payInvoice(items)}><CheckCircle2 />Marcar fatura como paga</Button> : <p className="mt-4 text-center text-sm font-medium text-emerald-600">Fatura paga</p>}</SectionCard>; })}</div> : <EmptyState>Nenhuma fatura para esta competência.</EmptyState>}</div>;
}
