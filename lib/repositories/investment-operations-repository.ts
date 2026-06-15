import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type InvestmentOperation = TableRow<"investment_operations">;
export type InvestmentOperationInput = Pick<
  TableInsert<"investment_operations">,
  "account_id" | "asset_id" | "fees" | "kind" | "notes" | "operation_date" | "quantity" | "unit_price"
>;

export async function listInvestmentOperations() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("investment_operations")
    .select("*")
    .order("operation_date", { ascending: false })
    .order("created_at", { ascending: false });
  throwIfError(error, "Não foi possível carregar as operações.");
  return data;
}

export async function createInvestmentOperation(input: InvestmentOperationInput) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_operations").insert(input).select("*").single();
  throwIfError(error, "Não foi possível criar a operação.");
  return data;
}

export async function updateInvestmentOperation(id: string, input: TableUpdate<"investment_operations">) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_operations").update(input).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar a operação.");
  return data;
}

export async function deleteInvestmentOperation(id: string) {
  const { error } = await getSupabaseBrowserClient().from("investment_operations").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a operação.");
}
