"use client";

import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { EmptyState, Field, MonthInput, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { budgetProgress } from "@/lib/domain/finance/budgets";
import { monthStart } from "@/lib/domain/finance/dates";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { repositoryErrorMessage } from "@/lib/repositories/base-repository";
import { createBudget, deleteBudget, listBudgets, type Budget, updateBudget } from "@/lib/repositories/budgets-repository";
import { listTransactions, type Transaction } from "@/lib/repositories/transactions-repository";
import { useFinanceCatalogs } from "@/hooks/use-finance-catalogs";
import { cn } from "@/lib/utils";

export function BudgetsManager() {
  const { categories } = useFinanceCatalogs();
  const [month, setMonth] = useState(monthStart(new Date()));
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  async function load() {
    setLoading(true);
    try { const [nextBudgets, nextTransactions] = await Promise.all([listBudgets(month), listTransactions({ month })]); setBudgets(nextBudgets); setTransactions(nextTransactions); } catch (error) { setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar os orçamentos."), tone: "error" }); } finally { setLoading(false); }
  }
  useEffect(() => { let active = true; void Promise.all([listBudgets(month), listTransactions({ month })]).then(([b, t]) => { if (active) { setBudgets(b); setTransactions(t); } }).catch((error: unknown) => { if (active) setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar os orçamentos."), tone: "error" }); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [month]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const input = { alert_percentage: Number(form.get("alertPercentage")), amount: Number(form.get("amount")), category_id: String(form.get("categoryId")), period_month: month };
    try { if (editing) await updateBudget(editing.id, input); else await createBudget(input); setEditing(null); formElement.reset(); await load(); setFeedback({ message: editing ? "Orçamento atualizado." : "Orçamento criado.", tone: "success" }); } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); }
  }
  async function remove(budget: Budget) { if (!window.confirm("Excluir este orçamento?")) return; try { await deleteBudget(budget.id); await load(); setFeedback({ message: "Orçamento excluído.", tone: "success" }); } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); } }
  const expenseCategories = useMemo(() => categories.filter((item) => item.kind === "expense" && item.is_active), [categories]);
  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Limites de gastos</p><h1 className="mt-1 text-2xl font-bold">Orçamentos</h1></div><div className="w-44"><MonthInput id="budget-month" value={month} onChange={setMonth} /></div></header><AuthMessage message={feedback?.message} tone={feedback?.tone} /><div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]"><SectionCard title={editing ? "Editar orçamento" : "Novo orçamento"}><form key={editing?.id ?? month} className="space-y-4" onSubmit={submit}><Field label="Categoria" htmlFor="budget-category"><Select id="budget-category" name="categoryId" defaultValue={editing?.category_id ?? ""} required><option value="">Selecione</option>{expenseCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field><Field label="Limite" htmlFor="budget-amount"><Input id="budget-amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={editing?.amount} required /></Field><Field label="Alertar em %" htmlFor="budget-alert"><Input id="budget-alert" name="alertPercentage" type="number" min="1" max="100" defaultValue={editing?.alert_percentage ?? 80} required /></Field><div className="flex gap-2"><Button type="submit"><Plus />{editing ? "Salvar" : "Adicionar"}</Button>{editing ? <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button> : null}</div></form></SectionCard><SectionCard title="Acompanhamento do mês">{loading ? <div className="flex min-h-32 items-center justify-center"><LoaderCircle className="animate-spin" /></div> : budgets.length ? <div className="space-y-4">{budgets.map((budget) => { const progress = budgetProgress(budget, transactions); const category = categories.find((item) => item.id === budget.category_id); const alert = progress.percentage >= Number(budget.alert_percentage) / 100; return <div key={budget.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{category?.name ?? "Categoria"}</p><p className={cn("text-sm", alert ? "text-amber-600" : "text-muted-foreground")}>{formatCurrency(progress.spent)} de {formatCurrency(Number(budget.amount))} · {formatPercent(progress.percentage)}</p></div><div className="flex"><Button size="icon" variant="ghost" aria-label="Editar orçamento" onClick={() => setEditing(budget)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label="Excluir orçamento" onClick={() => void remove(budget)}><Trash2 /></Button></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full", progress.percentage > 1 ? "bg-red-500" : alert ? "bg-amber-500" : "bg-primary")} style={{ width: `${Math.min(100, progress.percentage * 100)}%` }} /></div></div>; })}</div> : <EmptyState>Nenhum orçamento definido.</EmptyState>}</SectionCard></div></div>;
}
