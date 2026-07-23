<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  Plus,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Wallet,
  Landmark,
  CreditCard,
  PiggyBank,
  LineChart,
  ArrowLeftRight,
  Target,
  Wallet2,
  Receipt,
  HeartPulse,
  Sparkles,
  Boxes,
  Utensils,
  Bus,
  Wifi,
  ShoppingBag,
  Film,
  Banknote,
  ListChecks,
} from 'lucide-vue-next'
import { useFinanceStore } from '../stores/useFinanceStore'
import SummaryCard from '../components/SummaryCard.vue'
import type { TransactionType } from '../types/transaction'
import dayjs from 'dayjs'

const financeStore = useFinanceStore()

/* ------------------------------------------------------------------ */
/* Form tambah transaksi                                               */
/* ------------------------------------------------------------------ */
const showForm = ref(false)
const newType = ref<TransactionType>('expense')
const newAmount = ref<number | null>(null)
const newCategory = ref('')
const newDate = ref(dayjs().format('YYYY-MM-DD'))
const newDescription = ref('')
const newAccountId = ref('cash')

onMounted(() => {
  financeStore.loadFinanceData()
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

function openForm(type: TransactionType): void {
  newType.value = type
  if (!newAccountId.value && accounts.value.length > 0) {
    newAccountId.value = accounts.value[0].id
  }
  showForm.value = true
}

async function handleAddTransaction(): Promise<void> {
  const category = newCategory.value.trim()
  if (!category || newAmount.value === null || newAmount.value <= 0 || !newAccountId.value) return

  if (newType.value === 'expense') {
    const sourceAccount = financeStore.accounts.find((a) => a.id === newAccountId.value)
    if (sourceAccount && sourceAccount.amount < newAmount.value) {
      alert(`Saldo ${sourceAccount.label} tidak cukup untuk pengeluaran ini.`)
      return
    }
  }

  await financeStore.createTransaction({
    type: newType.value,
    amount: newAmount.value,
    category,
    date: newDate.value,
    description: newDescription.value.trim() || undefined,
    accountId: newAccountId.value,
  })

  newAmount.value = null
  newCategory.value = ''
  newDescription.value = ''
  showForm.value = false
}

/* ------------------------------------------------------------------ */
/* Ikon kategori untuk daftar transaksi                                */
/* ------------------------------------------------------------------ */
const categoryIcons: Record<string, any> = {
  makan: Utensils,
  transport: Bus,
  internet: Wifi,
  belanja: ShoppingBag,
  hiburan: Film,
  gaji: Banknote,
}

function iconForCategory(category: string) {
  const key = category.trim().toLowerCase()
  return categoryIcons[key] ?? Wallet2
}

/* ------------------------------------------------------------------ */
/* Akun (dari store, tersimpan ke finance.json)                        */
/* ------------------------------------------------------------------ */
interface AccountBalance {
  id: string
  label: string
  icon: any
  amount: number
}

const accountIcons: Record<string, any> = {
  cash: Wallet,
  bank: Landmark,
  ewallet: CreditCard,
  savings: PiggyBank,
  investment: LineChart,
}

function iconForAccount(iconKey: string) {
  return accountIcons[iconKey] ?? Wallet2
}

const accounts = computed<AccountBalance[]>(() =>
  financeStore.accounts.map((account) => ({
    id: account.id,
    label: account.label,
    icon: iconForAccount(account.iconKey),
    amount: account.amount,
  })),
)

function accountLabel(accountId?: string): string {
  if (!accountId) return '-'
  return financeStore.accounts.find((a) => a.id === accountId)?.label ?? '-'
}

const totalBalance = computed<number>(() => financeStore.totalBalance)

/* ------------------------------------------------------------------ */
/* Budget (dari store, dibandingkan dengan pengeluaran nyata bulan ini)*/
/* ------------------------------------------------------------------ */
const budgets = computed(() => financeStore.budgets)

function spentForCategory(category: string): number {
  const match = financeStore.expenseByCategory.find(
    (c) => c.category.toLowerCase() === category.toLowerCase(),
  )
  return match?.amount ?? 0
}

function budgetPercentage(budget: { category: string; limit: number }): number {
  if (budget.limit <= 0) return 0
  return Math.min(100, Math.round((spentForCategory(budget.category) / budget.limit) * 100))
}

const totalBudgetLimit = computed(() => budgets.value.reduce((s, b) => s + b.limit, 0))
const totalBudgetSpent = computed(() =>
  budgets.value.reduce((s, b) => s + spentForCategory(b.category), 0),
)
const remainingBudget = computed(() => totalBudgetLimit.value - totalBudgetSpent.value)

const showBudgetForm = ref(false)
const newBudgetCategory = ref('')
const newBudgetLimit = ref<number | null>(null)

async function addBudget(): Promise<void> {
  const category = newBudgetCategory.value.trim()
  if (!category || !newBudgetLimit.value || newBudgetLimit.value <= 0) return

  await financeStore.createBudget({
    category,
    limit: newBudgetLimit.value,
  })

  newBudgetCategory.value = ''
  newBudgetLimit.value = null
  showBudgetForm.value = false
}

/* ------------------------------------------------------------------ */
/* Savings goals (dari store) — tambah / edit / hapus                  */
/* ------------------------------------------------------------------ */
const goals = computed(() => financeStore.goals)

function goalPercentage(goal: { target: number; current: number }): number {
  if (goal.target <= 0) return 0
  return Math.min(100, Math.round((goal.current / goal.target) * 100))
}

const showGoalForm = ref(false)
const editingGoalId = ref<string | null>(null)
const newGoalName = ref('')
const newGoalTarget = ref<number | null>(null)
const newGoalCurrent = ref<number | null>(null)

function openGoalForm(goal?: { id: string; name: string; target: number; current: number }): void {
  if (goal) {
    editingGoalId.value = goal.id
    newGoalName.value = goal.name
    newGoalTarget.value = goal.target
    newGoalCurrent.value = goal.current
  } else {
    editingGoalId.value = null
    newGoalName.value = ''
    newGoalTarget.value = null
    newGoalCurrent.value = null
  }
  showGoalForm.value = true
}

async function saveGoal(): Promise<void> {
  const name = newGoalName.value.trim()
  if (!name || !newGoalTarget.value || newGoalTarget.value <= 0) return

  if (editingGoalId.value) {
    await financeStore.updateGoal(editingGoalId.value, {
      name,
      target: newGoalTarget.value,
      current: newGoalCurrent.value ?? undefined,
    })
  } else {
    await financeStore.createGoal({
      name,
      target: newGoalTarget.value,
    })
  }

  cancelGoalForm()
}

function cancelGoalForm(): void {
  showGoalForm.value = false
  editingGoalId.value = null
  newGoalName.value = ''
  newGoalTarget.value = null
  newGoalCurrent.value = null
}

async function removeGoal(id: string): Promise<void> {
  await financeStore.deleteGoal(id)
}

/* ------------------------------------------------------------------ */
/* Upcoming bills (dari store) — tambah / edit / hapus                 */
/* ------------------------------------------------------------------ */
const bills = computed(() => financeStore.bills)

const showBillForm = ref(false)
const editingBillId = ref<string | null>(null)
const newBillName = ref('')
const newBillAmount = ref<number | null>(null)
const newBillDueDate = ref(dayjs().format('YYYY-MM-DD'))

function openBillForm(bill?: { id: string; name: string; amount: number; dueDate: string }): void {
  if (bill) {
    editingBillId.value = bill.id
    newBillName.value = bill.name
    newBillAmount.value = bill.amount
    newBillDueDate.value = bill.dueDate
  } else {
    editingBillId.value = null
    newBillName.value = ''
    newBillAmount.value = null
    newBillDueDate.value = dayjs().format('YYYY-MM-DD')
  }
  showBillForm.value = true
}

async function saveBill(): Promise<void> {
  const name = newBillName.value.trim()
  if (!name || !newBillAmount.value || newBillAmount.value <= 0 || !newBillDueDate.value) return

  if (editingBillId.value) {
    await financeStore.updateBill(editingBillId.value, {
      name,
      amount: newBillAmount.value,
      dueDate: newBillDueDate.value,
    })
  } else {
    await financeStore.createBill({
      name,
      amount: newBillAmount.value,
      dueDate: newBillDueDate.value,
    })
  }

  cancelBillForm()
}

function cancelBillForm(): void {
  showBillForm.value = false
  editingBillId.value = null
  newBillName.value = ''
  newBillAmount.value = null
  newBillDueDate.value = dayjs().format('YYYY-MM-DD')
}

async function removeBill(id: string): Promise<void> {
  await financeStore.deleteBill(id)
}

/* ------------------------------------------------------------------ */
/* Wishlist (dari store) — tambah / edit / hapus                       */
/* ------------------------------------------------------------------ */
const wishlist = computed(() => financeStore.wishlist)

const showWishlistForm = ref(false)
const editingWishlistId = ref<string | null>(null)
const newWishlistName = ref('')
const newWishlistPrice = ref<number | null>(null)

function openWishlistForm(item?: { id: string; name: string; price?: number }): void {
  if (item) {
    editingWishlistId.value = item.id
    newWishlistName.value = item.name
    newWishlistPrice.value = item.price ?? null
  } else {
    editingWishlistId.value = null
    newWishlistName.value = ''
    newWishlistPrice.value = null
  }
  showWishlistForm.value = true
}

async function saveWishlistItem(): Promise<void> {
  const name = newWishlistName.value.trim()
  if (!name) return

  if (editingWishlistId.value) {
    await financeStore.updateWishlistItem(editingWishlistId.value, {
      name,
      price: newWishlistPrice.value ?? undefined,
    })
  } else {
    await financeStore.createWishlistItem({
      name,
      price: newWishlistPrice.value ?? undefined,
    })
  }

  cancelWishlistForm()
}

function cancelWishlistForm(): void {
  showWishlistForm.value = false
  editingWishlistId.value = null
  newWishlistName.value = ''
  newWishlistPrice.value = null
}

async function removeWishlistItem(id: string): Promise<void> {
  await financeStore.deleteWishlistItem(id)
}

/* ------------------------------------------------------------------ */
/* Assets summary (dari store) — bisa tambah/edit/hapus                */
/* ------------------------------------------------------------------ */
const assets = computed(() => financeStore.assets)
const totalAssetValue = computed(() => financeStore.totalAssetValue)

const showAssetForm = ref(false)
const editingAssetId = ref<string | null>(null)
const newAssetName = ref('')
const newAssetValue = ref<number | null>(null)

function openAssetForm(asset?: { id: string; name: string; value?: number }): void {
  if (asset) {
    editingAssetId.value = asset.id
    newAssetName.value = asset.name
    newAssetValue.value = asset.value ?? null
  } else {
    editingAssetId.value = null
    newAssetName.value = ''
    newAssetValue.value = null
  }
  showAssetForm.value = true
}

async function saveAsset(): Promise<void> {
  const name = newAssetName.value.trim()
  if (!name) return

  if (editingAssetId.value) {
    await financeStore.updateAsset(editingAssetId.value, {
      name,
      value: newAssetValue.value ?? undefined,
    })
  } else {
    await financeStore.createAsset({
      name,
      value: newAssetValue.value ?? undefined,
    })
  }

  showAssetForm.value = false
  editingAssetId.value = null
  newAssetName.value = ''
  newAssetValue.value = null
}

function cancelAssetForm(): void {
  showAssetForm.value = false
  editingAssetId.value = null
  newAssetName.value = ''
  newAssetValue.value = null
}

async function removeAsset(id: string): Promise<void> {
  await financeStore.deleteAsset(id)
}

/* ------------------------------------------------------------------ */
/* Financial Health Score (dihitung dari data transaksi asli)          */
/* ------------------------------------------------------------------ */
const financialHealthScore = computed<number>(() => {
  const income = financeStore.currentMonthIncome
  const expense = financeStore.currentMonthExpense

  const savingRate = income > 0 ? Math.max(0, (income - expense) / income) : 0
  const savingScore = Math.min(100, savingRate * 150)

  const spendingRatio = income > 0 ? expense / income : expense > 0 ? 1.5 : 0
  const spendingScore = Math.max(0, 100 - spendingRatio * 70)

  const budgetScore =
    budgets.value.length > 0
      ? 100 -
        budgets.value.reduce((sum, b) => sum + budgetPercentage(b), 0) / budgets.value.length
      : 70

  const cashFlowScore = financeStore.currentMonthCashFlow >= 0 ? 100 : 30

  const score =
    savingScore * 0.3 + spendingScore * 0.3 + budgetScore * 0.2 + cashFlowScore * 0.2

  return Math.round(Math.max(0, Math.min(100, score)))
})

const healthIndicators = computed(() => [
  { label: 'Saving', value: Math.round(Math.min(100, (financeStore.currentMonthCashFlow > 0 ? 80 : 40))) },
  {
    label: 'Spending',
    value:
      financeStore.currentMonthIncome > 0
        ? Math.round(
            100 -
              Math.min(100, (financeStore.currentMonthExpense / financeStore.currentMonthIncome) * 100),
          )
        : 0,
  },
  {
    label: 'Budget',
    value:
      budgets.value.length > 0
        ? Math.round(
            100 - budgets.value.reduce((sum, b) => sum + budgetPercentage(b), 0) / budgets.value.length,
          )
        : 70,
  },
  { label: 'Cash Flow', value: financeStore.currentMonthCashFlow >= 0 ? 100 : 20 },
])

/* ------------------------------------------------------------------ */
/* Grafik sederhana (CSS bar, tanpa library tambahan)                  */
/* ------------------------------------------------------------------ */
const maxTrendValue = computed(() =>
  Math.max(
    1,
    ...financeStore.monthlyTrend.map((m) => Math.max(m.income, m.expense)),
  ),
)

const maxCashFlowAbs = computed(() =>
  Math.max(1, ...financeStore.monthlyTrend.map((m) => Math.abs(m.income - m.expense))),
)

const incomeVsExpensePercentage = computed(() => {
  const income = financeStore.currentMonthIncome
  const expense = financeStore.currentMonthExpense
  const total = income + expense || 1
  return {
    income: Math.round((income / total) * 100),
    expense: Math.round((expense / total) * 100),
  }
})

/* ------------------------------------------------------------------ */
/* Transfer antar akun (persist ke finance.json lewat store)            */
/* ------------------------------------------------------------------ */
const showTransferForm = ref(false)
const transferFrom = ref('cash')
const transferTo = ref('bank')
const transferAmount = ref<number | null>(null)

async function handleTransfer(): Promise<void> {
  if (!transferAmount.value || transferAmount.value <= 0 || transferFrom.value === transferTo.value)
    return

  const from = financeStore.accounts.find((a) => a.id === transferFrom.value)
  const to = financeStore.accounts.find((a) => a.id === transferTo.value)
  if (!from || !to || from.amount < transferAmount.value) return

  await financeStore.updateAccount(from.id, { amount: from.amount - transferAmount.value })
  await financeStore.updateAccount(to.id, { amount: to.amount + transferAmount.value })

  transferAmount.value = null
  showTransferForm.value = false
}

/* ------------------------------------------------------------------ */
/* Reset semua data finance                                            */
/* ------------------------------------------------------------------ */
async function handleResetFinanceData(): Promise<void> {
  const confirmed = confirm(
    'Yakin mau hapus semua data finance (transaksi, budget, goal, tagihan, wishlist, aset) dan reset saldo semua akun ke 0? Aksi ini tidak bisa dibatalkan.',
  )
  if (!confirmed) return
  await financeStore.resetFinanceData()
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================= DASHBOARD CARDS ================= -->
    <div>
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Total Balance" :value="formatCurrency(totalBalance)" :icon="Wallet" />
        <SummaryCard label="Cash" :value="formatCurrency(accounts[0].amount)" :icon="Wallet" />
        <SummaryCard label="Bank" :value="formatCurrency(accounts[1].amount)" :icon="Landmark" />
        <SummaryCard label="E-Wallet" :value="formatCurrency(accounts[2].amount)" :icon="CreditCard" />
        <SummaryCard label="Savings" :value="formatCurrency(accounts[3].amount)" :icon="PiggyBank" />
        <SummaryCard label="Investments" :value="formatCurrency(accounts[4].amount)" :icon="LineChart" />
        <SummaryCard
          label="Monthly Income"
          :value="formatCurrency(financeStore.currentMonthIncome)"
          :icon="TrendingUp"
        />
        <SummaryCard
          label="Monthly Expense"
          :value="formatCurrency(financeStore.currentMonthExpense)"
          :icon="TrendingDown"
        />
        <SummaryCard
          label="Cash Flow"
          :value="formatCurrency(financeStore.currentMonthCashFlow)"
          :icon="ArrowLeftRight"
        />
        <SummaryCard label="Remaining Budget" :value="formatCurrency(remainingBudget)" :icon="Target" />
      </div>
    </div>

    <!-- ================= QUICK ACTIONS ================= -->
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        @click="openForm('income')"
      >
        <Plus class="h-4 w-4" /> Add Income
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        @click="openForm('expense')"
      >
        <Plus class="h-4 w-4" /> Add Expense
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
        @click="showTransferForm = !showTransferForm"
      >
        <ArrowLeftRight class="h-4 w-4" /> Transfer
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
        @click="openGoalForm()"
      >
        <Target class="h-4 w-4" /> Add Goal
      </button>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent"
        @click="showBudgetForm = !showBudgetForm"
      >
        <ListChecks class="h-4 w-4" /> Create Budget
      </button>
      <button
        type="button"
        class="ml-auto flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
        @click="handleResetFinanceData"
      >
        <Trash2 class="h-4 w-4" /> Reset Semua Data
      </button>
    </div>

    <!-- Form tambah transaksi -->
    <form
      v-if="showForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      @submit.prevent="handleAddTransaction"
    >
      <select
        v-model="newType"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option value="expense">Pengeluaran</option>
        <option value="income">Pemasukan</option>
      </select>
      <select
        v-model="newAccountId"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option v-for="account in accounts" :key="account.id" :value="account.id">
          {{ newType === 'income' ? 'Masuk ke: ' : 'Keluar dari: ' }}{{ account.label }}
        </option>
      </select>
      <input
        v-model.number="newAmount"
        type="number"
        min="0"
        placeholder="Jumlah (Rp)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model="newCategory"
        type="text"
        placeholder="Kategori (mis. Makan, Gaji)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model="newDate"
        type="date"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <textarea
        v-model="newDescription"
        placeholder="Catatan (opsional)"
        class="resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
        rows="2"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-2"
      >
        Simpan Transaksi
      </button>
    </form>

    <!-- Form transfer -->
    <form
      v-if="showTransferForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3"
      @submit.prevent="handleTransfer"
    >
      <select
        v-model="transferFrom"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option v-for="account in accounts" :key="account.id" :value="account.id">
          Dari: {{ account.label }}
        </option>
      </select>
      <select
        v-model="transferTo"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option v-for="account in accounts" :key="account.id" :value="account.id">
          Ke: {{ account.label }}
        </option>
      </select>
      <input
        v-model.number="transferAmount"
        type="number"
        min="0"
        placeholder="Jumlah (Rp)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-3"
      >
        Transfer
      </button>
    </form>

    <!-- Form budget -->
    <form
      v-if="showBudgetForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3"
      @submit.prevent="addBudget"
    >
      <input
        v-model="newBudgetCategory"
        type="text"
        placeholder="Kategori (mis. Makan)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
      />
      <input
        v-model.number="newBudgetLimit"
        type="number"
        min="0"
        placeholder="Batas (Rp)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-3"
      >
        Simpan Budget
      </button>
    </form>

    <!-- ================= EMPTY STATE ================= -->
    <div
      v-if="!financeStore.isLoading && financeStore.transactions.length === 0"
      class="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-surface p-12 text-center"
    >
      <Wallet2 class="h-12 w-12 text-ink-subtle" />
      <div>
        <p class="text-sm font-medium text-ink">Belum ada transaksi</p>
        <p class="text-xs text-ink-muted">
          Mulai catat pemasukan dan pengeluaranmu untuk melihat dashboard secara lengkap.
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        @click="openForm('expense')"
      >
        Tambah Transaksi Pertama
      </button>
    </div>

    <template v-else>
      <!-- ================= GRAFIK ================= -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Income vs Expense -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Income vs Expense (Bulan Ini)</h3>
          <div class="space-y-2">
            <div>
              <div class="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Income</span>
                <span>{{ formatCurrency(financeStore.currentMonthIncome) }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div
                  class="h-2 rounded-full bg-green-500"
                  :style="{ width: incomeVsExpensePercentage.income + '%' }"
                />
              </div>
            </div>
            <div>
              <div class="mb-1 flex justify-between text-xs text-ink-muted">
                <span>Expense</span>
                <span>{{ formatCurrency(financeStore.currentMonthExpense) }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div
                  class="h-2 rounded-full bg-red-500"
                  :style="{ width: incomeVsExpensePercentage.expense + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Expense by Category -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Expense by Category</h3>
          <div v-if="financeStore.expenseByCategory.length === 0" class="text-xs text-ink-muted">
            Belum ada pengeluaran bulan ini.
          </div>
          <div v-else class="space-y-2">
            <div v-for="item in financeStore.expenseByCategory" :key="item.category">
              <div class="mb-1 flex justify-between text-xs text-ink-muted">
                <span>{{ item.category }}</span>
                <span>{{ item.percentage }}% · {{ formatCurrency(item.amount) }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div class="h-2 rounded-full bg-accent" :style="{ width: item.percentage + '%' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Monthly Trend -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Monthly Trend (6 Bulan)</h3>
          <div class="flex h-32 items-end gap-3">
            <div
              v-for="month in financeStore.monthlyTrend"
              :key="month.month"
              class="flex flex-1 flex-col items-center gap-1"
            >
              <div class="flex h-24 w-full items-end justify-center gap-0.5">
                <div
                  class="w-2 rounded-t bg-green-500/70"
                  :style="{ height: (month.income / maxTrendValue) * 100 + '%' }"
                  :title="'Income: ' + formatCurrency(month.income)"
                />
                <div
                  class="w-2 rounded-t bg-red-500/70"
                  :style="{ height: (month.expense / maxTrendValue) * 100 + '%' }"
                  :title="'Expense: ' + formatCurrency(month.expense)"
                />
              </div>
              <span class="text-[10px] text-ink-subtle">{{ month.label }}</span>
            </div>
          </div>
        </div>

        <!-- Cash Flow -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Cash Flow (6 Bulan)</h3>
          <div class="flex h-32 items-center gap-3">
            <div
              v-for="month in financeStore.monthlyTrend"
              :key="month.month"
              class="flex flex-1 flex-col items-center gap-1"
            >
              <div class="relative flex h-24 w-full items-center justify-center">
                <div
                  class="w-3 rounded"
                  :class="month.income - month.expense >= 0 ? 'bg-green-500' : 'bg-red-500'"
                  :style="{
                    height: (Math.abs(month.income - month.expense) / maxCashFlowAbs) * 100 + '%',
                  }"
                />
              </div>
              <span class="text-[10px] text-ink-subtle">{{ month.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= FINANCIAL HEALTH + ANALYTICS ================= -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center gap-2">
            <HeartPulse class="h-4 w-4 text-accent" />
            <h3 class="text-sm font-semibold text-ink">Financial Health Score</h3>
          </div>
          <p class="mb-3 text-3xl font-bold text-ink">{{ financialHealthScore }}<span class="text-base text-ink-muted">/100</span></p>
          <div class="space-y-2">
            <div v-for="indicator in healthIndicators" :key="indicator.label">
              <div class="mb-1 flex justify-between text-xs text-ink-muted">
                <span>{{ indicator.label }}</span>
                <span>{{ indicator.value }}%</span>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div
                  class="h-2 rounded-full bg-accent"
                  :style="{ width: Math.max(0, Math.min(100, indicator.value)) + '%' }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center gap-2">
            <Sparkles class="h-4 w-4 text-accent" />
            <h3 class="text-sm font-semibold text-ink">Analytics</h3>
          </div>
          <ul class="space-y-2 text-sm text-ink-muted">
            <li>
              Pengeluaran terbesar bulan ini:
              <span class="font-medium text-ink">
                {{ financeStore.topExpenseCategory?.category ?? '-' }}
                <template v-if="financeStore.topExpenseCategory">
                  ({{ formatCurrency(financeStore.topExpenseCategory.amount) }})
                </template>
              </span>
            </li>
            <li>
              Kategori paling boros:
              <span class="font-medium text-ink">{{ financeStore.topExpenseCategory?.category ?? '-' }}</span>
            </li>
            <li>
              Hari paling banyak belanja:
              <span class="font-medium text-ink">{{ financeStore.busiestSpendingDay ?? '-' }}</span>
            </li>
            <li>
              Total tabungan bulan ini:
              <span class="font-medium text-ink">{{ formatCurrency(financeStore.currentMonthCashFlow) }}</span>
            </li>
            <li>
              Total investasi:
              <span class="font-medium text-ink">{{ formatCurrency(accounts[4].amount) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- ================= BUDGET PROGRESS ================= -->
      <div class="rounded-xl border border-border bg-surface p-4">
        <h3 class="mb-3 text-sm font-semibold text-ink">Budget Progress</h3>
        <div class="space-y-3">
          <div v-for="budget in budgets" :key="budget.id">
            <div class="mb-1 flex justify-between text-xs text-ink-muted">
              <span>{{ budget.category }}</span>
              <span>
                {{ formatCurrency(spentForCategory(budget.category)) }} /
                {{ formatCurrency(budget.limit) }} ({{ budgetPercentage(budget) }}%)
              </span>
            </div>
            <div class="h-2 w-full rounded-full bg-border">
              <div
                class="h-2 rounded-full"
                :class="budgetPercentage(budget) >= 90 ? 'bg-red-500' : 'bg-accent'"
                :style="{ width: budgetPercentage(budget) + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ================= SAVINGS GOALS + UPCOMING BILLS ================= -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Savings Goals — bisa tambah/edit/hapus -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-ink">Savings Goals</h3>
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              @click="openGoalForm()"
            >
              <Plus class="h-3.5 w-3.5" /> Tambah
            </button>
          </div>

          <form
            v-if="showGoalForm"
            class="mb-3 grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3"
            @submit.prevent="saveGoal"
          >
            <input
              v-model="newGoalName"
              type="text"
              placeholder="Nama target (mis. Laptop Baru)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-3"
            />
            <input
              v-model.number="newGoalTarget"
              type="number"
              min="0"
              placeholder="Target (Rp)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              v-model.number="newGoalCurrent"
              type="number"
              min="0"
              placeholder="Terkumpul (Rp)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
            />
            <div class="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {{ editingGoalId ? 'Simpan Perubahan' : 'Tambah Goal' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted hover:border-accent"
                @click="cancelGoalForm"
              >
                Batal
              </button>
            </div>
          </form>

          <div v-if="goals.length === 0" class="text-xs text-ink-muted">Belum ada target tabungan.</div>
          <div v-else class="space-y-3">
            <div v-for="goal in goals" :key="goal.id" class="group">
              <div class="mb-1 flex items-center justify-between text-xs text-ink-muted">
                <span>{{ goal.name }}</span>
                <div class="flex items-center gap-2">
                  <span>{{ formatCurrency(goal.current) }} / {{ formatCurrency(goal.target) }}</span>
                  <button
                    type="button"
                    class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-accent"
                    @click="openGoalForm(goal)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                    @click="removeGoal(goal.id)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div class="h-2 rounded-full bg-accent" :style="{ width: goalPercentage(goal) + '%' }" />
              </div>
              <p class="mt-1 text-[11px] text-ink-subtle">{{ goalPercentage(goal) }}%</p>
            </div>
          </div>
        </div>

        <!-- Upcoming Bills — bisa tambah/edit/hapus -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-ink">Upcoming Bills</h3>
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              @click="openBillForm()"
            >
              <Plus class="h-3.5 w-3.5" /> Tambah
            </button>
          </div>

          <form
            v-if="showBillForm"
            class="mb-3 grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3"
            @submit.prevent="saveBill"
          >
            <input
              v-model="newBillName"
              type="text"
              placeholder="Nama tagihan (mis. Listrik)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-3"
            />
            <input
              v-model.number="newBillAmount"
              type="number"
              min="0"
              placeholder="Jumlah (Rp)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              v-model="newBillDueDate"
              type="date"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
            />
            <div class="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {{ editingBillId ? 'Simpan Perubahan' : 'Tambah Tagihan' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted hover:border-accent"
                @click="cancelBillForm"
              >
                Batal
              </button>
            </div>
          </form>

          <ul class="space-y-2">
            <li
              v-for="bill in bills"
              :key="bill.id"
              class="group flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <div class="flex items-center gap-2">
                <Receipt class="h-4 w-4 text-ink-subtle" />
                <div>
                  <p class="text-sm text-ink">{{ bill.name }}</p>
                  <p class="text-xs text-ink-muted">Jatuh tempo {{ dayjs(bill.dueDate).format('D MMM') }}</p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium text-ink">{{ formatCurrency(bill.amount) }}</span>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-accent"
                  @click="openBillForm(bill)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                  @click="removeBill(bill.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- ================= WISHLIST + ASSETS ================= -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- Wishlist — bisa tambah/edit/hapus -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-ink">Wishlist</h3>
            <button
              type="button"
              class="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
              @click="openWishlistForm()"
            >
              <Plus class="h-3.5 w-3.5" /> Tambah
            </button>
          </div>

          <form
            v-if="showWishlistForm"
            class="mb-3 grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3"
            @submit.prevent="saveWishlistItem"
          >
            <input
              v-model="newWishlistName"
              type="text"
              placeholder="Nama barang (mis. Headphone)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
            />
            <input
              v-model.number="newWishlistPrice"
              type="number"
              min="0"
              placeholder="Harga (Rp)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <div class="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {{ editingWishlistId ? 'Simpan Perubahan' : 'Tambah Barang' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted hover:border-accent"
                @click="cancelWishlistForm"
              >
                Batal
              </button>
            </div>
          </form>

          <ul class="space-y-2">
            <li
              v-for="item in wishlist"
              :key="item.id"
              class="group flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span class="text-sm text-ink">{{ item.name }}</span>
              <div class="flex items-center gap-2">
                <span v-if="item.price" class="text-xs text-ink-muted">{{ formatCurrency(item.price) }}</span>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-accent"
                  @click="openWishlistForm(item)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                  @click="removeWishlistItem(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <!-- Assets Summary — sekarang bisa tambah / edit / hapus -->
        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <Boxes class="h-4 w-4 text-accent" /> Assets Summary
            </h3>
            <div class="flex items-center gap-3">
              <span class="text-xs text-ink-muted">Total: {{ formatCurrency(totalAssetValue) }}</span>
              <button
                type="button"
                class="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                @click="openAssetForm()"
              >
                <Plus class="h-3.5 w-3.5" /> Tambah
              </button>
            </div>
          </div>

          <form
            v-if="showAssetForm"
            class="mb-3 grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-3"
            @submit.prevent="saveAsset"
          >
            <input
              v-model="newAssetName"
              type="text"
              placeholder="Nama aset (mis. Laptop)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
            />
            <input
              v-model.number="newAssetValue"
              type="number"
              min="0"
              placeholder="Nilai (Rp)"
              class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <div class="flex gap-2 sm:col-span-3">
              <button
                type="submit"
                class="flex-1 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
              >
                {{ editingAssetId ? 'Simpan Perubahan' : 'Tambah Aset' }}
              </button>
              <button
                type="button"
                class="rounded-lg border border-border px-4 py-2 text-sm text-ink-muted hover:border-accent"
                @click="cancelAssetForm"
              >
                Batal
              </button>
            </div>
          </form>

          <div v-if="assets.length === 0" class="text-xs text-ink-muted">Belum ada aset tercatat.</div>
          <ul v-else class="space-y-2">
            <li
              v-for="asset in assets"
              :key="asset.id"
              class="group flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span class="text-sm text-ink">{{ asset.name }}</span>
              <div class="flex items-center gap-2">
                <span v-if="asset.value" class="text-xs text-ink-muted">{{ formatCurrency(asset.value) }}</span>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-accent"
                  @click="openAssetForm(asset)"
                >
                  <Pencil class="h-4 w-4" />
                </button>
                <button
                  type="button"
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                  @click="removeAsset(asset.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <!-- ================= RECENT TRANSACTIONS ================= -->
      <div>
        <h3 class="mb-3 text-sm font-semibold text-ink">Recent Transactions</h3>
        <div v-if="financeStore.isLoading" class="text-sm text-ink-muted">Memuat transaksi...</div>
        <ul v-else class="space-y-2">
          <li
            v-for="transaction in financeStore.sortedTransactions"
            :key="transaction.id"
            class="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
              :class="
                transaction.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              "
            >
              <component :is="iconForCategory(transaction.category)" class="h-4 w-4" />
            </span>

            <div class="flex-1">
              <p class="text-sm text-ink">{{ transaction.category }}</p>
              <p class="text-xs text-ink-muted">
                {{ accountLabel(transaction.accountId) }} · {{ dayjs(transaction.date).format('D MMM YYYY') }}
                <span v-if="transaction.description"> · {{ transaction.description }}</span>
              </p>
            </div>

            <span
              class="shrink-0 text-sm font-medium"
              :class="transaction.type === 'income' ? 'text-green-500' : 'text-red-500'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
            </span>

            <button
              type="button"
              class="shrink-0 text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
              @click="financeStore.deleteTransaction(transaction.id)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>