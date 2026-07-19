import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../../src/types/calendarEvent.js'

const CALENDAR_FILE = 'calendar.json'
const DEFAULT_EVENTS: CalendarEvent[] = []

export async function getEvents(): Promise<CalendarEvent[]> {
  return readJsonFile<CalendarEvent[]>(CALENDAR_FILE, DEFAULT_EVENTS)
}

export async function createEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const events = await getEvents()

  const newEvent: CalendarEvent = {
    id: randomUUID(),
    title: input.title,
    date: input.date,
    time: input.time ?? null,
    description: input.description ?? '',
    createdAt: new Date().toISOString(),
  }

  await writeJsonFile<CalendarEvent[]>(CALENDAR_FILE, [...events, newEvent])
  return newEvent
}

export async function updateEvent(id: string, input: UpdateCalendarEventInput): Promise<void> {
  const events = await getEvents()

  const updated = events.map((event) => (event.id === id ? { ...event, ...input } : event))

  await writeJsonFile<CalendarEvent[]>(CALENDAR_FILE, updated)
}

export async function deleteEvent(id: string): Promise<void> {
  const events = await getEvents()
  const updated = events.filter((event) => event.id !== id)
  await writeJsonFile<CalendarEvent[]>(CALENDAR_FILE, updated)
}