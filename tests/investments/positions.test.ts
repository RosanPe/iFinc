import { describe, expect, it } from "vitest";

import {
  calculateAssetPosition,
  calculatePositions,
  positionMarketValue,
  positionUnrealizedProfit,
  type InvestmentOperation,
} from "@/lib/domain/investments/positions";

function operation(input: Partial<InvestmentOperation> = {}): InvestmentOperation {
  return {
    asset_id: "asset-a",
    fees: 0,
    id: crypto.randomUUID(),
    kind: "buy",
    operation_date: "2026-01-01",
    quantity: 1,
    unit_price: 10,
    ...input,
  };
}

describe("investment positions", () => {
  it("calculates weighted average price including purchase fees", () => {
    const position = calculateAssetPosition([
      operation({ quantity: 10, unit_price: 20, fees: 2 }),
      operation({ id: "second", operation_date: "2026-02-01", quantity: 5, unit_price: 26, fees: 3 }),
    ]);

    expect(position.quantity).toBe(15);
    expect(position.investedCost).toBe(335);
    expect(position.averagePrice).toBeCloseTo(22.333333);
  });

  it("keeps average price and calculates realized profit after a partial sale", () => {
    const position = calculateAssetPosition([
      operation({ quantity: 10, unit_price: 20 }),
      operation({ id: "sell", kind: "sell", operation_date: "2026-03-01", quantity: 4, unit_price: 30, fees: 2 }),
    ]);

    expect(position.quantity).toBe(6);
    expect(position.averagePrice).toBe(20);
    expect(position.investedCost).toBe(120);
    expect(position.realizedProfit).toBe(38);
  });

  it("rejects a sale larger than the available position", () => {
    expect(() => calculateAssetPosition([
      operation({ quantity: 2 }),
      operation({ id: "sell", kind: "sell", operation_date: "2026-02-01", quantity: 3 }),
    ])).toThrow("supera a posição disponível");
  });

  it("groups positions and calculates market result", () => {
    const positions = calculatePositions([
      operation({ quantity: 2, unit_price: 10 }),
      operation({ asset_id: "asset-b", id: "b", quantity: 3, unit_price: 5 }),
    ]);
    const first = positions.find((position) => position.assetId === "asset-a")!;

    expect(positions).toHaveLength(2);
    expect(positionMarketValue(first, 14)).toBe(28);
    expect(positionUnrealizedProfit(first, 14)).toBe(8);
    expect(positionMarketValue(first, null)).toBeNull();
  });
});
