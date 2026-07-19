import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchEvents, addEvent, editEvent, removeEvent } from '../services/calendarService'
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../types/calendarEvent'

export const useCalendarStore = defineStore('calendar', () => {
  const events = ref<CalendarEvent[]>([])
  const isLoading = ref(false)

  // Diurutkan berdasarkan tanggal, lalu jam (event tanpa jam ditaruh duluan)
  const sortedEvents = computed<CalendarEvent[]>(() => {
    return [...events.value].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      if (!a.time && !b.time) return 0
      if (!a.time) return -1
      if (!b.time) return 1
      return a.time.localeCompare(b.time)
    })
  })

  // Dikelompokkan per tanggal, siap untuk ditampilkan sebagai agenda list
  const eventsByDate = computed<Map<string, CalendarEvent[]>>(() => {
    const groups = new Map<string, CalendarEvent[]>()
    for (const event of sortedEvents.value) {
      const bucket = groups.get(event.date) ?? []
      bucket.push(event)
      groups.set(event.date, bucket)
    }
    return groups
  })

  async function loadEvents(): Promise<void> {
    isLoading.value = true
    try {
      events.value = await fetchEvents()
    } finally {
      isLoading.value = false
    }
  }

  async function createEvent(input: CreateCalendarEventInput): Promise<void> {
    const newEvent = await addEvent(input)
    events.value = [...events.value, newEvent]
  }

  async function updateEvent(id: string, input: UpdateCalendarEventInput): Promise<void> {
    events.value = events.value.map((event) =>
      event.id === id ? { ...event, ...input } : event,
    )
    await editEvent(id, input)
  }

  async function deleteEvent(id: string): Promise<void> {
    events.value = events.value.filter((event) => event.id !== id)
    await removeEvent(id)
  }

  return {
    events,
    isLoading,
    sortedEvents,
    eventsByDate,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  }
})