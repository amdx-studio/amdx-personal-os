<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoutineStore } from '../../stores/routine'
import { ROUTINE_CATEGORIES } from '../../constants/routineCategories'
import RoutineHeader from './RoutineHeader.vue'
import RoutineDaySelector from './RoutineDaySelector.vue'
import RoutineProgress from './RoutineProgress.vue'
import RoutineQuickActions from './RoutineQuickActions.vue'
import RoutineEmptyState from './RoutineEmptyState.vue'
import RoutineSection from './RoutineSection.vue'
import RoutineStats from './RoutineStats.vue'
import RoutineEditorDialog from './RoutineEditorDialog.vue'
import RoutineCopyDialog from './RoutineCopyDialog.vue'
import type {
  RoutineActivity,
  RoutineCategoryId,
  RoutineDay,
  RoutinePriority,
} from '../../types/routine'

const routineStore = useRoutineStore()

const activities = computed(() => routineStore.activitiesForSelectedDay)
const hasActivities = computed(() => activities.value.length > 0)

const groupedByCategory = computed(() => {
  return ROUTINE_CATEGORIES.map((category) => ({
    categoryId: category.id as RoutineCategoryId,
    activities: activities.value.filter((activity) => activity.category === category.id),
  })).filter((group) => group.activities.length > 0)
})

onMounted(() => {
  routineStore.loadRoutineActivities()
})

function handleSelectDay(day: RoutineDay): void {
  routineStore.setSelectedDay(day)
}

// --- Editor Dialog (Tambah / Edit) ---
const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editingActivity = ref<RoutineActivity | null>(null)

function handleAddActivity(): void {
  editingActivity.value = null
  editorMode.value = 'create'
  editorOpen.value = true
}

function handleEditActivity(activity: RoutineActivity): void {
  editingActivity.value = activity
  editorMode.value = 'edit'
  editorOpen.value = true
}

function handleEditorClose(): void {
  editorOpen.value = false
}

function handleEditorSubmit(payload: {
  mode: 'create' | 'edit'
  id: string | null
  title: string
  description: string
  category: RoutineCategoryId
  day: RoutineDay
  startTime: string
  endTime: string
  priority: RoutinePriority
  notes: string
}): void {
  if (payload.mode === 'edit' && payload.id) {
    routineStore.updateRoutineActivity(payload.id, {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      day: payload.day,
      startTime: payload.startTime,
      endTime: payload.endTime,
      priority: payload.priority,
      notes: payload.notes,
    })
  } else {
    routineStore.createRoutineActivity({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      day: payload.day,
      startTime: payload.startTime,
      endTime: payload.endTime,
      priority: payload.priority,
      notes: payload.notes,
    })
  }

  editorOpen.value = false
}

// --- Duplicate (instan, tanpa dialog) ---
function handleDuplicateActivity(id: string): void {
  routineStore.duplicateRoutineActivity(id)
}

function handleDuplicateRoutine(): void {
  routineStore.duplicateDay(routineStore.selectedDay)
}

// --- Copy ke Hari Lain (butuh dialog pilih hari tujuan) ---
const copyDialogOpen = ref(false)

function handleCopyRoutine(): void {
  copyDialogOpen.value = true
}

function handleCopyDialogClose(): void {
  copyDialogOpen.value = false
}

function handleCopyConfirm(targetDays: RoutineDay[]): void {
  routineStore.copyDayToDays(routineStore.selectedDay, targetDays)
  copyDialogOpen.value = false
}

// --- Delete ---
function handleDeleteActivity(id: string): void {
  routineStore.deleteRoutineActivity(id)
}

// --- Toggle ---
function handleToggleActivity(id: string): void {
  routineStore.toggleRoutineActivity(id)
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <RoutineHeader :selected-day="routineStore.selectedDay" />

    <RoutineDaySelector :selected-day="routineStore.selectedDay" @select="handleSelectDay" />

    <div v-if="routineStore.isLoading" class="py-16 text-center text-sm text-ink-subtle">
      Memuat aktivitas...
    </div>

    <template v-else>
      <RoutineProgress :activities="activities" />

      <RoutineQuickActions
        @add="handleAddActivity"
        @duplicate="handleDuplicateRoutine"
        @copy="handleCopyRoutine"
      />

      <RoutineEmptyState v-if="!hasActivities" @add="handleAddActivity" />

      <div v-else class="space-y-3">
        <RoutineSection
          v-for="group in groupedByCategory"
          :key="group.categoryId"
          :category-id="group.categoryId"
          :activities="group.activities"
          @toggle="handleToggleActivity"
          @edit="handleEditActivity"
          @duplicate="handleDuplicateActivity"
          @delete="handleDeleteActivity"
        />
      </div>

      <RoutineStats />
    </template>

    <RoutineEditorDialog
      :open="editorOpen"
      :mode="editorMode"
      :activity="editingActivity"
      :default-day="routineStore.selectedDay"
      @close="handleEditorClose"
      @submit="handleEditorSubmit"
    />

    <RoutineCopyDialog
      :open="copyDialogOpen"
      :source-day="routineStore.selectedDay"
      @close="handleCopyDialogClose"
      @confirm="handleCopyConfirm"
    />
  </div>
</template>