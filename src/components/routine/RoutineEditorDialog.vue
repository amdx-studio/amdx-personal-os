<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { ROUTINE_CATEGORIES } from '../../constants/routineCategories'
import { ROUTINE_DAYS } from '../../constants/routineDays'
import type {
  RoutineActivity,
  RoutineCategoryId,
  RoutineDay,
  RoutinePriority,
} from '../../types/routine'

const props = defineProps<{
  open: boolean
  mode: 'create' | 'edit'
  activity: RoutineActivity | null
  defaultDay: RoutineDay
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (
    event: 'submit',
    payload: {
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
    },
  ): void
}>()

const title = ref('')
const description = ref('')
const category = ref<RoutineCategoryId>('personal')
const day = ref<RoutineDay>(props.defaultDay)
const startTime = ref('')
const endTime = ref('')
const priority = ref<RoutinePriority>('medium')
const notes = ref('')

const errors = ref<{ title?: string; startTime?: string; endTime?: string }>({})

function resetForm(): void {
  if (props.mode === 'edit' && props.activity) {
    title.value = props.activity.title
    description.value = props.activity.description
    category.value = props.activity.category
    day.value = props.activity.day
    startTime.value = props.activity.startTime
    endTime.value = props.activity.endTime
    priority.value = props.activity.priority
    notes.value = props.activity.notes
  } else {
    title.value = ''
    description.value = ''
    category.value = 'personal'
    day.value = props.defaultDay
    startTime.value = ''
    endTime.value = ''
    priority.value = 'medium'
    notes.value = ''
  }
  errors.value = {}
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  },
)

const dialogTitle = computed(() =>
  props.mode === 'edit' ? 'Edit Aktivitas' : 'Tambah Aktivitas',
)

function validate(): boolean {
  const nextErrors: typeof errors.value = {}

  if (!title.value.trim()) {
    nextErrors.title = 'Judul aktivitas wajib diisi'
  }

  if (!startTime.value) {
    nextErrors.startTime = 'Waktu mulai wajib diisi'
  }

  if (endTime.value && startTime.value && endTime.value <= startTime.value) {
    nextErrors.endTime = 'Waktu selesai harus setelah waktu mulai'
  }

  errors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function handleSubmit(): void {
  if (!validate()) return

  emit('submit', {
    mode: props.mode,
    id: props.mode === 'edit' && props.activity ? props.activity.id : null,
    title: title.value.trim(),
    description: description.value.trim(),
    category: category.value,
    day: day.value,
    startTime: startTime.value,
    endTime: endTime.value,
    priority: priority.value,
    notes: notes.value.trim(),
  })
}

function handleClose(): void {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="handleClose"
      @keydown.esc="handleClose"
    >
      <div class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-6">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-ink">{{ dialogTitle }}</h2>
          <button
            type="button"
            class="flex h-7 w-7 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-muted hover:text-ink"
            aria-label="Tutup"
            @click="handleClose"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div>
            <label class="mb-1 block text-xs font-medium text-ink-muted">Judul</label>
            <input
              v-model="title"
              type="text"
              placeholder="Mis. Sholat Subuh"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <p v-if="errors.title" class="mt-1 text-xs text-red-500">{{ errors.title }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-ink-muted">Deskripsi</label>
            <textarea
              v-model="description"
              rows="2"
              placeholder="Opsional"
              class="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-ink-muted">Kategori</label>
              <select
                v-model="category"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option v-for="item in ROUTINE_CATEGORIES" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="mb-1 block text-xs font-medium text-ink-muted">Hari</label>
              <select
                v-model="day"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              >
                <option v-for="item in ROUTINE_DAYS" :key="item.id" :value="item.id">
                  {{ item.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-ink-muted">Waktu Mulai</label>
              <input
                v-model="startTime"
                type="time"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <p v-if="errors.startTime" class="mt-1 text-xs text-red-500">
                {{ errors.startTime }}
              </p>
            </div>

            <div>
              <label class="mb-1 block text-xs font-medium text-ink-muted">Waktu Selesai</label>
              <input
                v-model="endTime"
                type="time"
                class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <p v-if="errors.endTime" class="mt-1 text-xs text-red-500">
                {{ errors.endTime }}
              </p>
            </div>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-ink-muted">Prioritas</label>
            <select
              v-model="priority"
              class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label class="mb-1 block text-xs font-medium text-ink-muted">Catatan</label>
            <textarea
              v-model="notes"
              rows="2"
              placeholder="Opsional"
              class="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button
              type="button"
              class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
              @click="handleClose"
            >
              Batal
            </button>
            <button
              type="submit"
              class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {{ mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Aktivitas' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>