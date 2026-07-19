<script setup lang="ts">
import { Search, Bell } from 'lucide-vue-next'

interface Props {
  title: string
  subtitle?: string
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
})
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-border bg-surface px-6">
    <div>
      <h1 class="text-lg font-semibold text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="text-xs text-ink-muted">{{ subtitle }}</p>
    </div>

    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        aria-label="Search"
      >
        <Search class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        aria-label="Notifications"
      >
        <Bell class="h-4 w-4" />
      </button>
    </div>
  </header>
</template>