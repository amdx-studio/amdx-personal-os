export interface Habit {
  id: string
  name: string
  createdAt: string
  completedDates: string[]
}

export type CreateHabitInput = Pick<Habit, 'name'>