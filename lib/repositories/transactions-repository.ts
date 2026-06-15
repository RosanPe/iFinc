import { monthEnd, monthStart } from "@/lib/domain/finance/dates";
import { buildTransactionRows, type CardCycle, type TransactionDraft } from "@/lib/domain/finance/transactions";
import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableRow, TableUpdate } from "@/types/database.types";

export type Transaction = TableRow<"transactions">;

export async function listTransactions(options?: { month?: string; limit?: number }) {
  let query = getSupabaseBrowserClient()
    .from("transactions")
    .select("*")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.month) {
    const start = monthStart(options.month);
    const end = monthEnd(options.month);
    query = query.or(
      `and(credit_card_id.is.null,transaction_date.gte.${start},transaction_date.lte.${end}),and(credit_card_id.not.is.null,statement_month.eq.${start})`,
    );
  }
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  throwIfError(error, "Não foi possível carregar os lançamentos.");
  return data;
}

export async function listAllTransactions() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("transactions")
    .select("*")
    .order("transaction_date");
  throwIfError(error, "Não foi possível calcular os saldos.");
  return data;
}

export async function createTransactions(draft: TransactionDraft, tagIds: string[], card?: CardCycle) {
  const rows = buildTransactionRows(draft, card);
  const { data, error } = await getSupabaseBrowserClient()
    .from("transactions")
    .insert(rows)
    .select("*");
  throwIfError(error, "Não foi possível criar o lançamento.");

  if (tagIds.length && data.length) {
    const links = data.flatMap((transaction) => tagIds.map((tagId) => ({ tag_id: tagId, transaction_id: transaction.id })));
    const { error: tagsError } = await getSupabaseBrowserClient().from("transaction_tags").insert(links);
    throwIfError(tagsError, "O lançamento foi criado, mas não foi possível vincular as tags.");
  }
  return data;
}

export async function updateTransaction(id: string, input: TableUpdate<"transactions">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("transactions")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar o lançamento.");
  return data;
}

export async function deleteTransaction(transaction: Transaction, deleteGroup = false) {
  let query = getSupabaseBrowserClient().from("transactions").delete();
  query = deleteGroup && transaction.installment_group_id
    ? query.eq("installment_group_id", transaction.installment_group_id)
    : query.eq("id", transaction.id);
  const { error } = await query;
  throwIfError(error, "Não foi possível excluir o lançamento.");
}

export async function setTransactionStatus(id: string, status: "paid" | "pending" | "cancelled") {
  return updateTransaction(id, { status });
}
