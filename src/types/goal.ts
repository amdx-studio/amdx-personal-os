export interface Goal {
  id: string
  title: string
  targetValue: number
  currentValue: number
  unit: string
  deadline: string | null // ISO date, format YYYY-MM-DD, null jika tanpa deadline
  createdAt: string
}

export type CreateGoalInput = Pick<Goal, 'title' | 'targetValue' | 'unit'> &
  Partial<Pick<Goal, 'deadline'>>

export type UpdateGoalInput = Partial<
  Pick<Goal, 'title' | 'targetValue' | 'currentValue' | 'unit' | 'deadline'>
>