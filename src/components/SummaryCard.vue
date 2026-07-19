<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
  label: string
  value: string
  icon: Component
  isPlaceholder?: boolean
}

withDefaults(defineProps<Props>(), {
  isPlaceholder: false,
})
</script>

<template>
  <div class="rounded-xl border border-border bg-surface p-5">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-bg-soft text-accent">
        <component :is="icon" class="h-5 w-5" />
      </div>
      <div>
        <p class="text-xs text-ink-muted">{{ label }}</p>
        <p class="text-lg font-semibold text-ink">{{ value }}</p>
      </div>
    </div>
    <p v-if="isPlaceholder" class="mt-3 text-xs text-ink-subtle">
      Data akan aktif setelah modul ini dibangun (Phase 10)
    </p>
  </div>
</template>