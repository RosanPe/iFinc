import { formatCurrency } from "@/lib/formatters";

export type LineDatum = { label: string; value: number };

export function LineChart({ data, title }: { data: LineDatum[]; title: string }) {
  if (!data.length) return <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Registre snapshots para visualizar a evolução.</div>;
  const width = 720; const height = 260; const padding = 28;
  const values = data.map((item) => item.value);
  const min = Math.min(...values); const max = Math.max(...values); const range = max - min || 1;
  const points = data.map((item, index) => ({
    ...item,
    x: data.length === 1 ? width / 2 : padding + index * (width - padding * 2) / (data.length - 1),
    y: height - padding - (item.value - min) / range * (height - padding * 2),
  }));
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

  return <figure aria-label={title} className="space-y-3"><svg role="img" aria-label={title} viewBox={`0 0 ${width} ${height}`} className="h-auto w-full overflow-visible"><defs><linearGradient id="net-worth-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" /><stop offset="100%" stopColor="var(--primary)" stopOpacity="0" /></linearGradient></defs><path d={`${path} L ${points.at(-1)?.x} ${height - padding} L ${points[0].x} ${height - padding} Z`} fill="url(#net-worth-area)" /><path d={path} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{points.map((point) => <g key={`${point.label}-${point.x}`}><circle cx={point.x} cy={point.y} r="5" fill="var(--card)" stroke="var(--primary)" strokeWidth="3"><title>{point.label}: {formatCurrency(point.value)}</title></circle></g>)}</svg><figcaption className="flex justify-between text-xs text-muted-foreground"><span>{data[0].label}</span><strong className="text-foreground">{formatCurrency(data.at(-1)?.value ?? 0)}</strong><span>{data.at(-1)?.label}</span></figcaption></figure>;
}
