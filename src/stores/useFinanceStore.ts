import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
} from '../services/financeService'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../types/transaction'

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)

  // Diurutkan dari yang terbaru
  const sortedTransactions = computed<Transaction[]>(() => {
    return [...transactions.value].sort((a, b) => b.date.localeCompare(a.date))
  })

  // Semua nilai berikut derived data, dihitung ulang dari transactions,
  // tidak disimpan terpisah di file JSON
  const totalIncome = computed<number>(() =>
    transactions.value
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  )

  const totalExpense = computed<number>(() =>
    transactions.value
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0),
  )

  const balance = computed<number>(() => totalIncome.value - totalExpense.value)

  async function loadTransactions(): Promise<void> {
    isLoading.value = true
    try {
      transactions.value = await fetchTransactions()
    } finally {
      isLoading.value = false
    }
  }

  async function createTransaction(input: CreateTransactionInput): Promise<void> {
    const newTransaction = await addTransaction(input)
    transactions.value = [...transactions.value, newTransaction]
  }

  async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<void> {
    transactions.value = transactions.value.map((transaction) =>
      transaction.id === id ? { ...transaction, ...input } : transaction,
    )
    await editTransaction(id, input)
  }

  async function deleteTransaction(id: string): Promise<void> {
    transactions.value = transactions.value.filter((transaction) => transaction.id !== id)
    await removeTransaction(id)
  }

  return {
    transactions,
    isLoading,
    sortedTransactions,
    totalIncome,
    totalExpense,
    balance,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})