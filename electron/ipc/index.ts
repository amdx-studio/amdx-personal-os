import { registerSettingsHandlers } from './settingsHandlers.js'
import { registerTasksHandlers } from './tasksHandlers.js'
import { registerHabitsHandlers } from './habitsHandlers.js'
import { registerNotesHandlers } from './notesHandlers.js'
import { registerCalendarHandlers } from './calendarHandlers.js'
import { registerFinanceHandlers } from './financeHandlers.js'
import { registerGoalsHandlers } from './goalsHandlers.js'
import { registerPrayerHandlers } from './prayerHandlers.js'

export function registerAllIpcHandlers(): void {
  registerSettingsHandlers()
  registerTasksHandlers()
  registerHabitsHandlers()
  registerNotesHandlers()
  registerCalendarHandlers()
  registerFinanceHandlers()
  registerGoalsHandlers()
  registerPrayerHandlers()
  // Statistics (10.8) tidak butuh handler baru — cukup agregasi dari data modul lain
}