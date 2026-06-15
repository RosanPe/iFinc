import { invoiceDueDate, statementMonth } from "@/lib/domain/finance/dates";
import { recurrenceDates } from "@/lib/domain/finance/recurrences";
import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type RecurringTransaction = TableRow<"recurring_transactions">;
export type RecurringInput = Omit<TableInsert<"recurring_transactions">, "user_id">;

export async function listRecurringTransactions() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("recurring_transactions")
    .select("*")
    .order("is_active", { ascending: false })
    .order("next_run_date");
  throwIfError(error, "Não foi possível carregar as recorrências.");
  return data;
}

export async function createRecurringTransaction(input: RecurringInput) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("recurring_transactions")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível criar a recorrência.");
  return data;
}

export async function updateRecurringTransaction(id: string, input: TableUpdate<"recurring_transactions">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("recurring_transactions")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar a recorrência.");
  return data;
}

export async function deleteRecurringTransaction(id: string) {
  const client = getSupabaseBrowserClient();
  const { error: unlinkError } = await client
    .from("transactions")
    .update({ recurrence_date: null, recurring_transaction_id: null })
    .eq("recurring_transaction_id", id);
  throwIfError(unlinkError, "Não foi possível desvincular os lançamentos gerados pela recorrência.");

  const { error } = await client.from("recurring_transactions").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a recorrência.");
}

export async function generateRecurringOccurrences(
  recurring: RecurringTransaction,
  throughDate: string,
  card?: { closingDay: number; dueDay: number },
) {
  const result = recurrenceDates(recurring.next_run_date, recurring.frequency, throughDate, recurring.end_date);
  if (!result.dates.length) return 0;

  const rows: TableInsert<"transactions">[] = result.dates.map((date) => {
    const cardStatement = recurring.credit_card_id && card ? statementMonth(date, card.closingDay, card.dueDay) : null;
    return {
      account_id: recurring.account_id,
      amount: recurring.amount,
      category_id: recurring.category_id,
      credit_card_id: recurring.credit_card_id,
      description: recurring.description,
      due_date: cardStatement && card ? invoiceDueDate(cardStatement, card.dueDay) : date,
      kind: recurring.kind,
      merchant: recurring.merchant,
      recurrence_date: date,
      recurring_transaction_id: recurring.id,
      statement_month: cardStatement,
      status: recurring.credit_card_id ? "pending" : "paid",
      transaction_date: date,
    };
  });

  const { data: existing, error: existingError } = await getSupabaseBrowserClient()
    .from("transactions")
    .select("recurrence_date")
    .eq("recurring_transaction_id", recurring.id)
    .in("recurrence_date", result.dates);
  throwIfError(existingError, "Não foi possível verificar as ocorrências existentes.");

  const existingDates = new Set(existing.map((item) => item.recurrence_date));
  const missingRows = rows.filter((row) => !existingDates.has(row.recurrence_date ?? null));
  if (missingRows.length) {
    const { error } = await getSupabaseBrowserClient().from("transactions").insert(missingRows);
    throwIfError(error, "Não foi possível gerar as ocorrências.");
  }
  await updateRecurringTransaction(recurring.id, { next_run_date: result.nextRunDate });
  return missingRows.length;
}
