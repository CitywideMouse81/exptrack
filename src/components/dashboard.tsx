"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useFinance } from "@/context/finance-context";
import { getSession, signOut } from "@/lib/auth";
import { AccountStrip } from "./account-strip";
import { ConnectBankDialog } from "./connect-bank-dialog";
import { DemoTools } from "./demo-tools";
import { ExpenseChart } from "./expense-chart";
import { MonthFilter } from "./month-filter";
import { SummaryCards } from "./summary-cards";
import { TransactionDialog } from "./transaction-dialog";
import { TransactionTable } from "./transaction-table";

const noopSubscribe = () => () => {};
const noSession = () => null;

export function Dashboard() {
  const { ready } = useFinance();
  const router = useRouter();
  const [txDialogOpen, setTxDialogOpen] = useState(false);
  const [connectBankOpen, setConnectBankOpen] = useState(false);
  const session = useSyncExternalStore(noopSubscribe, getSession, noSession);

  function handleSignOut() {
    signOut();
    router.replace("/login");
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F5F8F7] text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#112333]" />
          <span className="text-sm font-medium">Loading ledger records…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8F7] text-[#112333]">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#112333] text-emerald-400 font-bold shadow-xs">
              <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
                <rect x="3" y="10" width="3.2" height="7" rx="1" fill="#66D7B0" />
                <rect x="8.4" y="6.5" width="3.2" height="10.5" rx="1" fill="#66D7B0" />
                <rect x="13.8" y="3" width="3.2" height="14" rx="1" fill="#66D7B0" />
              </svg>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#112333]">
                  ExpTrack
                </h1>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                  Local-First
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Cash & linked institution statements in one place
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <MonthFilter />

            <button
              type="button"
              onClick={() => setTxDialogOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#112333] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 active:scale-[0.99]"
            >
              <span className="text-emerald-400 font-bold">+</span>
              <span>Add transaction</span>
            </button>

            {session && (
              <div className="ml-1 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1 shadow-xs">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#112333] text-[11px] font-bold text-emerald-300">
                  {session.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden pl-1 pr-1.5 font-mono text-xs text-slate-600 md:block">
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

      {/* Main Content */}
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        {/* Pass 2: Accounts Strip */}
        <AccountStrip onOpenConnect={() => setConnectBankOpen(true)} />

        {/* Hero: Copilot/Monarch Net Balance & Summaries */}
        <SummaryCards />

        {/* Main Grid: Ledger on Left, Visual Breakdown on Right */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="min-w-0">
            <TransactionTable />
          </div>
          <div className="min-w-0 space-y-6">
            <ExpenseChart />
            {/* QA Demo Controls */}
            <DemoTools />
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <TransactionDialog
        open={txDialogOpen}
        onClose={() => setTxDialogOpen(false)}
      />

      <ConnectBankDialog
        open={connectBankOpen}
        onClose={() => setConnectBankOpen(false)}
      />
    </div>
  );
}
