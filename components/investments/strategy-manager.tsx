"use client";

import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import { type FormEvent, useMemo, useState } from "react";

import { EmptyState, Field, SectionCard } from "@/components/finance/finance-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { calculateAllocation, validateTargetTotal } from "@/lib/domain/investments/allocation";
import { calculatePositions, positionMarketValue } from "@/lib/domain/investments/positions";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { AssetClass } from "@/lib/repositories/asset-classes-repository";
import type { Asset } from "@/lib/repositories/assets-repository";
import type { InvestmentOperation } from "@/lib/repositories/investment-operations-repository";
import { createInvestmentTarget, deleteInvestmentTarget, type InvestmentTarget, updateInvestmentTarget } from "@/lib/repositories/investment-targets-repository";

type Props = { assetClasses: AssetClass[]; assets: Asset[]; operations: InvestmentOperation[]; targets: InvestmentTarget[]; onChange: () => Promise<void>; onError: (error: unknown) => void };

export function StrategyManager({ assetClasses, assets, operations, targets, onChange, onError }: Props) {
  const [editing, setEditing] = useState<InvestmentTarget | null>(null);
  const [scope, setScope] = useState<"class" | "asset">("class");
  const [contribution, setContribution] = useState(1000);
  const positions = useMemo(() => calculatePositions(operations), [operations]);
  const currentValue = (asset: Asset) => { const position = positions.find((item) => item.assetId === asset.id); if (!position || asset.currency !== "BRL") return 0; return positionMarketValue(position, asset.current_price === null ? null : Number(asset.current_price)) ?? position.investedCost; };
  const allocationItems = targets.map((target) => {
    const asset = target.asset_id ? assets.find((item) => item.id === target.asset_id) : null;
    const assetClass = target.asset_class_id ? assetClasses.find((item) => item.id === target.asset_class_id) : null;
    const value = asset ? currentValue(asset) : assets.filter((item) => item.asset_class_id === assetClass?.id).reduce((sum, item) => sum + currentValue(item), 0);
    return { currentValue: value, id: target.id, label: asset ? asset.ticker : assetClass?.name ?? "Meta", targetPercentage: Number(target.target_percentage) / 100 };
  });
  const suggestions = calculateAllocation(allocationItems, contribution);
  const targetTotal = validateTargetTotal(allocationItems);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const formElement = event.currentTarget; const form = new FormData(formElement); const selectedScope = editing ? (editing.asset_id ? "asset" : "class") : scope;
    const input = { asset_class_id: selectedScope === "class" ? String(form.get("referenceId")) : null, asset_id: selectedScope === "asset" ? String(form.get("referenceId")) : null, target_percentage: Number(form.get("percentage")) };
    try { if (editing) await updateInvestmentTarget(editing.id, input); else await createInvestmentTarget(input); setEditing(null); formElement.reset(); await onChange(); } catch (error) { onError(error); }
  }
  function edit(item: InvestmentTarget) { setEditing(item); setScope(item.asset_id ? "asset" : "class"); }
  async function remove(item: InvestmentTarget) { if (!window.confirm("Excluir esta meta?")) return; try { await deleteInvestmentTarget(item.id); await onChange(); } catch (error) { onError(error); } }

  return <div className="space-y-5"><header><p className="text-sm text-muted-foreground">Planejamento da carteira</p><h1 className="mt-1 text-2xl font-bold">Alocação e próximo aporte</h1></header><div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]"><SectionCard title={editing ? "Editar meta" : "Nova meta"}><form key={editing?.id ?? "new-target"} className="space-y-4" onSubmit={submit}><Field label="Meta por" htmlFor="target-scope"><Select id="target-scope" value={scope} disabled={Boolean(editing)} onChange={(event) => setScope(event.target.value as typeof scope)}><option value="class">Classe</option><option value="asset">Ativo</option></Select></Field><Field label={scope === "class" ? "Classe" : "Ativo"} htmlFor="target-reference"><Select id="target-reference" name="referenceId" defaultValue={editing?.asset_class_id ?? editing?.asset_id ?? ""} required><option value="">Selecione</option>{scope === "class" ? assetClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>) : assets.map((item) => <option key={item.id} value={item.id}>{item.ticker} · {item.name}</option>)}</Select></Field><Field label="Percentual desejado" htmlFor="target-percentage"><Input id="target-percentage" name="percentage" type="number" min="0" max="100" step="0.01" defaultValue={editing?.target_percentage} required /></Field><div className="flex gap-2"><Button type="submit"><Plus />{editing ? "Salvar" : "Adicionar"}</Button>{editing ? <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancelar</Button> : null}</div></form><div className="mt-5 rounded-xl bg-muted p-4"><p className="text-xs text-muted-foreground">Soma das metas</p><p className={targetTotal > 1.0001 ? "mt-1 text-xl font-bold text-red-600" : "mt-1 text-xl font-bold"}>{formatPercent(targetTotal)}</p><p className="mt-1 text-xs text-muted-foreground">Para uma estratégia completa, use metas da mesma granularidade somando 100%.</p></div></SectionCard><SectionCard title="Sugestão de aporte" description="Distribuição pelos maiores déficits em relação às metas."><Field label="Valor disponível" htmlFor="contribution"><Input id="contribution" type="number" min="0" step="0.01" value={contribution} onChange={(event) => setContribution(Number(event.target.value))} /></Field>{suggestions.length ? <div className="mt-5 space-y-3">{suggestions.map((item) => <div key={item.id} className="rounded-xl border p-4"><div className="flex items-start gap-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><Target /></span><div className="min-w-0 flex-1"><p className="truncate font-semibold">{item.label}</p><p className="text-xs text-muted-foreground">Atual {formatPercent(item.currentPercentage)} · meta {formatPercent(item.targetPercentage)}</p></div><div className="text-right"><p className="text-xs text-muted-foreground">Aportar</p><strong>{formatCurrency(item.contribution)}</strong></div><div className="flex"><Button size="icon" variant="ghost" aria-label="Editar meta" onClick={() => edit(targets.find((target) => target.id === item.id)!)}><Pencil /></Button><Button size="icon" variant="ghost" aria-label="Excluir meta" onClick={() => void remove(targets.find((target) => target.id === item.id)!)}><Trash2 /></Button></div></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${Math.min(100, item.currentPercentage / Math.max(item.targetPercentage, 0.0001) * 100)}%` }} /></div><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>Atual {formatCurrency(item.currentValue)}</span><span>Objetivo após aporte {formatCurrency(item.targetValue)}</span></div></div>)}</div> : <div className="mt-5"><EmptyState>Cadastre metas para calcular o próximo aporte.</EmptyState></div>}</SectionCard></div></div>;
}
