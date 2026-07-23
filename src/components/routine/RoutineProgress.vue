<script setup lang="ts">
import { computed } from 'vue'
import type { RoutineActivity } from '../../types/routine'

const props = defineProps<{
  activities: RoutineActivity[]
}>()

const totalCount = computed(() => props.activities.length)

const checkedCount = computed(
  () => props.activities.filter((activity) => activity.checked).length,
)

const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((checkedCount.value / totalCount.value) * 100)
})

const dailyScore = computed(() => progressPercent.value)
</script>

<template>
  <div class="rounded-xl border border-border bg-surface p-5">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-ink">Daily Progress</p>
        <p class="text-xs text-ink-subtle">
          {{ checkedCount }} dari {{ totalCount }} aktivitas selesai
        </p>
      </div>
      <div class="text-right">
        <p class="text-2xl font-semibold text-ink">{{ progressPercent }}%</p>
        <p class="text-xs text-ink-subtle">Daily Score: {{ dailyScore }}</p>
      </div>
    </div>

    <div class="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
      <div
        class="h-full rounded-full bg-accent transition-all duration-300"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>
  </div>
</template>