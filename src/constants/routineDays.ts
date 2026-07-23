import type { RoutineDay } from '../types/routine'

export interface RoutineDayDefinition {
  id: RoutineDay
  label: string
  shortLabel: string
}

export const ROUTINE_DAYS: RoutineDayDefinition[] = [
  { id: 'monday', label: 'Senin', shortLabel: 'Sen' },
  { id: 'tuesday', label: 'Selasa', shortLabel: 'Sel' },
  { id: 'wednesday', label: 'Rabu', shortLabel: 'Rab' },
  { id: 'thursday', label: 'Kamis', shortLabel: 'Kam' },
  { id: 'friday', label: 'Jumat', shortLabel: 'Jum' },
  { id: 'saturday', label: 'Sabtu', shortLabel: 'Sab' },
  { id: 'sunday', label: 'Minggu', shortLabel: 'Min' },
]

export function getRoutineDayLabel(id: RoutineDay): string {
  const found = ROUTINE_DAYS.find((day) => day.id === id)
  return found ? found.label : id
}