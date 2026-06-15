"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthMessage } from "@/components/auth/auth-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isSupabaseConfigured()) {
      setError("Configure o Supabase no arquivo .env.local antes de entrar.");
      return;
    }

    const form = new FormData(event.currentTarget);
    setLoading(true);
    const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setLoading(false);

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      return;
    }

    router.replace("/dashboard/");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <AuthMessage message={error} />
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Senha</Label>
          <Link href="/recuperar-senha/" className="text-sm font-medium text-primary hover:underline">
            Esqueci a senha
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" minLength={6} required />
      </div>
      <Button className="w-full" type="submit" disabled={loading}>
        {loading ? "Entrando..." : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link href="/cadastro/" className="font-semibold text-primary hover:underline">Criar conta</Link>
      </p>
    </form>
  );
}
