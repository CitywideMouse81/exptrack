import type { FinanceState } from "./types";
import { SEED_DATA } from "./seed";

export const STORAGE_KEY = "expense-tracker:local-v1";

export function loadState(): FinanceState {
  if (typeof window === "undefined") return SEED_DATA;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(SEED_DATA);
    const parsed = JSON.parse(raw) as FinanceState;
    if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.transactions)) {
      return structuredClone(SEED_DATA);
    }
    return parsed;
  } catch {
    return structuredClone(SEED_DATA);
  }
}

export function saveState(state: FinanceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
