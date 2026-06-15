"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setError("");
    setSuccess("");

    if (!isSupabaseConfigured()) {
      setError("Configure o Supabase no arquivo .env.local antes de criar a conta.");
      return;
    }

    const form = new FormData(formElement);
    const password = String(form.get("password"));
    const confirmation = String(form.get("passwordConfirmation"));
    if (password !== confirmation) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const { data, error: signUpError } = await getSupabaseBrowserClient().auth.signUp({
      email: String(form.get("email")),
      password,
      options: { data: { display_name: String(form.get("displayName")).trim() } },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(
      data.session
        ? "Conta criada. Você já pode acessar o painel."
        : "Conta criada. Confirme o e-mail antes de entrar.",
    );
    formElement.reset();
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AuthMessage message={error} />
      <AuthMessage message={success} tone="success" />
      <div className="space-y-2">
        <Label htmlFor="displayName">Nome</Label>
        <Input id="displayName" name="displayName" autoComplete="name" maxLength={120} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passwordConfirmation">Confirmar senha</Label>
        <Input id="passwordConfirmation" name="passwordConfirmation" type="password" autoComplete="new-password" minLength={6} required />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já possui conta?{" "}
        <Link href="/login/" className="font-semibold text-primary hover:underline">Entrar</Link>
      </p>
    </form>
  );
}
