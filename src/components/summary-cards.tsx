"use client";

import { useFinance } from "@/context/finance-context";
import { formatINR } from "@/lib/format";

export function SummaryCards() {
  const { summary } = useFinance();

  const isPositive = summary.balance >= 0;

  return (
    <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
      {/* Primary Hero: Net Balance (Copilot / Monarch pattern) */}
      <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Net Balance
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {summary.savingsRate > 0
              ? `${summary.savingsRate}% saved this month`
              : "Deficit"}
          </span>
        </div>

        <div className="mt-3">
          <p
            className={`text-3xl font-bold tracking-tight sm:text-4xl ${
              isPositive ? "text-[#112333]" : "text-rose-600"
            }`}
          >
            {summary.balance < 0 ? "−" : ""}
            {formatINR(Math.abs(summary.balance))}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Visible cash flow position for this month
          </p>
        </div>
      </article>

      {/* Secondary Supporting: Income */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Income
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {summary.incomeCount} {summary.incomeCount === 1 ? "entry" : "entries"}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-emerald-600 sm:text-3xl">
            +{formatINR(summary.income)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Inflow from salary & freelance
          </p>
        </div>
      </article>

      {/* Secondary Supporting: Expenses */}
      <article className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Expenses
          </p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {summary.expenseCount} {summary.expenseCount === 1 ? "row" : "rows"}
          </span>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            −{formatINR(summary.expense)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Outflow across all categories
          </p>
        </div>
      </article>
    </section>
  );
}
