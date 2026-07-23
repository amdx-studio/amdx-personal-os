<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import { ROUTINE_DAYS, getRoutineDayLabel } from '../../constants/routineDays'
import type { RoutineDay } from '../../types/routine'

const props = defineProps<{
  open: boolean
  sourceDay: RoutineDay
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'confirm', targetDays: RoutineDay[]): void
}>()

const selectedDays = ref<RoutineDay[]>([])

const availableDays = computed(() => ROUTINE_DAYS.filter((d) => d.id !== props.sourceDay))

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) selectedDays.value = []
  },
)

function toggleDay(day: RoutineDay): void {
  if (selectedDays.value.includes(day)) {
    selectedDays.value = selectedDays.value.filter((d) => d !== day)
  } else {
    selectedDays.value = [...selectedDays.value, day]
  }
}

function handleClose(): void {
  emit('close')
}

function handleConfirm(): void {
  if (selectedDays.value.length === 0) return
  emit('confirm', selectedDays.value)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="handleClose"
    >
      <div class="w-full max-w-sm rounded-xl border border-border bg-surface p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-ink">Copy Routine ke Hari Lain</h2>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink"
            aria-label="Tutup"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <p class="mb-3 text-sm text-ink-muted">
          Salin seluruh aktivitas {{ getRoutineDayLabel(sourceDay) }} ke:
        </p>

        <div class="mb-5 space-y-1">
          <label
            v-for="item in availableDays"
            :key="item.id"
            class="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-muted"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-border accent-accent"
              :checked="selectedDays.includes(item.id)"
              @change="toggleDay(item.id)"
            />
            <span class="text-sm text-ink">{{ item.label }}</span>
          </label>
        </div>

        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
            @click="handleClose"
          >
            Batal
          </button>
          <button
            type="button"
            class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="selectedDays.length === 0"
            @click="handleConfirm"
          >
            Salin
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>