import { ipcMain } from 'electron'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../services/financeService.js'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../../src/types/transaction.js'

export function registerFinanceHandlers(): void {
  ipcMain.handle('finance:get', async () => {
    return getTransactions()
  })

  ipcMain.handle('finance:create', async (_event, input: CreateTransactionInput) => {
    return createTransaction(input)
  })

  ipcMain.handle(
    'finance:update',
    async (_event, id: string, input: UpdateTransactionInput) => {
      await updateTransaction(id, input)
      return true
    },
  )

  ipcMain.handle('finance:delete', async (_event, id: string) => {
    await deleteTransaction(id)
    return true
  })
}