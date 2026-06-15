import { RefreshCw, WifiOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function OfflineNotice() {
  return <div role="status" className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200"><WifiOff className="mt-0.5 size-4 shrink-0" /><p>Você está offline. Os dados já carregados continuam visíveis, mas consultas e alterações exigem conexão.</p></div>;
}

export function DataError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300"><p>{message}</p><Button type="button" variant="outline" size="sm" onClick={onRetry}><RefreshCw />Tentar novamente</Button></div>;
}
