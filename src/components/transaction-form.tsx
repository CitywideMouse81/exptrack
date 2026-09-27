"use client";

import { FormEvent, useMemo, useState } from "react";
import { useFinance } from "@/context/finance-context";
import type { Transaction, TxType } from "@/lib/types";

type Props = {
  initial?: Transaction | null;
  onClose: () => void;
};

export function TransactionForm({ initial, onClose }: Props) {
  const { categories, accounts, addTransaction, updateTransaction, addCategory } =
    useFinance();

  const isBank = initial?.source === "bank";

  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [accountId, setAccountId] = useState(
    initial?.accountId ?? "acc_cash"
  );
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type]
  );

  function handleTypeChange(next: TxType) {
    if (isBank) return;
    setType(next);
    const stillValid = categories.some((c) => c.id === categoryId && c.type === next);
    if (!stillValid) setCategoryId("");
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount greater than 0.");
      return;
    }
    if (!date) {
      setError("Pick a date.");
      return;
    }

    let chosenCategory = categoryId;
    if (!chosenCategory && newCategory.trim()) {
      chosenCategory = addCategory(newCategory.trim(), type).id;
    }
    if (!chosenCategory) {
      setError("Choose a category or create one.");
      return;
    }

    const payload = {
      amount: parsed,
      type,
      note: note.trim(),
      date,
      categoryId: chosenCategory,
      accountId,
    };

    if (initial) updateTransaction(initial.id, payload);
    else addTransaction(payload);
    onClose();
  }

  const selectedAcc = accounts.find((a) => a.id === accountId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Bank Row Warning Banner */}
      {isBank && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs text-blue-900 leading-relaxed">
          <p className="font-semibold">
            Linked Bank Transaction ({selectedAcc?.name} ••{selectedAcc?.mask})
          </p>
          <p className="mt-0.5 text-blue-700">
            Amount, date, and origin account are verified by the bank feed and
            cannot be altered. You can customize the category and add personal
            notes.
          </p>
        </div>
      )}

      {/* Type Toggle */}
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(["expense", "income"] as TxType[]).map((option) => (
          <button
            key={option}
            type="button"
            disabled={isBank}
            onClick={() => handleTypeChange(option)}
            className={`rounded-lg px-3 py-2 text-sm font-medium capitalize transition ${
              type === option
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-700"
            } ${isBank && type !== option ? "opacity-40" : ""}`}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Account Picker */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">Account</span>
        <select
          disabled={isBank}
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333] disabled:bg-slate-50 disabled:text-slate-500"
        >
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} (••{acc.mask}) — {acc.source === "manual" ? "Cash" : "Bank"}
            </option>
          ))}
        </select>
      </label>

      {/* Amount Field */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">Amount (₹)</span>
        <input
          type="number"
          min="1"
          step="1"
          disabled={isBank}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333] disabled:bg-slate-50 disabled:text-slate-500 font-mono"
          placeholder="2500"
        />
      </label>

      {/* Date Field */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">Date</span>
        <input
          type="date"
          disabled={isBank}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333] disabled:bg-slate-50 disabled:text-slate-500"
        />
      </label>

      {/* Category Select */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">Category</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333]"
        >
          <option value="">Select category</option>
          {typeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      {/* Create New Category Inline */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">
          Or create category
        </span>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333]"
          placeholder={type === "income" ? "e.g. Dividend" : "e.g. Groceries"}
        />
      </label>

      {/* Note Field */}
      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-slate-700">
          Note / Details
        </span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#112333]"
          placeholder="Details or merchant name"
        />
      </label>

      {error ? <p className="text-xs text-rose-600 font-medium">{error}</p> : null}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-[#112333] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {initial ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
