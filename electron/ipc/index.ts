import { registerSettingsHandlers } from './settingsHandlers.js'
import { registerTasksHandlers } from './tasksHandlers.js'

import { registerNotesHandlers } from './notesHandlers.js'

import { registerFinanceHandlers } from './financeHandlers.js'
import { registerGoalsHandlers } from './goalsHandlers.js'


export function registerAllIpcHandlers(): void {
  registerSettingsHandlers()
  registerTasksHandlers()

  registerNotesHandlers()

  registerFinanceHandlers()
  registerGoalsHandlers()

  // Statistics (10.8) tidak butuh handler baru — cukup agregasi dari data modul lain
}