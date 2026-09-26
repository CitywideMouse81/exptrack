"use client";

import { useFinance } from "@/context/finance-context";
import { monthLabel, shiftMonth } from "@/lib/format";

export function MonthFilter() {
  const { month, setMonth } = useFinance();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, -1))}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        aria-label="Previous month"
      >
        ‹
      </button>
      <div className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-800">
        {monthLabel(month)}
      </div>
      <button
        type="button"
        onClick={() => setMonth(shiftMonth(month, 1))}
        className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  );
}
