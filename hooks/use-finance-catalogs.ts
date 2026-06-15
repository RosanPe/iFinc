"use client";

import { useCallback, useEffect, useState } from "react";

import { listAccounts, type Account } from "@/lib/repositories/accounts-repository";
import { listCategories, type Category } from "@/lib/repositories/categories-repository";
import { listCreditCards, type CreditCard } from "@/lib/repositories/credit-cards-repository";
import { listTags, type Tag } from "@/lib/repositories/tags-repository";

export function useFinanceCatalogs() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextAccounts, nextCards, nextCategories, nextTags] = await Promise.all([
        listAccounts(), listCreditCards(), listCategories(), listTags(),
      ]);
      setAccounts(nextAccounts);
      setCards(nextCards);
      setCategories(nextCategories);
      setTags(nextTags);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível carregar os cadastros.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.all([listAccounts(), listCreditCards(), listCategories(), listTags()])
      .then(([nextAccounts, nextCards, nextCategories, nextTags]) => {
        if (!active) return;
        setAccounts(nextAccounts);
        setCards(nextCards);
        setCategories(nextCategories);
        setTags(nextTags);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Não foi possível carregar os cadastros.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return { accounts, cards, categories, error, loading, reload, tags };
}
