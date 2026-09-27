"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  Category,
  CategoryTotal,
  FinanceState,
  Summary,
  Transaction,
  TxType,
} from "@/lib/types";
import { currentMonth, uid } from "@/lib/format";
import { loadState, saveState } from "@/lib/storage";
import { SEED_DATA } from "@/lib/seed";

type AddTransactionInput = {
  amount: number;
  type: TxType;
  note: string;
  date: string;
  categoryId: string;
};

type FinanceContextValue = {
  ready: boolean;
  month: string;
  setMonth: (month: string) => void;
  categories: Category[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: Summary;
  categoryTotals: CategoryTotal[];
  addTransaction: (input: AddTransactionInput) => void;
  updateTransaction: (id: string, input: AddTransactionInput) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (name: string, type: TxType) => Category;
  deleteCategory: (id: string) => void;
  resetDemoData: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const noopSubscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function FinanceProvider({ children }: { children: ReactNode }) {
  // The server and hydration pass both render the loading state. After hydration,
  // expose the state loaded from this browser without writing seed data over it.
  const ready = useSyncExternalStore(noopSubscribe, clientReady, serverReady);
  const [month, setMonth] = useState(currentMonth);
  const [state, setState] = useState<FinanceState>(loadState);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  const filteredTransactions = useMemo(
    () =>
      state.transactions
        .filter((tx) => tx.date.startsWith(month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.transactions, month],
  );

  const summary = useMemo(() => {
    return filteredTransactions.reduce<Summary>(
      (acc, tx) => {
        if (tx.type === "income") acc.income += tx.amount;
        else acc.expense += tx.amount;
        acc.balance = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, balance: 0 },
    );
  }, [filteredTransactions]);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, CategoryTotal>();
    for (const tx of filteredTransactions) {
      const category = state.categories.find((c) => c.id === tx.categoryId);
      const key = tx.categoryId;
      const existing = map.get(key);
      if (existing) existing.total += tx.amount;
      else {
        map.set(key, {
          categoryId: key,
          name: category?.name ?? "Uncategorized",
          type: tx.type,
          total: tx.amount,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [filteredTransactions, state.categories]);

  const value: FinanceContextValue = {
    ready,
    month,
    setMonth,
    categories: state.categories,
    transactions: state.transactions,
    filteredTransactions,
    summary,
    categoryTotals,
    addTransaction(input) {
      const tx: Transaction = { id: uid(), ...input };
      setState((prev) => ({ ...prev, transactions: [tx, ...prev.transactions] }));
    },
    updateTransaction(id, input) {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((tx) =>
          tx.id === id ? { ...tx, ...input } : tx,
        ),
      }));
    },
    deleteTransaction(id) {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((tx) => tx.id !== id),
      }));
    },
    addCategory(name, type) {
      const category: Category = { id: uid(), name: name.trim(), type };
      setState((prev) => ({ ...prev, categories: [...prev.categories, category] }));
      return category;
    },
    deleteCategory(id) {
      setState((prev) => ({
        categories: prev.categories.filter((c) => c.id !== id),
        transactions: prev.transactions.filter((tx) => tx.categoryId !== id),
      }));
    },
    resetDemoData() {
      setState(structuredClone(SEED_DATA));
    },
  };

  return (
    <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
}
