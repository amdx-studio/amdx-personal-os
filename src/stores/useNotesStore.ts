import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchNotes, addNote, editNote, removeNote } from '../services/notesService'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../types/note'

export const useNotesStore = defineStore('notes', () => {
  const notes = ref<Note[]>([])
  const isLoading = ref(false)

  async function loadNotes(): Promise<void> {
    isLoading.value = true
    try {
      notes.value = await fetchNotes()
    } finally {
      isLoading.value = false
    }
  }

  async function createNote(input: CreateNoteInput): Promise<void> {
    const newNote = await addNote(input)
    notes.value = [...notes.value, newNote]
  }

  async function updateNote(id: string, input: UpdateNoteInput): Promise<void> {
    const now = new Date().toISOString()

    notes.value = notes.value.map((note) =>
      note.id === id ? { ...note, ...input, updatedAt: now } : note,
    )

    await editNote(id, input)
  }

  async function deleteNote(id: string): Promise<void> {
    notes.value = notes.value.filter((note) => note.id !== id)
    await removeNote(id)
  }

  return {
    notes,
    isLoading,
    loadNotes,
    createNote,
    updateNote,
    deleteNote,
  }
})