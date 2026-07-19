<script setup lang="ts">
import { onMounted } from 'vue'
import { useSettingsStore } from '../stores/useSettingsStore'

const settingsStore = useSettingsStore()

onMounted(() => {
  settingsStore.loadSettings()
})

function cycleTheme(): void {
  const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
  const currentIndex = themes.indexOf(settingsStore.settings.theme)
  const nextTheme = themes[(currentIndex + 1) % themes.length]
  settingsStore.updateSettings({ theme: nextTheme })
}
</script>

<template>
  <div class="rounded-xl border border-border bg-surface p-8">
    <h2 class="text-base font-semibold text-ink">Test Phase 8 — Local JSON Engine</h2>

    <div v-if="settingsStore.isLoading" class="mt-4 text-sm text-ink-muted">
      Memuat settings...
    </div>

    <div v-else class="mt-4 space-y-3">
      <p class="text-sm text-ink-muted">
        Theme saat ini:
        <span class="font-medium text-ink">{{ settingsStore.settings.theme }}</span>
      </p>

      <button
        type="button"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        @click="cycleTheme"
      >
        Ganti Theme
      </button>
    </div>
  </div>
</template>