import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type Budget = TableRow<"budgets">;
export type BudgetInput = Pick<TableInsert<"budgets">, "alert_percentage" | "amount" | "category_id" | "period_month">;

export async function listBudgets(month: string) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("budgets")
    .select("*")
    .eq("period_month", month)
    .order("created_at");
  throwIfError(error, "Não foi possível carregar os orçamentos.");
  return data;
}

export async function createBudget(input: BudgetInput) {
  const { data, error } = await getSupabaseBrowserClient().from("budgets").insert(input).select("*").single();
  throwIfError(error, "Não foi possível criar o orçamento.");
  return data;
}

export async function updateBudget(id: string, input: TableUpdate<"budgets">) {
  const { data, error } = await getSupabaseBrowserClient().from("budgets").update(input).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar o orçamento.");
  return data;
}

export async function deleteBudget(id: string) {
  const { error } = await getSupabaseBrowserClient().from("budgets").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir o orçamento.");
}
