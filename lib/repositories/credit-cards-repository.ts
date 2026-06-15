import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type CreditCard = TableRow<"credit_cards">;
export type CreditCardInput = Pick<
  TableInsert<"credit_cards">,
  "account_id" | "brand" | "closing_day" | "credit_limit" | "due_day" | "name"
>;

export async function listCreditCards() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("credit_cards")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");
  throwIfError(error, "Não foi possível carregar os cartões.");
  return data;
}

export async function createCreditCard(input: CreditCardInput) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("credit_cards")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível criar o cartão.");
  return data;
}

export async function updateCreditCard(id: string, input: TableUpdate<"credit_cards">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("credit_cards")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar o cartão.");
  return data;
}

export async function deleteCreditCard(id: string) {
  const { error } = await getSupabaseBrowserClient().from("credit_cards").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir o cartão.");
}
