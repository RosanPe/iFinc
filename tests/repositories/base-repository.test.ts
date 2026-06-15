import type { PostgrestError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { repositoryErrorMessage, RepositoryError, throwIfError } from "@/lib/repositories/base-repository";

function error(code: string): PostgrestError {
  return { code, details: "", hint: "", message: "database error", name: "PostgrestError", toJSON: () => ({ code }) } as PostgrestError;
}

describe("repository errors", () => {
  it.each([
    ["23505", "Já existe um cadastro com esses dados."],
    ["23503", "Este cadastro está sendo usado e não pode ser excluído."],
    ["23514", "Revise os campos informados."],
  ])("maps PostgreSQL code %s", (code, message) => {
    expect(() => throwIfError(error(code), "Fallback")).toThrow(message);
  });

  it("uses the operation fallback for unknown database errors", () => {
    expect(() => throwIfError(error("99999"), "Não foi possível salvar.")).toThrow("Não foi possível salvar.");
  });

  it("normalizes errors for interface feedback", () => {
    expect(repositoryErrorMessage(new RepositoryError("Falha tratada"))).toBe("Falha tratada");
    expect(repositoryErrorMessage(null, "Fallback")).toBe("Fallback");
  });
});
