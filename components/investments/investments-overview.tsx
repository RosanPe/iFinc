import { CircleDollarSign, Scale, TrendingUp, WalletCards } from "lucide-react";

import { DonutChart } from "@/components/charts/donut-chart";
import { EmptyState, SectionCard } from "@/components/finance/finance-shared";
import { Card, CardContent } from "@/components/ui/card";
import { calculatePositions, positionMarketValue, positionUnrealizedProfit } from "@/lib/domain/investments/positions";
import { formatCurrency, formatMoney, formatPercent } from "@/lib/formatters";
import type { AssetClass } from "@/lib/repositories/asset-classes-repository";
import type { Asset } from "@/lib/repositories/assets-repository";
import type { InvestmentOperation } from "@/lib/repositories/investment-operations-repository";

type Props = { assetClasses: AssetClass[]; assets: Asset[]; operations: InvestmentOperation[] };

export function InvestmentsOverview({ assetClasses, assets, operations }: Props) {
  const positions = calculatePositions(operations).filter((position) => position.quantity > 0);
  const rows = positions.map((position) => {
    const asset = assets.find((item) => item.id === position.assetId);
    const marketValue = positionMarketValue(position, asset?.current_price === null || asset?.current_price === undefined ? null : Number(asset.current_price));
    const unrealizedProfit = positionUnrealizedProfit(position, asset?.current_price === null || asset?.current_price === undefined ? null : Number(asset.current_price));
    return { asset, marketValue, position, unrealizedProfit };
  });
  const brlRows = rows.filter((row) => row.asset?.currency === "BRL");
  const investedCost = brlRows.reduce((sum, row) => sum + row.position.investedCost, 0);
  const knownMarketValue = brlRows.reduce((sum, row) => sum + (row.marketValue ?? row.position.investedCost), 0);
  const unrealizedProfit = brlRows.reduce((sum, row) => sum + (row.unrealizedProfit ?? 0), 0);
  const realizedProfit = calculatePositions(operations).filter((position) => assets.find((asset) => asset.id === position.assetId)?.currency === "BRL").reduce((sum, position) => sum + position.realizedProfit, 0);
  const distribution = assetClasses.map((assetClass) => ({
    color: assetClass.color ?? "#64748b",
    label: assetClass.name,
    value: rows.filter((row) => row.asset?.asset_class_id === assetClass.id && row.asset.currency === "BRL").reduce((sum, row) => sum + (row.marketValue ?? row.position.investedCost), 0),
  }));

  const metrics = [
    { label: "Valor da carteira", value: formatCurrency(knownMarketValue), icon: WalletCards },
    { label: "Custo investido", value: formatCurrency(investedCost), icon: CircleDollarSign },
    { label: "Resultado em aberto", value: formatCurrency(unrealizedProfit), icon: TrendingUp },
    { label: "Resultado realizado", value: formatCurrency(realizedProfit), icon: Scale },
  ];

  return <div className="space-y-5"><header><p className="text-sm text-muted-foreground">Posição consolidada</p><h1 className="mt-1 text-2xl font-bold">Minha carteira</h1></header>{assets.some((asset) => asset.currency !== "BRL") ? <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">Os totais e a distribuição consideram somente BRL. Posições estrangeiras aparecem abaixo na moeda original.</p> : null}<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="p-4"><Icon className="mb-3 size-5 text-primary" /><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-bold">{value}</p></CardContent></Card>)}</div><SectionCard title="Distribuição por classe" description="Valores em BRL; usa cotação atual ou custo investido como fallback."><DonutChart title="Distribuição da carteira por classe" data={distribution} /></SectionCard><SectionCard title="Posições atuais" description="Preço médio considera as taxas informadas nas compras.">{rows.length ? <div className="space-y-3">{rows.map(({ asset, marketValue, position, unrealizedProfit: result }) => { const assetClass = assetClasses.find((item) => item.id === asset?.asset_class_id); const performance = result === null || position.investedCost === 0 ? null : result / position.investedCost; const currency = asset?.currency ?? "BRL"; return <div key={position.assetId} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="min-w-0"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ backgroundColor: assetClass?.color ?? "#64748b" }} /><p className="truncate font-semibold">{asset?.ticker ?? "Ativo"} · {asset?.name}</p></div><p className="mt-1 text-xs text-muted-foreground">{position.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 8 })} cotas · preço médio {formatMoney(position.averagePrice, currency)}</p></div><div className="sm:text-right"><p className="text-xs text-muted-foreground">Valor atual</p><p className="font-semibold">{marketValue === null ? "Sem cotação" : formatMoney(marketValue, currency)}</p></div><div className="sm:min-w-28 sm:text-right"><p className="text-xs text-muted-foreground">Resultado</p><p className={result !== null && result < 0 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{result === null ? "-" : `${formatMoney(result, currency)} (${formatPercent(performance ?? 0)})`}</p></div></div>; })}</div> : <EmptyState>Cadastre um ativo e registre uma compra para iniciar a carteira.</EmptyState>}</SectionCard></div>;
}
