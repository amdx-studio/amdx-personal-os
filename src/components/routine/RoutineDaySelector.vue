<script setup lang="ts">
import { ROUTINE_DAYS } from '../../constants/routineDays'
import type { RoutineDay } from '../../types/routine'

defineProps<{
  selectedDay: RoutineDay
}>()

const emit = defineEmits<{
  (event: 'select', day: RoutineDay): void
}>()
</script>

<template>
  <div class="flex gap-2 overflow-x-auto pb-1">
    <button
      v-for="day in ROUTINE_DAYS"
      :key="day.id"
      type="button"
      class="shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
      :class="
        selectedDay === day.id
          ? 'bg-accent-bg-soft text-accent'
          : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
      "
      @click="emit('select', day.id)"
    >
      {{ day.shortLabel }}
    </button>
  </div>
</template>