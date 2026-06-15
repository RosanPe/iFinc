import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type InvestmentIncome = TableRow<"investment_income">;
export type InvestmentIncomeInput = Pick<TableInsert<"investment_income">, "account_id" | "amount" | "asset_id" | "expected_payment_date" | "income_type" | "notes" | "payment_date" | "record_date" | "status">;

export async function listInvestmentIncome() {
  const { data, error } = await getSupabaseBrowserClient().from("investment_income").select("*").order("expected_payment_date", { ascending: false }).order("payment_date", { ascending: false });
  throwIfError(error, "Não foi possível carregar os proventos.");
  return data;
}

export async function createInvestmentIncome(input: InvestmentIncomeInput) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_income").insert(input).select("*").single();
  throwIfError(error, "Não foi possível criar o provento.");
  return data;
}

export async function updateInvestmentIncome(id: string, input: TableUpdate<"investment_income">) {
  const { data, error } = await getSupabaseBrowserClient().from("investment_income").update(input).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar o provento.");
  return data;
}

export async function deleteInvestmentIncome(id: string) {
  const { error } = await getSupabaseBrowserClient().from("investment_income").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir o provento.");
}
