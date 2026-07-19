import { ipcMain } from 'electron'
import { getTasks, createTask, toggleTask, deleteTask } from '../services/tasksService.js'
import type { CreateTaskInput } from '../../src/types/task.js'

export function registerTasksHandlers(): void {
  ipcMain.handle('tasks:get', async () => {
    return getTasks()
  })

  ipcMain.handle('tasks:create', async (_event, input: CreateTaskInput) => {
    return createTask(input)
  })

  ipcMain.handle('tasks:toggle', async (_event, id: string) => {
    await toggleTask(id)
    return true
  })

  ipcMain.handle('tasks:delete', async (_event, id: string) => {
    await deleteTask(id)
    return true
  })
}