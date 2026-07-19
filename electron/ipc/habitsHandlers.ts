import { ipcMain } from 'electron'
import { getHabits, createHabit, toggleHabitToday, deleteHabit } from '../services/habitsService.js'
import type { CreateHabitInput } from '../../src/types/habit.js'

export function registerHabitsHandlers(): void {
  ipcMain.handle('habits:get', async () => {
    return getHabits()
  })

  ipcMain.handle('habits:create', async (_event, input: CreateHabitInput) => {
    return createHabit(input)
  })

  ipcMain.handle('habits:toggleToday', async (_event, id: string) => {
    await toggleHabitToday(id)
    return true
  })

  ipcMain.handle('habits:delete', async (_event, id: string) => {
    await deleteHabit(id)
    return true
  })
}