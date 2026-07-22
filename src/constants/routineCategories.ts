import type { RoutineCategoryId } from '../types/routine'

export interface RoutineCategoryDefinition {
  id: RoutineCategoryId
  name: string
  icon: string
  color: string
}

export const ROUTINE_CATEGORIES: RoutineCategoryDefinition[] = [
  { id: 'work', name: 'Work', icon: 'Briefcase', color: '#3B82F6' },
  { id: 'study', name: 'Study', icon: 'BookOpen', color: '#8B5CF6' },
  { id: 'worship', name: 'Worship', icon: 'Moon', color: '#10B981' },
  { id: 'health', name: 'Health', icon: 'HeartPulse', color: '#EF4444' },
  { id: 'exercise', name: 'Exercise', icon: 'Dumbbell', color: '#F59E0B' },
  { id: 'personal', name: 'Personal', icon: 'User', color: '#EC4899' },
  { id: 'family', name: 'Family', icon: 'Users', color: '#14B8A6' },
  { id: 'finance', name: 'Finance', icon: 'Wallet', color: '#22C55E' },
  { id: 'custom', name: 'Custom', icon: 'Sparkles', color: '#6B7280' },
]

export function getRoutineCategoryDefinition(
  id: RoutineCategoryId,
): RoutineCategoryDefinition {
  const found = ROUTINE_CATEGORIES.find((category) => category.id === id)
  if (!found) {
    throw new Error(`Kategori routine tidak dikenali: ${id}`)
  }
  return found
}