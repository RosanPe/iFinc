"use client";

import { useEffect } from "react";

import { currentDateString } from "@/lib/domain/finance/dates";
import { listCreditCards } from "@/lib/repositories/credit-cards-repository";
import { generateRecurringOccurrences, listRecurringTransactions } from "@/lib/repositories/recurring-transactions-repository";

export function useRecurringGeneration() {
  useEffect(() => {
    let active = true;
    void Promise.all([listRecurringTransactions(), listCreditCards()]).then(async ([recurrences, cards]) => {
      if (!active) return;
      for (const recurring of recurrences.filter((item) => item.is_active && item.next_run_date <= currentDateString())) {
        const card = cards.find((item) => item.id === recurring.credit_card_id);
        await generateRecurringOccurrences(
          recurring,
          currentDateString(),
          card ? { closingDay: card.closing_day, dueDay: card.due_day } : undefined,
        );
      }
    }).catch(() => {
      // A interface continua utilizavel; a tela de recorrencias permite tentar novamente.
    });
    return () => { active = false; };
  }, []);
}
