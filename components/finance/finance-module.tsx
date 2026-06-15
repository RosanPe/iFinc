"use client";

import { CalendarClock, ChartNoAxesColumnIncreasing, CreditCard, ListPlus, Settings2, Target } from "lucide-react";
import { useState } from "react";

import { BudgetsManager } from "@/components/finance/budgets-manager";
import { FinanceOverview } from "@/components/finance/finance-overview";
import { FinanceSettings } from "@/components/finance/finance-settings";
import { InvoicesManager } from "@/components/finance/invoices-manager";
import { RecurringManager } from "@/components/finance/recurring-manager";
import { TransactionsManager } from "@/components/finance/transactions-manager";
import { cn } from "@/lib/utils";
import { useRecurringGeneration } from "@/hooks/use-recurring-generation";

type FinanceView = "overview" | "transactions" | "invoices" | "recurring" | "budgets" | "settings";

const views = [
  { id: "overview" as const, label: "Resumo", icon: ChartNoAxesColumnIncreasing },
  { id: "transactions" as const, label: "Lançamentos", icon: ListPlus },
  { id: "invoices" as const, label: "Faturas", icon: CreditCard },
  { id: "recurring" as const, label: "Recorrências", icon: CalendarClock },
  { id: "budgets" as const, label: "Orçamentos", icon: Target },
  { id: "settings" as const, label: "Cadastros", icon: Settings2 },
];

export function FinanceModule() {
  useRecurringGeneration();
  const [view, setView] = useState<FinanceView>("overview");

  return (
    <div className="space-y-5">
      <nav aria-label="Seções financeiras" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-1 rounded-2xl bg-muted p-1 sm:grid sm:min-w-0 sm:grid-cols-6">
          {views.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-semibold text-muted-foreground transition-colors",
                view === id && "bg-background text-foreground shadow-sm",
              )}
              onClick={() => setView(id)}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {view === "overview" ? <FinanceOverview onAdd={() => setView("transactions")} /> : null}
      {view === "transactions" ? <TransactionsManager /> : null}
      {view === "invoices" ? <InvoicesManager /> : null}
      {view === "recurring" ? <RecurringManager /> : null}
      {view === "budgets" ? <BudgetsManager /> : null}
      {view === "settings" ? <FinanceSettings /> : null}
    </div>
  );
}
