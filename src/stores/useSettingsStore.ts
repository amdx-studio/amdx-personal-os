import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchSettings, persistSettings } from '../services/settingsService'
import { DEFAULT_SETTINGS } from '../types/settings'
import type { AppSettings } from '../types/settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AppSettings>(DEFAULT_SETTINGS)
  const isLoading = ref(false)

  async function loadSettings(): Promise<void> {
    isLoading.value = true
    try {
      settings.value = await fetchSettings()
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(partial: Partial<AppSettings>): Promise<void> {
    const updated = { ...settings.value, ...partial }
    settings.value = updated
    await persistSettings(updated)
  }

  return {
    settings,
    isLoading,
    loadSettings,
    updateSettings,
  }
})