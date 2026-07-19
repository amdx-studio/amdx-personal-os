import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchGoals, addGoal, editGoal, removeGoal } from '../services/goalsService'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal'

export const useGoalsStore = defineStore('goals', () => {
  const goals = ref<Goal[]>([])
  const isLoading = ref(false)

  async function loadGoals(): Promise<void> {
    isLoading.value = true
    try {
      goals.value = await fetchGoals()
    } finally {
      isLoading.value = false
    }
  }

  async function createGoal(input: CreateGoalInput): Promise<void> {
    const newGoal = await addGoal(input)
    goals.value = [...goals.value, newGoal]
  }

  async function updateGoal(id: string, input: UpdateGoalInput): Promise<void> {
    goals.value = goals.value.map((goal) => (goal.id === id ? { ...goal, ...input } : goal))
    await editGoal(id, input)
  }

  // Nambah progress secara relatif (mis. +5), dikunci di rentang [0, targetValue]
  async function addProgress(id: string, amount: number): Promise<void> {
    const goal = goals.value.find((item) => item.id === id)
    if (!goal) return

    const nextValue = Math.min(Math.max(goal.currentValue + amount, 0), goal.targetValue)
    await updateGoal(id, { currentValue: nextValue })
  }

  async function deleteGoal(id: string): Promise<void> {
    goals.value = goals.value.filter((goal) => goal.id !== id)
    await removeGoal(id)
  }

  // Derived data, dihitung ulang tiap dipanggil — tidak disimpan di file
  function getProgressPercent(goal: Goal): number {
    if (goal.targetValue <= 0) return 0
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
  }

  function isCompleted(goal: Goal): boolean {
    return goal.currentValue >= goal.targetValue
  }

  return {
    goals,
    isLoading,
    loadGoals,
    createGoal,
    updateGoal,
    addProgress,
    deleteGoal,
    getProgressPercent,
    isCompleted,
  }
})