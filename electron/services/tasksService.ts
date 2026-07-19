import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { Task, CreateTaskInput } from '../../src/types/task.js'

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
    completed: false,
    createdAt: new Date().toISOString(),
  }

  await writeJsonFile<Task[]>(TASKS_FILE, [...tasks, newTask])
  return newTask
}

export async function toggleTask(id: string): Promise<void> {
  const tasks = await getTasks()
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  )
  await writeJsonFile<Task[]>(TASKS_FILE, updated)
}

export async function deleteTask(id: string): Promise<void> {
  const tasks = await getTasks()
  const updated = tasks.filter((task) => task.id !== id)
  await writeJsonFile<Task[]>(TASKS_FILE, updated)
}