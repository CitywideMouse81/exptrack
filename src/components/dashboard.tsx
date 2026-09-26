"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { ExpenseChart } from "./expense-chart";
import { MonthFilter } from "./month-filter";
import { SummaryCards } from "./summary-cards";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionTable } from "./transaction-table";

export function Dashboard() {
  const { ready, resetDemoData } = useFinance();
  const [open, setOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading local data…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
              Local mode
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Expense Tracker</h1>
            <p className="text-sm text-slate-500">
              Working frontend first. Data stays in this browser until you add a database.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MonthFilter />
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add transaction
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <SummaryCards />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <TransactionTable />
          <div className="space-y-4">
            <ExpenseChart />
            <button
              type="button"
              onClick={resetDemoData}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Reset demo data
            </button>
          </div>
        </div>
      </main>

      <TransactionDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
