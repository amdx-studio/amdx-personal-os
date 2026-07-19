import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { Habit, CreateHabitInput } from '../../src/types/habit.js'

const HABITS_FILE = 'habits.json'
const DEFAULT_HABITS: Habit[] = []

export async function getHabits(): Promise<Habit[]> {
  return readJsonFile<Habit[]>(HABITS_FILE, DEFAULT_HABITS)
}

export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const habits = await getHabits()

  const newHabit: Habit = {
    id: randomUUID(),
    name: input.name,
    createdAt: new Date().toISOString(),
    completedDates: [],
  }

  await writeJsonFile<Habit[]>(HABITS_FILE, [...habits, newHabit])
  return newHabit
}

export async function toggleHabitToday(id: string): Promise<void> {
  const habits = await getHabits()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const updated = habits.map((habit) => {
    if (habit.id !== id) return habit

    const alreadyDone = habit.completedDates.includes(today)
    const completedDates = alreadyDone
      ? habit.completedDates.filter((date) => date !== today)
      : [...habit.completedDates, today]

    return { ...habit, completedDates }
  })

  await writeJsonFile<Habit[]>(HABITS_FILE, updated)
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await getHabits()
  const updated = habits.filter((habit) => habit.id !== id)
  await writeJsonFile<Habit[]>(HABITS_FILE, updated)
}