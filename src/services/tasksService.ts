import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'

/**
 * Electron IPC uses the structured clone algorithm, which cannot serialize
 * Vue reactive Proxy objects (e.g. fields coming from a `reactive()` form).
 * Deep-cloning through JSON strips the Proxy and leaves a plain object.
 */
function toPlain<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

export async function fetchTasks(): Promise<Task[]> {
  return window.electronAPI.tasks.get()
}

export async function addTask(input: CreateTaskInput): Promise<Task> {
  return window.electronAPI.tasks.create(toPlain(input))
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  return window.electronAPI.tasks.update(toPlain(input))
}

export async function removeTask(id: string): Promise<boolean> {
  return window.electronAPI.tasks.delete(id)
}

export async function duplicateTask(id: string): Promise<Task> {
  return window.electronAPI.tasks.duplicate(id)
}

export async function markTaskDone(id: string): Promise<Task> {
  return window.electronAPI.tasks.markDone(id)
}

export async function extendTaskDeadline(id: string, newDeadline: string): Promise<Task> {
  return window.electronAPI.tasks.extendDeadline(id, newDeadline)
}

export async function archiveTask(id: string, archived: boolean): Promise<Task> {
  return window.electronAPI.tasks.archive(id, archived)
}