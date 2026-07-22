import { contextBridge, ipcRenderer } from 'electron'
import type { AppSettings } from '../src/types/settings.js'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../src/types/task.js'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../src/types/note.js'
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
} from '../src/types/transaction.js'
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../src/types/goal.js'

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
    update: (input: UpdateTaskInput): Promise<Task> =>
      ipcRenderer.invoke('tasks:update', input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('tasks:delete', id),
    duplicate: (id: string): Promise<Task> => ipcRenderer.invoke('tasks:duplicate', id),
    markDone: (id: string): Promise<Task> => ipcRenderer.invoke('tasks:markDone', id),
    extendDeadline: (id: string, newDeadline: string): Promise<Task> =>
      ipcRenderer.invoke('tasks:extendDeadline', id, newDeadline),
    archive: (id: string, archived: boolean): Promise<Task> =>
      ipcRenderer.invoke('tasks:archive', id, archived),
  },
  notes: {
    get: (): Promise<Note[]> => ipcRenderer.invoke('notes:get'),
    create: (input: CreateNoteInput): Promise<Note> =>
      ipcRenderer.invoke('notes:create', input),
    update: (id: string, input: UpdateNoteInput): Promise<boolean> =>
      ipcRenderer.invoke('notes:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('notes:delete', id),
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
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI