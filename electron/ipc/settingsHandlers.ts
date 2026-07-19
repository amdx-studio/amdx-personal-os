import { ipcMain } from 'electron'
import { getSettings, saveSettings } from '../services/settingsService.js'
import type { AppSettings } from '../../src/types/settings.js'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    return getSettings()
  })

  ipcMain.handle('settings:save', async (_event, settings: AppSettings) => {
    await saveSettings(settings)
    return true
  })
}