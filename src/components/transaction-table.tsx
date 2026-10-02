"use client";

import { useMemo, useState } from "react";
import { useFinance } from "@/context/finance-context";
import { formatDate, formatINR } from "@/lib/format";
import type { Transaction, TxType } from "@/lib/types";
import { TransactionDialog } from "./transaction-dialog";

export function TransactionTable() {
  const {
    filteredTransactions,
    transactions,
    month,
    categories,
    accounts,
    deleteTransaction,
    ignoreTransaction,
    restoreTransaction,
    selectedAccountId,
    setSelectedAccountId,
  } = useFinance();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TxType>("all");
  const [showIgnored, setShowIgnored] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  function getCategoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  }

  function getCategoryColor(id: string) {
    return categories.find((c) => c.id === id)?.color ?? "#94a3b8";
  }

  function getAccount(id: string) {
    return accounts.find((a) => a.id === id);
  }

  const ignoredCount = useMemo(() => {
    return transactions.filter(
      (tx) => tx.ignored && tx.date.startsWith(month)
    ).length;
  }, [transactions, month]);

  // Filter transactions by search, type, and account
  const displayed = useMemo(() => {
    let list = showIgnored
      ? transactions
          .filter((tx) => tx.date.startsWith(month))
          .filter((tx) => (selectedAccountId ? tx.accountId === selectedAccountId : true))
          .sort((a, b) => b.date.localeCompare(a.date))
      : filteredTransactions;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((tx) => {
        const catName =
          categories.find((c) => c.id === tx.categoryId)?.name?.toLowerCase() ?? "";
        return (
          tx.note.toLowerCase().includes(q) ||
          (tx.rawNarration && tx.rawNarration.toLowerCase().includes(q)) ||
          catName.includes(q)
        );
      });
    }

    if (typeFilter !== "all") {
      list = list.filter((tx) => tx.type === typeFilter);
    }

    return list;
  }, [
    showIgnored,
    transactions,
    month,
    selectedAccountId,
    filteredTransactions,
    search,
    typeFilter,
    categories,
  ]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
      {/* Header & Filter Bar */}
      <div className="border-b border-slate-100 p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Transactions Ledger
            </h2>
            <p className="text-xs text-slate-400">
              {displayed.length} visible transaction{displayed.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {ignoredCount > 0 && (
              <button
                type="button"
                onClick={() => setShowIgnored((v) => !v)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  showIgnored
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "text-slate-500 hover:text-slate-800 border border-slate-200"
                }`}
              >
                {showIgnored ? "Hide ignored" : `Show ignored (${ignoredCount})`}
              </button>
            )}

            {/* Type Filter Pills */}
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {(["all", "expense", "income"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                    typeFilter === t
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Bar + Account Filter Pills */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            >
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search note, merchant, or UPI narration…"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#112333] focus:bg-white"
            />
          </div>

          {/* Account Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedAccountId(null)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                selectedAccountId === null
                  ? "bg-[#112333] text-white"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              All accounts
            </button>
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setSelectedAccountId(acc.id)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  selectedAccountId === acc.id
                    ? "bg-[#112333] text-white"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{acc.name.split(" ")[0]}</span>
                <span className="font-mono text-[10px] opacity-75">
                  ••{acc.mask}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main List */}
      {displayed.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-700">No transactions match</p>
          <p className="mt-1 text-xs text-slate-400">
            Try adjusting your search query, type filter, or selected account.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card View (< md) */}
          <div className="divide-y divide-slate-100 md:hidden">
            {displayed.map((tx) => {
              const acc = getAccount(tx.accountId);
              const isIncome = tx.type === "income";

              return (
                <article
                  key={tx.id}
                  className={`flex items-start justify-between p-4 transition ${
                    tx.ignored ? "bg-amber-50/40 opacity-70" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-900">
                        {tx.note || "Untitled transaction"}
                      </span>
                      {tx.pending && (
                        <span className="rounded bg-amber-100 px-1 py-0.5 text-[9px] font-semibold text-amber-800">
                          Pending
                        </span>
                      )}
                      {tx.ignored && (
                        <span className="rounded bg-slate-200 px-1 py-0.5 text-[9px] font-semibold text-slate-700">
                          Ignored
                        </span>
                      )}
                    </div>

                    {tx.rawNarration && (
                      <p className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">
                        {tx.rawNarration}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: getCategoryColor(tx.categoryId) }}
                        />
                        <span>{getCategoryName(tx.categoryId)}</span>
                      </span>
                      <span>·</span>
                      <span>{formatDate(tx.date)}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {acc?.name || "Cash"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        isIncome ? "text-emerald-700" : "text-slate-900"
                      }`}
                    >
                      {isIncome ? "+" : "−"}
                      {formatINR(tx.amount)}
                    </p>

                    <div className="mt-1 flex items-center justify-end gap-2 text-xs">
                      {tx.ignored ? (
                        <button
                          type="button"
                          onClick={() => restoreTransaction(tx.id)}
                          className="text-emerald-700 font-medium hover:underline"
                        >
                          Restore
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setEditing(tx)}
                            className="text-slate-500 hover:text-slate-900"
                          >
                            Edit
                          </button>
                          {tx.source === "bank" ? (
                            <button
                              type="button"
                              onClick={() => ignoreTransaction(tx.id)}
                              className="text-amber-700 hover:text-amber-900"
                              title="Hide this bank transaction from your feed"
                            >
                              Ignore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => deleteTransaction(tx.id)}
                              className="text-rose-600 hover:text-rose-800"
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Note / Merchant</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Account</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayed.map((tx) => {
                  const acc = getAccount(tx.accountId);
                  const isIncome = tx.type === "income";

                  return (
                    <tr
                      key={tx.id}
                      className={`transition ${
                        tx.ignored
                          ? "bg-amber-50/30 opacity-70"
                          : "hover:bg-slate-50/60"
                      }`}
                    >
                      <td className="px-5 py-3 text-xs text-slate-500">
                        {formatDate(tx.date)}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900">
                            {tx.note || "No note"}
                          </span>
                          {tx.pending && (
                            <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          )}
                          {tx.ignored && (
                            <span className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                              Ignored
                            </span>
                          )}
                          {tx.userEdited && (
                            <span
                              title="Category or note customized by you"
                              className="text-[10px] text-slate-400"
                            >
                              ✎
                            </span>
                          )}
                        </div>
                        {tx.rawNarration && (
                          <p className="font-mono text-[10px] text-slate-400">
                            {tx.rawNarration}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-700">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              backgroundColor: getCategoryColor(tx.categoryId),
                            }}
                          />
                          {getCategoryName(tx.categoryId)}
                        </span>
                      </td>

                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              tx.source === "bank"
                                ? "bg-[#112333]"
                                : "bg-emerald-500"
                            }`}
                          />
                          {acc ? `${acc.name} ••${acc.mask}` : "Cash"}
                        </span>
                      </td>

                      <td
                        className={`px-5 py-3 text-right font-semibold ${
                          isIncome ? "text-emerald-700" : "text-slate-900"
                        }`}
                      >
                        {isIncome ? "+" : "−"}
                        {formatINR(tx.amount)}
                      </td>

                      <td className="px-5 py-3 text-right">
                        {tx.ignored ? (
                          <button
                            type="button"
                            onClick={() => restoreTransaction(tx.id)}
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditing(tx)}
                              className="mr-3 text-xs text-slate-500 hover:text-slate-900"
                            >
                              Edit
                            </button>

                            {tx.source === "bank" ? (
                              <button
                                type="button"
                                onClick={() => ignoreTransaction(tx.id)}
                                className="text-xs text-amber-700 hover:text-amber-900"
                                title="Ignore this bank transaction so it doesn't count"
                              >
                                Ignore
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => deleteTransaction(tx.id)}
                                className="text-xs text-rose-600 hover:text-rose-800"
                              >
                                Delete
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <TransactionDialog
        open={Boolean(editing)}
        transaction={editing}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
