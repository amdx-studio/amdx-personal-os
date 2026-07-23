import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import {
  fetchTransactions,
  addTransaction,
  editTransaction,
  removeTransaction,
  fetchAccounts,
  createAccount as createAccountService,
  updateAccount as updateAccountService,
  deleteAccount as deleteAccountService,
  fetchBudgets,
  createBudget as createBudgetService,
  updateBudget as updateBudgetService,
  deleteBudget as deleteBudgetService,
  fetchGoals,
  createGoal as createGoalService,
  updateGoal as updateGoalService,
  deleteGoal as deleteGoalService,
  fetchBills,
  createBill as createBillService,
  updateBill as updateBillService,
  deleteBill as deleteBillService,
  fetchWishlist,
  createWishlistItem as createWishlistItemService,
  updateWishlistItem as updateWishlistItemService,
  deleteWishlistItem as deleteWishlistItemService,
  fetchAssets,
  createAsset as createAssetService,
  updateAsset as updateAssetService,
  deleteAsset as deleteAssetService,
} from '../services/financeService'
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

export const useFinanceStore = defineStore('finance', () => {
  const transactions = ref<Transaction[]>([])

  const accounts = ref<Account[]>([
    { id: 'cash', label: 'Cash', iconKey: 'cash', amount: 850_000, createdAt: '' },
    { id: 'bank', label: 'Bank', iconKey: 'bank', amount: 4_200_000, createdAt: '' },
    { id: 'ewallet', label: 'E-Wallet', iconKey: 'ewallet', amount: 350_000, createdAt: '' },
    { id: 'savings', label: 'Savings', iconKey: 'savings', amount: 6_000_000, createdAt: '' },
    { id: 'investment', label: 'Investments', iconKey: 'investment', amount: 3_000_000, createdAt: '' },
  ])

  const budgets = ref<Budget[]>([])
  const goals = ref<SavingsGoal[]>([])
  const bills = ref<Bill[]>([])
  const wishlist = ref<WishlistItem[]>([])
  const assets = ref<Asset[]>([])
  const isLoading = ref(false)

  const sortedTransactions = computed<Transaction[]>(() => {
    return [...transactions.value].sort((a, b) => b.date.localeCompare(a.date))
  })

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

  const totalBalance = computed<number>(() =>
    accounts.value.reduce((sum, account) => sum + account.amount, 0),
  )

  const totalAssetValue = computed<number>(() =>
    assets.value.reduce((sum, asset) => sum + (asset.value ?? 0), 0),
  )

  /* ------------------------------------------------------------------ */
  /* Transactions                                                        */
  /* ------------------------------------------------------------------ */

  async function loadTransactions(): Promise<void> {
    transactions.value = await fetchTransactions()
  }

  /**
   * Menambah transaksi baru DAN menyesuaikan saldo akun terkait:
   * - income  -> saldo akun bertambah
   * - expense -> saldo akun berkurang
   * (accountId wajib dikirim dari form supaya saldo akun ikut akurat)
   */
  async function createTransaction(input: CreateTransactionInput): Promise<void> {
    const newTransaction = await addTransaction(input)
    transactions.value = [...transactions.value, newTransaction]

    if (input.accountId) {
      const account = accounts.value.find((a) => a.id === input.accountId)
      if (account) {
        const delta = input.type === 'income' ? input.amount : -input.amount
        await updateAccount(account.id, { amount: account.amount + delta })
      }
    }
  }

  async function updateTransaction(id: string, input: UpdateTransactionInput): Promise<void> {
    transactions.value = transactions.value.map((transaction) =>
      transaction.id === id ? { ...transaction, ...input } : transaction,
    )
    await editTransaction(id, input)
  }

  /**
   * Hapus transaksi DAN kembalikan efeknya ke saldo akun (mengurangi
   * saldo untuk income yang dihapus, mengembalikan saldo untuk expense
   * yang dihapus).
   */
  async function deleteTransaction(id: string): Promise<void> {
    const target = transactions.value.find((transaction) => transaction.id === id)

    transactions.value = transactions.value.filter((transaction) => transaction.id !== id)
    await removeTransaction(id)

    if (target?.accountId) {
      const account = accounts.value.find((a) => a.id === target.accountId)
      if (account) {
        const delta = target.type === 'income' ? -target.amount : target.amount
        await updateAccount(account.id, { amount: account.amount + delta })
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* Accounts                                                             */
  /* ------------------------------------------------------------------ */

  async function loadAccounts(): Promise<void> {
    accounts.value = await fetchAccounts()
  }

  async function createAccount(input: CreateAccountInput): Promise<void> {
    const newAccount = await createAccountService(input)
    accounts.value = [...accounts.value, newAccount]
  }

  async function updateAccount(id: string, input: UpdateAccountInput): Promise<void> {
    accounts.value = accounts.value.map((account) =>
      account.id === id ? { ...account, ...input } : account,
    )
    await updateAccountService(id, input)
  }

  async function deleteAccount(id: string): Promise<void> {
    accounts.value = accounts.value.filter((account) => account.id !== id)
    await deleteAccountService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Budgets                                                              */
  /* ------------------------------------------------------------------ */

  async function loadBudgets(): Promise<void> {
    budgets.value = await fetchBudgets()
  }

  async function createBudget(input: CreateBudgetInput): Promise<void> {
    const newBudget = await createBudgetService(input)
    budgets.value = [...budgets.value, newBudget]
  }

  async function updateBudget(id: string, input: UpdateBudgetInput): Promise<void> {
    budgets.value = budgets.value.map((budget) =>
      budget.id === id ? { ...budget, ...input } : budget,
    )
    await updateBudgetService(id, input)
  }

  async function deleteBudget(id: string): Promise<void> {
    budgets.value = budgets.value.filter((budget) => budget.id !== id)
    await deleteBudgetService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Savings goals                                                        */
  /* ------------------------------------------------------------------ */

  async function loadGoals(): Promise<void> {
    goals.value = await fetchGoals()
  }

  async function createGoal(input: CreateSavingsGoalInput): Promise<void> {
    const newGoal = await createGoalService(input)
    goals.value = [...goals.value, newGoal]
  }

  async function updateGoal(id: string, input: UpdateSavingsGoalInput): Promise<void> {
    goals.value = goals.value.map((goal) => (goal.id === id ? { ...goal, ...input } : goal))
    await updateGoalService(id, input)
  }

  async function deleteGoal(id: string): Promise<void> {
    goals.value = goals.value.filter((goal) => goal.id !== id)
    await deleteGoalService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Bills                                                                */
  /* ------------------------------------------------------------------ */

  async function loadBills(): Promise<void> {
    bills.value = await fetchBills()
  }

  async function createBill(input: CreateBillInput): Promise<void> {
    const newBill = await createBillService(input)
    bills.value = [...bills.value, newBill]
  }

  async function updateBill(id: string, input: UpdateBillInput): Promise<void> {
    bills.value = bills.value.map((bill) => (bill.id === id ? { ...bill, ...input } : bill))
    await updateBillService(id, input)
  }

  async function deleteBill(id: string): Promise<void> {
    bills.value = bills.value.filter((bill) => bill.id !== id)
    await deleteBillService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Wishlist                                                             */
  /* ------------------------------------------------------------------ */

  async function loadWishlist(): Promise<void> {
    wishlist.value = await fetchWishlist()
  }

  async function createWishlistItem(input: CreateWishlistItemInput): Promise<void> {
    const newItem = await createWishlistItemService(input)
    wishlist.value = [...wishlist.value, newItem]
  }

  async function updateWishlistItem(id: string, input: UpdateWishlistItemInput): Promise<void> {
    wishlist.value = wishlist.value.map((item) => (item.id === id ? { ...item, ...input } : item))
    await updateWishlistItemService(id, input)
  }

  async function deleteWishlistItem(id: string): Promise<void> {
    wishlist.value = wishlist.value.filter((item) => item.id !== id)
    await deleteWishlistItemService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Assets                                                               */
  /* ------------------------------------------------------------------ */

  async function loadAssets(): Promise<void> {
    assets.value = await fetchAssets()
  }

  async function createAsset(input: CreateAssetInput): Promise<void> {
    const newAsset = await createAssetService(input)
    assets.value = [...assets.value, newAsset]
  }

  async function updateAsset(id: string, input: UpdateAssetInput): Promise<void> {
    assets.value = assets.value.map((asset) => (asset.id === id ? { ...asset, ...input } : asset))
    await updateAssetService(id, input)
  }

  async function deleteAsset(id: string): Promise<void> {
    assets.value = assets.value.filter((asset) => asset.id !== id)
    await deleteAssetService(id)
  }

  /* ------------------------------------------------------------------ */
  /* Muat seluruh data finance sekaligus                                  */
  /* ------------------------------------------------------------------ */

  async function loadFinanceData(): Promise<void> {
    isLoading.value = true
    try {
      await Promise.all([
        loadTransactions(),
        loadAccounts(),
        loadBudgets(),
        loadGoals(),
        loadBills(),
        loadWishlist(),
        loadAssets(),
      ])
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Mengosongkan SEMUA data finance: transaksi, budget, goal, tagihan,
   * wishlist, dan aset dihapus; saldo tiap akun direset ke 0.
   * Akun itu sendiri (Cash, Bank, dll) tidak dihapus supaya struktur
   * dashboard tidak rusak.
   */
  async function resetFinanceData(): Promise<void> {
    isLoading.value = true
    try {
      await Promise.all([
        ...transactions.value.map((t) => removeTransaction(t.id)),
        ...budgets.value.map((b) => deleteBudgetService(b.id)),
        ...goals.value.map((g) => deleteGoalService(g.id)),
        ...bills.value.map((b) => deleteBillService(b.id)),
        ...wishlist.value.map((w) => deleteWishlistItemService(w.id)),
        ...assets.value.map((a) => deleteAssetService(a.id)),
        ...accounts.value.map((a) => updateAccountService(a.id, { amount: 0 })),
      ])
    } finally {
      await loadFinanceData()
    }
  }

  return {
    transactions,
    accounts,
    budgets,
    goals,
    bills,
    wishlist,
    assets,
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
    totalBalance,
    totalAssetValue,
    loadTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    loadGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    loadBills,
    createBill,
    updateBill,
    deleteBill,
    loadWishlist,
    createWishlistItem,
    updateWishlistItem,
    deleteWishlistItem,
    loadAssets,
    createAsset,
    updateAsset,
    deleteAsset,
    loadFinanceData,
    resetFinanceData,
  }
})