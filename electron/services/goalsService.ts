import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../../src/types/goal.js'

const GOALS_FILE = 'goals.json'
const DEFAULT_GOALS: Goal[] = []

export async function getGoals(): Promise<Goal[]> {
  return readJsonFile<Goal[]>(GOALS_FILE, DEFAULT_GOALS)
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const goals = await getGoals()

  const newGoal: Goal = {
    id: randomUUID(),
    title: input.title,
    targetValue: input.targetValue,
    currentValue: 0,
    unit: input.unit,
    deadline: input.deadline ?? null,
    createdAt: new Date().toISOString(),
  }

  await writeJsonFile<Goal[]>(GOALS_FILE, [...goals, newGoal])
  return newGoal
}

export async function updateGoal(id: string, input: UpdateGoalInput): Promise<void> {
  const goals = await getGoals()
  const updated = goals.map((goal) => (goal.id === id ? { ...goal, ...input } : goal))
  await writeJsonFile<Goal[]>(GOALS_FILE, updated)
}

export async function deleteGoal(id: string): Promise<void> {
  const goals = await getGoals()
  const updated = goals.filter((goal) => goal.id !== id)
  await writeJsonFile<Goal[]>(GOALS_FILE, updated)
}