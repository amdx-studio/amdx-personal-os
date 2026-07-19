<script setup lang="ts">
import { ref, watch } from 'vue'
import { X, Copy, CheckCircle2, CalendarClock, Archive, Trash2, Pencil } from 'lucide-vue-next'
import type { Task } from '../../types/task'
import {
  TASK_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '../../types/task'
import {
  CATEGORY_BADGE_CLASSES,
  PRIORITY_BADGE_CLASSES,
  STATUS_BADGE_CLASSES,
  formatDeadline,
  formatCurrency,
} from '../../utils/taskStyles'
import TaskBadge from './TaskBadge.vue'

const props = defineProps<{
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  edit: [task: Task]
  delete: [id: string]
  duplicate: [id: string]
  markDone: [id: string]
  extendDeadline: [id: string, newDeadline: string]
  archive: [id: string, archived: boolean]
  updateProgress: [id: string, progress: number]
  updateNotes: [id: string, notes: string]
}>()

const localProgress = ref(0)
const localNotes = ref('')
const showExtendInput = ref(false)
const extendValue = ref('')

watch(
  () => props.task,
  (t) => {
    localProgress.value = t?.progress ?? 0
    localNotes.value = t?.notes ?? ''
    showExtendInput.value = false
    extendValue.value = ''
  },
  { immediate: true }
)

function commitProgress(): void {
  if (props.task) emit('updateProgress', props.task.id, localProgress.value)
}

function commitNotes(): void {
  if (props.task) emit('updateNotes', props.task.id, localNotes.value)
}

function confirmExtend(): void {
  if (props.task && extendValue.value) {
    emit('extendDeadline', props.task.id, new Date(extendValue.value).toISOString())
    showExtendInput.value = false
  }
}
</script>

<template>
  <transition name="fade">
    <div v-if="task" class="fixed inset-0 z-40 flex justify-end bg-black/40" @click.self="$emit('close')">
      <aside class="flex h-full w-full max-w-md flex-col border-l border-border bg-surface">
        <div class="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 class="text-sm font-semibold text-ink">Detail Task</h2>
          <button type="button" class="text-ink-subtle hover:text-ink" @click="$emit('close')">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <h3 class="text-base font-semibold text-ink">{{ task.title }}</h3>
            <p v-if="task.description" class="mt-1 text-sm text-ink-muted">{{ task.description }}</p>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <TaskBadge :label="TASK_CATEGORY_LABELS[task.category]" :classes="CATEGORY_BADGE_CLASSES[task.category]" />
            <TaskBadge :label="TASK_PRIORITY_LABELS[task.priority]" :classes="PRIORITY_BADGE_CLASSES[task.priority]" />
            <TaskBadge :label="TASK_STATUS_LABELS[task.status]" :classes="STATUS_BADGE_CLASSES[task.status]" />
          </div>

          <div class="space-y-1 text-sm">
            <p class="text-ink-muted">Deadline: <span class="text-ink">{{ formatDeadline(task.deadline) }}</span></p>
            <p class="text-ink-muted">Dibuat: <span class="text-ink">{{ formatDeadline(task.createdAt) }}</span></p>
            <p v-if="task.completedAt" class="text-ink-muted">
              Selesai: <span class="text-ink">{{ formatDeadline(task.completedAt) }}</span>
            </p>
          </div>

          <!-- Category-specific read-only details -->
          <div v-if="task.category === 'kuliah' && task.kuliahDetails" class="rounded-lg border border-border p-3 text-sm">
            <p class="text-ink">Mata Kuliah: <span class="font-medium">{{ task.kuliahDetails.mataKuliah }}</span></p>
            <p v-if="task.kuliahDetails.dosen" class="text-ink-muted">Dosen: {{ task.kuliahDetails.dosen }}</p>
            <p v-if="task.kuliahDetails.pertemuan" class="text-ink-muted">Pertemuan: {{ task.kuliahDetails.pertemuan }}</p>
          </div>

          <div v-else-if="task.category === 'joki' && task.jokiDetails" class="rounded-lg border border-border p-3 text-sm space-y-0.5">
            <p class="text-ink">Client: <span class="font-medium">{{ task.jokiDetails.namaClient }}</span></p>
            <p v-if="task.jokiDetails.kontakClient" class="text-ink-muted">Kontak: {{ task.jokiDetails.kontakClient }}</p>
            <p class="text-ink-muted">Harga: {{ formatCurrency(task.jokiDetails.harga) }}</p>
            <p class="text-ink-muted">DP: {{ formatCurrency(task.jokiDetails.dp) }}</p>
            <p class="text-ink-muted">
              Sisa: {{ formatCurrency(task.jokiDetails.harga - task.jokiDetails.dp) }}
            </p>
          </div>

          <div v-else-if="task.category === 'klien' && task.klienDetails" class="rounded-lg border border-border p-3 text-sm space-y-0.5">
            <p class="text-ink">Client: <span class="font-medium">{{ task.klienDetails.namaClient }}</span></p>
            <p class="text-ink-muted">Project: {{ task.klienDetails.namaProject }}</p>
            <p class="text-ink-muted">Nilai: {{ formatCurrency(task.klienDetails.nilaiProject) }}</p>
            <a
              v-if="task.klienDetails.linkProject"
              :href="task.klienDetails.linkProject"
              target="_blank"
              rel="noopener"
              class="text-accent underline"
            >
              Buka Link Project
            </a>
          </div>

          <!-- Progress -->
          <div>
            <div class="mb-1 flex items-center justify-between text-xs text-ink-muted">
              <span>Progress</span>
              <span>{{ localProgress }}%</span>
            </div>
            <input
              v-model.number="localProgress"
              type="range"
              min="0"
              max="100"
              step="5"
              class="w-full accent-accent"
              @change="commitProgress"
            />
          </div>

          <!-- Notes -->
          <label class="flex flex-col gap-1 text-xs text-ink-muted">
            Catatan
            <textarea
              v-model="localNotes"
              rows="3"
              class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              @blur="commitNotes"
            />
          </label>

          <!-- Quick actions -->
          <div class="space-y-2">
            <p class="text-xs font-medium uppercase tracking-wide text-ink-subtle">Quick Actions</p>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink"
                @click="$emit('duplicate', task.id)"
              >
                <Copy class="h-3.5 w-3.5" /> Duplicate
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink"
                @click="$emit('markDone', task.id)"
              >
                <CheckCircle2 class="h-3.5 w-3.5" /> Mark as Done
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink"
                @click="showExtendInput = !showExtendInput"
              >
                <CalendarClock class="h-3.5 w-3.5" /> Extend Deadline
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:text-ink"
                @click="$emit('archive', task.id, !task.archived)"
              >
                <Archive class="h-3.5 w-3.5" /> {{ task.archived ? 'Unarchive' : 'Archive' }}
              </button>
            </div>
            <div v-if="showExtendInput" class="flex gap-2">
              <input
                v-model="extendValue"
                type="datetime-local"
                class="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
              <button
                type="button"
                class="rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white hover:bg-accent-hover"
                @click="confirmExtend"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between gap-2 border-t border-border px-5 py-4">
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
            @click="$emit('delete', task.id)"
          >
            <Trash2 class="h-4 w-4" /> Hapus
          </button>
          <button
            type="button"
            class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
            @click="$emit('edit', task)"
          >
            <Pencil class="h-4 w-4" /> Edit
          </button>
        </div>
      </aside>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
