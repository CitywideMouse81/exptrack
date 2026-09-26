export type TxType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: TxType;
};

export type Transaction = {
  id: string;
  amount: number;
  type: TxType;
  note: string;
  date: string; // YYYY-MM-DD
  categoryId: string;
};

export type FinanceState = {
  categories: Category[];
  transactions: Transaction[];
};

export type Summary = {
  income: number;
  expense: number;
  balance: number;
};

export type CategoryTotal = {
  categoryId: string;
  name: string;
  type: TxType;
  total: number;
};
