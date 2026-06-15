import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone?: "default" | "positive";
  onClick?: () => void;
  selected?: boolean;
};

export function MetricCard({ label, value, helper, icon: Icon, tone = "default", onClick, selected = false }: MetricCardProps) {
  const content = <CardContent className="p-4 text-left sm:p-5"><div className="mb-4 flex items-start justify-between gap-3"><p className="text-sm text-muted-foreground">{label}</p><span className="rounded-xl bg-primary/10 p-2 text-primary"><Icon className="size-4" /></span></div><p className="truncate text-xl font-bold tracking-tight sm:text-2xl">{value}</p><p className={cn("mt-1 text-xs text-muted-foreground", tone === "positive" && "text-emerald-600 dark:text-emerald-400")}>{helper}</p>{onClick ? <p className="mt-3 text-[11px] font-semibold text-primary">Ver detalhes</p> : null}</CardContent>;
  return (
    <Card className={cn("min-w-0", selected && "ring-2 ring-primary")}>
      {onClick ? <button type="button" aria-pressed={selected} className="block w-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={onClick}>{content}</button> : content}
    </Card>
  );
}
