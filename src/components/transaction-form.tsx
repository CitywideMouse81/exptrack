"use client";

import { FormEvent, useMemo, useState } from "react";
import { useFinance } from "@/context/finance-context";
import type { Transaction, TxType } from "@/lib/types";

type Props = {
  initial?: Transaction | null;
  onClose: () => void;
};

export function TransactionForm({ initial, onClose }: Props) {
  const { categories, addTransaction, updateTransaction, addCategory } =
    useFinance();
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [date, setDate] = useState(
    initial?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");

  const typeCategories = useMemo(
    () => categories.filter((c) => c.type === type),
    [categories, type],
  );

  function handleTypeChange(next: TxType) {
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
    };

    if (initial) updateTransaction(initial.id, payload);
    else addTransaction(payload);
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
        {(["expense", "income"] as TxType[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleTypeChange(option)}
            className={`rounded-lg px-3 py-2 text-sm font-medium capitalize ${
              type === option
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Amount (₹)</span>
        <input
          type="number"
          min="1"
          step="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
          placeholder="2500"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Date</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Category</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
        >
          <option value="">Select category</option>
          {typeCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Or create category</span>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
          placeholder={type === "income" ? "Bonus" : "Health"}
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-slate-700">Note</span>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-900 outline-none ring-slate-900/10 focus:ring-2"
          placeholder="Optional details"
        />
      </label>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

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
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          {initial ? "Save changes" : "Add transaction"}
        </button>
      </div>
    </form>
  );
}
