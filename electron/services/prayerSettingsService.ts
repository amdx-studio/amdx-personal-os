import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { PrayerSettings } from '../../src/types/prayerSettings.js'
import { DEFAULT_PRAYER_SETTINGS } from '../../src/types/prayerSettings.js'

const PRAYER_SETTINGS_FILE = 'prayerSettings.json'

export async function getPrayerSettings(): Promise<PrayerSettings> {
  return readJsonFile<PrayerSettings>(PRAYER_SETTINGS_FILE, DEFAULT_PRAYER_SETTINGS)
}

export async function savePrayerSettings(settings: PrayerSettings): Promise<boolean> {
  await writeJsonFile<PrayerSettings>(PRAYER_SETTINGS_FILE, settings)
  return true
}