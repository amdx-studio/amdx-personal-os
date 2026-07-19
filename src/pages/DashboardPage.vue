<script setup lang="ts">
import { computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/id'
import relativeTime from 'dayjs/plugin/relativeTime'
import {
  CheckSquare,
  Repeat,
  Wallet,
  StickyNote,
  CalendarDays,
  Target,
} from 'lucide-vue-next'
import SummaryCard from '../components/SummaryCard.vue'
import { useTasksStore } from '../stores/useTasksStore'
import { useHabitsStore } from '../stores/useHabitsStore'
import { useFinanceStore } from '../stores/useFinanceStore'
import { useNotesStore } from '../stores/useNotesStore'
import { useCalendarStore } from '../stores/useCalendarStore'
import { useGoalsStore } from '../stores/useGoalsStore'

dayjs.extend(relativeTime) // plugin bawaan dayjs, bukan dependency baru
dayjs.locale('id')

const tasksStore = useTasksStore()
const habitsStore = useHabitsStore()
const financeStore = useFinanceStore()
const notesStore = useNotesStore()
const calendarStore = useCalendarStore()
const goalsStore = useGoalsStore()

onMounted(() => {
  tasksStore.loadTasks()
  habitsStore.loadHabits()
  financeStore.loadTransactions()
  notesStore.loadNotes()
  calendarStore.loadEvents()
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

// CATATAN ASUMSI: Task punya field `completed: boolean` dan `createdAt: string`,
// store punya `loadTasks()`. Sesuaikan kalau nama aslinya beda.
const pendingTasksLabel = computed(() => {
  const total = tasksStore.tasks.length
  const pending = tasksStore.tasks.filter((task: { completed: boolean }) => !task.completed).length
  return total === 0 ? '—' : `${pending} belum selesai`
})

const habitsTodayLabel = computed(() => {
  const total = habitsStore.habits.length
  if (total === 0) return '—'
  const doneToday = habitsStore.habits.filter((habit) => habitsStore.isCompletedToday(habit)).length
  return `${doneToday}/${total} hari ini`
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

// ---- Recent Activity: gabungan item terbaru dari semua modul, diurutkan waktu dibuat ----
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
    ...habitsStore.habits.map((habit) => ({
      id: `habit-${habit.id}`,
      icon: Repeat,
      label: `Habit dibuat: ${habit.name}`,
      createdAt: habit.createdAt,
    })),
    ...notesStore.notes.map((note) => ({
      id: `note-${note.id}`,
      icon: StickyNote,
      label: `Catatan diperbarui: ${note.title || 'Tanpa judul'}`,
      createdAt: note.updatedAt,
    })),
    ...calendarStore.events.map((event) => ({
      id: `event-${event.id}`,
      icon: CalendarDays,
      label: `Event ditambahkan: ${event.title}`,
      createdAt: event.createdAt,
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

// ---- Mini chart: persentase habit selesai untuk 7 hari terakhir, murni CSS bar ----
const weeklyHabitChart = computed(() => {
  const totalHabits = habitsStore.habits.length

  return Array.from({ length: 7 }).map((_, index) => {
    const date = dayjs().subtract(6 - index, 'day')
    const dateStr = date.format('YYYY-MM-DD')

    const doneCount =
      totalHabits === 0
        ? 0
        : habitsStore.habits.filter((habit) => habit.completedDates.includes(dateStr)).length

    const percent = totalHabits === 0 ? 0 : Math.round((doneCount / totalHabits) * 100)

    return {
      dayLabel: date.format('dd'),
      percent,
      isToday: date.isSame(dayjs(), 'day'),
    }
  })
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-xl font-semibold text-ink">{{ greeting }} 👋</h2>
      <p class="text-sm text-ink-muted">{{ todayFormatted }}</p>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <SummaryCard label="Tasks" :value="pendingTasksLabel" :icon="CheckSquare" />
      <SummaryCard label="Habits" :value="habitsTodayLabel" :icon="Repeat" />
      <SummaryCard label="Saldo" :value="balanceLabel" :icon="Wallet" />
      <SummaryCard label="Catatan" :value="notesCountLabel" :icon="StickyNote" />
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <!-- Recent Activity -->
      <div class="rounded-xl border border-border bg-surface p-5">
        <h3 class="mb-3 text-sm font-medium text-ink">Aktivitas Terbaru</h3>

        <p v-if="activityFeed.length === 0" class="text-sm text-ink-muted">
          Belum ada aktivitas. Mulai tambahkan task, habit, atau catatan!
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

      <!-- Mini chart: habit completion 7 hari terakhir -->
      <div class="rounded-xl border border-border bg-surface p-5">
        <h3 class="mb-4 text-sm font-medium text-ink">Konsistensi Habit (7 Hari)</h3>

        <p v-if="habitsStore.habits.length === 0" class="text-sm text-ink-muted">
          Belum ada habit untuk ditampilkan.
        </p>

        <div v-else class="flex h-32 items-end justify-between gap-2">
          <div
            v-for="day in weeklyHabitChart"
            :key="day.dayLabel + day.percent"
            class="flex flex-1 flex-col items-center gap-1"
          >
            <div class="flex h-24 w-full items-end overflow-hidden rounded-md bg-border">
              <div
                class="w-full rounded-md transition-all"
                :class="day.isToday ? 'bg-accent' : 'bg-accent/50'"
                :style="{ height: Math.max(day.percent, 4) + '%' }"
              />
            </div>
            <span class="text-xs" :class="day.isToday ? 'font-medium text-accent' : 'text-ink-muted'">
              {{ day.dayLabel }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>