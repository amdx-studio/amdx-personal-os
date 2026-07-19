import type { AppSettings } from '../types/settings'

export async function fetchSettings(): Promise<AppSettings> {
  return window.electronAPI.settings.get()
}

export async function persistSettings(settings: AppSettings): Promise<boolean> {
  return window.electronAPI.settings.save(settings)
}