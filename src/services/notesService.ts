import type { Note, CreateNoteInput, UpdateNoteInput } from '../types/note'

export async function fetchNotes(): Promise<Note[]> {
  return window.electronAPI.notes.get()
}

export async function addNote(input: CreateNoteInput): Promise<Note> {
  return window.electronAPI.notes.create(input)
}

export async function editNote(id: string, input: UpdateNoteInput): Promise<boolean> {
  return window.electronAPI.notes.update(id, input)
}

export async function removeNote(id: string): Promise<boolean> {
  return window.electronAPI.notes.delete(id)
}