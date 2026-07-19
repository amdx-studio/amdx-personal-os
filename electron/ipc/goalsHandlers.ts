import { ipcMain } from 'electron'
import { getGoals, createGoal, updateGoal, deleteGoal } from '../services/goalsService.js'
import type { CreateGoalInput, UpdateGoalInput } from '../../src/types/goal.js'

export function registerGoalsHandlers(): void {
  ipcMain.handle('goals:get', async () => {
    return getGoals()
  })

  ipcMain.handle('goals:create', async (_event, input: CreateGoalInput) => {
    return createGoal(input)
  })

  ipcMain.handle('goals:update', async (_event, id: string, input: UpdateGoalInput) => {
    await updateGoal(id, input)
    return true
  })

  ipcMain.handle('goals:delete', async (_event, id: string) => {
    await deleteGoal(id)
    return true
  })
}