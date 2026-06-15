export type AllocationItem = {
  currentValue: number;
  id: string;
  label: string;
  targetPercentage: number;
};

export type AllocationSuggestion = AllocationItem & {
  contribution: number;
  currentPercentage: number;
  targetValue: number;
};

export function calculateAllocation(items: AllocationItem[], contribution = 0): AllocationSuggestion[] {
  const currentTotal = items.reduce((sum, item) => sum + item.currentValue, 0);
  const futureTotal = currentTotal + Math.max(0, contribution);
  const deficits = items.map((item) => Math.max(0, futureTotal * item.targetPercentage - item.currentValue));
  const totalDeficit = deficits.reduce((sum, deficit) => sum + deficit, 0);

  return items.map((item, index) => ({
    ...item,
    contribution: totalDeficit > 0 ? Math.max(0, contribution) * deficits[index] / totalDeficit : 0,
    currentPercentage: currentTotal > 0 ? item.currentValue / currentTotal : 0,
    targetValue: futureTotal * item.targetPercentage,
  }));
}

export function validateTargetTotal(items: Pick<AllocationItem, "targetPercentage">[]) {
  return items.reduce((sum, item) => sum + item.targetPercentage, 0);
}
