"use client";

import { CalendarClock, LoaderCircle, Pause, Pencil, Play, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { EmptyState, Field, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { currentDateString } from "@/lib/domain/finance/dates";
import { formatCurrency } from "@/lib/formatters";
import { repositoryErrorMessage } from "@/lib/repositories/base-repository";
import {
  createRecurringTransaction,
  deleteRecurringTransaction,
  generateRecurringOccurrences,
  listRecurringTransactions,
  type RecurringTransaction,
  updateRecurringTransaction,
} from "@/lib/repositories/recurring-transactions-repository";
import { useFinanceCatalogs } from "@/hooks/use-finance-catalogs";

export function RecurringManager() {
  const { accounts, cards, categories } = useFinanceCatalogs();
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [editing, setEditing] = useState<RecurringTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [payment, setPayment] = useState<"account" | "card">("account");
  const [feedback, setFeedback] = useState<{ message: string; tone: "error" | "success" } | null>(null);

  async function load() { setLoading(true); try { setItems(await listRecurringTransactions()); } catch (error) { setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar as recorrências."), tone: "error" }); } finally { setLoading(false); } }
  useEffect(() => { let active = true; void listRecurringTransactions().then((data) => { if (active) setItems(data); }).catch((error: unknown) => { if (active) setFeedback({ message: repositoryErrorMessage(error, "Não foi possível carregar as recorrências."), tone: "error" }); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  function edit(item: RecurringTransaction) {
    setEditing(item); setKind(item.kind as "income" | "expense"); setPayment(item.credit_card_id ? "card" : "account");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement);
    const input = {
      account_id: payment === "account" || kind === "income" ? String(form.get("accountId")) : null,
      amount: Number(form.get("amount")), category_id: String(form.get("categoryId")),
      credit_card_id: kind === "expense" && payment === "card" ? String(form.get("creditCardId")) : null,
      description: String(form.get("description")).trim(), end_date: String(form.get("endDate")) || null,
      frequency: String(form.get("frequency")) as "weekly" | "monthly" | "yearly", is_active: true, kind,
      merchant: String(form.get("merchant")).trim() || null, next_run_date: String(form.get("nextRunDate")), start_date: String(form.get("startDate")),
    };
    try {
      if (editing) await updateRecurringTransaction(editing.id, input); else await createRecurringTransaction(input);
      setEditing(null); formElement.reset(); await load();
      setFeedback({ message: editing ? "Recorrência atualizada." : "Recorrência criada.", tone: "success" });
    } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); }
  }

  async function generateAll() {
    setGenerating(true); setFeedback(null);
    try {
      let generated = 0;
      for (const item of items.filter((entry) => entry.is_active)) {
        const card = cards.find((entry) => entry.id === item.credit_card_id);
        generated += await generateRecurringOccurrences(item, currentDateString(), card ? { closingDay: card.closing_day, dueDay: card.due_day } : undefined);
      }
      await load(); setFeedback({ message: generated ? `${generated} ocorrência(s) gerada(s).` : "Nenhuma ocorrência pendente.", tone: "success" });
    } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); } finally { setGenerating(false); }
  }

  async function toggle(item: RecurringTransaction) { try { await updateRecurringTransaction(item.id, { is_active: !item.is_active }); await load(); setFeedback({ message: item.is_active ? "Recorrência pausada." : "Recorrência ativada.", tone: "success" }); } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); } }
  async function remove(item: RecurringTransaction) { if (!window.confirm(`Excluir a recorrência "${item.description}"? Os lançamentos já gerados serão preservados.`)) return; try { await deleteRecurringTransaction(item.id); await load(); setFeedback({ message: "Recorrência excluída; lançamentos anteriores foram preservados.", tone: "success" }); } catch (error) { setFeedback({ message: repositoryErrorMessage(error), tone: "error" }); } }

  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-muted-foreground">Contas fixas</p><h1 className="mt-1 text-2xl font-bold">Recorrências</h1></div><Button onClick={() => void generateAll()} disabled={generating}>{generating ? <LoaderCircle className="animate-spin" /> : <CalendarClock />}{generating ? "Gerando..." : "Gerar pendentes"}</Button></header><AuthMessage message={feedback?.message} tone={feedback?.tone} /><div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]"><SectionCard title={editing ? "Editar recorrência" : "Nova recorrência"}><form key={editing?.id ?? "new"} className="space-y-4" onSubmit={submit}><Field label="Tipo" htmlFor="recurring-kind"><Select id="recurring-kind" value={kind} onChange={(event) => setKind(event.target.value as "income" | "expense")}><option value="expense">Despesa</option><option value="income">Receita</option></Select></Field><Field label="Descrição" htmlFor="recurring-description"><Input id="recurring-description" name="description" defaultValue={editing?.description} required /></Field><Field label="Valor" htmlFor="recurring-amount"><Input id="recurring-amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={editing?.amount} required /></Field>{kind === "expense" ? <Field label="Pagamento" htmlFor="recurring-payment"><Select id="recurring-payment" value={payment} onChange={(event) => setPayment(event.target.value as "account" | "card")}><option value="account">Conta</option><option value="card">Cartão</option></Select></Field> : null}<Field label="Categoria" htmlFor="recurring-category"><Select id="recurring-category" name="categoryId" defaultValue={editing?.category_id ?? ""} required><option value="">Selecione</option>{categories.filter((item) => item.kind === kind && item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>{payment === "account" || kind === "income" ? <Field label="Conta" htmlFor="recurring-account"><Select id="recurring-account" name="accountId" defaultValue={editing?.account_id ?? ""} required><option value="">Selecione</option>{accounts.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field> : <Field label="Cartão" htmlFor="recurring-card"><Select id="recurring-card" name="creditCardId" defaultValue={editing?.credit_card_id ?? ""} required><option value="">Selecione</option>{cards.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field>}<Field label="Frequência" htmlFor="recurring-frequency"><Select id="recurring-frequency" name="frequency" defaultValue={editing?.frequency ?? "monthly"}><option value="weekly">Semanal</option><option value="monthly">Mensal</option><option value="yearly">Anual</option></Select></Field><div className="grid grid-cols-2 gap-3"><Field label="Início" htmlFor="recurring-start"><Input id="recurring-start" name="startDate" type="date" defaultValue={editing?.start_date ?? currentDateString()} required /></Field><Field label="Próxima geração" htmlFor="recurring-next"><Input id="recurring-next" name="nextRunDate" type="date" defaultValue={editing?.next_run_date ?? currentDateString()} required /></Field></div><Field label="Fim opcional" htmlFor="recurring-end"><Input id="recurring-end" name="endDate" type="date" defaultValue={editing?.end_date ?? ""} /></Field><Field label="Estabelecimento" htmlFor="recurring-merchant"><Input id="recurring-merchant" name="merchant" defaultValue={editing?.merchant ?? ""} /></Field><div className="flex gap-2"><Button type="submit"><Plus />{editing ? "Salvar" : "Adicionar"}</Button>{editing ? <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button> : null}</div></form></SectionCard><SectionCard title="Regras cadastradas">{loading ? <div className="flex min-h-32 items-center justify-center"><LoaderCircle className="animate-spin" /></div> : items.length ? <div className="space-y-2">{items.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><CalendarClock className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.description}</p><p className="text-xs text-muted-foreground">{formatCurrency(Number(item.amount))} · próxima em {new Date(`${item.next_run_date}T12:00`).toLocaleDateString("pt-BR")}</p></div><Button size="icon" variant="ghost" aria-label={item.is_active ? "Pausar recorrência" : "Ativar recorrência"} onClick={() => void toggle(item)}>{item.is_active ? <Pause /> : <Play />}</Button><Button size="icon" variant="ghost" aria-label="Editar recorrência" onClick={() => edit(item)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label="Excluir recorrência" onClick={() => void remove(item)}><Trash2 /></Button></div>)}</div> : <EmptyState>Nenhuma recorrência cadastrada.</EmptyState>}</SectionCard></div></div>;
}
