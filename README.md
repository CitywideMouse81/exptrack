# Expense Tracker — local-first frontend

This is the working UI first. No Postgres, Prisma, or Clerk yet.

Data lives in React state and is saved to `localStorage` under `expense-tracker:local-v1`. Refreshing the page keeps your transactions.

## Run locally

```bash
cd expense-tracker
npm install
npm run dev
```

Open http://localhost:3000

## What already works

- Income / expense / balance cards
- Month filter
- Add, edit, delete transactions
- Create a category from the form
- Pie chart of expenses by category
- Sample September 2026 and August 2026 data
- Reset demo data button

## How this maps to the later backend

Frontend now (`FinanceProvider` + localStorage) becomes API routes + Prisma later.
Keep the dashboard components. Only swap the data layer.

## Sign-in (demo auth)

`/` is protected by `src/proxy.ts`. Signed-out visitors are redirected to `/login`,
which validates credentials in the browser against a single fake account
(`src/lib/auth.ts`):

- email: `demo@exptrack.app`
- password: `demo1234`

A session cookie (`exptrack_session`) is set on success. "Keep me signed in"
extends it to 30 days. Signing out from the dashboard header clears it.
No server, no database, nothing leaves the browser.
