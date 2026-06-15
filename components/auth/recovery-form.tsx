"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function RecoveryForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (!isSupabaseConfigured()) {
      setError("Configure o Supabase no arquivo .env.local.");
      return;
    }

    const form = new FormData(event.currentTarget);
    const redirectTo = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/redefinir-senha/`;
    setLoading(true);
    const { error: recoveryError } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(
      String(form.get("email")),
      { redirectTo },
    );
    setLoading(false);

    if (recoveryError) {
      setError(recoveryError.message);
      return;
    }
    setSuccess("Enviamos as instruções de recuperação para o seu e-mail.");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AuthMessage message={error} />
      <AuthMessage message={success} tone="success" />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar instruções"}
      </Button>
      <Link href="/login/" className="block text-center text-sm font-semibold text-primary hover:underline">
        Voltar para o login
      </Link>
    </form>
  );
}
