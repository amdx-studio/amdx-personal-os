<script setup lang="ts">
import { computed } from 'vue'
import { Pencil, Trash2, Copy } from 'lucide-vue-next'
import type { RoutineActivity } from '../../types/routine'

const props = defineProps<{
  activity: RoutineActivity
}>()

const emit = defineEmits<{
  (event: 'toggle', id: string): void
  (event: 'edit', activity: RoutineActivity): void
  (event: 'duplicate', id: string): void
  (event: 'delete', id: string): void
}>()

const priorityColor = computed(() => {
  if (props.activity.priority === 'high') return '#EF4444'
  if (props.activity.priority === 'medium') return '#F59E0B'
  return '#94A3B8'
})

const timeRangeLabel = computed(() => {
  if (!props.activity.endTime) return props.activity.startTime
  return `${props.activity.startTime} - ${props.activity.endTime}`
})
</script>

<template>
  <div
    class="group flex items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:border-border hover:bg-surface-muted"
  >
    <button
      type="button"
      class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors"
      :class="
        activity.checked
          ? 'border-accent bg-accent text-white'
          : 'border-border bg-surface hover:border-accent'
      "
      :aria-label="activity.checked ? 'Tandai belum selesai' : 'Tandai selesai'"
      @click="emit('toggle', activity.id)"
    >
      <svg
        v-if="activity.checked"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="3"
        class="h-3 w-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <span
          class="h-1.5 w-1.5 shrink-0 rounded-full"
          :style="{ backgroundColor: priorityColor }"
        />
        <p
          class="truncate text-sm font-medium"
          :class="activity.checked ? 'text-ink-subtle line-through' : 'text-ink'"
        >
          {{ activity.title }}
        </p>
      </div>
      <p class="mt-0.5 text-xs text-ink-subtle">{{ timeRangeLabel }}</p>
      <p v-if="activity.description" class="mt-1 text-xs text-ink-muted">
        {{ activity.description }}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface hover:text-ink"
        aria-label="Duplicate aktivitas"
        @click="emit('duplicate', activity.id)"
      >
        <Copy class="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface hover:text-ink"
        aria-label="Edit aktivitas"
        @click="emit('edit', activity)"
      >
        <Pencil class="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface hover:text-red-500"
        aria-label="Hapus aktivitas"
        @click="emit('delete', activity.id)"
      >
        <Trash2 class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
</template>