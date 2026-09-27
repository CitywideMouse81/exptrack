import type { TxType } from "./types";

export type MockFeedItem = {
  externalId: string;
  amount: number;
  type: TxType;
  note: string;
  date: string;
  categoryId: string;
  rawNarration: string;
  pending?: boolean;
};

export type MockAccountFeed = {
  batches: MockFeedItem[][];
  balanceUpdates: number[]; // balance after each batch
};

export const MOCK_FEEDS: Record<string, MockAccountFeed> = {
  hdfc_savings_4291: {
    batches: [
      // Batch 0: Lands on initial connect
      [
        {
          externalId: "hdfc_sav_01",
          amount: 95000,
          type: "income",
          note: "Infosys Monthly Salary",
          date: "2026-09-01",
          categoryId: "cat_salary",
          rawNarration: "ACH/SALARY/INFOSYS LTD/002914",
        },
        {
          externalId: "hdfc_sav_02",
          amount: 22000,
          type: "expense",
          note: "Apartment Rent Payment",
          date: "2026-09-03",
          categoryId: "cat_rent",
          rawNarration: "NEFT/RENT-LANDLORD/KORAMANGALA",
        },
        {
          externalId: "hdfc_sav_03",
          amount: 1450,
          type: "expense",
          note: "Swiggy Dinner",
          date: "2026-09-07",
          categoryId: "cat_food",
          rawNarration: "UPI/SWIGGY/982138@hdfcbank/ORDER44",
        },
        {
          externalId: "hdfc_sav_04",
          amount: 600,
          type: "expense",
          note: "BMRC Metro Recharge",
          date: "2026-09-11",
          categoryId: "cat_transport",
          rawNarration: "UPI/METRO/DMTS/BLR-AUTO-RECHARGE",
        },
      ],
      // Batch 1: Lands on first Sync
      [
        {
          externalId: "hdfc_sav_05",
          amount: 850,
          type: "expense",
          note: "Cafe Coffee Day",
          date: "2026-09-18",
          categoryId: "cat_food",
          rawNarration: "POS/CAFE COFFEE DAY/MG ROAD/4119",
        },
        {
          externalId: "hdfc_sav_06",
          amount: 2199,
          type: "expense",
          note: "Airtel Broadband & DTH",
          date: "2026-09-20",
          categoryId: "cat_utilities",
          rawNarration: "AUTOPAY/AIRTEL/BILLPAY-BB-99120",
        },
        {
          externalId: "hdfc_sav_07",
          amount: 620,
          type: "expense",
          note: "Quick Commerce Grocery",
          date: "2026-09-23",
          categoryId: "cat_food",
          rawNarration: "UPI/BLINKIT/INSTA-DELIVERY/3901",
          pending: true,
        },
      ],
      // Batch 2: Lands on second Sync
      [
        {
          externalId: "hdfc_sav_08",
          amount: 4500,
          type: "income",
          note: "Freelance consulting retainer",
          date: "2026-09-24",
          categoryId: "cat_freelance",
          rawNarration: "IMPS/FREELANCE-RETAINER/P2P",
        },
        {
          externalId: "hdfc_sav_09",
          amount: 1100,
          type: "expense",
          note: "BookMyShow Movie Tickets",
          date: "2026-09-26",
          categoryId: "cat_entertainment",
          rawNarration: "POS/BOOKMYSHOW/INOX-PVR/ONLINE",
        },
      ],
    ],
    balanceUpdates: [142850, 139181, 142581],
  },

  hdfc_credit_8821: {
    batches: [
      // Batch 0
      [
        {
          externalId: "hdfc_cc_01",
          amount: 12499,
          type: "expense",
          note: "Apple Store Accessory",
          date: "2026-09-06",
          categoryId: "cat_shopping",
          rawNarration: "POS/APPLE STORE/BKC/MUMBAI-AUTH",
        },
        {
          externalId: "hdfc_cc_02",
          amount: 1499,
          type: "expense",
          note: "Netflix Premium Plan",
          date: "2026-09-12",
          categoryId: "cat_entertainment",
          rawNarration: "AUTOPAY/NETFLIX-MTH/SUBSCRIPTION",
        },
        {
          externalId: "hdfc_cc_03",
          amount: 4422,
          type: "expense",
          note: "Diesel fuel refill",
          date: "2026-09-14",
          categoryId: "cat_transport",
          rawNarration: "POS/INDIAN OIL CORP/OUTLET-091",
        },
      ],
      // Batch 1
      [
        {
          externalId: "hdfc_cc_04",
          amount: 3290,
          type: "expense",
          note: "Zomato dining out",
          date: "2026-09-21",
          categoryId: "cat_food",
          rawNarration: "POS/TOIT-BREWERY/ZOMATO-PAY",
          pending: true,
        },
      ],
    ],
    balanceUpdates: [-18420, -21710],
  },

  sbi_savings_1092: {
    batches: [
      [
        {
          externalId: "sbi_sav_01",
          amount: 15000,
          type: "income",
          note: "Quarterly Fixed Deposit Interest",
          date: "2026-09-05",
          categoryId: "cat_salary",
          rawNarration: "INT/SBI-FD-QUARTERLY-INTEREST/AUTO",
        },
        {
          externalId: "sbi_sav_02",
          amount: 4500,
          type: "expense",
          note: "State electricity bill",
          date: "2026-09-09",
          categoryId: "cat_utilities",
          rawNarration: "BESCOM/ELEC-BILLPAY-ONLINE/OCT",
        },
      ],
      [
        {
          externalId: "sbi_sav_03",
          amount: 1200,
          type: "expense",
          note: "Pharmacy & medicine",
          date: "2026-09-22",
          categoryId: "cat_shopping",
          rawNarration: "UPI/APOLLO-PHARMACY/STORE-77",
        },
      ],
    ],
    balanceUpdates: [65200, 64000],
  },

  axis_savings_7734: {
    batches: [
      [
        {
          externalId: "axis_sav_01",
          amount: 35000,
          type: "income",
          note: "Client milestone transfer",
          date: "2026-09-04",
          categoryId: "cat_freelance",
          rawNarration: "RTGS/TECH-VENTURES/INV-409",
        },
        {
          externalId: "axis_sav_02",
          amount: 6800,
          type: "expense",
          note: "Weekly hypermarket groceries",
          date: "2026-09-10",
          categoryId: "cat_food",
          rawNarration: "POS/NATURES-BASKET/BLR-02",
        },
      ],
      [
        {
          externalId: "axis_sav_03",
          amount: 1750,
          type: "expense",
          note: "Uber ride across town",
          date: "2026-09-25",
          categoryId: "cat_transport",
          rawNarration: "UPI/UBER-INDIA/TRIP-99014",
        },
      ],
    ],
    balanceUpdates: [88900, 87150],
  },

  icici_savings_5512: {
    batches: [
      [
        {
          externalId: "icici_sav_01",
          amount: 50000,
          type: "income",
          note: "Mutual Fund Dividend Payout",
          date: "2026-09-02",
          categoryId: "cat_freelance",
          rawNarration: "ACH/ICICI-PRU-DIVIDEND/099120",
        },
        {
          externalId: "icici_sav_02",
          amount: 7200,
          type: "expense",
          note: "Term Life Insurance Premium",
          date: "2026-09-14",
          categoryId: "cat_utilities",
          rawNarration: "NACH/HDFC-LIFE-PREMIUM/MTH",
        },
      ],
      [
        {
          externalId: "icici_sav_03",
          amount: 2400,
          type: "expense",
          note: "Weekend gas refuel",
          date: "2026-09-24",
          categoryId: "cat_transport",
          rawNarration: "POS/SHELL-PETROL/OUTLET-12",
        },
      ],
    ],
    balanceUpdates: [112000, 109600],
  },

  icici_credit_3309: {
    batches: [
      [
        {
          externalId: "icici_cc_01",
          amount: 3490,
          type: "expense",
          note: "Amazon Great Indian Festival item",
          date: "2026-09-08",
          categoryId: "cat_shopping",
          rawNarration: "ECOM/AMAZON INDIA/ORDER-38102",
        },
        {
          externalId: "icici_cc_02",
          amount: 2990,
          type: "expense",
          note: "Wireless gaming mouse",
          date: "2026-09-17",
          categoryId: "cat_shopping",
          rawNarration: "ECOM/AMAZON PAY/LOGITECH-DIRECT",
        },
      ],
      [
        {
          externalId: "icici_cc_03",
          amount: 1450,
          type: "expense",
          note: "Coffee beans subscription",
          date: "2026-09-25",
          categoryId: "cat_food",
          rawNarration: "ECOM/BLUE-TOKAI/MONTHLY-PACK",
          pending: true,
        },
      ],
    ],
    balanceUpdates: [-6480, -7930],
  },
};
