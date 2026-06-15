"use client";

import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <div role="alert" className="mx-auto flex min-h-72 max-w-lg flex-col items-center justify-center rounded-2xl border bg-card p-8 text-center"><span className="rounded-2xl bg-red-500/10 p-4 text-red-600"><CircleAlert /></span><h1 className="mt-4 text-xl font-bold">Não foi possível abrir esta área</h1><p className="mt-2 text-sm text-muted-foreground">Tente novamente. Se o problema persistir, verifique sua conexão e a configuração do Supabase.</p><Button className="mt-5" onClick={reset}><RefreshCw />Tentar novamente</Button></div>;
}
