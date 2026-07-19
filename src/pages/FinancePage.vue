<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from 'lucide-vue-next'
import { useFinanceStore } from '../stores/useFinanceStore'
import SummaryCard from '../components/SummaryCard.vue'
import type { TransactionType } from '../types/transaction'
import dayjs from 'dayjs'

const financeStore = useFinanceStore()

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
</script>

<template>
  <div class="space-y-4">
    <!-- Summary cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Pemasukan"
        :value="formatCurrency(financeStore.totalIncome)"
        :icon="TrendingUp"
      />
      <SummaryCard
        label="Pengeluaran"
        :value="formatCurrency(financeStore.totalExpense)"
        :icon="TrendingDown"
      />
      <SummaryCard label="Saldo" :value="formatCurrency(financeStore.balance)" :icon="Wallet" />
    </div>

    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      @click="showForm = !showForm"
    >
      <Plus class="h-4 w-4" />
      Tambah Transaksi
    </button>

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

    <div v-if="financeStore.isLoading" class="text-sm text-ink-muted">
      Memuat transaksi...
    </div>

    <div
      v-else-if="financeStore.transactions.length === 0"
      class="rounded-xl border border-border bg-surface p-8 text-center text-sm text-ink-muted"
    >
      Belum ada transaksi. Tambahkan yang pertama!
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="transaction in financeStore.sortedTransactions"
        :key="transaction.id"
        class="group flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
      >
        <span
          class="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
          :class="
            transaction.type === 'income'
              ? 'bg-green-500/10 text-green-500'
              : 'bg-red-500/10 text-red-500'
          "
        >
          {{ transaction.type === 'income' ? 'Masuk' : 'Keluar' }}
        </span>

        <div class="flex-1">
          <p class="text-sm text-ink">{{ transaction.category }}</p>
          <p class="text-xs text-ink-muted">
            {{ dayjs(transaction.date).format('D MMM YYYY') }}
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