import type { Task, CreateTaskInput } from '../types/task'

export async function fetchTasks(): Promise<Task[]> {
  return window.electronAPI.tasks.get()
}

export async function addTask(input: CreateTaskInput): Promise<Task> {
  return window.electronAPI.tasks.create(input)
}

export async function toggleTaskStatus(id: string): Promise<boolean> {
  return window.electronAPI.tasks.toggle(id)
}

export async function removeTask(id: string): Promise<boolean> {
  return window.electronAPI.tasks.delete(id)
}