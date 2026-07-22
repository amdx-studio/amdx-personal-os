import type {
  RoutineActivity,
  CreateRoutineActivityInput,
  UpdateRoutineActivityInput,
} from '../types/routine'

export async function fetchRoutineActivities(): Promise<RoutineActivity[]> {
  return window.electronAPI.routine.get()
}

export async function addRoutineActivity(
  input: CreateRoutineActivityInput,
): Promise<RoutineActivity> {
  return window.electronAPI.routine.create(input)
}

export async function editRoutineActivity(
  id: string,
  input: UpdateRoutineActivityInput,
): Promise<boolean> {
  return window.electronAPI.routine.update(id, input)
}

export async function removeRoutineActivity(id: string): Promise<boolean> {
  return window.electronAPI.routine.delete(id)
}