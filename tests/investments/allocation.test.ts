import { describe, expect, it } from "vitest";

import { calculateAllocation, validateTargetTotal } from "@/lib/domain/investments/allocation";

describe("investment allocation", () => {
  it("calculates current percentages and target values", () => {
    const allocation = calculateAllocation([
      { id: "stocks", label: "Ações", currentValue: 600, targetPercentage: 0.5 },
      { id: "funds", label: "FIIs", currentValue: 400, targetPercentage: 0.5 },
    ]);
    expect(allocation[0].currentPercentage).toBe(0.6);
    expect(allocation[1].targetValue).toBe(500);
  });

  it("directs the next contribution to allocation deficits", () => {
    const allocation = calculateAllocation([
      { id: "stocks", label: "Ações", currentValue: 700, targetPercentage: 0.5 },
      { id: "funds", label: "FIIs", currentValue: 300, targetPercentage: 0.5 },
    ], 200);
    expect(allocation[0].contribution).toBe(0);
    expect(allocation[1].contribution).toBe(200);
  });

  it("distributes contribution proportionally when multiple targets have deficits", () => {
    const allocation = calculateAllocation([
      { id: "a", label: "A", currentValue: 0, targetPercentage: 0.6 },
      { id: "b", label: "B", currentValue: 0, targetPercentage: 0.4 },
    ], 100);
    expect(allocation[0].contribution).toBe(60);
    expect(allocation[1].contribution).toBe(40);
    expect(validateTargetTotal(allocation)).toBe(1);
  });
});
