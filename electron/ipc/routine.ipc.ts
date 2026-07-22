import { ipcMain } from 'electron'
import {
  getRoutineActivities,
  createRoutineActivity,
  updateRoutineActivity,
  deleteRoutineActivity,
} from '../services/routineService.js'
import type {
  CreateRoutineActivityInput,
  UpdateRoutineActivityInput,
} from '../../src/types/routine.js'

export function registerRoutineHandlers(): void {
  ipcMain.handle('routine:get', async () => {
    return getRoutineActivities()
  })

  ipcMain.handle('routine:create', async (_event, input: CreateRoutineActivityInput) => {
    return createRoutineActivity(input)
  })

  ipcMain.handle(
    'routine:update',
    async (_event, id: string, input: UpdateRoutineActivityInput) => {
      await updateRoutineActivity(id, input)
      return true
    },
  )

  ipcMain.handle('routine:delete', async (_event, id: string) => {
    await deleteRoutineActivity(id)
    return true
  })
}