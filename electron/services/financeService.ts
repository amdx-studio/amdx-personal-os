import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../../src/types/transaction.js'
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  Bill,
  CreateBillInput,
  UpdateBillInput,
  WishlistItem,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
} from '../../src/types/finance.js'

const FINANCE_FILE = 'finance.json'

interface FinanceData {
  transactions: Transaction[]
  accounts: Account[]
  budgets: Budget[]
  goals: SavingsGoal[]
  bills: Bill[]
  wishlist: WishlistItem[]
  assets: Asset[]
}

function addDays(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

/**
 * Data default yang dipakai saat finance.json belum ada sama sekali,
 * atau saat migrasi dari format lama perlu mengisi section yang belum
 * pernah tersimpan sebelumnya. Nilainya sengaja disamakan dengan data
 * contoh yang dulu hardcoded di FinanceView.vue, supaya tampilan tidak
 * mendadak kosong setelah migrasi.
 */
function createDefaultFinanceData(): FinanceData {
  const now = new Date().toISOString()

  return {
    transactions: [],
    accounts: [
      { id: 'cash', label: 'Cash', iconKey: 'cash', amount: 850_000, createdAt: now },
      { id: 'bank', label: 'Bank', iconKey: 'bank', amount: 4_200_000, createdAt: now },
      { id: 'ewallet', label: 'E-Wallet', iconKey: 'ewallet', amount: 350_000, createdAt: now },
      { id: 'savings', label: 'Savings', iconKey: 'savings', amount: 6_000_000, createdAt: now },
      {
        id: 'investment',
        label: 'Investments',
        iconKey: 'investment',
        amount: 3_000_000,
        createdAt: now,
      },
    ],
    budgets: [
      { id: randomUUID(), category: 'Makan', limit: 1_500_000, createdAt: now },
      { id: randomUUID(), category: 'Transport', limit: 500_000, createdAt: now },
      { id: randomUUID(), category: 'Internet', limit: 300_000, createdAt: now },
    ],
    goals: [
      {
        id: randomUUID(),
        name: 'Laptop Baru',
        target: 15_000_000,
        current: 7_500_000,
        createdAt: now,
      },
    ],
    bills: [
      { id: randomUUID(), name: 'Internet', amount: 350_000, dueDate: addDays(3), createdAt: now },
      { id: randomUUID(), name: 'Listrik', amount: 250_000, dueDate: addDays(5), createdAt: now },
      { id: randomUUID(), name: 'Domain', amount: 180_000, dueDate: addDays(9), createdAt: now },
      { id: randomUUID(), name: 'Hosting', amount: 220_000, dueDate: addDays(12), createdAt: now },
      { id: randomUUID(), name: 'Spotify', amount: 59_000, dueDate: addDays(15), createdAt: now },
      { id: randomUUID(), name: 'Netflix', amount: 120_000, dueDate: addDays(20), createdAt: now },
    ],
    wishlist: [
      { id: randomUUID(), name: 'Monitor', price: 3_500_000, createdAt: now },
      { id: randomUUID(), name: 'Mechanical Keyboard', price: 1_200_000, createdAt: now },
      { id: randomUUID(), name: 'iPad', price: 9_000_000, createdAt: now },
      { id: randomUUID(), name: 'Camera', price: 12_000_000, createdAt: now },
    ],
    assets: [
      { id: randomUUID(), name: 'Laptop', value: 15_000_000, createdAt: now },
      { id: randomUUID(), name: 'Motor', value: 12_000_000, createdAt: now },
      { id: randomUUID(), name: 'HP', value: 6_000_000, createdAt: now },
      { id: randomUUID(), name: 'Monitor', value: 3_500_000, createdAt: now },
    ],
  }
}

function isFinanceData(value: unknown): value is FinanceData {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const data = value as Partial<FinanceData>
  return (
    Array.isArray(data.transactions) &&
    Array.isArray(data.accounts) &&
    Array.isArray(data.budgets) &&
    Array.isArray(data.goals) &&
    Array.isArray(data.bills) &&
    Array.isArray(data.wishlist) &&
    Array.isArray(data.assets)
  )
}

/**
 * Migrasi finance.json:
 * - Format lama: file HANYA berisi array transaksi ([{...}, {...}]).
 * - Format baru: file berisi object dengan 7 section.
 * Data transaksi lama tetap dipertahankan; section lain diisi default.
 */
function migrateFinanceData(raw: unknown): FinanceData {
  const defaults = createDefaultFinanceData()

  if (Array.isArray(raw)) {
    return {
      ...defaults,
      transactions: raw as Transaction[],
    }
  }

  const partial = (raw && typeof raw === 'object' ? raw : {}) as Partial<FinanceData>

  return {
    transactions: Array.isArray(partial.transactions) ? partial.transactions : defaults.transactions,
    accounts: Array.isArray(partial.accounts) ? partial.accounts : defaults.accounts,
    budgets: Array.isArray(partial.budgets) ? partial.budgets : defaults.budgets,
    goals: Array.isArray(partial.goals) ? partial.goals : defaults.goals,
    bills: Array.isArray(partial.bills) ? partial.bills : defaults.bills,
    wishlist: Array.isArray(partial.wishlist) ? partial.wishlist : defaults.wishlist,
    assets: Array.isArray(partial.assets) ? partial.assets : defaults.assets,
  }
}

async function loadFinanceData(): Promise<FinanceData> {
  const raw = await readJsonFile<unknown>(FINANCE_FILE, createDefaultFinanceData())

  if (isFinanceData(raw)) {
    return raw
  }

  const migrated = migrateFinanceData(raw)
  await writeJsonFile<FinanceData>(FINANCE_FILE, migrated)
  return migrated
}

async function persistFinanceData(data: FinanceData): Promise<void> {
  await writeJsonFile<FinanceData>(FINANCE_FILE, data)
}

/* ------------------------------------------------------------------ */
/* Transactions                                                        */
/* ------------------------------------------------------------------ */

export async function getTransactions(): Promise<Transaction[]> {
  const data = await loadFinanceData()
  return data.transactions
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const data = await loadFinanceData()

  const newTransaction: Transaction = {
    id: randomUUID(),
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    description: input.description ?? '',
    createdAt: new Date().toISOString(),
  }

  data.transactions = [...data.transactions, newTransaction]
  await persistFinanceData(data)
  return newTransaction
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<void> {
  const data = await loadFinanceData()
  data.transactions = data.transactions.map((transaction) =>
    transaction.id === id ? { ...transaction, ...input } : transaction,
  )
  await persistFinanceData(data)
}

export async function deleteTransaction(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.transactions = data.transactions.filter((transaction) => transaction.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Accounts                                                             */
/* ------------------------------------------------------------------ */

export async function getAccounts(): Promise<Account[]> {
  const data = await loadFinanceData()
  return data.accounts
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const data = await loadFinanceData()

  const newAccount: Account = {
    id: input.id ?? randomUUID(),
    label: input.label,
    iconKey: input.iconKey,
    amount: input.amount,
    createdAt: new Date().toISOString(),
  }

  data.accounts = [...data.accounts, newAccount]
  await persistFinanceData(data)
  return newAccount
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<void> {
  const data = await loadFinanceData()
  data.accounts = data.accounts.map((account) =>
    account.id === id ? { ...account, ...input } : account,
  )
  await persistFinanceData(data)
}

export async function deleteAccount(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.accounts = data.accounts.filter((account) => account.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Budgets                                                              */
/* ------------------------------------------------------------------ */

export async function getBudgets(): Promise<Budget[]> {
  const data = await loadFinanceData()
  return data.budgets
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const data = await loadFinanceData()

  const newBudget: Budget = {
    id: randomUUID(),
    category: input.category,
    limit: input.limit,
    createdAt: new Date().toISOString(),
  }

  data.budgets = [...data.budgets, newBudget]
  await persistFinanceData(data)
  return newBudget
}

export async function updateBudget(id: string, input: UpdateBudgetInput): Promise<void> {
  const data = await loadFinanceData()
  data.budgets = data.budgets.map((budget) => (budget.id === id ? { ...budget, ...input } : budget))
  await persistFinanceData(data)
}

export async function deleteBudget(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.budgets = data.budgets.filter((budget) => budget.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Savings goals                                                        */
/* ------------------------------------------------------------------ */

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const data = await loadFinanceData()
  return data.goals
}

export async function createSavingsGoal(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
  const data = await loadFinanceData()

  const newGoal: SavingsGoal = {
    id: randomUUID(),
    name: input.name,
    target: input.target,
    current: input.current ?? 0,
    createdAt: new Date().toISOString(),
  }

  data.goals = [...data.goals, newGoal]
  await persistFinanceData(data)
  return newGoal
}

export async function updateSavingsGoal(id: string, input: UpdateSavingsGoalInput): Promise<void> {
  const data = await loadFinanceData()
  data.goals = data.goals.map((goal) => (goal.id === id ? { ...goal, ...input } : goal))
  await persistFinanceData(data)
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.goals = data.goals.filter((goal) => goal.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Bills                                                                */
/* ------------------------------------------------------------------ */

export async function getBills(): Promise<Bill[]> {
  const data = await loadFinanceData()
  return data.bills
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const data = await loadFinanceData()

  const newBill: Bill = {
    id: randomUUID(),
    name: input.name,
    amount: input.amount,
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
  }

  data.bills = [...data.bills, newBill]
  await persistFinanceData(data)
  return newBill
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<void> {
  const data = await loadFinanceData()
  data.bills = data.bills.map((bill) => (bill.id === id ? { ...bill, ...input } : bill))
  await persistFinanceData(data)
}

export async function deleteBill(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.bills = data.bills.filter((bill) => bill.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                             */
/* ------------------------------------------------------------------ */

export async function getWishlist(): Promise<WishlistItem[]> {
  const data = await loadFinanceData()
  return data.wishlist
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  const data = await loadFinanceData()

  const newItem: WishlistItem = {
    id: randomUUID(),
    name: input.name,
    price: input.price,
    createdAt: new Date().toISOString(),
  }

  data.wishlist = [...data.wishlist, newItem]
  await persistFinanceData(data)
  return newItem
}

export async function updateWishlistItem(
  id: string,
  input: UpdateWishlistItemInput,
): Promise<void> {
  const data = await loadFinanceData()
  data.wishlist = data.wishlist.map((item) => (item.id === id ? { ...item, ...input } : item))
  await persistFinanceData(data)
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.wishlist = data.wishlist.filter((item) => item.id !== id)
  await persistFinanceData(data)
}

/* ------------------------------------------------------------------ */
/* Assets                                                               */
/* ------------------------------------------------------------------ */

export async function getAssets(): Promise<Asset[]> {
  const data = await loadFinanceData()
  return data.assets
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const data = await loadFinanceData()

  const newAsset: Asset = {
    id: randomUUID(),
    name: input.name,
    value: input.value,
    createdAt: new Date().toISOString(),
  }

  data.assets = [...data.assets, newAsset]
  await persistFinanceData(data)
  return newAsset
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<void> {
  const data = await loadFinanceData()
  data.assets = data.assets.map((asset) => (asset.id === id ? { ...asset, ...input } : asset))
  await persistFinanceData(data)
}

export async function deleteAsset(id: string): Promise<void> {
  const data = await loadFinanceData()
  data.assets = data.assets.filter((asset) => asset.id !== id)
  await persistFinanceData(data)
}