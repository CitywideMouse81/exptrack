import type { AccountType } from "./types";

export type MockAccountTemplate = {
  id: string; // e.g. "hdfc_savings_4291"
  name: string;
  mask: string;
  type: AccountType;
  startingBalance: number;
};

export type MockBank = {
  id: string;
  name: string;
  shortName: string;
  color: string;
  accentBg: string;
  logoLetter: string;
  accounts: MockAccountTemplate[];
};

export const MOCK_BANKS: MockBank[] = [
  {
    id: "bank_hdfc",
    name: "HDFC Bank",
    shortName: "HDFC",
    color: "#004c8f",
    accentBg: "bg-blue-50 text-blue-900 border-blue-200",
    logoLetter: "H",
    accounts: [
      {
        id: "hdfc_savings_4291",
        name: "HDFC Classic Savings",
        mask: "4291",
        type: "savings",
        startingBalance: 142850,
      },
      {
        id: "hdfc_credit_8821",
        name: "HDFC Millennia Credit Card",
        mask: "8821",
        type: "credit",
        startingBalance: -18420,
      },
    ],
  },
  {
    id: "bank_sbi",
    name: "State Bank of India",
    shortName: "SBI",
    color: "#280071",
    accentBg: "bg-indigo-50 text-indigo-900 border-indigo-200",
    logoLetter: "S",
    accounts: [
      {
        id: "sbi_savings_1092",
        name: "SBI Regular Savings",
        mask: "1092",
        type: "savings",
        startingBalance: 65200,
      },
    ],
  },
  {
    id: "bank_axis",
    name: "Axis Bank",
    shortName: "Axis",
    color: "#97144d",
    accentBg: "bg-pink-50 text-pink-900 border-pink-200",
    logoLetter: "A",
    accounts: [
      {
        id: "axis_savings_7734",
        name: "Axis Priority Savings",
        mask: "7734",
        type: "savings",
        startingBalance: 88900,
      },
    ],
  },
  {
    id: "bank_icici",
    name: "ICICI Bank",
    shortName: "ICICI",
    color: "#f37021",
    accentBg: "bg-orange-50 text-orange-900 border-orange-200",
    logoLetter: "I",
    accounts: [
      {
        id: "icici_savings_5512",
        name: "ICICI Privilege Savings",
        mask: "5512",
        type: "savings",
        startingBalance: 112000,
      },
      {
        id: "icici_credit_3309",
        name: "ICICI Amazon Pay Credit",
        mask: "3309",
        type: "credit",
        startingBalance: -6480,
      },
    ],
  },
];
