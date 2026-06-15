import { throwIfError } from "@/lib/repositories/base-repository";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { TableInsert, TableRow } from "@/types/database.types";

export type NetWorthSnapshot = TableRow<"net_worth_snapshots">;
export type NetWorthSnapshotInput = Pick<TableInsert<"net_worth_snapshots">, "accounts_value" | "investments_value" | "liabilities_value" | "snapshot_date">;

export async function listNetWorthSnapshots() {
  const { data, error } = await getSupabaseBrowserClient().from("net_worth_snapshots").select("*").order("snapshot_date");
  throwIfError(error, "Não foi possível carregar o histórico patrimonial.");
  return data;
}

export async function saveNetWorthSnapshot(input: NetWorthSnapshotInput) {
  const { data, error } = await getSupabaseBrowserClient().from("net_worth_snapshots").upsert(input, { onConflict: "user_id,snapshot_date" }).select("*").single();
  throwIfError(error, "Não foi possível registrar o patrimônio.");
  return data;
}

export async function deleteNetWorthSnapshot(id: string) {
  const { error } = await getSupabaseBrowserClient().from("net_worth_snapshots").delete().eq("id", id);
  throwIfError(error, "Não foi possível excluir o registro patrimonial.");
}
