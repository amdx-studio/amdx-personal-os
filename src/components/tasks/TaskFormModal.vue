<script setup lang="ts">
import { reactive, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskCategory,
  TaskStatus,
  TaskPriority,
} from '../../types/task'
import {
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '../../types/task'
import CategoryFields from './CategoryFields.vue'

const props = defineProps<{
  open: boolean
  task?: Task | null // when provided -> edit mode
}>()

const emit = defineEmits<{
  close: []
  save: [payload: CreateTaskInput | UpdateTaskInput]
}>()

interface FormState {
  title: string
  description: string
  category: TaskCategory
  deadlineDate: string // yyyy-mm-dd
  deadlineTime: string // HH:mm
  status: TaskStatus
  priority: TaskPriority
  progress: number
  notes: string
  kuliahDetails: { mataKuliah: string; dosen?: string; pertemuan?: string }
  jokiDetails: { namaClient: string; kontakClient?: string; harga: number; dp: number }
  klienDetails: { namaClient: string; namaProject: string; nilaiProject: number; linkProject?: string }
}

function emptyForm(): FormState {
  return {
    title: '',
    description: '',
    category: 'pribadi',
    deadlineDate: '',
    deadlineTime: '',
    status: 'belum_dimulai',
    priority: 'medium',
    progress: 0,
    notes: '',
    kuliahDetails: { mataKuliah: '', dosen: '', pertemuan: '' },
    jokiDetails: { namaClient: '', kontakClient: '', harga: 0, dp: 0 },
    klienDetails: { namaClient: '', namaProject: '', nilaiProject: 0, linkProject: '' },
  }
}

function formFromTask(task: Task): FormState {
  const base = emptyForm()
  const deadline = task.deadline ? new Date(task.deadline) : null
  return {
    ...base,
    title: task.title,
    description: task.description,
    category: task.category,
    deadlineDate: deadline ? deadline.toISOString().slice(0, 10) : '',
    deadlineTime: deadline ? deadline.toISOString().slice(11, 16) : '',
    status: task.status,
    priority: task.priority,
    progress: task.progress,
    notes: task.notes,
    kuliahDetails: { ...base.kuliahDetails, ...task.kuliahDetails },
    jokiDetails: { ...base.jokiDetails, ...task.jokiDetails },
    klienDetails: { ...base.klienDetails, ...task.klienDetails },
  }
}

const form = reactive<FormState>(props.task ? formFromTask(props.task) : emptyForm())

watch(
  () => [props.open, props.task],
  () => {
    Object.assign(form, props.task ? formFromTask(props.task) : emptyForm())
  }
)

function buildDeadlineIso(): string | null {
  if (!form.deadlineDate) return null
  const time = form.deadlineTime || '23:59'
  return new Date(`${form.deadlineDate}T${time}:00`).toISOString()
}

function handleSubmit(): void {
  if (!form.title.trim()) return

  const basePayload = {
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    deadline: buildDeadlineIso(),
    status: form.status,
    priority: form.priority,
    progress: form.progress,
    notes: form.notes.trim(),
    kuliahDetails: form.category === 'kuliah' ? form.kuliahDetails : undefined,
    jokiDetails: form.category === 'joki' ? form.jokiDetails : undefined,
    klienDetails: form.category === 'klien' ? form.klienDetails : undefined,
  }

  if (props.task) {
    emit('save', { id: props.task.id, ...basePayload } as UpdateTaskInput)
  } else {
    emit('save', basePayload as CreateTaskInput)
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    @click.self="$emit('close')"
  >
    <div class="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-border bg-surface">
      <div class="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 class="text-sm font-semibold text-ink">
          {{ task ? 'Edit Task' : 'Tambah Task Baru' }}
        </h2>
        <button type="button" class="text-ink-subtle hover:text-ink" @click="$emit('close')">
          <X class="h-5 w-5" />
        </button>
      </div>

      <form class="flex-1 space-y-4 overflow-y-auto px-5 py-4" @submit.prevent="handleSubmit">
        <label class="flex flex-col gap-1 text-xs text-ink-muted">
          Judul Task
          <input
            v-model="form.title"
            type="text"
            required
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label class="flex flex-col gap-1 text-xs text-ink-muted">
          Deskripsi
          <textarea
            v-model="form.description"
            rows="3"
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Kategori
            <select
              v-model="form.category"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option v-for="c in TASK_CATEGORIES" :key="c" :value="c">
                {{ TASK_CATEGORY_LABELS[c] }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Status
            <select
              v-model="form.status"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option v-for="s in TASK_STATUSES" :key="s" :value="s">
                {{ TASK_STATUS_LABELS[s] }}
              </option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Prioritas
            <select
              v-model="form.priority"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            >
              <option v-for="p in TASK_PRIORITIES" :key="p" :value="p">
                {{ TASK_PRIORITY_LABELS[p] }}
              </option>
            </select>
          </label>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Tanggal Deadline
            <input
              v-model="form.deadlineDate"
              type="date"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Jam Deadline
            <input
              v-model="form.deadlineTime"
              type="time"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </label>
        </div>

        <label class="flex flex-col gap-1 text-xs text-ink-muted">
          Progress ({{ form.progress }}%)
          <input v-model.number="form.progress" type="range" min="0" max="100" step="5" class="accent-accent" />
        </label>

        <CategoryFields
          :category="form.category"
          v-model:kuliahDetails="form.kuliahDetails"
          v-model:jokiDetails="form.jokiDetails"
          v-model:klienDetails="form.klienDetails"
        />

        <label class="flex flex-col gap-1 text-xs text-ink-muted">
          Catatan
          <textarea
            v-model="form.notes"
            rows="2"
            class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </label>
      </form>

      <div class="flex justify-end gap-2 border-t border-border px-5 py-4">
        <button
          type="button"
          class="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-muted hover:text-ink"
          @click="$emit('close')"
        >
          Batal
        </button>
        <button
          type="button"
          class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
          @click="handleSubmit"
        >
          {{ task ? 'Simpan Perubahan' : 'Tambah Task' }}
        </button>
      </div>
    </div>
  </div>
</template>
