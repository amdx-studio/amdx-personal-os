<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, GraduationCap, Users } from 'lucide-vue-next'
import type { Task } from '../../types/task'
import { TASK_CATEGORY_LABELS, TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../types/task'
import {
  CATEGORY_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  cardUrgencyClasses,
  formatDeadline,
} from '../../utils/taskStyles'
import { getDeadlineUrgency } from '../../stores/useTasksStore'
import TaskBadge from './TaskBadge.vue'

const props = defineProps<{
  task: Task
}>()

defineEmits<{
  click: []
}>()

const urgency = computed(() => getDeadlineUrgency(props.task))
const showWarningIcon = computed(() => urgency.value === 'soon' || urgency.value === 'today' || urgency.value === 'overdue')

const clientLabel = computed(() => {
  if (props.task.category === 'joki') return props.task.jokiDetails?.namaClient
  if (props.task.category === 'klien') return props.task.klienDetails?.namaClient
  return undefined
})
</script>

<template>
  <li
    class="flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-colors hover:border-accent/50"
    :class="cardUrgencyClasses(urgency, task.status)"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between gap-2">
      <h3
        class="text-sm font-medium text-ink"
        :class="task.status === 'selesai' ? 'line-through text-ink-subtle' : ''"
      >
        {{ task.title }}
      </h3>
      <AlertTriangle v-if="showWarningIcon" class="h-4 w-4 shrink-0 text-orange-500" />
    </div>

    <div class="flex flex-wrap items-center gap-1.5">
      <TaskBadge :label="TASK_CATEGORY_LABELS[task.category]" :classes="CATEGORY_BADGE_CLASSES[task.category]" />
      <TaskBadge :label="TASK_PRIORITY_LABELS[task.priority]" :classes="PRIORITY_BADGE_CLASSES[task.priority]" />
      <TaskBadge :label="TASK_STATUS_LABELS[task.status]" :classes="STATUS_BADGE_CLASSES[task.status]" />
    </div>

    <div class="flex items-center gap-2 text-xs text-ink-muted">
      <GraduationCap v-if="task.category === 'kuliah'" class="h-3.5 w-3.5" />
      <Users v-else-if="clientLabel" class="h-3.5 w-3.5" />
      <span v-if="task.category === 'kuliah' && task.kuliahDetails?.mataKuliah">
        {{ task.kuliahDetails.mataKuliah }}
      </span>
      <span v-else-if="clientLabel">{{ clientLabel }}</span>
    </div>

    <div class="flex items-center justify-between text-xs text-ink-muted">
      <span>{{ formatDeadline(task.deadline) }}</span>
      <span>{{ task.progress }}%</span>
    </div>

    <div class="h-1.5 w-full overflow-hidden rounded-full bg-border">
      <div
        class="h-full rounded-full bg-accent transition-all"
        :class="task.status === 'selesai' ? 'bg-emerald-500' : ''"
        :style="{ width: `${task.progress}%` }"
      />
    </div>
  </li>
</template>
