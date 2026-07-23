<script setup lang="ts">
import { CalendarClock, Plus } from 'lucide-vue-next'

const emit = defineEmits<{
  (event: 'add'): void
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
      <CalendarClock class="h-6 w-6 text-ink-subtle" />
    </div>
    <div>
      <p class="text-sm font-medium text-ink">Belum ada aktivitas</p>
      <p class="text-xs text-ink-subtle">Tambahkan aktivitas pertama untuk hari ini</p>
    </div>
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      @click="emit('add')"
    >
      <Plus class="h-4 w-4" />
      Tambah Aktivitas
    </button>
  </div>
</template>