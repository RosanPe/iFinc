import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type Account = TableRow<"accounts">;
export type AccountInput = Pick<
  TableInsert<"accounts">,
  "account_type" | "currency" | "include_in_net_worth" | "institution" | "name" | "opening_balance"
>;

export async function listAccounts() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("accounts")
    .select("*")
    .order("is_active", { ascending: false })
    .order("name");
  throwIfError(error, "Não foi possível carregar as contas.");
  return data;
}

export async function createAccount(input: AccountInput) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("accounts")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível criar a conta.");
  return data;
}

export async function updateAccount(id: string, input: TableUpdate<"accounts">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("accounts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar a conta.");
  return data;
}

export async function deleteAccount(id: string) {
  const { error } = await getSupabaseBrowserClient().from("accounts").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a conta.");
}
