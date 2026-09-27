import type { Account, Transaction } from "./types";
import { MOCK_BANKS } from "./mock-banks";
import { MOCK_FEEDS } from "./mock-feeds";
import { uid } from "./format";

export async function mockDelay(ms = 850) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectMockBank(
  bankId: string,
  selectedAccountTemplateIds: string[]
): Promise<{
  accounts: Account[];
  initialTransactions: Transaction[];
}> {
  await mockDelay(900);

  const bank = MOCK_BANKS.find((b) => b.id === bankId);
  if (!bank) throw new Error("Bank not found in mock catalog");

  const accounts: Account[] = [];
  const initialTransactions: Transaction[] = [];

  for (const templateId of selectedAccountTemplateIds) {
    const template = bank.accounts.find((a) => a.id === templateId);
    if (!template) continue;

    const account: Account = {
      id: template.id,
      name: template.name,
      institution: bank.name,
      mask: template.mask,
      type: template.type,
      source: "linked",
      currentBalance: template.startingBalance,
      lastSyncedAt: new Date().toISOString(),
      syncStatus: "ok",
    };
    accounts.push(account);

    // Batch 0 transactions
    const feed = MOCK_FEEDS[template.id];
    if (feed && feed.batches.length > 0) {
      const batch0 = feed.batches[0];
      for (const item of batch0) {
        initialTransactions.push({
          id: uid(),
          amount: item.amount,
          type: item.type,
          note: item.note,
          date: item.date,
          categoryId: item.categoryId,
          accountId: account.id,
          source: "bank",
          externalId: item.externalId,
          rawNarration: item.rawNarration,
          pending: item.pending,
          userEdited: false,
          ignored: false,
        });
      }
    }
  }

  return { accounts, initialTransactions };
}

export async function syncMockAccount(
  account: Account,
  currentBatchIndex = 0
): Promise<{
  newBalance: number;
  newTransactions: Transaction[];
  nextBatchIndex: number;
  exhausted: boolean;
}> {
  await mockDelay(800);

  const feed = MOCK_FEEDS[account.id];
  if (!feed) {
    // Unknown feed: jitter balance slightly
    return {
      newBalance: account.currentBalance,
      newTransactions: [],
      nextBatchIndex: currentBatchIndex,
      exhausted: true,
    };
  }

  // The connect step already imported batch 0.
  // Next batch to pull is currentBatchIndex + 1.
  const targetBatch = currentBatchIndex + 1;

  if (targetBatch < feed.batches.length) {
    const batchItems = feed.batches[targetBatch];
    const newTransactions: Transaction[] = batchItems.map((item) => ({
      id: uid(),
      amount: item.amount,
      type: item.type,
      note: item.note,
      date: item.date,
      categoryId: item.categoryId,
      accountId: account.id,
      source: "bank",
      externalId: item.externalId,
      rawNarration: item.rawNarration,
      pending: item.pending,
      userEdited: false,
      ignored: false,
    }));

    const newBalance =
      feed.balanceUpdates[targetBatch] ??
      account.currentBalance -
        batchItems.reduce(
          (acc, item) => acc + (item.type === "expense" ? item.amount : -item.amount),
          0
        );

    return {
      newBalance,
      newTransactions,
      nextBatchIndex: targetBatch,
      exhausted: targetBatch === feed.batches.length - 1,
    };
  }

  // Batches exhausted: Jitter slightly by a few rupees or keep current balance
  const jitter = Math.floor(Math.random() * 20) - 10;
  return {
    newBalance: account.currentBalance + jitter,
    newTransactions: [],
    nextBatchIndex: currentBatchIndex,
    exhausted: true,
  };
}
