import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type Asset = TableRow<"assets">;
export type AssetInput = Pick<TableInsert<"assets">, "asset_class_id" | "currency" | "current_price" | "name" | "ticker">;

export async function listAssets() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("assets")
    .select("*")
    .order("is_active", { ascending: false })
    .order("ticker");
  throwIfError(error, "Não foi possível carregar os ativos.");
  return data;
}

export async function createAsset(input: AssetInput) {
  const payload = input.current_price === null
    ? input
    : { ...input, price_updated_at: new Date().toISOString() };
  const { data, error } = await getSupabaseBrowserClient().from("assets").insert(payload).select("*").single();
  throwIfError(error, "Não foi possível criar o ativo.");
  return data;
}

export async function updateAsset(id: string, input: TableUpdate<"assets">) {
  const nextInput = input.current_price === undefined
    ? input
    : { ...input, price_updated_at: input.current_price === null ? null : new Date().toISOString() };
  const { data, error } = await getSupabaseBrowserClient().from("assets").update(nextInput).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar o ativo.");
  return data;
}

export async function deleteAsset(id: string) {
  const { error } = await getSupabaseBrowserClient().from("assets").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir o ativo.");
}
