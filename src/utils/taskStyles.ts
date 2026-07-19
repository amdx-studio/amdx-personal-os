import type { TaskCategory, TaskPriority, TaskStatus, DeadlineUrgency } from '../types/task'

export const CATEGORY_BADGE_CLASSES: Record<TaskCategory, string> = {
  kuliah: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  project: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  klien: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  joki: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  pribadi: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
  lainnya: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
}

export const PRIORITY_BADGE_CLASSES: Record<TaskPriority, string> = {
  critical: 'bg-red-500/10 text-red-600 dark:text-red-400',
  high: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
}

export const STATUS_BADGE_CLASSES: Record<TaskStatus, string> = {
  belum_dimulai: 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
  sedang_dikerjakan: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  menunggu: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  revisi: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  selesai: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  dibatalkan: 'bg-red-500/10 text-red-500 line-through',
}

/** Border/left-accent + background treatment applied to the whole card based on deadline urgency / completion. */
export function cardUrgencyClasses(urgency: DeadlineUrgency, status: TaskStatus): string {
  if (status === 'selesai') return 'border-emerald-500/40 bg-emerald-500/5'
  if (urgency === 'overdue') return 'border-red-500/40 bg-red-500/5'
  if (urgency === 'today') return 'border-orange-500/40 bg-orange-500/5'
  return 'border-border bg-surface'
}

export function formatDeadline(iso: string | null): string {
  if (!iso) return 'Tanpa deadline'
  const d = new Date(iso)
  return d.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value: number | undefined): string {
  if (value === undefined) return '-'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    value
  )
}
