import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../../src/types/transaction.js'

const FINANCE_FILE = 'finance.json'
const DEFAULT_TRANSACTIONS: Transaction[] = []

export async function getTransactions(): Promise<Transaction[]> {
  return readJsonFile<Transaction[]>(FINANCE_FILE, DEFAULT_TRANSACTIONS)
}

export async function createTransaction(input: CreateTransactionInput): Promise<Transaction> {
  const transactions = await getTransactions()

  const newTransaction: Transaction = {
    id: randomUUID(),
    type: input.type,
    amount: input.amount,
    category: input.category,
    date: input.date,
    description: input.description ?? '',
    createdAt: new Date().toISOString(),
  }

  await writeJsonFile<Transaction[]>(FINANCE_FILE, [...transactions, newTransaction])
  return newTransaction
}

export async function updateTransaction(
  id: string,
  input: UpdateTransactionInput,
): Promise<void> {
  const transactions = await getTransactions()

  const updated = transactions.map((transaction) =>
    transaction.id === id ? { ...transaction, ...input } : transaction,
  )

  await writeJsonFile<Transaction[]>(FINANCE_FILE, updated)
}

export async function deleteTransaction(id: string): Promise<void> {
  const transactions = await getTransactions()
  const updated = transactions.filter((transaction) => transaction.id !== id)
  await writeJsonFile<Transaction[]>(FINANCE_FILE, updated)
}