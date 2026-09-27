"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";

export function DemoTools() {
  const { accounts, setAccountError, injectPending, resetDemoData } = useFinance();
  const [open, setOpen] = useState(false);

  const linkedAccounts = accounts.filter((a) => a.source === "linked");

  function handleBreakFirstConnection() {
    if (linkedAccounts.length > 0) {
      setAccountError(linkedAccounts[0].id);
    }
  }

  return (
    <aside className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-100 text-[10px] font-bold text-amber-800">
            QA
          </span>
          <h3 className="text-xs font-semibold text-slate-800">
            Interactive Test & Demo Controls
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          {open ? "Hide tools" : "Show test buttons"}
        </button>
      </div>

      {open && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            disabled={linkedAccounts.length === 0}
            onClick={handleBreakFirstConnection}
            className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:opacity-40"
          >
            Break 1st bank connection (Test Reconnect)
          </button>

          <button
            type="button"
            onClick={() => injectPending()}
            className="rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-800 transition hover:bg-sky-100"
          >
            Inject pending auth row
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Reset demo data to default
          </button>
        </div>
      )}
    </aside>
  );
}
