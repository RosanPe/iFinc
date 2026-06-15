"use client";

import {
  Building2,
  Check,
  CreditCard as CreditCardIcon,
  FolderTree,
  LoaderCircle,
  Pencil,
  Plus,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  createAccount,
  deleteAccount,
  listAccounts,
  type Account,
  updateAccount,
} from "@/lib/repositories/accounts-repository";
import {
  createCategory,
  deleteCategory,
  listCategories,
  type Category,
  updateCategory,
} from "@/lib/repositories/categories-repository";
import {
  createCreditCard,
  deleteCreditCard,
  listCreditCards,
  type CreditCard,
  updateCreditCard,
} from "@/lib/repositories/credit-cards-repository";
import { RepositoryError } from "@/lib/repositories/base-repository";
import { createTag, deleteTag, listTags, type Tag, updateTag } from "@/lib/repositories/tags-repository";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type Section = "accounts" | "cards" | "categories" | "tags";
type Feedback = { message: string; tone: "error" | "success" } | null;

const sections = [
  { id: "accounts" as const, label: "Contas", icon: Building2 },
  { id: "cards" as const, label: "Cartões", icon: CreditCardIcon },
  { id: "categories" as const, label: "Categorias", icon: FolderTree },
  { id: "tags" as const, label: "Tags", icon: Tags },
];

const accountTypeLabels: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro",
  investment: "Conta de investimento",
  other: "Outra",
};

function errorMessage(error: unknown) {
  return error instanceof RepositoryError || error instanceof Error
    ? error.message
    : "Ocorreu um erro inesperado.";
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-1 text-[11px] font-semibold",
        active
          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "bg-muted text-muted-foreground",
      )}
    >
      {active ? "Ativo" : "Inativo"}
    </span>
  );
}

function ItemActions({
  active,
  canToggle = true,
  onDelete,
  onEdit,
  onToggle,
}: {
  active?: boolean;
  canToggle?: boolean;
  onDelete: () => void;
  onEdit: () => void;
  onToggle?: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      {canToggle && onToggle ? (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={active ? "Desativar" : "Ativar"}
          onClick={onToggle}
        >
          {active ? <X /> : <Check />}
        </Button>
      ) : null}
      <Button type="button" size="icon" variant="ghost" aria-label="Editar" onClick={onEdit}>
        <Pencil />
      </Button>
      <Button type="button" size="icon" variant="ghost" aria-label="Excluir" onClick={onDelete}>
        <Trash2 />
      </Button>
    </div>
  );
}

export function FinanceSettings() {
  const [section, setSection] = useState<Section>("accounts");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const [nextAccounts, nextCards, nextCategories, nextTags] = await Promise.all([
        listAccounts(),
        listCreditCards(),
        listCategories(),
        listTags(),
      ]);
      setAccounts(nextAccounts);
      setCards(nextCards);
      setCategories(nextCategories);
      setTags(nextTags);
    } catch (error) {
      setFeedback({ message: errorMessage(error), tone: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void Promise.all([listAccounts(), listCreditCards(), listCategories(), listTags()])
      .then(([nextAccounts, nextCards, nextCategories, nextTags]) => {
        if (!active) return;
        setAccounts(nextAccounts);
        setCards(nextCards);
        setCategories(nextCategories);
        setTags(nextTags);
      })
      .catch((error: unknown) => {
        if (active) setFeedback({ message: errorMessage(error), tone: "error" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function changeSection(nextSection: Section) {
    setSection(nextSection);
    setEditingId(null);
    setFeedback(null);
  }

  async function runMutation(action: () => Promise<unknown>, successMessage: string) {
    setSaving(true);
    setFeedback(null);
    try {
      await action();
      await loadData();
      setEditingId(null);
      setFeedback({ message: successMessage, tone: "success" });
      return true;
    } catch (error) {
      setFeedback({ message: errorMessage(error), tone: "error" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(label: string, action: () => Promise<void>) {
    if (!window.confirm(`Excluir ${label}? Esta ação não pode ser desfeita.`)) return;
    await runMutation(action, "Cadastro excluído.");
  }

  const activeAccounts = useMemo(() => accounts.filter((account) => account.is_active), [accounts]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-sm text-muted-foreground">Configuração financeira</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Cadastros</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Organize as bases usadas nos lançamentos, faturas e relatórios.
        </p>
      </header>

      <nav aria-label="Tipos de cadastro" className="grid grid-cols-4 gap-1 rounded-2xl bg-muted p-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={section === id}
            className={cn(
              "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[11px] font-semibold text-muted-foreground transition-colors sm:flex-row sm:text-sm",
              section === id && "bg-background text-foreground shadow-sm",
            )}
            onClick={() => changeSection(id)}
          >
            <Icon className="size-4" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      <AuthMessage message={feedback?.message} tone={feedback?.tone} />

      {loading ? (
        <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <LoaderCircle className="size-5 animate-spin" />
          Carregando cadastros...
        </div>
      ) : (
        <>
          {section === "accounts" ? (
            <AccountsSection
              accounts={accounts}
              editingId={editingId}
              saving={saving}
              onCancel={() => setEditingId(null)}
              onDelete={(account) => confirmDelete(account.name, () => deleteAccount(account.id))}
              onEdit={setEditingId}
              onSave={(action, message) => runMutation(action, message)}
              onToggle={(account) => runMutation(
                () => updateAccount(account.id, { is_active: !account.is_active }),
                account.is_active ? "Conta desativada." : "Conta ativada.",
              )}
            />
          ) : null}
          {section === "cards" ? (
            <CardsSection
              accounts={activeAccounts}
              cards={cards}
              editingId={editingId}
              saving={saving}
              onCancel={() => setEditingId(null)}
              onDelete={(card) => confirmDelete(card.name, () => deleteCreditCard(card.id))}
              onEdit={setEditingId}
              onSave={(action, message) => runMutation(action, message)}
              onToggle={(card) => runMutation(
                () => updateCreditCard(card.id, { is_active: !card.is_active }),
                card.is_active ? "Cartão desativado." : "Cartão ativado.",
              )}
            />
          ) : null}
          {section === "categories" ? (
            <CategoriesSection
              key={editingId ?? "new-category"}
              categories={categories}
              editingId={editingId}
              saving={saving}
              onCancel={() => setEditingId(null)}
              onDelete={(category) => confirmDelete(category.name, () => deleteCategory(category.id))}
              onEdit={setEditingId}
              onSave={(action, message) => runMutation(action, message)}
              onToggle={(category) => runMutation(
                () => updateCategory(category.id, { is_active: !category.is_active }),
                category.is_active ? "Categoria desativada." : "Categoria ativada.",
              )}
            />
          ) : null}
          {section === "tags" ? (
            <TagsSection
              tags={tags}
              editingId={editingId}
              saving={saving}
              onCancel={() => setEditingId(null)}
              onDelete={(tag) => confirmDelete(tag.name, () => deleteTag(tag.id))}
              onEdit={setEditingId}
              onSave={(action, message) => runMutation(action, message)}
            />
          ) : null}
        </>
      )}
    </div>
  );
}

type SharedSectionProps<T> = {
  editingId: string | null;
  saving: boolean;
  onCancel: () => void;
  onDelete: (item: T) => void;
  onEdit: (id: string) => void;
  onSave: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
};

function AccountsSection({ accounts, editingId, saving, onCancel, onDelete, onEdit, onSave, onToggle }: SharedSectionProps<Account> & {
  accounts: Account[];
  onToggle: (account: Account) => void;
}) {
  const editing = accounts.find((account) => account.id === editingId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const input = {
      account_type: String(form.get("accountType")),
      currency: "BRL",
      include_in_net_worth: form.get("includeInNetWorth") === "on",
      institution: String(form.get("institution")).trim() || null,
      name: String(form.get("name")).trim(),
      opening_balance: Number(form.get("openingBalance")),
    };
    const saved = await onSave(
      () => editing ? updateAccount(editing.id, input) : createAccount(input),
      editing ? "Conta atualizada." : "Conta criada.",
    );
    if (saved) formElement.reset();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <EditorCard title={editing ? "Editar conta" : "Nova conta"} description="Contas bancárias, carteiras e dinheiro.">
        <form key={editing?.id ?? "new-account"} className="space-y-4" onSubmit={submit}>
          <Field label="Nome" htmlFor="account-name"><Input id="account-name" name="name" defaultValue={editing?.name} maxLength={80} required /></Field>
          <Field label="Tipo" htmlFor="account-type">
            <Select id="account-type" name="accountType" defaultValue={editing?.account_type ?? "checking"}>
              {Object.entries(accountTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Select>
          </Field>
          <Field label="Instituição" htmlFor="account-institution"><Input id="account-institution" name="institution" defaultValue={editing?.institution ?? ""} maxLength={80} /></Field>
          <Field label="Saldo inicial" htmlFor="account-opening-balance"><Input id="account-opening-balance" name="openingBalance" type="number" step="0.01" defaultValue={editing?.opening_balance ?? 0} required /></Field>
          <CheckboxField name="includeInNetWorth" defaultChecked={editing?.include_in_net_worth ?? true}>Incluir no patrimônio total</CheckboxField>
          <FormActions editing={Boolean(editing)} saving={saving} onCancel={onCancel} />
        </form>
      </EditorCard>
      <ListCard title="Contas cadastradas" count={accounts.length}>
        {accounts.length ? accounts.map((account) => (
          <ListItem key={account.id} title={account.name} subtitle={`${accountTypeLabels[account.account_type] ?? account.account_type}${account.institution ? ` · ${account.institution}` : ""}`} meta={formatCurrency(account.opening_balance)} status={<StatusBadge active={account.is_active} />} actions={<ItemActions active={account.is_active} onEdit={() => onEdit(account.id)} onToggle={() => onToggle(account)} onDelete={() => onDelete(account)} />} />
        )) : <EmptyState>Nenhuma conta cadastrada.</EmptyState>}
      </ListCard>
    </div>
  );
}

function CardsSection({ accounts, cards, editingId, saving, onCancel, onDelete, onEdit, onSave, onToggle }: SharedSectionProps<CreditCard> & {
  accounts: Account[];
  cards: CreditCard[];
  onToggle: (card: CreditCard) => void;
}) {
  const editing = cards.find((card) => card.id === editingId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const input = {
      account_id: String(form.get("accountId")) || null,
      brand: String(form.get("brand")).trim() || null,
      closing_day: Number(form.get("closingDay")),
      credit_limit: Number(form.get("creditLimit")),
      due_day: Number(form.get("dueDay")),
      name: String(form.get("name")).trim(),
    };
    const saved = await onSave(
      () => editing ? updateCreditCard(editing.id, input) : createCreditCard(input),
      editing ? "Cartão atualizado." : "Cartão criado.",
    );
    if (saved) formElement.reset();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <EditorCard title={editing ? "Editar cartão" : "Novo cartão"} description="Limite, fechamento e vencimento da fatura.">
        <form key={editing?.id ?? "new-card"} className="space-y-4" onSubmit={submit}>
          <Field label="Nome" htmlFor="card-name"><Input id="card-name" name="name" defaultValue={editing?.name} maxLength={80} required /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bandeira" htmlFor="card-brand"><Input id="card-brand" name="brand" defaultValue={editing?.brand ?? ""} maxLength={40} /></Field>
            <Field label="Limite" htmlFor="card-limit"><Input id="card-limit" name="creditLimit" type="number" min="0" step="0.01" defaultValue={editing?.credit_limit ?? 0} required /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fechamento" htmlFor="card-closing"><Input id="card-closing" name="closingDay" type="number" min="1" max="31" defaultValue={editing?.closing_day ?? 1} required /></Field>
            <Field label="Vencimento" htmlFor="card-due"><Input id="card-due" name="dueDay" type="number" min="1" max="31" defaultValue={editing?.due_day ?? 10} required /></Field>
          </div>
          <Field label="Conta para pagamento" htmlFor="card-account">
            <Select id="card-account" name="accountId" defaultValue={editing?.account_id ?? ""}>
              <option value="">Não vinculada</option>
              {accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
            </Select>
          </Field>
          <FormActions editing={Boolean(editing)} saving={saving} onCancel={onCancel} />
        </form>
      </EditorCard>
      <ListCard title="Cartões cadastrados" count={cards.length}>
        {cards.length ? cards.map((card) => (
          <ListItem key={card.id} title={card.name} subtitle={`Fecha dia ${card.closing_day} · vence dia ${card.due_day}`} meta={formatCurrency(card.credit_limit)} status={<StatusBadge active={card.is_active} />} actions={<ItemActions active={card.is_active} onEdit={() => onEdit(card.id)} onToggle={() => onToggle(card)} onDelete={() => onDelete(card)} />} />
        )) : <EmptyState>Nenhum cartão cadastrado.</EmptyState>}
      </ListCard>
    </div>
  );
}

function CategoriesSection({ categories, editingId, saving, onCancel, onDelete, onEdit, onSave, onToggle }: SharedSectionProps<Category> & {
  categories: Category[];
  onToggle: (category: Category) => void;
}) {
  const editing = categories.find((category) => category.id === editingId);
  const [kind, setKind] = useState<"income" | "expense">(
    editing?.kind === "income" ? "income" : "expense",
  );

  const possibleParents = categories.filter((category) => category.kind === kind && !category.parent_category_id && category.id !== editing?.id);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const input = {
      color: String(form.get("color")),
      kind,
      name: String(form.get("name")).trim(),
      parent_category_id: String(form.get("parentCategoryId")) || null,
    };
    const saved = await onSave(
      () => editing ? updateCategory(editing.id, input) : createCategory(input),
      editing ? "Categoria atualizada." : "Categoria criada.",
    );
    if (saved) formElement.reset();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <EditorCard title={editing ? "Editar categoria" : "Nova categoria"} description="Use categoria principal ou subcategoria.">
        <form key={editing?.id ?? "new-category"} className="space-y-4" onSubmit={submit}>
          <Field label="Nome" htmlFor="category-name"><Input id="category-name" name="name" defaultValue={editing?.name} maxLength={80} required /></Field>
          <Field label="Tipo" htmlFor="category-kind">
            <Select id="category-kind" name="kind" value={kind} onChange={(event) => setKind(event.target.value as "income" | "expense")}>
              <option value="expense">Despesa</option>
              <option value="income">Receita</option>
            </Select>
          </Field>
          <Field label="Categoria principal" htmlFor="category-parent">
            <Select id="category-parent" name="parentCategoryId" defaultValue={editing?.parent_category_id ?? ""}>
              <option value="">Nenhuma, esta é principal</option>
              {possibleParents.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </Select>
          </Field>
          <Field label="Cor" htmlFor="category-color"><Input className="h-11 p-1" id="category-color" name="color" type="color" defaultValue={editing?.color ?? (kind === "income" ? "#10b981" : "#f97316")} /></Field>
          <FormActions editing={Boolean(editing)} saving={saving} onCancel={onCancel} />
        </form>
      </EditorCard>
      <ListCard title="Categorias cadastradas" count={categories.length}>
        {categories.length ? categories.map((category) => {
          const parent = categories.find((item) => item.id === category.parent_category_id);
          return <ListItem key={category.id} color={category.color} title={category.name} subtitle={`${category.kind === "income" ? "Receita" : "Despesa"}${parent ? ` · ${parent.name}` : " · Principal"}`} status={<StatusBadge active={category.is_active} />} actions={<ItemActions active={category.is_active} onEdit={() => onEdit(category.id)} onToggle={() => onToggle(category)} onDelete={() => onDelete(category)} />} />;
        }) : <EmptyState>Nenhuma categoria cadastrada.</EmptyState>}
      </ListCard>
    </div>
  );
}

function TagsSection({ tags, editingId, saving, onCancel, onDelete, onEdit, onSave }: SharedSectionProps<Tag> & { tags: Tag[] }) {
  const editing = tags.find((tag) => tag.id === editingId);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const input = { color: String(form.get("color")), name: String(form.get("name")).trim() };
    const saved = await onSave(
      () => editing ? updateTag(editing.id, input) : createTag(input),
      editing ? "Tag atualizada." : "Tag criada.",
    );
    if (saved) formElement.reset();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <EditorCard title={editing ? "Editar tag" : "Nova tag"} description="Marcadores livres para filtrar lançamentos.">
        <form key={editing?.id ?? "new-tag"} className="space-y-4" onSubmit={submit}>
          <Field label="Nome" htmlFor="tag-name"><Input id="tag-name" name="name" defaultValue={editing?.name} maxLength={50} required /></Field>
          <Field label="Cor" htmlFor="tag-color"><Input className="h-11 p-1" id="tag-color" name="color" type="color" defaultValue={editing?.color ?? "#3b82f6"} /></Field>
          <FormActions editing={Boolean(editing)} saving={saving} onCancel={onCancel} />
        </form>
      </EditorCard>
      <ListCard title="Tags cadastradas" count={tags.length}>
        {tags.length ? tags.map((tag) => (
          <ListItem key={tag.id} color={tag.color} title={tag.name} subtitle="Marcador" actions={<ItemActions canToggle={false} onEdit={() => onEdit(tag.id)} onDelete={() => onDelete(tag)} />} />
        )) : <EmptyState>Nenhuma tag cadastrada.</EmptyState>}
      </ListCard>
    </div>
  );
}

function EditorCard({ children, description, title }: { children: ReactNode; description: string; title: string }) {
  return <Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card>;
}

function ListCard({ children, count, title }: { children: ReactNode; count: number; title: string }) {
  return <Card><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{title}</CardTitle><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold">{count}</span></div></CardHeader><CardContent className="space-y-2">{children}</CardContent></Card>;
}

function Field({ children, htmlFor, label }: { children: ReactNode; htmlFor: string; label: string }) {
  return <div className="space-y-2"><Label htmlFor={htmlFor}>{label}</Label>{children}</div>;
}

function CheckboxField({ children, defaultChecked, name }: { children: ReactNode; defaultChecked: boolean; name: string }) {
  return <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 text-sm"><input className="size-4 accent-primary" type="checkbox" name={name} defaultChecked={defaultChecked} />{children}</label>;
}

function FormActions({ editing, onCancel, saving }: { editing: boolean; onCancel: () => void; saving: boolean }) {
  return <div className="flex gap-2"><Button className="flex-1" type="submit" disabled={saving}>{saving ? "Salvando..." : editing ? "Salvar alterações" : <><Plus />Adicionar</>}</Button>{editing ? <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button> : null}</div>;
}

function ListItem({ actions, color, meta, status, subtitle, title }: { actions: ReactNode; color?: string | null; meta?: string; status?: ReactNode; subtitle: string; title: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 p-3">
      {color ? <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: color }} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold">{title}</p>{status}</div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        {meta ? <p className="mt-1 text-sm font-medium">{meta}</p> : null}
      </div>
      {actions}
    </div>
  );
}
