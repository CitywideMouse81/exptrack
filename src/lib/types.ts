export type TxType = "income" | "expense";

export type AccountSource = "manual" | "linked";
export type TxSource = "manual" | "bank";
export type SyncStatus = "idle" | "connecting" | "syncing" | "ok" | "error";
export type AccountType = "cash" | "checking" | "savings" | "credit";

export type Account = {
  id: string;
  name: string; // e.g. "HDFC Savings"
  institution: string; // e.g. "HDFC Bank"
  mask: string; // e.g. "4291"
  type: AccountType;
  source: AccountSource;
  currentBalance: number; // bank-reported, not summed from rows. Credit uses negative.
  lastSyncedAt: string | null;
  syncStatus: SyncStatus;
};

export type Category = {
  id: string;
  name: string;
  type: TxType;
  color?: string;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TxType;
  note: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
  accountId: string;
  source: TxSource;
  externalId?: string; // mock bank id — used to dedupe
  rawNarration?: string;
  pending?: boolean;
  userEdited?: boolean;
  ignored?: boolean;
};

export type FinanceState = {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  batchPointers?: Record<string, number>; // accountId -> next batch index
};

export type Summary = {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
};

export type CategoryTotal = {
  categoryId: string;
  name: string;
  type: TxType;
  total: number;
  percentage: number;
  color?: string;
};
