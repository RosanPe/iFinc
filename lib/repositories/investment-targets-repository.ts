import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type InvestmentTarget = TableRow<"investment_targets">;
export type InvestmentTargetInput = Pick<TableInsert<"investment_targets">, "asset_class_id" | "asset_id" | "target_percentage">;

export async function listInvestmentTargets() {
  const { data, error } = await getSupabaseBrowserClient().from("investment_targets").select("*").order("created_at");
  throwIfError(error, "Não foi possível carregar as metas de alocação.");
  return data;
}

export async function createInvestmentTarget(input: InvestmentTargetInput) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_targets").insert(input).select("*").single();
  throwIfError(error, "Não foi possível criar a meta de alocação.");
  return data;
}

export async function updateInvestmentTarget(id: string, input: TableUpdate<"investment_targets">) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_targets").update(input).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar a meta de alocação.");
  return data;
}

export async function deleteInvestmentTarget(id: string) {
  const { error } = await getSupabaseBrowserClient().from("investment_targets").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a meta de alocação.");
}
