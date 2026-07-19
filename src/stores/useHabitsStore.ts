import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchHabits,
  addHabit,
  toggleHabitTodayStatus,
  removeHabit,
} from '../services/habitsService'
import type { Habit, CreateHabitInput } from '../types/habit'

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function calculateStreak(completedDates: string[]): number {
  const sorted = [...completedDates].sort().reverse()
  if (sorted.length === 0) return 0

  let streak = 0
  const cursor = new Date()

  for (const dateStr of sorted) {
    const cursorStr = cursor.toISOString().slice(0, 10)
    if (dateStr !== cursorStr) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

export const useHabitsStore = defineStore('habits', () => {
  const habits = ref<Habit[]>([])
  const isLoading = ref(false)

  async function loadHabits(): Promise<void> {
    isLoading.value = true
    try {
      habits.value = await fetchHabits()
    } finally {
      isLoading.value = false
    }
  }

  async function createHabit(input: CreateHabitInput): Promise<void> {
    const newHabit = await addHabit(input)
    habits.value = [...habits.value, newHabit]
  }

  async function toggleToday(id: string): Promise<void> {
    const today = getTodayString()

    habits.value = habits.value.map((habit) => {
      if (habit.id !== id) return habit
      const alreadyDone = habit.completedDates.includes(today)
      const completedDates = alreadyDone
        ? habit.completedDates.filter((d) => d !== today)
        : [...habit.completedDates, today]
      return { ...habit, completedDates }
    })

    await toggleHabitTodayStatus(id)
  }

  async function deleteHabit(id: string): Promise<void> {
    habits.value = habits.value.filter((habit) => habit.id !== id)
    await removeHabit(id)
  }

  function isCompletedToday(habit: Habit): boolean {
    return habit.completedDates.includes(getTodayString())
  }

  function getStreak(habit: Habit): number {
    return calculateStreak(habit.completedDates)
  }

  return {
    habits,
    isLoading,
    loadHabits,
    createHabit,
    toggleToday,
    deleteHabit,
    isCompletedToday,
    getStreak,
  }
})