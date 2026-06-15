import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow, TableUpdate } from "@/types/database.types";

export type Category = TableRow<"categories">;
export type CategoryInput = Pick<
  TableInsert<"categories">,
  "color" | "kind" | "name" | "parent_category_id"
>;

export async function listCategories() {
  const { data, error } = await getSupabaseBrowserClient()
    .from("categories")
    .select("*")
    .order("kind")
    .order("name");
  throwIfError(error, "Não foi possível carregar as categorias.");
  return data;
}

export async function createCategory(input: CategoryInput) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("categories")
    .insert(input)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível criar a categoria.");
  return data;
}

export async function updateCategory(id: string, input: TableUpdate<"categories">) {
  const { data, error } = await getSupabaseBrowserClient()
    .from("categories")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  throwIfError(error, "Não foi possível atualizar a categoria.");
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await getSupabaseBrowserClient().from("categories").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir a categoria.");
}
