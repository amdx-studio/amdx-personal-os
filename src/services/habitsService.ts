import type { Habit, CreateHabitInput } from '../types/habit'

export async function fetchHabits(): Promise<Habit[]> {
  return window.electronAPI.habits.get()
}

export async function addHabit(input: CreateHabitInput): Promise<Habit> {
  return window.electronAPI.habits.create(input)
}

export async function toggleHabitTodayStatus(id: string): Promise<boolean> {
  return window.electronAPI.habits.toggleToday(id)
}

export async function removeHabit(id: string): Promise<boolean> {
  return window.electronAPI.habits.delete(id)
}