"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type {
  Account,
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
import { connectMockBank, syncMockAccount } from "@/lib/mock-sync";

export type AddTransactionInput = {
  amount: number;
  type: TxType;
  note: string;
  date: string;
  categoryId: string;
  accountId?: string;
};

type FinanceContextValue = {
  ready: boolean;
  month: string;
  setMonth: (month: string) => void;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  summary: Summary;
  categoryTotals: CategoryTotal[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  addTransaction: (input: AddTransactionInput) => void;
  updateTransaction: (id: string, input: Partial<AddTransactionInput>) => void;
  deleteTransaction: (id: string) => void;
  ignoreTransaction: (id: string) => void;
  restoreTransaction: (id: string) => void;
  addCategory: (name: string, type: TxType, color?: string) => Category;
  deleteCategory: (id: string) => void;
  connectBank: (bankId: string, accountTemplateIds: string[]) => Promise<void>;
  syncAccount: (accountId: string) => Promise<void>;
  syncAll: () => Promise<void>;
  unlinkAccount: (accountId: string, keepHistory: boolean) => void;
  setAccountError: (accountId: string) => void;
  injectPending: (accountId?: string) => void;
  resetDemoData: () => void;
};

const FinanceContext = createContext<FinanceContextValue | null>(null);

const noopSubscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function FinanceProvider({ children }: { children: ReactNode }) {
  // Server and hydration pass render the loading placeholder.
  const ready = useSyncExternalStore(noopSubscribe, clientReady, serverReady);
  const [month, setMonth] = useState(currentMonth);
  const [state, setState] = useState<FinanceState>(loadState);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  // Filter transactions for active month that are not ignored
  const filteredTransactions = useMemo(() => {
    return state.transactions
      .filter((tx) => !tx.ignored)
      .filter((tx) => tx.date.startsWith(month))
      .filter((tx) => (selectedAccountId ? tx.accountId === selectedAccountId : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.transactions, month, selectedAccountId]);

  // Calculate monthly summary
  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    for (const tx of filteredTransactions) {
      if (tx.type === "income") {
        income += tx.amount;
        incomeCount++;
      } else {
        expense += tx.amount;
        expenseCount++;
      }
    }

    const balance = income - expense;
    const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;

    return {
      income,
      expense,
      balance,
      savingsRate,
      incomeCount,
      expenseCount,
    };
  }, [filteredTransactions]);

  // Calculate category totals with percentages and colors
  const categoryTotals = useMemo(() => {
    const map = new Map<string, CategoryTotal>();
    const totalExpenses = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    for (const tx of filteredTransactions) {
      if (tx.type !== "expense") continue;

      const category = state.categories.find((c) => c.id === tx.categoryId);
      const existing = map.get(tx.categoryId);
      if (existing) {
        existing.total += tx.amount;
      } else {
        map.set(tx.categoryId, {
          categoryId: tx.categoryId,
          name: category?.name ?? "Uncategorized",
          type: tx.type,
          total: tx.amount,
          percentage: 0,
          color: category?.color ?? "#94a3b8",
        });
      }
    }

    const result = [...map.values()].map((item) => ({
      ...item,
      percentage: totalExpenses > 0 ? Math.round((item.total / totalExpenses) * 100) : 0,
    }));

    return result.sort((a, b) => b.total - a.total);
  }, [filteredTransactions, state.categories]);

  const addTransaction = useCallback((input: AddTransactionInput) => {
    const tx: Transaction = {
      id: uid(),
      amount: input.amount,
      type: input.type,
      note: input.note,
      date: input.date,
      categoryId: input.categoryId,
      accountId: input.accountId || "acc_cash",
      source: "manual",
      ignored: false,
    };
    setState((prev) => ({
      ...prev,
      transactions: [tx, ...prev.transactions],
    }));
  }, []);

  const updateTransaction = useCallback(
    (id: string, input: Partial<AddTransactionInput>) => {
      setState((prev) => ({
        ...prev,
        transactions: prev.transactions.map((tx) => {
          if (tx.id !== id) return tx;
          return {
            ...tx,
            ...input,
            // If editing a bank transaction, flag userEdited so future syncs preserve user's category/note
            userEdited: tx.source === "bank" ? true : tx.userEdited,
          };
        }),
      }));
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.filter((tx) => tx.id !== id),
    }));
  }, []);

  const ignoreTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === id ? { ...tx, ignored: true } : tx
      ),
    }));
  }, []);

  const restoreTransaction = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === id ? { ...tx, ignored: false } : tx
      ),
    }));
  }, []);

  const addCategory = useCallback((name: string, type: TxType, color?: string) => {
    const category: Category = {
      id: uid(),
      name: name.trim(),
      type,
      color: color || (type === "income" ? "#66D7B0" : "#f97316"),
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, category],
    }));
    return category;
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      transactions: prev.transactions.filter((tx) => tx.categoryId !== id),
    }));
  }, []);

  // Connect mock bank
  const connectBank = useCallback(
    async (bankId: string, accountTemplateIds: string[]) => {
      const { accounts: newAccounts, initialTransactions } = await connectMockBank(
        bankId,
        accountTemplateIds
      );

      setState((prev) => {
        // Exclude accounts already present
        const existingIds = new Set(prev.accounts.map((a) => a.id));
        const filteredNewAccounts = newAccounts.filter((a) => !existingIds.has(a.id));

        // Deduplicate initial transactions by externalId
        const existingExternals = new Set(
          prev.transactions.map((tx) => `${tx.accountId}_${tx.externalId}`)
        );
        const filteredNewTxns = initialTransactions.filter(
          (tx) => !existingExternals.has(`${tx.accountId}_${tx.externalId}`)
        );

        const newPointers = { ...prev.batchPointers };
        for (const acc of filteredNewAccounts) {
          newPointers[acc.id] = 0;
        }

        return {
          ...prev,
          accounts: [...prev.accounts, ...filteredNewAccounts],
          transactions: [...filteredNewTxns, ...prev.transactions],
          batchPointers: newPointers,
        };
      });
    },
    []
  );

  // Sync a single mock account
  const syncAccount = useCallback(async (accountId: string) => {
    // 1. Mark account as syncing
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, syncStatus: "syncing" } : acc
      ),
    }));

    // Find account and current batch
    let targetAccount: Account | undefined;
    let currentBatch = 0;
    setState((prev) => {
      targetAccount = prev.accounts.find((a) => a.id === accountId);
      currentBatch = prev.batchPointers?.[accountId] ?? 0;
      return prev;
    });

    if (!targetAccount) return;

    try {
      const { newBalance, newTransactions, nextBatchIndex } = await syncMockAccount(
        targetAccount,
        currentBatch
      );

      setState((prev) => {
        // Upsert transactions by externalId
        const existingMap = new Map<string, Transaction>();
        for (const tx of prev.transactions) {
          if (tx.accountId === accountId && tx.externalId) {
            existingMap.set(tx.externalId, tx);
          }
        }

        const incomingExternals = new Set<string>();
        for (const incoming of newTransactions) {
          if (!incoming.externalId) continue;
          incomingExternals.add(incoming.externalId);
          const existing = existingMap.get(incoming.externalId);
          if (existing) {
            // Respect user edits and ignored status
            existingMap.set(incoming.externalId, {
              ...incoming,
              id: existing.id,
              categoryId: existing.userEdited ? existing.categoryId : incoming.categoryId,
              note: existing.userEdited ? existing.note : incoming.note,
              userEdited: existing.userEdited,
              ignored: existing.ignored,
            });
          } else {
            existingMap.set(incoming.externalId, incoming);
          }
        }

        // Rebuild transaction list
        const otherTxns = prev.transactions.filter(
          (tx) => tx.accountId !== accountId || !tx.externalId || !incomingExternals.has(tx.externalId)
        );

        const updatedTxns = [...newTransactions.filter((tx) => !prev.transactions.some((p) => p.externalId === tx.externalId)), ...otherTxns];

        return {
          ...prev,
          accounts: prev.accounts.map((acc) =>
            acc.id === accountId
              ? {
                  ...acc,
                  currentBalance: newBalance,
                  lastSyncedAt: new Date().toISOString(),
                  syncStatus: "ok",
                }
              : acc
          ),
          transactions: updatedTxns,
          batchPointers: {
            ...prev.batchPointers,
            [accountId]: nextBatchIndex,
          },
        };
      });
    } catch {
      setState((prev) => ({
        ...prev,
        accounts: prev.accounts.map((acc) =>
          acc.id === accountId ? { ...acc, syncStatus: "error" } : acc
        ),
      }));
    }
  }, []);

  // Sync all linked accounts
  const syncAll = useCallback(async () => {
    const linkedAccounts = state.accounts.filter((a) => a.source === "linked");
    for (const acc of linkedAccounts) {
      await syncAccount(acc.id);
    }
  }, [state.accounts, syncAccount]);

  // Unlink an account
  const unlinkAccount = useCallback((accountId: string, keepHistory: boolean) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.filter((a) => a.id !== accountId),
      transactions: keepHistory
        ? prev.transactions
        : prev.transactions.filter((tx) => tx.accountId !== accountId),
    }));
    if (selectedAccountId === accountId) {
      setSelectedAccountId(null);
    }
  }, [selectedAccountId]);

  // Force an account into error state for demo QA
  const setAccountError = useCallback((accountId: string) => {
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc) =>
        acc.id === accountId ? { ...acc, syncStatus: "error" } : acc
      ),
    }));
  }, []);

  // Inject a pending transaction for demo testing
  const injectPending = useCallback((accountId?: string) => {
    const targetAcc = accountId || state.accounts.find((a) => a.source === "linked")?.id || "acc_cash";
    const pendingTx: Transaction = {
      id: uid(),
      amount: 1899,
      type: "expense",
      note: "Starbucks Coffee (Authorization Hold)",
      date: new Date().toISOString().slice(0, 10),
      categoryId: "cat_food",
      accountId: targetAcc,
      source: targetAcc === "acc_cash" ? "manual" : "bank",
      externalId: `pending_${Date.now()}`,
      rawNarration: "AUTH/STARBUCKS/BANGALORE/PENDING",
      pending: true,
      ignored: false,
    };
    setState((prev) => ({
      ...prev,
      transactions: [pendingTx, ...prev.transactions],
    }));
  }, [state.accounts]);

  const resetDemoData = useCallback(() => {
    setState(structuredClone(SEED_DATA));
    setSelectedAccountId(null);
  }, []);

  const value: FinanceContextValue = {
    ready,
    month,
    setMonth,
    accounts: state.accounts,
    categories: state.categories,
    transactions: state.transactions,
    filteredTransactions,
    summary,
    categoryTotals,
    selectedAccountId,
    setSelectedAccountId,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    ignoreTransaction,
    restoreTransaction,
    addCategory,
    deleteCategory,
    connectBank,
    syncAccount,
    syncAll,
    unlinkAccount,
    setAccountError,
    injectPending,
    resetDemoData,
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
