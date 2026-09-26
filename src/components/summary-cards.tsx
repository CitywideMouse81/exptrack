"use client";

import { useFinance } from "@/context/finance-context";
import { formatINR } from "@/lib/format";

export function SummaryCards() {
  const { summary } = useFinance();

  const cards = [
    {
      label: "Income",
      value: summary.income,
      accent: "from-emerald-500/15 to-emerald-500/5 text-emerald-700",
      pill: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Expenses",
      value: summary.expense,
      accent: "from-rose-500/15 to-rose-500/5 text-rose-700",
      pill: "bg-rose-100 text-rose-700",
    },
    {
      label: "Balance",
      value: summary.balance,
      accent:
        summary.balance >= 0
          ? "from-sky-500/15 to-sky-500/5 text-sky-800"
          : "from-amber-500/15 to-amber-500/5 text-amber-800",
      pill:
        summary.balance >= 0
          ? "bg-sky-100 text-sky-700"
          : "bg-amber-100 text-amber-800",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${card.accent} p-5 shadow-sm`}
        >
          <p className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${card.pill}`}>
            {card.label}
          </p>
          <p className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {formatINR(card.value)}
          </p>
        </article>
      ))}
    </section>
  );
}
