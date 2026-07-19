import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  fetchTasks,
  addTask as apiAddTask,
  updateTask as apiUpdateTask,
  removeTask as apiRemoveTask,
  duplicateTask as apiDuplicateTask,
  markTaskDone as apiMarkTaskDone,
  extendTaskDeadline as apiExtendTaskDeadline,
  archiveTask as apiArchiveTask,
} from '../services/tasksService'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilters,
  TaskSummary,
  DeadlineUrgency,
} from '../types/task'

const DAY_MS = 24 * 60 * 60 * 1000

export function getDeadlineUrgency(task: Task): DeadlineUrgency {
  if (!task.deadline || task.status === 'selesai' || task.status === 'dibatalkan') return 'none'
  const now = Date.now()
  const deadline = new Date(task.deadline).getTime()
  const diff = deadline - now

  if (diff < 0) return 'overdue'
  if (diff < DAY_MS) return 'today'
  if (diff < 3 * DAY_MS) return 'soon'
  return 'normal'
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const selectedTaskId = ref<string | null>(null)

  const filters = ref<TaskFilters>({
    search: '',
    category: 'all',
    status: 'all',
    priority: 'all',
    sortBy: 'deadline_asc',
    showArchived: false,
  })

  // ── Loading ────────────────────────────────────────────────────

  async function loadTasks(): Promise<void> {
    isLoading.value = true
    try {
      tasks.value = await fetchTasks()
    } finally {
      isLoading.value = false
    }
  }

  // ── CRUD (optimistic where safe) ──────────────────────────────

  async function createTask(input: CreateTaskInput): Promise<void> {
    const newTask = await apiAddTask(input)
    tasks.value = [...tasks.value, newTask]
  }

  async function updateTask(input: UpdateTaskInput): Promise<void> {
    const previous = tasks.value
    tasks.value = tasks.value.map((t) => (t.id === input.id ? { ...t, ...input } : t))
    try {
      const saved = await apiUpdateTask(input)
      tasks.value = tasks.value.map((t) => (t.id === saved.id ? saved : t))
    } catch (err) {
      tasks.value = previous
      throw err
    }
  }

  async function deleteTask(id: string): Promise<void> {
    const previous = tasks.value
    tasks.value = tasks.value.filter((t) => t.id !== id)
    if (selectedTaskId.value === id) selectedTaskId.value = null
    try {
      await apiRemoveTask(id)
    } catch (err) {
      tasks.value = previous
      throw err
    }
  }

  async function duplicateTask(id: string): Promise<void> {
    const copy = await apiDuplicateTask(id)
    tasks.value = [...tasks.value, copy]
  }

  async function markAsDone(id: string): Promise<void> {
    await updateTask({ id, status: 'selesai', progress: 100 })
    await apiMarkTaskDone(id) // keeps main-process completedAt logic authoritative
  }

  async function extendDeadline(id: string, newDeadline: string): Promise<void> {
    await updateTask({ id, deadline: newDeadline })
    await apiExtendTaskDeadline(id, newDeadline)
  }

  async function toggleArchive(id: string, archived: boolean): Promise<void> {
    await updateTask({ id, archived })
    await apiArchiveTask(id, archived)
  }

  // ── Selection (drawer) ────────────────────────────────────────

  function selectTask(id: string | null): void {
    selectedTaskId.value = id
  }

  const selectedTask = computed<Task | null>(
    () => tasks.value.find((t) => t.id === selectedTaskId.value) ?? null
  )

  // ── Summary ───────────────────────────────────────────────────

  const summary = computed<TaskSummary>(() => {
    const visible = tasks.value.filter((t) => !t.archived)
    const completed = visible.filter((t) => t.status === 'selesai')
    const incomplete = visible.filter((t) => t.status !== 'selesai' && t.status !== 'dibatalkan')
    const dueToday = visible.filter((t) => getDeadlineUrgency(t) === 'today')
    const overdue = visible.filter((t) => getDeadlineUrgency(t) === 'overdue')

    return {
      total: visible.length,
      completed: completed.length,
      incomplete: incomplete.length,
      dueToday: dueToday.length,
      overdue: overdue.length,
    }
  })

  // ── Filtering + sorting ──────────────────────────────────────

  const priorityWeight: Record<Task['priority'], number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  const filteredTasks = computed<Task[]>(() => {
    const q = filters.value.search.trim().toLowerCase()

    let result = tasks.value.filter((t) => {
      if (t.archived !== filters.value.showArchived) return false
      if (filters.value.category !== 'all' && t.category !== filters.value.category) return false
      if (filters.value.status !== 'all' && t.status !== filters.value.status) return false
      if (filters.value.priority !== 'all' && t.priority !== filters.value.priority) return false
      if (q && !t.title.toLowerCase().includes(q) && !t.description.toLowerCase().includes(q)) {
        return false
      }
      return true
    })

    result = [...result].sort((a, b) => {
      switch (filters.value.sortBy) {
        case 'deadline_asc':
          return deadlineSortValue(a) - deadlineSortValue(b)
        case 'deadline_desc':
          return deadlineSortValue(b) - deadlineSortValue(a)
        case 'priority':
          return priorityWeight[a.priority] - priorityWeight[b.priority]
        case 'created_desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    return result
  })

  function deadlineSortValue(t: Task): number {
    return t.deadline ? new Date(t.deadline).getTime() : Number.MAX_SAFE_INTEGER
  }

  function setFilter<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]): void {
    filters.value[key] = value
  }

  function resetFilters(): void {
    filters.value = {
      search: '',
      category: 'all',
      status: 'all',
      priority: 'all',
      sortBy: 'deadline_asc',
      showArchived: false,
    }
  }

  return {
    tasks,
    isLoading,
    filters,
    selectedTaskId,
    selectedTask,
    summary,
    filteredTasks,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    duplicateTask,
    markAsDone,
    extendDeadline,
    toggleArchive,
    selectTask,
    setFilter,
    resetFilters,
  }
})
