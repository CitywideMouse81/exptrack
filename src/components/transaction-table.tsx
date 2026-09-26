"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { formatDate, formatINR } from "@/lib/format";
import type { Transaction } from "@/lib/types";
import { TransactionDialog } from "./transaction-dialog";

export function TransactionTable() {
  const { filteredTransactions, categories, deleteTransaction } = useFinance();
  const [editing, setEditing] = useState<Transaction | null>(null);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Transactions</h2>
          <p className="text-sm text-slate-500">
            {filteredTransactions.length} in this month
          </p>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-slate-500">
          No transactions for this month. Add one to see the dashboard fill in.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Note</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-600">{formatDate(tx.date)}</td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {tx.note || "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{categoryName(tx.categoryId)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        tx.type === "income"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {tx.type}
                    </span>
                  </td>
                  <td
                    className={`px-5 py-3 text-right font-semibold ${
                      tx.type === "income" ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "−"}
                    {formatINR(tx.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditing(tx)}
                      className="mr-2 text-slate-500 hover:text-slate-900"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTransaction(tx.id)}
                      className="text-rose-600 hover:text-rose-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransactionDialog
        open={Boolean(editing)}
        transaction={editing}
        onClose={() => setEditing(null)}
      />
    </section>
  );
}
