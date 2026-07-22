import { randomUUID } from 'node:crypto'
import { readJsonFile, writeJsonFile } from './jsonStore.js'
import type {
  RoutineActivity,
  CreateRoutineActivityInput,
  UpdateRoutineActivityInput,
} from '../../src/types/routine.js'

const ROUTINES_FILE = 'routines.json'
const DEFAULT_ROUTINES: RoutineActivity[] = []

export async function getRoutineActivities(): Promise<RoutineActivity[]> {
  return readJsonFile<RoutineActivity[]>(ROUTINES_FILE, DEFAULT_ROUTINES)
}

export async function createRoutineActivity(
  input: CreateRoutineActivityInput,
): Promise<RoutineActivity> {
  const activities = await getRoutineActivities()

  const now = new Date().toISOString()
  const newActivity: RoutineActivity = {
    id: randomUUID(),
    title: input.title,
    description: input.description ?? '',
    category: input.category,
    day: input.day,
    startTime: input.startTime,
    endTime: input.endTime ?? '',
    priority: input.priority,
    checked: false,
    notes: input.notes ?? '',
    createdAt: now,
    updatedAt: now,
  }

  await writeJsonFile<RoutineActivity[]>(ROUTINES_FILE, [...activities, newActivity])
  return newActivity
}

export async function updateRoutineActivity(
  id: string,
  input: UpdateRoutineActivityInput,
): Promise<void> {
  const activities = await getRoutineActivities()

  const updated = activities.map((activity) => {
    if (activity.id !== id) return activity

    return {
      ...activity,
      ...input,
      updatedAt: new Date().toISOString(),
    }
  })

  await writeJsonFile<RoutineActivity[]>(ROUTINES_FILE, updated)
}

export async function deleteRoutineActivity(id: string): Promise<void> {
  const activities = await getRoutineActivities()
  const updated = activities.filter((activity) => activity.id !== id)
  await writeJsonFile<RoutineActivity[]>(ROUTINES_FILE, updated)
}