import { randomUUID } from 'node:crypto'
import { withFileTransaction } from './jsonStore.js'
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

/**
 * Mengambil finance data untuk keperluan BACA saja (get*).
 *
 * Tetap dijalankan lewat withFileTransaction supaya pembacaan ini
 * ikut masuk antrean file yang sama -- jadi tidak pernah membaca state
 * "setengah jalan" di tengah operasi tulis lain yang sedang berlangsung.
 */
async function readFinanceData(): Promise<FinanceData> {
  return withFileTransaction(FINANCE_FILE, async (ctx) => {
    const raw = await ctx.read<unknown>(createDefaultFinanceData())

    if (isFinanceData(raw)) {
      return raw
    }

    const migrated = migrateFinanceData(raw)
    await ctx.write(migrated)
    return migrated
  })
}

/**
 * Inti dari perbaikan race condition: seluruh siklus
 * "baca finance.json -> ubah -> simpan lagi" dijalankan sebagai SATU
 * unit atomik di dalam antrean per-file (withFileTransaction).
 *
 * Sebelumnya, create/update/delete masing-masing memanggil
 * loadFinanceData() dan persistFinanceData() secara terpisah, sehingga
 * dua operasi yang berjalan bersamaan bisa baca state yang sama lalu
 * saling menimpa perubahan satu sama lain (lost update). Dengan
 * mutateFinanceData(), tidak ada operasi finance.json lain yang bisa
 * menyela di antara "baca" dan "simpan".
 */
async function mutateFinanceData<T>(
  mutator: (data: FinanceData) => T | Promise<T>,
): Promise<T> {
  return withFileTransaction(FINANCE_FILE, async (ctx) => {
    const raw = await ctx.read<unknown>(createDefaultFinanceData())
    const data = isFinanceData(raw) ? raw : migrateFinanceData(raw)

    const result = await mutator(data)

    await ctx.write(data)
    return result
  })
}

/* ------------------------------------------------------------------ */
/* Transactions                                                        */
/* ------------------------------------------------------------------ */

export async function getTransactions(): Promise<Transaction[]> {
  const data = await readFinanceData()
  return data.transactions
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const newTransaction: Transaction = {
    id: randomUUID(),
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    description: input.description ?? '',
    accountId: input.accountId,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.transactions = [...data.transactions, newTransaction]
  })

  return newTransaction
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<void> {
  await mutateFinanceData((data) => {
    data.transactions = data.transactions.map((transaction) =>
      transaction.id === id ? { ...transaction, ...input } : transaction,
    )
  })
}

export async function deleteTransaction(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.transactions = data.transactions.filter((transaction) => transaction.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Accounts                                                             */
/* ------------------------------------------------------------------ */

export async function getAccounts(): Promise<Account[]> {
  const data = await readFinanceData()
  return data.accounts
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  const newAccount: Account = {
    id: input.id ?? randomUUID(),
    label: input.label,
    iconKey: input.iconKey,
    amount: input.amount,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.accounts = [...data.accounts, newAccount]
  })

  return newAccount
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<void> {
  await mutateFinanceData((data) => {
    data.accounts = data.accounts.map((account) =>
      account.id === id ? { ...account, ...input } : account,
    )
  })
}

export async function deleteAccount(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.accounts = data.accounts.filter((account) => account.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Budgets                                                              */
/* ------------------------------------------------------------------ */

export async function getBudgets(): Promise<Budget[]> {
  const data = await readFinanceData()
  return data.budgets
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  const newBudget: Budget = {
    id: randomUUID(),
    category: input.category,
    limit: input.limit,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.budgets = [...data.budgets, newBudget]
  })

  return newBudget
}

export async function updateBudget(id: string, input: UpdateBudgetInput): Promise<void> {
  await mutateFinanceData((data) => {
    data.budgets = data.budgets.map((budget) => (budget.id === id ? { ...budget, ...input } : budget))
  })
}

export async function deleteBudget(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.budgets = data.budgets.filter((budget) => budget.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Savings goals                                                        */
/* ------------------------------------------------------------------ */

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const data = await readFinanceData()
  return data.goals
}

export async function createSavingsGoal(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
  const newGoal: SavingsGoal = {
    id: randomUUID(),
    name: input.name,
    target: input.target,
    current: input.current ?? 0,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.goals = [...data.goals, newGoal]
  })

  return newGoal
}

export async function updateSavingsGoal(id: string, input: UpdateSavingsGoalInput): Promise<void> {
  await mutateFinanceData((data) => {
    data.goals = data.goals.map((goal) => (goal.id === id ? { ...goal, ...input } : goal))
  })
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.goals = data.goals.filter((goal) => goal.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Bills                                                                */
/* ------------------------------------------------------------------ */

export async function getBills(): Promise<Bill[]> {
  const data = await readFinanceData()
  return data.bills
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  const newBill: Bill = {
    id: randomUUID(),
    name: input.name,
    amount: input.amount,
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.bills = [...data.bills, newBill]
  })

  return newBill
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<void> {
  await mutateFinanceData((data) => {
    data.bills = data.bills.map((bill) => (bill.id === id ? { ...bill, ...input } : bill))
  })
}

export async function deleteBill(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.bills = data.bills.filter((bill) => bill.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Wishlist                                                             */
/* ------------------------------------------------------------------ */

export async function getWishlist(): Promise<WishlistItem[]> {
  const data = await readFinanceData()
  return data.wishlist
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  const newItem: WishlistItem = {
    id: randomUUID(),
    name: input.name,
    price: input.price,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.wishlist = [...data.wishlist, newItem]
  })

  return newItem
}

export async function updateWishlistItem(
  id: string,
  input: UpdateWishlistItemInput,
): Promise<void> {
  await mutateFinanceData((data) => {
    data.wishlist = data.wishlist.map((item) => (item.id === id ? { ...item, ...input } : item))
  })
}

export async function deleteWishlistItem(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.wishlist = data.wishlist.filter((item) => item.id !== id)
  })
}

/* ------------------------------------------------------------------ */
/* Assets                                                               */
/* ------------------------------------------------------------------ */

export async function getAssets(): Promise<Asset[]> {
  const data = await readFinanceData()
  return data.assets
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  const newAsset: Asset = {
    id: randomUUID(),
    name: input.name,
    value: input.value,
    createdAt: new Date().toISOString(),
  }

  await mutateFinanceData((data) => {
    data.assets = [...data.assets, newAsset]
  })

  return newAsset
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<void> {
  await mutateFinanceData((data) => {
    data.assets = data.assets.map((asset) => (asset.id === id ? { ...asset, ...input } : asset))
  })
}

export async function deleteAsset(id: string): Promise<void> {
  await mutateFinanceData((data) => {
    data.assets = data.assets.filter((asset) => asset.id !== id)
  })
}