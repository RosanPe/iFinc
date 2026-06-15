import type { PostgrestError } from "@supabase/supabase-js";

export class RepositoryError extends Error {
  constructor(message: string, readonly cause?: PostgrestError) {
    super(message);
    this.name = "RepositoryError";
  }
}

export function repositoryErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado.") {
  return error instanceof RepositoryError || error instanceof Error ? error.message : fallback;
}

export function throwIfError(error: PostgrestError | null, fallback: string): asserts error is null {
  if (!error) return;

  if (error.code === "23505") {
    throw new RepositoryError("Já existe um cadastro com esses dados.", error);
  }
  if (error.code === "23503") {
    throw new RepositoryError("Este cadastro está sendo usado e não pode ser excluído.", error);
  }
  if (error.code === "23514") {
    throw new RepositoryError("Revise os campos informados.", error);
  }

  throw new RepositoryError(fallback, error);
}
