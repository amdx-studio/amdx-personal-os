import { ipcMain } from 'electron'
import { getNotes, createNote, updateNote, deleteNote } from '../services/notesService.js'
import type { CreateNoteInput, UpdateNoteInput } from '../../src/types/note.js'

export function registerNotesHandlers(): void {
  ipcMain.handle('notes:get', async () => {
    return getNotes()
  })

  ipcMain.handle('notes:create', async (_event, input: CreateNoteInput) => {
    return createNote(input)
  })

  ipcMain.handle('notes:update', async (_event, id: string, input: UpdateNoteInput) => {
    await updateNote(id, input)
    return true
  })

  ipcMain.handle('notes:delete', async (_event, id: string) => {
    await deleteNote(id)
    return true
  })
}