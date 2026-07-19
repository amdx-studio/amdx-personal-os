import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../../src/types/task.js'

const TASKS_FILE = 'tasks.json'
const DEFAULT_TASKS: Task[] = []

export async function getTasks(): Promise<Task[]> {
  return readJsonFile<Task[]>(TASKS_FILE, DEFAULT_TASKS)
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const tasks = await getTasks()

  const newTask: Task = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? '',
    category: input.category,
    deadline: input.deadline ?? null,
    status: input.status ?? 'belum_dimulai',
    priority: input.priority ?? 'medium',
    progress: input.progress ?? 0,
    notes: input.notes ?? '',
    createdAt: new Date().toISOString(),
    completedAt: null,
    archived: false,
    kuliahDetails: input.kuliahDetails,
    jokiDetails: input.jokiDetails,
    klienDetails: input.klienDetails,
  }

  await writeJsonFile<Task[]>(TASKS_FILE, [...tasks, newTask])
  return newTask
}

export async function updateTask(input: UpdateTaskInput): Promise<Task> {
  const tasks = await getTasks()
  const index = tasks.findIndex((t) => t.id === input.id)
  if (index === -1) throw new Error(`Task ${input.id} tidak ditemukan`)

  const existing = tasks[index]
  const merged: Task = { ...existing, ...input }

  // Auto-manage completedAt when status transitions
  if (input.status && input.status !== existing.status) {
    if (input.status === 'selesai') {
      merged.completedAt = new Date().toISOString()
      merged.progress = 100
    } else if (existing.status === 'selesai') {
      // moved out of 'selesai' back into an active state
      merged.completedAt = null
    }
  }

  const updated = [...tasks]
  updated[index] = merged
  await writeJsonFile<Task[]>(TASKS_FILE, updated)
  return merged
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks()
  const filtered = tasks.filter((task) => task.id !== id)
  await writeJsonFile<Task[]>(TASKS_FILE, filtered)
}

export async function duplicateTask(id: string): Promise<Task> {
  const tasks = await getTasks()
  const original = tasks.find((t) => t.id === id)
  if (!original) throw new Error(`Task ${id} tidak ditemukan`)

  const copy: Task = {
    ...original,
    id: randomUUID(),
    title: `${original.title} (Copy)`,
    status: 'belum_dimulai',
    progress: 0,
    completedAt: null,
    createdAt: new Date().toISOString(),
    archived: false,
  }

  await writeJsonFile<Task[]>(TASKS_FILE, [...tasks, copy])
  return copy
}

export async function markTaskDone(id: string): Promise<Task> {
  return updateTask({ id, status: 'selesai', progress: 100 })
}

export async function extendDeadline(id: string, newDeadline: string): Promise<Task> {
  return updateTask({ id, deadline: newDeadline })
}

export async function archiveTask(id: string, archived = true): Promise<Task> {
  return updateTask({ id, archived })
}
