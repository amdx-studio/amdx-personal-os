<script setup lang="ts">
import { computed } from 'vue'
import { getRoutineDayLabel } from '../../constants/routineDays'
import type { RoutineDay } from '../../types/routine'

const props = defineProps<{
  selectedDay: RoutineDay
}>()

const todayFormatted = computed(() => {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})

const selectedDayLabel = computed(() => getRoutineDayLabel(props.selectedDay))
</script>

<template>
  <div class="flex flex-col gap-1">
    <h1 class="text-2xl font-semibold text-ink">Routine</h1>
    <p class="text-sm text-ink-muted">
      Menampilkan template
      <span class="font-medium text-ink">{{ selectedDayLabel }}</span>
      &middot; Hari ini {{ todayFormatted }}
    </p>
  </div>
</template>