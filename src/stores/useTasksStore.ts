import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  fetchTasks,
  addTask,
  toggleTaskStatus,
  removeTask,
} from '../services/tasksService'
import type { Task, CreateTaskInput } from '../types/task'

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)

  async function loadTasks(): Promise<void> {
    isLoading.value = true
    try {
      tasks.value = await fetchTasks()
    } finally {
      isLoading.value = false
    }
  }

  async function createTask(input: CreateTaskInput): Promise<void> {
    const newTask = await addTask(input)
    tasks.value = [...tasks.value, newTask]
  }

  async function toggleTask(id: string): Promise<void> {
    tasks.value = tasks.value.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    )
    await toggleTaskStatus(id)
  }

  async function deleteTask(id: string): Promise<void> {
    tasks.value = tasks.value.filter((task) => task.id !== id)
    await removeTask(id)
  }

  return {
    tasks,
    isLoading,
    loadTasks,
    createTask,
    toggleTask,
    deleteTask,
  }
})