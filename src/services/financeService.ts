import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/transaction'
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
} from '../types/finance'

// --- Transactions ---

export async function fetchTransactions(): Promise<Transaction[]> {
  return window.electronAPI.finance.get()
}

export async function addTransaction(input: CreateTransactionInput): Promise<Transaction> {
  return window.electronAPI.finance.create(input)
}

export async function editTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<boolean> {
  return window.electronAPI.finance.update(id, input)
}

export async function removeTransaction(id: string): Promise<boolean> {
  return window.electronAPI.finance.delete(id)
}

// --- Accounts ---

export async function fetchAccounts(): Promise<Account[]> {
  return window.electronAPI.finance.accounts.get()
}

export async function createAccount(input: CreateAccountInput): Promise<Account> {
  return window.electronAPI.finance.accounts.create(input)
}

export async function updateAccount(id: string, input: UpdateAccountInput): Promise<boolean> {
  return window.electronAPI.finance.accounts.update(id, input)
}

export async function deleteAccount(id: string): Promise<boolean> {
  return window.electronAPI.finance.accounts.delete(id)
}

// --- Budgets ---

export async function fetchBudgets(): Promise<Budget[]> {
  return window.electronAPI.finance.budgets.get()
}

export async function createBudget(input: CreateBudgetInput): Promise<Budget> {
  return window.electronAPI.finance.budgets.create(input)
}

export async function updateBudget(id: string, input: UpdateBudgetInput): Promise<boolean> {
  return window.electronAPI.finance.budgets.update(id, input)
}

export async function deleteBudget(id: string): Promise<boolean> {
  return window.electronAPI.finance.budgets.delete(id)
}

// --- Savings goals ---

export async function fetchGoals(): Promise<SavingsGoal[]> {
  return window.electronAPI.finance.goals.get()
}

export async function createGoal(input: CreateSavingsGoalInput): Promise<SavingsGoal> {
  return window.electronAPI.finance.goals.create(input)
}

export async function updateGoal(id: string, input: UpdateSavingsGoalInput): Promise<boolean> {
  return window.electronAPI.finance.goals.update(id, input)
}

export async function deleteGoal(id: string): Promise<boolean> {
  return window.electronAPI.finance.goals.delete(id)
}

// --- Bills ---

export async function fetchBills(): Promise<Bill[]> {
  return window.electronAPI.finance.bills.get()
}

export async function createBill(input: CreateBillInput): Promise<Bill> {
  return window.electronAPI.finance.bills.create(input)
}

export async function updateBill(id: string, input: UpdateBillInput): Promise<boolean> {
  return window.electronAPI.finance.bills.update(id, input)
}

export async function deleteBill(id: string): Promise<boolean> {
  return window.electronAPI.finance.bills.delete(id)
}

// --- Wishlist ---

export async function fetchWishlist(): Promise<WishlistItem[]> {
  return window.electronAPI.finance.wishlist.get()
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  return window.electronAPI.finance.wishlist.create(input)
}

export async function updateWishlistItem(
  id: string,
  input: UpdateWishlistItemInput,
): Promise<boolean> {
  return window.electronAPI.finance.wishlist.update(id, input)
}

export async function deleteWishlistItem(id: string): Promise<boolean> {
  return window.electronAPI.finance.wishlist.delete(id)
}

// --- Assets ---

export async function fetchAssets(): Promise<Asset[]> {
  return window.electronAPI.finance.assets.get()
}

export async function createAsset(input: CreateAssetInput): Promise<Asset> {
  return window.electronAPI.finance.assets.create(input)
}

export async function updateAsset(id: string, input: UpdateAssetInput): Promise<boolean> {
  return window.electronAPI.finance.assets.update(id, input)
}

export async function deleteAsset(id: string): Promise<boolean> {
  return window.electronAPI.finance.assets.delete(id)
}