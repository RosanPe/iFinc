import { formatCurrency, formatPercent } from "@/lib/formatters";

export type DonutDatum = { color: string; label: string; value: number };

export function DonutChart({ data, title }: { data: DonutDatum[]; title: string }) {
  const positive = data.filter((item) => item.value > 0);
  const total = positive.reduce((sum, item) => sum + item.value, 0);
  const segments = positive.map((item, index) => {
    const start = positive.slice(0, index).reduce((sum, entry) => sum + entry.value / total * 100, 0);
    const end = start + item.value / total * 100;
    return `${item.color} ${start}% ${end}%`;
  });

  if (!total) return <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Sem valores para exibir no gráfico.</div>;

  return <figure aria-label={title} className="grid gap-6 sm:grid-cols-[minmax(180px,240px)_1fr] sm:items-center"><div className="relative mx-auto aspect-square w-full max-w-56 rounded-full" style={{ background: `conic-gradient(${segments.join(",")})` }}><div className="absolute inset-[23%] flex flex-col items-center justify-center rounded-full bg-card text-center"><span className="text-xs text-muted-foreground">Total</span><strong className="mt-1 text-base">{formatCurrency(total)}</strong></div></div><figcaption className="space-y-3">{positive.map((item) => <div key={item.label} className="flex items-center gap-3 text-sm"><span className="size-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="min-w-0 flex-1 truncate">{item.label}</span><span className="text-right"><strong>{formatPercent(item.value / total)}</strong><span className="ml-2 text-xs text-muted-foreground">{formatCurrency(item.value)}</span></span></div>)}</figcaption></figure>;
}
