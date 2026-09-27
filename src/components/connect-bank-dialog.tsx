"use client";

import { useCallback, useEffect, useState } from "react";
import { useFinance } from "@/context/finance-context";
import { MOCK_BANKS, type MockBank } from "@/lib/mock-banks";
import { formatINR } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Step = "choose_bank" | "authenticating" | "select_accounts";

export function ConnectBankDialog({ open, onClose }: Props) {
  const { accounts, connectBank } = useFinance();
  const [step, setStep] = useState<Step>("choose_bank");
  const [selectedBank, setSelectedBank] = useState<MockBank | null>(null);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [linking, setLinking] = useState(false);

  const handleClose = useCallback(() => {
    if (linking) return;
    setStep("choose_bank");
    setSelectedBank(null);
    setSelectedAccountIds([]);
    setLinking(false);
    onClose();
  }, [linking, onClose]);

  // Handle escape key
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !linking) handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, linking, handleClose]);

  if (!open) return null;

  const linkedAccountIds = new Set(accounts.map((a) => a.id));

  async function handleSelectBank(bank: MockBank) {
    setSelectedBank(bank);
    setStep("authenticating");

    // Simulate bank handshake
    setTimeout(() => {
      // Pre-select accounts that are not already linked
      const available = bank.accounts
        .filter((a) => !linkedAccountIds.has(a.id))
        .map((a) => a.id);
      setSelectedAccountIds(available);
      setStep("select_accounts");
    }, 900);
  }

  function toggleAccount(accountId: string) {
    if (linkedAccountIds.has(accountId)) return;
    setSelectedAccountIds((prev) =>
      prev.includes(accountId)
        ? prev.filter((id) => id !== accountId)
        : [...prev, accountId]
    );
  }

  async function handleLink() {
    if (!selectedBank || selectedAccountIds.length === 0 || linking) return;
    setLinking(true);
    try {
      await connectBank(selectedBank.id, selectedAccountIds);
      handleClose();
    } finally {
      setLinking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close dialog"
        onClick={() => {
          if (!linking) handleClose();
        }}
      />

      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#112333] text-[11px] font-bold text-emerald-400">
                ⚡
              </span>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mock Bank Sync
              </p>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-slate-900">
              {step === "choose_bank" && "Connect a financial institution"}
              {step === "authenticating" && `Connecting to ${selectedBank?.name}…`}
              {step === "select_accounts" && `Select ${selectedBank?.shortName} accounts`}
            </h2>
            <p className="text-xs text-slate-500">
              {step === "choose_bank" &&
                "Choose a simulated Indian bank to test real-time feed synchronization."}
              {step === "authenticating" &&
                "Establishing secure mock handshake and querying statement batches…"}
              {step === "select_accounts" &&
                "Choose which accounts to link to your ExpTrack feed."}
            </p>
          </div>

          <button
            type="button"
            disabled={linking}
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Step 1: Choose Bank */}
        {step === "choose_bank" && (
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MOCK_BANKS.map((bank) => {
              const allLinked = bank.accounts.every((a) =>
                linkedAccountIds.has(a.id)
              );

              return (
                <button
                  key={bank.id}
                  type="button"
                  disabled={allLinked}
                  onClick={() => handleSelectBank(bank)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                    allLinked
                      ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed"
                      : "border-slate-200 bg-white hover:border-[#112333] hover:shadow-xs active:scale-[0.99]"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-xs text-sm"
                    style={{ backgroundColor: bank.color }}
                  >
                    {bank.logoLetter}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{bank.name}</p>
                    <p className="text-xs text-slate-400">
                      {bank.accounts.length} available accounts
                    </p>
                    {allLinked && (
                      <span className="mt-1 inline-block rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                        All accounts linked
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Authenticating Spinner */}
        {step === "authenticating" && (
          <div className="my-12 flex flex-col items-center justify-center text-center">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
              <span className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-[#112333]" />
              <span
                className="absolute font-bold text-sm"
                style={{ color: selectedBank?.color }}
              >
                {selectedBank?.logoLetter}
              </span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-800">
              Verifying mock connection…
            </p>
            <p className="text-xs text-slate-400">
              No live credentials or aggregator tokens needed.
            </p>
          </div>
        )}

        {/* Step 3: Select Accounts */}
        {step === "select_accounts" && selectedBank && (
          <div className="mt-6 space-y-4">
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50">
              {selectedBank.accounts.map((account) => {
                const isAlreadyLinked = linkedAccountIds.has(account.id);
                const isChecked = selectedAccountIds.includes(account.id);

                return (
                  <label
                    key={account.id}
                    className={`flex items-center justify-between p-4 cursor-pointer transition select-none ${
                      isAlreadyLinked
                        ? "opacity-50 cursor-not-allowed bg-slate-50"
                        : "hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        disabled={isAlreadyLinked}
                        checked={isChecked}
                        onChange={() => toggleAccount(account.id)}
                        className="h-4 w-4 rounded border-slate-300 accent-[#112333]"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {account.name}
                        </p>
                        <p className="font-mono text-xs text-slate-400">
                          Account ••{account.mask} ·{" "}
                          <span className="capitalize">{account.type}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          account.type === "credit"
                            ? "text-rose-600"
                            : "text-slate-900"
                        }`}
                      >
                        {account.startingBalance < 0
                          ? `−${formatINR(Math.abs(account.startingBalance))}`
                          : formatINR(account.startingBalance)}
                      </p>
                      {isAlreadyLinked ? (
                        <span className="text-[11px] font-medium text-slate-400">
                          Already linked
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          Available balance
                        </span>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep("choose_bank")}
                disabled={linking}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Back
              </button>

              <button
                type="button"
                onClick={handleLink}
                disabled={selectedAccountIds.length === 0 || linking}
                className="flex items-center gap-2 rounded-xl bg-[#112333] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50"
              >
                {linking && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}
                <span>
                  {linking
                    ? "Importing statements…"
                    : `Link ${selectedAccountIds.length} account${
                        selectedAccountIds.length === 1 ? "" : "s"
                      }`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
