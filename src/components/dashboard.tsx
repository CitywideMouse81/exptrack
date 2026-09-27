"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { getSession, signOut } from "@/lib/auth";
import { ExpenseChart } from "./expense-chart";
import { MonthFilter } from "./month-filter";
import { SummaryCards } from "./summary-cards";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionTable } from "./transaction-table";

const noopSubscribe = () => () => {};
const noSession = () => null;

export function Dashboard() {
  const { ready, resetDemoData } = useFinance();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const session = useSyncExternalStore(noopSubscribe, getSession, noSession);

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

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
            {session && (
              <div className="ml-1 flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
                  {session.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden pl-1 pr-1.5 font-mono text-xs text-slate-500 md:block">
                  {session.email}
                </span>
                <span className="mx-0.5 hidden h-4 w-px bg-slate-200 md:block" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>
                </button>
              </div>
            )}
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
