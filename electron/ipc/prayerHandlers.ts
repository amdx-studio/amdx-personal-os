import { ipcMain } from 'electron'
import { getPrayerSettings, savePrayerSettings } from '../services/prayerSettingsService.js'
import type { PrayerSettings } from '../../src/types/prayerSettings.js'

export function registerPrayerHandlers(): void {
  ipcMain.handle('prayer:getSettings', async () => {
    return getPrayerSettings()
  })

  ipcMain.handle('prayer:saveSettings', async (_event, settings: PrayerSettings) => {
    return savePrayerSettings(settings)
  })
}