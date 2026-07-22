<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import {
  Plus,
  Trash2,
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
/* Form tambah transaksi (data asli, tersimpan lewat store yang ada)   */
/* ------------------------------------------------------------------ */
const showForm = ref(false)
const newType = ref<TransactionType>('expense')
const newAmount = ref<number | null>(null)
const newCategory = ref('')
const newDate = ref(dayjs().format('YYYY-MM-DD'))
const newDescription = ref('')

onMounted(() => {
  financeStore.loadTransactions()
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
  showForm.value = true
}

async function handleAddTransaction(): Promise<void> {
  const category = newCategory.value.trim()
  if (!category || newAmount.value === null || newAmount.value <= 0) return

  await financeStore.createTransaction({
    type: newType.value,
    amount: newAmount.value,
    category,
    date: newDate.value,
    description: newDescription.value.trim() || undefined,
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
/* NOTE: Bagian di bawah ini (accounts, budgets, goals, bills,          */
/* wishlist, assets) BELUM punya backend/model data.                   */
/* Sesuai instruksi (tidak boleh membuat backend/database/API),        */
/* data-data ini disimpan sebagai state lokal (session-only) dan       */
/* TIDAK ikut tersimpan ke finance.json. Ditandai "Manual" di UI.       */
/* ------------------------------------------------------------------ */

// --- Akun (manual, belum tersinkron dari transaksi) ---
interface AccountBalance {
  id: string
  label: string
  icon: any
  amount: number
}

const accounts = ref<AccountBalance[]>([
  { id: 'cash', label: 'Cash', icon: Wallet, amount: 850_000 },
  { id: 'bank', label: 'Bank', icon: Landmark, amount: 4_200_000 },
  { id: 'ewallet', label: 'E-Wallet', icon: CreditCard, amount: 350_000 },
  { id: 'savings', label: 'Savings', icon: PiggyBank, amount: 6_000_000 },
  { id: 'investment', label: 'Investments', icon: LineChart, amount: 3_000_000 },
])

const totalBalance = computed<number>(() =>
  accounts.value.reduce((sum, account) => sum + account.amount, 0),
)

// --- Budget (manual, dibandingkan dengan pengeluaran nyata bulan ini) ---
interface BudgetItem {
  id: string
  category: string
  limit: number
}

const budgets = ref<BudgetItem[]>([
  { id: 'b1', category: 'Makan', limit: 1_500_000 },
  { id: 'b2', category: 'Transport', limit: 500_000 },
  { id: 'b3', category: 'Internet', limit: 300_000 },
])

function spentForCategory(category: string): number {
  const match = financeStore.expenseByCategory.find(
    (c) => c.category.toLowerCase() === category.toLowerCase(),
  )
  return match?.amount ?? 0
}

function budgetPercentage(budget: BudgetItem): number {
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

function addBudget(): void {
  const category = newBudgetCategory.value.trim()
  if (!category || !newBudgetLimit.value || newBudgetLimit.value <= 0) return
  budgets.value.push({
    id: crypto.randomUUID(),
    category,
    limit: newBudgetLimit.value,
  })
  newBudgetCategory.value = ''
  newBudgetLimit.value = null
  showBudgetForm.value = false
}

// --- Savings goals (manual) ---
interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
}

const goals = ref<SavingsGoal[]>([
  { id: 'g1', name: 'Laptop Baru', target: 15_000_000, current: 7_500_000 },
])

function goalPercentage(goal: SavingsGoal): number {
  if (goal.target <= 0) return 0
  return Math.min(100, Math.round((goal.current / goal.target) * 100))
}

const showGoalForm = ref(false)
const newGoalName = ref('')
const newGoalTarget = ref<number | null>(null)

function addGoal(): void {
  const name = newGoalName.value.trim()
  if (!name || !newGoalTarget.value || newGoalTarget.value <= 0) return
  goals.value.push({
    id: crypto.randomUUID(),
    name,
    target: newGoalTarget.value,
    current: 0,
  })
  newGoalName.value = ''
  newGoalTarget.value = null
  showGoalForm.value = false
}

// --- Upcoming bills (manual) ---
interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
}

const bills = ref<Bill[]>([
  { id: 'bl1', name: 'Internet', amount: 350_000, dueDate: dayjs().add(3, 'day').format('YYYY-MM-DD') },
  { id: 'bl2', name: 'Listrik', amount: 250_000, dueDate: dayjs().add(5, 'day').format('YYYY-MM-DD') },
  { id: 'bl3', name: 'Domain', amount: 180_000, dueDate: dayjs().add(9, 'day').format('YYYY-MM-DD') },
  { id: 'bl4', name: 'Hosting', amount: 220_000, dueDate: dayjs().add(12, 'day').format('YYYY-MM-DD') },
  { id: 'bl5', name: 'Spotify', amount: 59_000, dueDate: dayjs().add(15, 'day').format('YYYY-MM-DD') },
  { id: 'bl6', name: 'Netflix', amount: 120_000, dueDate: dayjs().add(20, 'day').format('YYYY-MM-DD') },
])

function removeBill(id: string): void {
  bills.value = bills.value.filter((bill) => bill.id !== id)
}

// --- Wishlist (manual) ---
interface WishlistItem {
  id: string
  name: string
  price?: number
}

const wishlist = ref<WishlistItem[]>([
  { id: 'w1', name: 'Monitor', price: 3_500_000 },
  { id: 'w2', name: 'Mechanical Keyboard', price: 1_200_000 },
  { id: 'w3', name: 'iPad', price: 9_000_000 },
  { id: 'w4', name: 'Camera', price: 12_000_000 },
])

function removeWishlistItem(id: string): void {
  wishlist.value = wishlist.value.filter((item) => item.id !== id)
}

// --- Assets summary (manual) ---
interface Asset {
  id: string
  name: string
  value?: number
}

const assets = ref<Asset[]>([
  { id: 'a1', name: 'Laptop', value: 15_000_000 },
  { id: 'a2', name: 'Motor', value: 12_000_000 },
  { id: 'a3', name: 'HP', value: 6_000_000 },
  { id: 'a4', name: 'Monitor', value: 3_500_000 },
])

const totalAssetValue = computed(() =>
  assets.value.reduce((sum, asset) => sum + (asset.value ?? 0), 0),
)

/* ------------------------------------------------------------------ */
/* Financial Health Score (dihitung dari data transaksi asli)          */
/* ------------------------------------------------------------------ */
const financialHealthScore = computed<number>(() => {
  const income = financeStore.currentMonthIncome
  const expense = financeStore.currentMonthExpense

  // Saving rate: makin besar persentase yang disisakan, makin bagus
  const savingRate = income > 0 ? Math.max(0, (income - expense) / income) : 0
  const savingScore = Math.min(100, savingRate * 150) // saving 33% -> ~50, saving 66%+ -> 100

  // Spending: makin kecil rasio expense/income, makin bagus
  const spendingRatio = income > 0 ? expense / income : expense > 0 ? 1.5 : 0
  const spendingScore = Math.max(0, 100 - spendingRatio * 70)

  // Budget adherence
  const budgetScore =
    budgets.value.length > 0
      ? 100 -
        budgets.value.reduce((sum, b) => sum + budgetPercentage(b), 0) / budgets.value.length
      : 70

  // Cash flow bulan ini
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
/* Transfer antar akun (manual, hanya menggeser saldo lokal)            */
/* ------------------------------------------------------------------ */
const showTransferForm = ref(false)
const transferFrom = ref('cash')
const transferTo = ref('bank')
const transferAmount = ref<number | null>(null)

function handleTransfer(): void {
  if (!transferAmount.value || transferAmount.value <= 0 || transferFrom.value === transferTo.value)
    return

  const from = accounts.value.find((a) => a.id === transferFrom.value)
  const to = accounts.value.find((a) => a.id === transferTo.value)
  if (!from || !to || from.amount < transferAmount.value) return

  from.amount -= transferAmount.value
  to.amount += transferAmount.value

  transferAmount.value = null
  showTransferForm.value = false
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================= DASHBOARD CARDS ================= -->
    <div>
      <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Ringkasan</h2>
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
      <p class="mt-2 text-xs text-ink-subtle">
        * Cash, Bank, E-Wallet, Savings, dan Investments masih berupa data manual (belum tersambung
        otomatis ke transaksi).
      </p>
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
        @click="showGoalForm = !showGoalForm"
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

    <!-- Form goal -->
    <form
      v-if="showGoalForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-3"
      @submit.prevent="addGoal"
    >
      <input
        v-model="newGoalName"
        type="text"
        placeholder="Nama target (mis. Laptop Baru)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
      />
      <input
        v-model.number="newGoalTarget"
        type="number"
        min="0"
        placeholder="Target (Rp)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-3"
      >
        Simpan Goal
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
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Savings Goals</h3>
          <div v-if="goals.length === 0" class="text-xs text-ink-muted">Belum ada target tabungan.</div>
          <div v-else class="space-y-3">
            <div v-for="goal in goals" :key="goal.id">
              <div class="mb-1 flex justify-between text-xs text-ink-muted">
                <span>{{ goal.name }}</span>
                <span>{{ formatCurrency(goal.current) }} / {{ formatCurrency(goal.target) }}</span>
              </div>
              <div class="h-2 w-full rounded-full bg-border">
                <div class="h-2 rounded-full bg-accent" :style="{ width: goalPercentage(goal) + '%' }" />
              </div>
              <p class="mt-1 text-[11px] text-ink-subtle">{{ goalPercentage(goal) }}%</p>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Upcoming Bills</h3>
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
        <div class="rounded-xl border border-border bg-surface p-4">
          <h3 class="mb-3 text-sm font-semibold text-ink">Wishlist</h3>
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
                  class="text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
                  @click="removeWishlistItem(item.id)"
                >
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="rounded-xl border border-border bg-surface p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="flex items-center gap-2 text-sm font-semibold text-ink">
              <Boxes class="h-4 w-4 text-accent" /> Assets Summary
            </h3>
            <span class="text-xs text-ink-muted">Total: {{ formatCurrency(totalAssetValue) }}</span>
          </div>
          <ul class="space-y-2">
            <li
              v-for="asset in assets"
              :key="asset.id"
              class="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <span class="text-sm text-ink">{{ asset.name }}</span>
              <span v-if="asset.value" class="text-xs text-ink-muted">{{ formatCurrency(asset.value) }}</span>
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
                Cash · {{ dayjs(transaction.date).format('D MMM YYYY') }}
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