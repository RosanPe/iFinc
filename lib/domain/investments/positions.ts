export type InvestmentOperation = {
  asset_id: string;
  created_at?: string;
  fees: number;
  id: string;
  kind: "buy" | "sell";
  operation_date: string;
  quantity: number;
  unit_price: number;
};

export type AssetPosition = {
  assetId: string;
  averagePrice: number;
  investedCost: number;
  quantity: number;
  realizedProfit: number;
};

const EPSILON = 1e-8;

function operationOrder(left: InvestmentOperation, right: InvestmentOperation) {
  return left.operation_date.localeCompare(right.operation_date)
    || (left.created_at ?? "").localeCompare(right.created_at ?? "")
    || left.id.localeCompare(right.id);
}

export function calculateAssetPosition(operations: InvestmentOperation[]): AssetPosition {
  const assetId = operations[0]?.asset_id ?? "";
  let quantity = 0;
  let investedCost = 0;
  let realizedProfit = 0;

  for (const operation of [...operations].sort(operationOrder)) {
    if (operation.asset_id !== assetId) {
      throw new Error("Todas as operações devem pertencer ao mesmo ativo.");
    }

    const operationQuantity = Number(operation.quantity);
    const unitPrice = Number(operation.unit_price);
    const fees = Number(operation.fees);

    if (operation.kind === "buy") {
      quantity += operationQuantity;
      investedCost += operationQuantity * unitPrice + fees;
      continue;
    }

    if (operationQuantity - quantity > EPSILON) {
      throw new Error("A quantidade vendida supera a posição disponível.");
    }

    const averagePrice = quantity > EPSILON ? investedCost / quantity : 0;
    realizedProfit += operationQuantity * unitPrice - fees - operationQuantity * averagePrice;
    quantity -= operationQuantity;
    investedCost -= operationQuantity * averagePrice;

    if (quantity < EPSILON) {
      quantity = 0;
      investedCost = 0;
    }
  }

  return {
    assetId,
    averagePrice: quantity > 0 ? investedCost / quantity : 0,
    investedCost,
    quantity,
    realizedProfit,
  };
}

export function calculatePositions(operations: InvestmentOperation[]) {
  const grouped = operations.reduce((positions, operation) => {
    const assetOperations = positions.get(operation.asset_id) ?? [];
    assetOperations.push(operation);
    positions.set(operation.asset_id, assetOperations);
    return positions;
  }, new Map<string, InvestmentOperation[]>());
  return Array.from(grouped.values(), calculateAssetPosition);
}

export function positionMarketValue(position: AssetPosition, currentPrice: number | null) {
  return currentPrice === null ? null : position.quantity * currentPrice;
}

export function positionUnrealizedProfit(position: AssetPosition, currentPrice: number | null) {
  const marketValue = positionMarketValue(position, currentPrice);
  return marketValue === null ? null : marketValue - position.investedCost;
}
