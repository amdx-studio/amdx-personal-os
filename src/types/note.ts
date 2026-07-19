export interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export type CreateNoteInput = Pick<Note, 'title' | 'content'>
export type UpdateNoteInput = Partial<Pick<Note, 'title' | 'content'>>