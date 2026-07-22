import type { RoutineDay } from '../types/routine'

const DAY_INDEX_MAP: Record<number, RoutineDay> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

export const ROUTINE_DAY_ORDER: RoutineDay[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
]

export function getCurrentRoutineDay(): RoutineDay {
  const dayIndex = new Date().getDay()
  return DAY_INDEX_MAP[dayIndex]
}