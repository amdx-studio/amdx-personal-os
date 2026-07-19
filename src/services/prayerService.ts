import type { PrayerSettings } from '../types/prayerSettings'

export async function fetchPrayerSettings(): Promise<PrayerSettings> {
  return window.electronAPI.prayer.getSettings()
}

export async function savePrayerSettings(settings: PrayerSettings): Promise<boolean> {
  return window.electronAPI.prayer.saveSettings(settings)
}