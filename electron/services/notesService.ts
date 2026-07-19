import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../../src/types/note.js'

const NOTES_FILE = 'notes.json'
const DEFAULT_NOTES: Note[] = []

export async function getNotes(): Promise<Note[]> {
  return readJsonFile<Note[]>(NOTES_FILE, DEFAULT_NOTES)
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  const notes = await getNotes()

  const now = new Date().toISOString()
  const newNote: Note = {
    id: randomUUID(),
    title: input.title,
    content: input.content,
    createdAt: now,
    updatedAt: now,
  }

  await writeJsonFile<Note[]>(NOTES_FILE, [...notes, newNote])
  return newNote
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<void> {
  const notes = await getNotes()

  const updated = notes.map((note) => {
    if (note.id !== id) return note

    return {
      ...note,
      ...input,
      updatedAt: new Date().toISOString(),
    }
  })

  await writeJsonFile<Note[]>(NOTES_FILE, updated)
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes()
  const updated = notes.filter((note) => note.id !== id)
  await writeJsonFile<Note[]>(NOTES_FILE, updated)
}