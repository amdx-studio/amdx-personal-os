import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../types/calendarEvent'

export async function fetchEvents(): Promise<CalendarEvent[]> {
  return window.electronAPI.calendar.get()
}

export async function addEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  return window.electronAPI.calendar.create(input)
}

export async function editEvent(
  id: string,
  input: UpdateCalendarEventInput,
): Promise<boolean> {
  return window.electronAPI.calendar.update(id, input)
}

export async function removeEvent(id: string): Promise<boolean> {
  return window.electronAPI.calendar.delete(id)
}