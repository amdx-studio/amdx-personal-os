import { ipcMain } from 'electron'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/calendarService.js'
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../../src/types/calendarEvent.js'

export function registerCalendarHandlers(): void {
  ipcMain.handle('calendar:get', async () => {
    return getEvents()
  })

  ipcMain.handle('calendar:create', async (_event, input: CreateCalendarEventInput) => {
    return createEvent(input)
  })

  ipcMain.handle(
    'calendar:update',
    async (_event, id: string, input: UpdateCalendarEventInput) => {
      await updateEvent(id, input)
      return true
    },
  )

  ipcMain.handle('calendar:delete', async (_event, id: string) => {
    await deleteEvent(id)
    return true
  })
}