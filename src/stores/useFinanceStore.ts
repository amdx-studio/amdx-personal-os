import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
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

  // --- Transaksi bulan berjalan ---
  const currentMonthTransactions = computed<Transaction[]>(() => {
    const now = dayjs()
    return transactions.value.filter((t) => dayjs(t.date).isSame(now, 'month'))
  })

  const currentMonthIncome = computed<number>(() =>
    currentMonthTransactions.value
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0),
  )

  const currentMonthExpense = computed<number>(() =>
    currentMonthTransactions.value
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0),
  )

  const currentMonthCashFlow = computed<number>(
    () => currentMonthIncome.value - currentMonthExpense.value,
  )

  // --- Pengeluaran per kategori (bulan berjalan) ---
  interface CategoryBreakdown {
    category: string
    amount: number
    percentage: number
  }

  const expenseByCategory = computed<CategoryBreakdown[]>(() => {
    const map = new Map<string, number>()
    currentMonthTransactions.value
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map.set(t.category, (map.get(t.category) ?? 0) + t.amount)
      })

    const total = currentMonthExpense.value || 1
    return Array.from(map.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: Math.round((amount / total) * 100),
      }))
      .sort((a, b) => b.amount - a.amount)
  })

  const topExpenseCategory = computed<CategoryBreakdown | null>(
    () => expenseByCategory.value[0] ?? null,
  )

  // --- Tren 6 bulan terakhir ---
  interface MonthTrend {
    month: string
    label: string
    income: number
    expense: number
  }

  const monthlyTrend = computed<MonthTrend[]>(() => {
    const months: MonthTrend[] = []
    for (let i = 5; i >= 0; i--) {
      const cursor = dayjs().subtract(i, 'month')
      const monthKey = cursor.format('YYYY-MM')
      const income = transactions.value
        .filter((t) => t.type === 'income' && dayjs(t.date).format('YYYY-MM') === monthKey)
        .reduce((sum, t) => sum + t.amount, 0)
      const expense = transactions.value
        .filter((t) => t.type === 'expense' && dayjs(t.date).format('YYYY-MM') === monthKey)
        .reduce((sum, t) => sum + t.amount, 0)

      months.push({
        month: monthKey,
        label: cursor.format('MMM'),
        income,
        expense,
      })
    }
    return months
  })

  // --- Hari paling banyak belanja (bulan berjalan) ---
  const busiestSpendingDay = computed<string | null>(() => {
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    const counter = new Array(7).fill(0)

    currentMonthTransactions.value
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        counter[dayjs(t.date).day()] += t.amount
      })

    const maxIndex = counter.reduce(
      (best, value, index) => (value > counter[best] ? index : best),
      0,
    )

    return counter[maxIndex] > 0 ? dayNames[maxIndex] : null
  })

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
    currentMonthTransactions,
    currentMonthIncome,
    currentMonthExpense,
    currentMonthCashFlow,
    expenseByCategory,
    topExpenseCategory,
    monthlyTrend,
    busiestSpendingDay,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
})