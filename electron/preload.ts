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
import type {
  Account,
  CreateAccountInput,
  UpdateAccountInput,
  Budget,
  CreateBudgetInput,
  UpdateBudgetInput,
  SavingsGoal,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
  Bill,
  CreateBillInput,
  UpdateBillInput,
  WishlistItem,
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  Asset,
  CreateAssetInput,
  UpdateAssetInput,
} from '../src/types/finance.js'
import type {
  RoutineActivity,
  CreateRoutineActivityInput,
  UpdateRoutineActivityInput,
} from '../src/types/routine.js'

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
    accounts: {
      get: (): Promise<Account[]> => ipcRenderer.invoke('finance:accounts:get'),
      create: (input: CreateAccountInput): Promise<Account> =>
        ipcRenderer.invoke('finance:accounts:create', input),
      update: (id: string, input: UpdateAccountInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:accounts:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:accounts:delete', id),
    },
    budgets: {
      get: (): Promise<Budget[]> => ipcRenderer.invoke('finance:budgets:get'),
      create: (input: CreateBudgetInput): Promise<Budget> =>
        ipcRenderer.invoke('finance:budgets:create', input),
      update: (id: string, input: UpdateBudgetInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:budgets:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:budgets:delete', id),
    },
    goals: {
      get: (): Promise<SavingsGoal[]> => ipcRenderer.invoke('finance:goals:get'),
      create: (input: CreateSavingsGoalInput): Promise<SavingsGoal> =>
        ipcRenderer.invoke('finance:goals:create', input),
      update: (id: string, input: UpdateSavingsGoalInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:goals:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:goals:delete', id),
    },
    bills: {
      get: (): Promise<Bill[]> => ipcRenderer.invoke('finance:bills:get'),
      create: (input: CreateBillInput): Promise<Bill> =>
        ipcRenderer.invoke('finance:bills:create', input),
      update: (id: string, input: UpdateBillInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:bills:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:bills:delete', id),
    },
    wishlist: {
      get: (): Promise<WishlistItem[]> => ipcRenderer.invoke('finance:wishlist:get'),
      create: (input: CreateWishlistItemInput): Promise<WishlistItem> =>
        ipcRenderer.invoke('finance:wishlist:create', input),
      update: (id: string, input: UpdateWishlistItemInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:wishlist:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:wishlist:delete', id),
    },
    assets: {
      get: (): Promise<Asset[]> => ipcRenderer.invoke('finance:assets:get'),
      create: (input: CreateAssetInput): Promise<Asset> =>
        ipcRenderer.invoke('finance:assets:create', input),
      update: (id: string, input: UpdateAssetInput): Promise<boolean> =>
        ipcRenderer.invoke('finance:assets:update', id, input),
      delete: (id: string): Promise<boolean> =>
        ipcRenderer.invoke('finance:assets:delete', id),
    },
  },
  goals: {
    get: (): Promise<Goal[]> => ipcRenderer.invoke('goals:get'),
    create: (input: CreateGoalInput): Promise<Goal> =>
      ipcRenderer.invoke('goals:create', input),
    update: (id: string, input: UpdateGoalInput): Promise<boolean> =>
      ipcRenderer.invoke('goals:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('goals:delete', id),
  },
  routine: {
    get: (): Promise<RoutineActivity[]> => ipcRenderer.invoke('routine:get'),
    create: (input: CreateRoutineActivityInput): Promise<RoutineActivity> =>
      ipcRenderer.invoke('routine:create', input),
    update: (id: string, input: UpdateRoutineActivityInput): Promise<boolean> =>
      ipcRenderer.invoke('routine:update', id, input),
    delete: (id: string): Promise<boolean> => ipcRenderer.invoke('routine:delete', id),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI