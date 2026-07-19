export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date, format YYYY-MM-DD
  time: string | null // format HH:mm, null jika sepanjang hari
  description: string
  createdAt: string
}

export type CreateCalendarEventInput = Pick<CalendarEvent, 'title' | 'date'> &
  Partial<Pick<CalendarEvent, 'time' | 'description'>>

export type UpdateCalendarEventInput = Partial<
  Pick<CalendarEvent, 'title' | 'date' | 'time' | 'description'>
>