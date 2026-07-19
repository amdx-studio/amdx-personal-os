<script setup lang="ts">
import { CheckCircle2, CircleDashed, AlarmClock, AlertTriangle, ListChecks } from 'lucide-vue-next'
import type { TaskSummary } from '../../types/task'

defineProps<{
  summary: TaskSummary
}>()

const cards = [
  { key: 'total', label: 'Semua Task', icon: ListChecks, tone: 'text-ink' },
  { key: 'completed', label: 'Selesai', icon: CheckCircle2, tone: 'text-emerald-500' },
  { key: 'incomplete', label: 'Belum Selesai', icon: CircleDashed, tone: 'text-blue-500' },
  { key: 'dueToday', label: 'Deadline Hari Ini', icon: AlarmClock, tone: 'text-orange-500' },
  { key: 'overdue', label: 'Terlambat', icon: AlertTriangle, tone: 'text-red-500' },
] as const
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
    <div
      v-for="card in cards"
      :key="card.key"
      class="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
    >
      <component :is="card.icon" class="h-5 w-5 shrink-0" :class="card.tone" />
      <div>
        <p class="text-lg font-semibold text-ink">{{ summary[card.key] }}</p>
        <p class="text-xs text-ink-muted">{{ card.label }}</p>
      </div>
    </div>
  </div>
</template>
