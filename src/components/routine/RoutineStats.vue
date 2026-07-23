<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle2, XCircle, Award, Layers, AlertTriangle } from 'lucide-vue-next'
import { useRoutineStore } from '../../stores/routine'
import { ROUTINE_DAYS } from '../../constants/routineDays'
import RoutineCategoryBadge from './RoutineCategoryBadge.vue'
import type { RoutineDay, RoutineCategoryId } from '../../types/routine'

const routineStore = useRoutineStore()

const totalActivities = computed(() => routineStore.activities.length)

const checkedCount = computed(
  () => routineStore.activities.filter((activity) => activity.checked).length,
)

const uncheckedCount = computed(() => totalActivities.value - checkedCount.value)

const overallProgress = computed(() => {
  if (totalActivities.value === 0) return 0
  return Math.round((checkedCount.value / totalActivities.value) * 100)
})

const todayActivities = computed(() => routineStore.todayActivities)

const dailyScore = computed(() => {
  if (todayActivities.value.length === 0) return 0
  const checked = todayActivities.value.filter((activity) => activity.checked).length
  return Math.round((checked / todayActivities.value.length) * 100)
})

interface DayStat {
  day: RoutineDay
  label: string
  total: number
  checked: number
  percent: number
}

const perDayStats = computed<DayStat[]>(() => {
  return ROUTINE_DAYS.map((day) => {
    const dayActivities = routineStore.getActivitiesByDay(day.id)
    const total = dayActivities.length
    const checked = dayActivities.filter((activity) => activity.checked).length
    const percent = total === 0 ? 0 : Math.round((checked / total) * 100)
    return { day: day.id, label: day.label, total, checked, percent }
  })
})

const mostProductiveDay = computed<DayStat | null>(() => {
  const withData = perDayStats.value.filter((day) => day.total > 0)
  if (withData.length === 0) return null
  return withData.reduce((best, current) => (current.percent > best.percent ? current : best))
})

interface CategoryStat {
  category: RoutineCategoryId
  count: number
}

const mostUsedCategory = computed<CategoryStat | null>(() => {
  const counts = new Map<RoutineCategoryId, number>()

  for (const activity of routineStore.activities) {
    counts.set(activity.category, (counts.get(activity.category) ?? 0) + 1)
  }

  let best: CategoryStat | null = null
  for (const [category, count] of counts) {
    if (!best || count > best.count) {
      best = { category, count }
    }
  }
  return best
})

interface MissedStat {
  title: string
  count: number
}

const mostMissedActivity = computed<MissedStat | null>(() => {
  const counts = new Map<string, number>()

  for (const activity of routineStore.activities) {
    if (activity.checked) continue
    const key = activity.title.trim()
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  let best: MissedStat | null = null
  for (const [title, count] of counts) {
    if (!best || count > best.count) {
      best = { title, count }
    }
  }
  return best
})
</script>

<template>
  <div class="rounded-xl border border-border bg-surface p-5">
    <h2 class="mb-4 text-sm font-semibold text-ink">Statistics</h2>

    <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-lg bg-surface-muted p-3">
        <div class="mb-1 flex items-center gap-1.5 text-ink-subtle">
          <CheckCircle2 class="h-3.5 w-3.5" />
          <span class="text-xs">Selesai</span>
        </div>
        <p class="text-lg font-semibold text-ink">{{ checkedCount }}</p>
      </div>

      <div class="rounded-lg bg-surface-muted p-3">
        <div class="mb-1 flex items-center gap-1.5 text-ink-subtle">
          <XCircle class="h-3.5 w-3.5" />
          <span class="text-xs">Belum Selesai</span>
        </div>
        <p class="text-lg font-semibold text-ink">{{ uncheckedCount }}</p>
      </div>

      <div class="rounded-lg bg-surface-muted p-3">
        <div class="mb-1 flex items-center gap-1.5 text-ink-subtle">
          <Layers class="h-3.5 w-3.5" />
          <span class="text-xs">Progress</span>
        </div>
        <p class="text-lg font-semibold text-ink">{{ overallProgress }}%</p>
      </div>

      <div class="rounded-lg bg-surface-muted p-3">
        <div class="mb-1 flex items-center gap-1.5 text-ink-subtle">
          <Award class="h-3.5 w-3.5" />
          <span class="text-xs">Daily Score</span>
        </div>
        <p class="text-lg font-semibold text-ink">{{ dailyScore }}%</p>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div class="rounded-lg border border-border p-3">
        <p class="mb-1 text-xs text-ink-subtle">Most Productive Day</p>
        <p v-if="mostProductiveDay" class="text-sm font-medium text-ink">
          {{ mostProductiveDay.label }}
          <span class="text-ink-subtle">({{ mostProductiveDay.percent }}%)</span>
        </p>
        <p v-else class="text-sm text-ink-subtle">Belum ada data</p>
      </div>

      <div class="rounded-lg border border-border p-3">
        <p class="mb-1 text-xs text-ink-subtle">Most Used Category</p>
        <RoutineCategoryBadge
          v-if="mostUsedCategory"
          :category-id="mostUsedCategory.category"
          size="sm"
        />
        <p v-else class="text-sm text-ink-subtle">Belum ada data</p>
      </div>

      <div class="rounded-lg border border-border p-3">
        <div class="mb-1 flex items-center gap-1.5 text-ink-subtle">
          <AlertTriangle class="h-3.5 w-3.5" />
          <span class="text-xs">Most Missed Activity</span>
        </div>
        <p v-if="mostMissedActivity" class="text-sm font-medium text-ink">
          {{ mostMissedActivity.title }}
        </p>
        <p v-else class="text-sm text-ink-subtle">Belum ada data</p>
        <p class="mt-0.5 text-[11px] text-ink-subtle">Berdasarkan status saat ini, bukan tren waktu</p>
      </div>
    </div>
  </div>
</template>