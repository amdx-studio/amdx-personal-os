import { defineStore } from 'pinia'
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useTasksStore } from './useTasksStore'
import { useHabitsStore } from './useHabitsStore'
import { useNotesStore } from './useNotesStore'
import { useCalendarStore } from './useCalendarStore'
import { useFinanceStore } from './useFinanceStore'
import { useGoalsStore } from './useGoalsStore'

// CATATAN ASUMSI: store ini mengasumsikan Task punya field `completed: boolean`
// (konsisten dengan deskripsi Phase 10.1 "tambah/toggle/hapus"). Kalau nama field
// aslinya beda (mis. `isDone`), sesuaikan di computed `taskStats` di bawah.

export const useStatisticsStore = defineStore('statistics', () => {
  const tasksStore = useTasksStore()
  const habitsStore = useHabitsStore()
  const notesStore = useNotesStore()
  const calendarStore = useCalendarStore()
  const financeStore = useFinanceStore()
  const goalsStore = useGoalsStore()

  // Memuat data dari semua modul sekaligus — dipanggil sekali saat halaman Statistics dibuka
  async function loadAll(): Promise<void> {
    await Promise.all([
      tasksStore.loadTasks(),
      habitsStore.loadHabits(),
      notesStore.loadNotes(),
      calendarStore.loadEvents(),
      financeStore.loadTransactions(),
      goalsStore.loadGoals(),
    ])
  }

  const taskStats = computed(() => {
    const total = tasksStore.tasks.length
    const completed = tasksStore.tasks.filter((task) => task.completed).length
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, pending: total - completed, completionRate }
  })

  const habitStats = computed(() => {
    const total = habitsStore.habits.length
    const streaks = habitsStore.habits.map((habit) => habitsStore.getStreak(habit))
    const averageStreak =
      streaks.length === 0 ? 0 : Math.round(streaks.reduce((sum, s) => sum + s, 0) / streaks.length)
    const bestStreak = streaks.length === 0 ? 0 : Math.max(...streaks)
    return { total, averageStreak, bestStreak }
  })

  const noteStats = computed(() => ({
    total: notesStore.notes.length,
  }))

  const calendarStats = computed(() => {
    const today = dayjs().startOf('day')
    const inSevenDays = today.add(7, 'day')
    const upcoming = calendarStore.events.filter((event) => {
      const eventDate = dayjs(event.date)
      return eventDate.isSame(today, 'day') || (eventDate.isAfter(today) && eventDate.isBefore(inSevenDays))
    })
    return { total: calendarStore.events.length, upcomingThisWeek: upcoming.length }
  })

  const financeStats = computed(() => {
    const thisMonth = dayjs().format('YYYY-MM')
    const monthTransactions = financeStore.transactions.filter((t) => t.date.startsWith(thisMonth))
    const monthIncome = monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const monthExpense = monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      balance: financeStore.balance,
      totalIncome: financeStore.totalIncome,
      totalExpense: financeStore.totalExpense,
      monthIncome,
      monthExpense,
    }
  })

  const goalStats = computed(() => {
    const total = goalsStore.goals.length
    const completed = goalsStore.goals.filter((goal) => goalsStore.isCompleted(goal)).length
    const percentages = goalsStore.goals.map((goal) => goalsStore.getProgressPercent(goal))
    const averageProgress =
      percentages.length === 0
        ? 0
        : Math.round(percentages.reduce((sum, p) => sum + p, 0) / percentages.length)
    return { total, completed, averageProgress }
  })

  return {
    loadAll,
    taskStats,
    habitStats,
    noteStats,
    calendarStats,
    financeStats,
    goalStats,
  }
})