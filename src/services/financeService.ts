import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/transaction'

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