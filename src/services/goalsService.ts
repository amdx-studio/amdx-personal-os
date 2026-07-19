import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal'

export async function fetchGoals(): Promise<Goal[]> {
  return window.electronAPI.goals.get()
}

export async function addGoal(input: CreateGoalInput): Promise<Goal> {
  return window.electronAPI.goals.create(input)
}

export async function editGoal(id: string, input: UpdateGoalInput): Promise<boolean> {
  return window.electronAPI.goals.update(id, input)
}

export async function removeGoal(id: string): Promise<boolean> {
  return window.electronAPI.goals.delete(id)
}