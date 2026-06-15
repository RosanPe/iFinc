import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type AssetClass = TableRow<"asset_classes">;
export type AssetClassInput = Pick<TableInsert<"asset_classes">, "color" | "name">;

export async function listAssetClasses() {
  const { data, error } = await getSupabaseBrowserClient().from("asset_classes").select("*").order("name");
  throwIfError(error, "Não foi possível carregar as classes de ativos.");
  return data;
}

export async function createAssetClass(input: AssetClassInput) {
  const { data, error } = await getSupabaseBrowserClient().from("asset_classes").insert(input).select("*").single();
  throwIfError(error, "Não foi possível criar a classe de ativo.");
  return data;
}

export async function updateAssetClass(id: string, input: TableUpdate<"asset_classes">) {
  const { data, error } = await getSupabaseBrowserClient().from("asset_classes").update(input).eq("id", id).select("*").single();
  throwIfError(error, "Não foi possível atualizar a classe de ativo.");
  return data;
}

export async function deleteAssetClass(id: string) {
  const { error } = await getSupabaseBrowserClient().from("asset_classes").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a classe de ativo.");
}
