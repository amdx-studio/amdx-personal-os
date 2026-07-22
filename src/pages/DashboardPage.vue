<script setup lang="ts">
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import { CheckSquare, Wallet, StickyNote, Target } from 'lucide-vue-next'
import SummaryCard from '../components/SummaryCard.vue'
import { useTasksStore } from '../stores/useTasksStore'
import { useFinanceStore } from '../stores/useFinanceStore'
import { useNotesStore } from '../stores/useNotesStore'
import { useGoalsStore } from '../stores/useGoalsStore'

dayjs.extend(relativeTime)
dayjs.locale('id')

const tasksStore = useTasksStore()
const financeStore = useFinanceStore()
const notesStore = useNotesStore()
const goalsStore = useGoalsStore()

onMounted(() => {
  tasksStore.loadTasks()
  financeStore.loadTransactions()
  notesStore.loadNotes()
  goalsStore.loadGoals()
})

const greeting = computed(() => {
  const hour = dayjs().hour()
  if (hour < 10) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
})

const todayFormatted = computed(() => dayjs().format('dddd, D MMMM YYYY'))

const pendingTasksLabel = computed(() => {
  const total = tasksStore.tasks.length
const pending = tasksStore.tasks.filter((task) => !task.completedAt).length
  return total === 0 ? '—' : `${pending} belum selesai`
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

const balanceLabel = computed(() => formatCurrency(financeStore.balance))
const notesCountLabel = computed(() => `${notesStore.notes.length} catatan`)

interface ActivityItem {
  id: string
  icon: typeof CheckSquare
  label: string
  createdAt: string
}

const activityFeed = computed<ActivityItem[]>(() => {
  const items: ActivityItem[] = [
    ...tasksStore.tasks.map((task: { id: string; title: string; createdAt: string }) => ({
      id: `task-${task.id}`,
      icon: CheckSquare,
      label: `Task ditambahkan: ${task.title}`,
      createdAt: task.createdAt,
    })),
    ...notesStore.notes.map((note) => ({
      id: `note-${note.id}`,
      icon: StickyNote,
      label: `Catatan diperbarui: ${note.title || 'Tanpa judul'}`,
      createdAt: note.updatedAt,
    })),
    ...financeStore.transactions.map((transaction) => ({
      id: `transaction-${transaction.id}`,
      icon: Wallet,
      label:
        transaction.type === 'income'
          ? `Pemasukan: ${transaction.category} (${formatCurrency(transaction.amount)})`
          : `Pengeluaran: ${transaction.category} (${formatCurrency(transaction.amount)})`,
      createdAt: transaction.createdAt,
    })),
    ...goalsStore.goals.map((goal) => ({
      id: `goal-${goal.id}`,
      icon: Target,
      label: `Goal dibuat: ${goal.title}`,
      createdAt: goal.createdAt,
    })),
  ]

  return items
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-ink">{{ greeting }} 👋</h2>
      <p class="text-sm text-ink-muted">{{ todayFormatted }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <SummaryCard label="Tasks" :value="pendingTasksLabel" :icon="CheckSquare" />
      <SummaryCard label="Saldo" :value="balanceLabel" :icon="Wallet" />
      <SummaryCard label="Catatan" :value="notesCountLabel" :icon="StickyNote" />
    </div>

    <div class="rounded-xl border border-border bg-surface p-5">
      <h3 class="mb-3 text-sm font-medium text-ink">Aktivitas Terbaru</h3>

      <p v-if="activityFeed.length === 0" class="text-sm text-ink-muted">
        Belum ada aktivitas. Mulai tambahkan task, atau catatan!
      </p>

      <ul v-else class="space-y-3">
        <li v-for="item in activityFeed" :key="item.id" class="flex items-start gap-3">
          <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent-bg-soft text-accent">
            <component :is="item.icon" class="h-3.5 w-3.5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm text-ink">{{ item.label }}</p>
            <p class="text-xs text-ink-subtle">{{ dayjs(item.createdAt).fromNow() }}</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>