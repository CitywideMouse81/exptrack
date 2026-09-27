"use client";

import { useState } from "react";
import { useFinance } from "@/context/finance-context";
import { formatINR } from "@/lib/format";

type Props = {
  onOpenConnect: () => void;
};

function formatTimeAgo(isoDate: string | null) {
  if (!isoDate) return "Never synced";
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (diff < 15) return "Synced just now";
  if (diff < 60) return `Synced ${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `Synced ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `Synced ${hours}h ago`;
}

export function AccountStrip({ onOpenConnect }: Props) {
  const {
    accounts,
    syncAccount,
    syncAll,
    unlinkAccount,
    selectedAccountId,
    setSelectedAccountId,
  } = useFinance();

  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const linkedAccounts = accounts.filter((a) => a.source === "linked");
  const anySyncing = accounts.some((a) => a.syncStatus === "syncing");

  async function handleSyncAll() {
    if (anySyncing || syncingAll) return;
    setSyncingAll(true);
    await syncAll();
    setSyncingAll(false);
  }

  function handleUnlinkConfirm(id: string, keepHistory: boolean) {
    unlinkAccount(id, keepHistory);
    setUnlinkingId(null);
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Accounts & Live Balances
          </h2>
          {selectedAccountId && (
            <button
              type="button"
              onClick={() => setSelectedAccountId(null)}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              Clear filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {linkedAccounts.length > 0 && (
            <button
              type="button"
              disabled={anySyncing || syncingAll}
              onClick={handleSyncAll}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-3.5 w-3.5 ${syncingAll ? "animate-spin text-emerald-600" : "text-slate-400"}`}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{syncingAll ? "Syncing all…" : "Sync all"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenConnect}
            className="flex items-center gap-1.5 rounded-lg bg-[#112333] px-3 py-1 text-xs font-medium text-white shadow-sm transition hover:bg-slate-800"
          >
            <span className="text-emerald-400 font-bold">+</span>
            <span>Connect account</span>
          </button>
        </div>
      </div>

      {/* Account Tiles Carousel / Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {accounts.map((account) => {
          const isSelected = selectedAccountId === account.id;
          const isSyncing = account.syncStatus === "syncing";
          const isError = account.syncStatus === "error";

          return (
            <div
              key={account.id}
              className={`relative flex flex-col justify-between rounded-xl border bg-white p-4 shadow-xs transition ${
                isSelected
                  ? "border-[#112333] ring-2 ring-[#112333]/10"
                  : isError
                  ? "border-rose-300 bg-rose-50/20"
                  : "border-slate-200 hover:border-slate-300"
              } ${isSyncing ? "animate-sync-pulse" : ""}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAccountId(isSelected ? null : account.id)
                    }
                    className="group text-left"
                    title="Click to filter transactions by this account"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          account.type === "credit"
                            ? "bg-amber-500"
                            : account.source === "manual"
                            ? "bg-emerald-500"
                            : isError
                            ? "bg-rose-500"
                            : isSyncing
                            ? "bg-sky-500"
                            : "bg-[#112333]"
                        }`}
                      />
                      <span className="font-medium text-slate-900 group-hover:text-emerald-700">
                        {account.name}
                      </span>
                    </div>
                    <span className="mt-0.5 block font-mono text-[11px] text-slate-400">
                      {account.institution} · ••{account.mask}
                    </span>
                  </button>

                  {/* Actions for linked accounts */}
                  {account.source === "linked" && (
                    <div className="flex items-center gap-1">
                      {isError ? (
                        <button
                          type="button"
                          onClick={() => syncAccount(account.id)}
                          className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 transition hover:bg-rose-200"
                          title="Reconnect institution"
                        >
                          Reconnect
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSyncing}
                          onClick={() => syncAccount(account.id)}
                          title="Sync transactions"
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`h-3.5 w-3.5 ${
                              isSyncing ? "animate-spin text-emerald-600" : ""
                            }`}
                          >
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setUnlinkingId(account.id)}
                        title="Unlink account"
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-600"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5"
                        >
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                {/* Balance display */}
                <div className="mt-3">
                  <p
                    className={`font-semibold tracking-tight ${
                      account.type === "credit"
                        ? "text-rose-600 text-lg sm:text-xl"
                        : "text-slate-900 text-lg sm:text-xl"
                    }`}
                  >
                    {account.currentBalance < 0
                      ? `−${formatINR(Math.abs(account.currentBalance))}`
                      : formatINR(account.currentBalance)}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {account.type === "credit"
                      ? "Outstanding card balance"
                      : "Institution balance"}
                  </p>
                </div>
              </div>

              {/* Status footer line */}
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px]">
                <span
                  className={
                    isError
                      ? "font-medium text-rose-600"
                      : isSyncing
                      ? "font-medium text-sky-600"
                      : "text-slate-400"
                  }
                >
                  {isError
                    ? "Connection error"
                    : isSyncing
                    ? "Syncing new batch…"
                    : formatTimeAgo(account.lastSyncedAt)}
                </span>

                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase ${
                    account.source === "manual"
                      ? "bg-slate-100 text-slate-600"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {account.source === "manual" ? "Cash" : "Linked Bank"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unlink Confirmation Dialog */}
      {unlinkingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">
              Unlink institution account?
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Do you want to keep the historical transactions as frozen records,
              or delete all transactions imported from this account?
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleUnlinkConfirm(unlinkingId, true)}
                className="w-full rounded-xl bg-[#112333] px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Keep history as frozen records
              </button>
              <button
                type="button"
                onClick={() => handleUnlinkConfirm(unlinkingId, false)}
                className="w-full rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100"
              >
                Delete account and its transactions
              </button>
              <button
                type="button"
                onClick={() => setUnlinkingId(null)}
                className="w-full rounded-xl px-4 py-2 text-sm text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
