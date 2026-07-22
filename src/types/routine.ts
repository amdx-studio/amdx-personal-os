export type RoutineDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type RoutineCategoryId =
  | 'work'
  | 'study'
  | 'worship'
  | 'health'
  | 'exercise'
  | 'personal'
  | 'family'
  | 'finance'
  | 'custom'

export type RoutinePriority = 'low' | 'medium' | 'high'

export interface RoutineActivity {
  id: string
  title: string
  description: string
  category: RoutineCategoryId
  day: RoutineDay
  startTime: string
  endTime: string
  priority: RoutinePriority
  checked: boolean
  notes: string
  createdAt: string
  updatedAt: string
}

export type CreateRoutineActivityInput = {
  title: string
  description?: string
  category: RoutineCategoryId
  day: RoutineDay
  startTime: string
  endTime?: string
  priority: RoutinePriority
  notes?: string
}

export type UpdateRoutineActivityInput = Partial<Pick<RoutineActivity, 'title' | 'description' | 'category' | 'day' | 'startTime' | 'endTime' | 'priority' | 'checked' | 'notes'>>