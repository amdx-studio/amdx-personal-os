<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
}>()
</script>

<template>
  <header class="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
    <div class="min-w-0">
      <h1 v-if="title" class="truncate text-lg font-semibold text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="truncate text-xs text-ink-muted">{{ subtitle }}</p>
    </div>
  </header>
</template>