<script setup lang="ts">
import { Search, Plus, Archive } from 'lucide-vue-next'
import {
  TASK_CATEGORIES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '../../types/task'
import type { TaskFilters } from '../../types/task'

const filters = defineModel<TaskFilters>('filters', { required: true })

defineEmits<{
  addTask: []
}>()
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:flex-wrap">
    <div class="relative flex-1 min-w-[180px]">
      <Search class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" />
      <input
        v-model="filters.search"
        type="text"
        placeholder="Cari task..."
        class="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-accent"
      />
    </div>

    <select
      v-model="filters.category"
      class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
    >
      <option value="all">Semua Kategori</option>
      <option v-for="c in TASK_CATEGORIES" :key="c" :value="c">
        {{ TASK_CATEGORY_LABELS[c] }}
      </option>
    </select>

    <select
      v-model="filters.status"
      class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
    >
      <option value="all">Semua Status</option>
      <option v-for="s in TASK_STATUSES" :key="s" :value="s">
        {{ TASK_STATUS_LABELS[s] }}
      </option>
    </select>

    <select
      v-model="filters.priority"
      class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
    >
      <option value="all">Semua Prioritas</option>
      <option v-for="p in TASK_PRIORITIES" :key="p" :value="p">
        {{ TASK_PRIORITY_LABELS[p] }}
      </option>
    </select>

    <select
      v-model="filters.sortBy"
      class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
    >
      <option value="deadline_asc">Deadline Terdekat</option>
      <option value="deadline_desc">Deadline Terjauh</option>
      <option value="priority">Prioritas</option>
      <option value="created_desc">Terbaru Dibuat</option>
    </select>

    <button
      type="button"
      class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors"
      :class="filters.showArchived ? 'bg-accent/10 text-accent border-accent' : 'text-ink-muted hover:text-ink'"
      @click="filters.showArchived = !filters.showArchived"
    >
      <Archive class="h-4 w-4" />
      Archive
    </button>

    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:ml-auto"
      @click="$emit('addTask')"
    >
      <Plus class="h-4 w-4" />
      Tambah Task
    </button>
  </div>
</template>
