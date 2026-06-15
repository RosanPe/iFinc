import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type Tag = TableRow<"tags">;
export type TagInput = Pick<TableInsert<"tags">, "color" | "name">;

export async function listTags() {
  const { data, error } = await getSupabaseBrowserClient().from("tags").select("*").order("name");
  throwIfError(error, "Não foi possível carregar as tags.");
  return data;
}

export async function createTag(input: TagInput) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("tags")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível criar a tag.");
  return data;
}

export async function updateTag(id: string, input: TableUpdate<"tags">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("tags")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar a tag.");
  return data;
}

export async function deleteTag(id: string) {
  const { error } = await getSupabaseBrowserClient().from("tags").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a tag.");
}
