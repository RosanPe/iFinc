"use client";

import { ArrowDownRight, ArrowLeftRight, ArrowUpRight, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { EmptyState, Field, MonthInput, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { currentDateString, invoiceDueDate, monthStart, statementMonth } from "@/lib/domain/finance/dates";
import type { TransactionKind } from "@/lib/domain/finance/transactions";
import { formatCurrency } from "@/lib/formatters";
import { RepositoryError } from "@/lib/repositories/base-repository";
import {
  createTransactions,
  deleteTransaction,
  listTransactions,
  setTransactionStatus,
  type Transaction,
  updateTransaction,
} from "@/lib/repositories/transactions-repository";
import { useFinanceCatalogs } from "@/hooks/use-finance-catalogs";
import { cn } from "@/lib/utils";

type Feedback = { message: string; tone: "error" | "success" } | null;

export function TransactionsManager() {
  const catalogs = useFinanceCatalogs();
  const [month, setMonth] = useState(monthStart(new Date()));
  const [kindFilter, setKindFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await listTransactions({ month }));
    } catch (cause) {
      setFeedback({ message: cause instanceof Error ? cause.message : "Erro ao carregar lançamentos.", tone: "error" });
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    let active = true;
    void listTransactions({ month }).then((data) => { if (active) setTransactions(data); })
      .catch((cause: unknown) => { if (active) setFeedback({ message: cause instanceof Error ? cause.message : "Erro ao carregar lançamentos.", tone: "error" }); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [month]);

  const visible = useMemo(
    () => kindFilter === "all" ? transactions : transactions.filter((transaction) => transaction.kind === kindFilter),
    [kindFilter, transactions],
  );

  async function run(action: () => Promise<unknown>, message: string) {
    setSaving(true);
    setFeedback(null);
    try {
      await action();
      await reload();
      setFeedback({ message, tone: "success" });
      setEditing(null);
      setShowForm(false);
      return true;
    } catch (cause) {
      setFeedback({ message: cause instanceof RepositoryError || cause instanceof Error ? cause.message : "Erro inesperado.", tone: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function remove(transaction: Transaction) {
    const wholeGroup = Boolean(transaction.installment_group_id) && window.confirm("Excluir todas as parcelas? Cancele para excluir somente esta parcela.");
    if (!wholeGroup && !window.confirm("Excluir este lançamento?")) return;
    await run(() => deleteTransaction(transaction, wholeGroup), "Lançamento excluído.");
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm text-muted-foreground">Fluxo financeiro</p><h1 className="mt-1 text-2xl font-bold tracking-tight">Lançamentos</h1></div>
        <Button onClick={() => { setEditing(null); setShowForm((value) => !value); }}><Plus />Novo lançamento</Button>
      </header>
      <AuthMessage message={catalogs.error || feedback?.message} tone={feedback?.tone} />
      {showForm || editing ? (
        <TransactionForm
          key={editing?.id ?? "new"}
          accounts={catalogs.accounts.filter((item) => item.is_active)}
          cards={catalogs.cards.filter((item) => item.is_active)}
          categories={catalogs.categories.filter((item) => item.is_active)}
          editing={editing}
          saving={saving}
          tags={catalogs.tags}
          onCancel={() => { setEditing(null); setShowForm(false); }}
          onSave={run}
        />
      ) : null}
      <SectionCard title="Movimentações do mês">
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <Field label="Mês" htmlFor="transactions-month"><MonthInput id="transactions-month" value={month} onChange={setMonth} /></Field>
          <Field label="Tipo" htmlFor="transactions-kind"><Select id="transactions-kind" value={kindFilter} onChange={(event) => setKindFilter(event.target.value)}><option value="all">Todos</option><option value="income">Receitas</option><option value="expense">Despesas</option><option value="transfer">Transferências</option></Select></Field>
        </div>
        {loading ? <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="animate-spin" />Carregando...</div> : visible.length ? (
          <div className="space-y-2">
            {visible.map((transaction) => {
              const category = catalogs.categories.find((item) => item.id === transaction.category_id);
              const Icon = transaction.kind === "income" ? ArrowUpRight : transaction.kind === "expense" ? ArrowDownRight : ArrowLeftRight;
              return (
                <div key={transaction.id} className="flex min-w-0 items-center gap-3 rounded-xl border p-3">
                  <span className={cn("rounded-xl p-2.5", transaction.kind === "income" ? "bg-emerald-500/10 text-emerald-600" : transaction.kind === "expense" ? "bg-red-500/10 text-red-600" : "bg-blue-500/10 text-blue-600")}><Icon className="size-4" /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.description || "Sem descrição"}</p><p className="truncate text-xs text-muted-foreground">{category?.name ?? (transaction.kind === "transfer" ? "Transferência" : "Sem categoria")} · {new Date(`${transaction.transaction_date}T12:00:00`).toLocaleDateString("pt-BR")}</p><button className="mt-1 text-xs font-medium text-primary" onClick={() => void run(() => setTransactionStatus(transaction.id, transaction.status === "paid" ? "pending" : "paid"), "Status atualizado.")}>{transaction.status === "paid" ? "Pago" : transaction.status === "pending" ? "Pendente" : "Cancelado"}</button></div>
                  <div className="text-right"><p className={cn("text-sm font-bold", transaction.kind === "income" && "text-emerald-600", transaction.kind === "expense" && "text-red-600")}>{transaction.kind === "income" ? "+" : transaction.kind === "expense" ? "-" : ""}{formatCurrency(Number(transaction.amount))}</p><div className="mt-1 flex justify-end"><Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setEditing(transaction); setShowForm(true); }}><Pencil /></Button><Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => void remove(transaction)}><Trash2 /></Button></div></div>
                </div>
              );
            })}
          </div>
        ) : <EmptyState>Nenhum lançamento neste período.</EmptyState>}
      </SectionCard>
    </div>
  );
}

function TransactionForm({ accounts, cards, categories, editing, onCancel, onSave, saving, tags }: {
  accounts: ReturnType<typeof useFinanceCatalogs>["accounts"];
  cards: ReturnType<typeof useFinanceCatalogs>["cards"];
  categories: ReturnType<typeof useFinanceCatalogs>["categories"];
  editing: Transaction | null;
  onCancel: () => void;
  onSave: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
  saving: boolean;
  tags: ReturnType<typeof useFinanceCatalogs>["tags"];
}) {
  const [kind, setKind] = useState<TransactionKind>(editing?.kind ?? "expense");
  const [payment, setPayment] = useState<"account" | "card">(editing?.credit_card_id ? "card" : "account");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const cardId = kind === "expense" && payment === "card" ? String(form.get("creditCardId")) : null;
    const accountId = payment === "account" || kind !== "expense" ? String(form.get("accountId")) || null : null;
    const transactionDate = String(form.get("transactionDate"));
    const selectedCard = cards.find((card) => card.id === cardId);
    const draft = {
      accountId,
      amount: Number(form.get("amount")),
      categoryId: kind === "transfer" ? null : String(form.get("categoryId")) || null,
      creditCardId: cardId,
      description: String(form.get("description")).trim(),
      destinationAccountId: kind === "transfer" ? String(form.get("destinationAccountId")) : null,
      dueDate: String(form.get("dueDate")) || null,
      installmentCount: Number(form.get("installmentCount") || 1),
      kind,
      merchant: String(form.get("merchant")).trim() || null,
      notes: String(form.get("notes")).trim() || null,
      status: String(form.get("status")) as "pending" | "paid",
      transactionDate,
    };

    if (editing) {
      const statement = selectedCard ? statementMonth(transactionDate, selectedCard.closing_day, selectedCard.due_day) : null;
      await onSave(() => updateTransaction(editing.id, {
        account_id: draft.accountId,
        amount: draft.amount,
        category_id: draft.categoryId,
        credit_card_id: draft.creditCardId,
        description: draft.description,
        destination_account_id: draft.destinationAccountId,
        due_date: statement && selectedCard ? invoiceDueDate(statement, selectedCard.due_day) : draft.dueDate,
        kind: draft.kind,
        merchant: draft.merchant,
        notes: draft.notes,
        statement_month: statement,
        status: selectedCard ? "pending" : draft.status,
        transaction_date: draft.transactionDate,
      }), "Lançamento atualizado.");
      return;
    }

    const tagIds = form.getAll("tagIds").map(String);
    await onSave(
      () => createTransactions(draft, tagIds, selectedCard ? { closingDay: selectedCard.closing_day, dueDay: selectedCard.due_day } : undefined),
      draft.installmentCount > 1 ? "Parcelas criadas." : "Lançamento criado.",
    );
  }

  const filteredCategories = categories.filter((category) => category.kind === kind);
  return (
    <SectionCard title={editing ? "Editar lançamento" : "Novo lançamento"} description="Receita, despesa, transferência ou compra parcelada.">
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Tipo" htmlFor="transaction-kind"><Select id="transaction-kind" value={kind} onChange={(event) => setKind(event.target.value as TransactionKind)} disabled={Boolean(editing?.installment_group_id)}><option value="expense">Despesa</option><option value="income">Receita</option><option value="transfer">Transferência</option></Select></Field>
        <Field label="Valor" htmlFor="transaction-amount"><Input id="transaction-amount" name="amount" type="number" min="0.01" step="0.01" defaultValue={editing?.amount} required /></Field>
        <Field label="Descrição" htmlFor="transaction-description"><Input id="transaction-description" name="description" defaultValue={editing?.description} maxLength={160} required /></Field>
        <Field label="Data" htmlFor="transaction-date"><Input id="transaction-date" name="transactionDate" type="date" defaultValue={editing?.transaction_date ?? currentDateString()} required /></Field>
        {kind === "expense" ? <Field label="Forma de pagamento" htmlFor="transaction-payment"><Select id="transaction-payment" value={payment} onChange={(event) => setPayment(event.target.value as "account" | "card")}><option value="account">Conta</option><option value="card">Cartão de crédito</option></Select></Field> : null}
        {kind !== "transfer" ? <Field label="Categoria" htmlFor="transaction-category"><Select id="transaction-category" name="categoryId" defaultValue={editing?.category_id ?? ""} required><option value="">Selecione</option>{filteredCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Select></Field> : null}
        {payment === "account" || kind !== "expense" ? <Field label={kind === "transfer" ? "Conta de origem" : "Conta"} htmlFor="transaction-account"><Select id="transaction-account" name="accountId" defaultValue={editing?.account_id ?? ""} required><option value="">Selecione</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></Field> : null}
        {kind === "transfer" ? <Field label="Conta de destino" htmlFor="transaction-destination"><Select id="transaction-destination" name="destinationAccountId" defaultValue={editing?.destination_account_id ?? ""} required><option value="">Selecione</option>{accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}</Select></Field> : null}
        {kind === "expense" && payment === "card" ? <><Field label="Cartão" htmlFor="transaction-card"><Select id="transaction-card" name="creditCardId" defaultValue={editing?.credit_card_id ?? ""} required><option value="">Selecione</option>{cards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}</Select></Field>{!editing ? <Field label="Parcelas" htmlFor="transaction-installments"><Input id="transaction-installments" name="installmentCount" type="number" min="1" max="120" defaultValue={1} /></Field> : null}</> : null}
        {kind !== "transfer" ? <Field label="Estabelecimento" htmlFor="transaction-merchant"><Input id="transaction-merchant" name="merchant" defaultValue={editing?.merchant ?? ""} /></Field> : null}
        {!editing?.credit_card_id && payment !== "card" ? <><Field label="Status" htmlFor="transaction-status"><Select id="transaction-status" name="status" defaultValue={editing?.status ?? "paid"}><option value="paid">Pago/recebido</option><option value="pending">Pendente</option></Select></Field><Field label="Vencimento" htmlFor="transaction-due"><Input id="transaction-due" name="dueDate" type="date" defaultValue={editing?.due_date ?? ""} /></Field></> : null}
        <Field label="Observações" htmlFor="transaction-notes"><Input id="transaction-notes" name="notes" defaultValue={editing?.notes ?? ""} /></Field>
        {!editing && tags.length ? <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium">Tags</legend><div className="flex flex-wrap gap-2">{tags.map((tag) => <label key={tag.id} className="flex items-center gap-2 rounded-full border px-3 py-2 text-xs"><input type="checkbox" name="tagIds" value={tag.id} />{tag.name}</label>)}</div></fieldset> : null}
        <div className="flex gap-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar lançamento"}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button></div>
      </form>
    </SectionCard>
  );
}
