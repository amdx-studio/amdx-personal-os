import { readJsonFile, writeJsonFile } from './jsonStore.js'
import { DEFAULT_SETTINGS } from '../../src/types/settings.js'
import type { AppSettings } from '../../src/types/settings.js'

const SETTINGS_FILE = 'settings.json'

export async function getSettings(): Promise<AppSettings> {
  return readJsonFile<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS)
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeJsonFile<AppSettings>(SETTINGS_FILE, settings)
}