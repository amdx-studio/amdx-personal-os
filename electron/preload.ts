import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings } from '../src/types/settings.js'
import type { Task, CreateTaskInput } from '../src/types/task.js'
import type { Habit, CreateHabitInput } from '../src/types/habit.js'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../src/types/note.js'
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from '../src/types/calendarEvent.js'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../src/types/transaction.js'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../src/types/goal.js'
import type { PrayerSettings } from '../src/types/prayerSettings.js'

const electronAPI = {
  app: {
    getVersion: (): Promise<string> => ipcRenderer.invoke('app:get-version'),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    save: (settings: AppSettings): Promise<boolean> =>
      ipcRenderer.invoke('settings:save', settings),
  },
  tasks: {
    get: (): Promise<Task[]> => ipcRenderer.invoke('tasks:get'),
    create: (input: CreateTaskInput): Promise<Task> =>
      ipcRenderer.invoke('tasks:create', input),
    toggle: (id: string): Promise<boolean> => ipcRenderer.invoke('tasks:toggle', id),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('tasks:delete', id),
  },
  habits: {
    get: (): Promise<Habit[]> => ipcRenderer.invoke('habits:get'),
    create: (input: CreateHabitInput): Promise<Habit> =>
      ipcRenderer.invoke('habits:create', input),
    toggleToday: (id: string): Promise<boolean> =>
      ipcRenderer.invoke('habits:toggleToday', id),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('habits:delete', id),
  },
  notes: {
    get: (): Promise<Note[]> => ipcRenderer.invoke('notes:get'),
    create: (input: CreateNoteInput): Promise<Note> =>
      ipcRenderer.invoke('notes:create', input),
    update: (id: string, input: UpdateNoteInput): Promise<boolean> =>
      ipcRenderer.invoke('notes:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('notes:delete', id),
  },
  calendar: {
    get: (): Promise<CalendarEvent[]> => ipcRenderer.invoke('calendar:get'),
    create: (input: CreateCalendarEventInput): Promise<CalendarEvent> =>
      ipcRenderer.invoke('calendar:create', input),
    update: (id: string, input: UpdateCalendarEventInput): Promise<boolean> =>
      ipcRenderer.invoke('calendar:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('calendar:delete', id),
  },
  finance: {
    get: (): Promise<Transaction[]> => ipcRenderer.invoke('finance:get'),
    create: (input: CreateTransactionInput): Promise<Transaction> =>
      ipcRenderer.invoke('finance:create', input),
    update: (id: string, input: UpdateTransactionInput): Promise<boolean> =>
      ipcRenderer.invoke('finance:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('finance:delete', id),
  },
  goals: {
    get: (): Promise<Goal[]> => ipcRenderer.invoke('goals:get'),
    create: (input: CreateGoalInput): Promise<Goal> =>
      ipcRenderer.invoke('goals:create', input),
    update: (id: string, input: UpdateGoalInput): Promise<boolean> =>
      ipcRenderer.invoke('goals:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('goals:delete', id),
  },
  prayer: {
    getSettings: (): Promise<PrayerSettings> => ipcRenderer.invoke('prayer:getSettings'),
    saveSettings: (settings: PrayerSettings): Promise<boolean> =>
      ipcRenderer.invoke('prayer:saveSettings', settings),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI