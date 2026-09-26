"use client";

import { useEffect } from "react";
import type { Transaction } from "@/lib/types";
import { TransactionForm } from "./transaction-form";

type Props = {
  open: boolean;
  transaction?: Transaction | null;
  onClose: () => void;
};

export function TransactionDialog({ open, transaction, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          {transaction ? "Edit transaction" : "Add transaction"}
        </h2>
        <TransactionForm initial={transaction} onClose={onClose} />
      </div>
    </div>
  );
}
