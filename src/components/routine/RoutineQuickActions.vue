<script setup lang="ts">
import { Plus, Copy, CopyPlus } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'add'): void
  (event: 'duplicate'): void
  (event: 'copy'): void
}>()
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      @click="emit('add')"
    >
      <Plus class="h-4 w-4" />
      Tambah Aktivitas
    </button>

    <button
      type="button"
      class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      @click="emit('duplicate')"
    >
      <CopyPlus class="h-4 w-4" />
      Duplicate Routine
    </button>

    <button
      type="button"
      class="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
      @click="emit('copy')"
    >
      <Copy class="h-4 w-4" />
      Copy ke Hari Lain
    </button>
  </div>
</template>