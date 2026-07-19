import { ipcMain } from 'electron'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask,
  markTaskDone,
  extendDeadline,
  archiveTask,
} from '../services/tasksService.js'
import type { CreateTaskInput, UpdateTaskInput } from '../../src/types/task.js'

export function registerTasksHandlers(): void {
  ipcMain.handle('tasks:get', async () => {
    return getTasks()
  })

  ipcMain.handle('tasks:create', async (_event, input: CreateTaskInput) => {
    return createTask(input)
  })

  ipcMain.handle('tasks:update', async (_event, input: UpdateTaskInput) => {
    return updateTask(input)
  })

  ipcMain.handle('tasks:delete', async (_event, id: string) => {
    await deleteTask(id)
    return true
  })

  ipcMain.handle('tasks:duplicate', async (_event, id: string) => {
    return duplicateTask(id)
  })

  ipcMain.handle('tasks:markDone', async (_event, id: string) => {
    return markTaskDone(id)
  })

  ipcMain.handle('tasks:extendDeadline', async (_event, id: string, newDeadline: string) => {
    return extendDeadline(id, newDeadline)
  })

  ipcMain.handle('tasks:archive', async (_event, id: string, archived: boolean) => {
    return archiveTask(id, archived)
  })
}
