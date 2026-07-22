import { defineStore } from 'pinia'
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useTasksStore } from './useTasksStore'
import { useNotesStore } from './useNotesStore'
import { useFinanceStore } from './useFinanceStore'
import { useGoalsStore } from './useGoalsStore'

export const useStatisticsStore = defineStore('statistics', () => {
  const tasksStore = useTasksStore()
  const notesStore = useNotesStore()
  const financeStore = useFinanceStore()
  const goalsStore = useGoalsStore()

  async function loadAll(): Promise<void> {
    await Promise.all([
      tasksStore.loadTasks(),
      notesStore.loadNotes(),
      financeStore.loadTransactions(),
      goalsStore.loadGoals(),
    ])
  }

  const taskStats = computed(() => {
    const total = tasksStore.tasks.length
    const completed = tasksStore.tasks.filter((task) => task.completedAt).length
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, pending: total - completed, completionRate }
  })

  const noteStats = computed(() => ({
    total: notesStore.notes.length,
  }))

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
    noteStats,
    financeStats,
    goalStats,
  }
})