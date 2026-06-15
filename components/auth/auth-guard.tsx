"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { Card, CardContent } from "@/components/ui/card";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { configured, loading, user } = useAuth();

  useEffect(() => {
    if (configured && !loading && !user) router.replace("/login/");
  }, [configured, loading, router, user]);

  if (!configured) {
    return (
      <main className="grid min-h-dvh place-items-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-lg font-semibold">Supabase não configurado</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Crie o arquivo <code>.env.local</code> usando o exemplo do projeto para acessar a área privada.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="grid min-h-dvh place-items-center" aria-live="polite">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          Verificando sessão...
        </div>
      </main>
    );
  }

  return children;
}
