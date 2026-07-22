import { ipcMain } from 'electron'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getWishlist,
  createWishlistItem,
  updateWishlistItem,
  deleteWishlistItem,
  getAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from '../services/financeService.js'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../../src/types/transaction.js'
import type {
  CreateAccountInput,
  UpdateAccountInput,
  CreateBudgetInput,
  UpdateBudgetInput,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  CreateBillInput,
  UpdateBillInput,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  CreateAssetInput,
  UpdateAssetInput,
} from '../../src/types/finance.js'

export function registerFinanceHandlers(): void {
  // Transactions
  ipcMain.handle('finance:get', async () => {
    return getTransactions()
  })

  ipcMain.handle('finance:create', async (_event, input: CreateTransactionInput) => {
    return createTransaction(input)
  })

  ipcMain.handle('finance:update', async (_event, id: string, input: UpdateTransactionInput) => {
    await updateTransaction(id, input)
    return true
  })

  ipcMain.handle('finance:delete', async (_event, id: string) => {
    await deleteTransaction(id)
    return true
  })

  // Accounts
  ipcMain.handle('finance:accounts:get', async () => {
    return getAccounts()
  })

  ipcMain.handle('finance:accounts:create', async (_event, input: CreateAccountInput) => {
    return createAccount(input)
  })

  ipcMain.handle(
    'finance:accounts:update',
    async (_event, id: string, input: UpdateAccountInput) => {
      await updateAccount(id, input)
      return true
    },
  )

  ipcMain.handle('finance:accounts:delete', async (_event, id: string) => {
    await deleteAccount(id)
    return true
  })

  // Budgets
  ipcMain.handle('finance:budgets:get', async () => {
    return getBudgets()
  })

  ipcMain.handle('finance:budgets:create', async (_event, input: CreateBudgetInput) => {
    return createBudget(input)
  })

  ipcMain.handle(
    'finance:budgets:update',
    async (_event, id: string, input: UpdateBudgetInput) => {
      await updateBudget(id, input)
      return true
    },
  )

  ipcMain.handle('finance:budgets:delete', async (_event, id: string) => {
    await deleteBudget(id)
    return true
  })

  // Savings goals
  ipcMain.handle('finance:goals:get', async () => {
    return getSavingsGoals()
  })

  ipcMain.handle('finance:goals:create', async (_event, input: CreateSavingsGoalInput) => {
    return createSavingsGoal(input)
  })

  ipcMain.handle(
    'finance:goals:update',
    async (_event, id: string, input: UpdateSavingsGoalInput) => {
      await updateSavingsGoal(id, input)
      return true
    },
  )

  ipcMain.handle('finance:goals:delete', async (_event, id: string) => {
    await deleteSavingsGoal(id)
    return true
  })

  // Bills
  ipcMain.handle('finance:bills:get', async () => {
    return getBills()
  })

  ipcMain.handle('finance:bills:create', async (_event, input: CreateBillInput) => {
    return createBill(input)
  })

  ipcMain.handle('finance:bills:update', async (_event, id: string, input: UpdateBillInput) => {
    await updateBill(id, input)
    return true
  })

  ipcMain.handle('finance:bills:delete', async (_event, id: string) => {
    await deleteBill(id)
    return true
  })

  // Wishlist
  ipcMain.handle('finance:wishlist:get', async () => {
    return getWishlist()
  })

  ipcMain.handle('finance:wishlist:create', async (_event, input: CreateWishlistItemInput) => {
    return createWishlistItem(input)
  })

  ipcMain.handle(
    'finance:wishlist:update',
    async (_event, id: string, input: UpdateWishlistItemInput) => {
      await updateWishlistItem(id, input)
      return true
    },
  )

  ipcMain.handle('finance:wishlist:delete', async (_event, id: string) => {
    await deleteWishlistItem(id)
    return true
  })

  // Assets
  ipcMain.handle('finance:assets:get', async () => {
    return getAssets()
  })

  ipcMain.handle('finance:assets:create', async (_event, input: CreateAssetInput) => {
    return createAsset(input)
  })

  ipcMain.handle('finance:assets:update', async (_event, id: string, input: UpdateAssetInput) => {
    await updateAsset(id, input)
    return true
  })

  ipcMain.handle('finance:assets:delete', async (_event, id: string) => {
    await deleteAsset(id)
    return true
  })
}