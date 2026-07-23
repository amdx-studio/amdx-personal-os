import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchRoutineActivities,
  addRoutineActivity,
  editRoutineActivity,
  removeRoutineActivity,
} from '../services/routineService'
import { getCurrentRoutineDay } from '../utils/routineDay'
import type {
  RoutineActivity,
  RoutineDay,
  CreateRoutineActivityInput,
  UpdateRoutineActivityInput,
} from '../types/routine'

export const useRoutineStore = defineStore('routine', () => {
  const activities = ref<RoutineActivity[]>([])
  const isLoading = ref(false)
  const selectedDay = ref<RoutineDay>(getCurrentRoutineDay())

  const activitiesForSelectedDay = computed<RoutineActivity[]>(() => {
    return activities.value
      .filter((activity) => activity.day === selectedDay.value)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  const todayActivities = computed<RoutineActivity[]>(() => {
    const today = getCurrentRoutineDay()
    return activities.value
      .filter((activity) => activity.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  })

  function getActivitiesByDay(day: RoutineDay): RoutineActivity[] {
    return activities.value
      .filter((activity) => activity.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }

  function setSelectedDay(day: RoutineDay): void {
    selectedDay.value = day
  }

  async function loadRoutineActivities(): Promise<void> {
    isLoading.value = true
    try {
      activities.value = await fetchRoutineActivities()
    } finally {
      isLoading.value = false
    }
  }

  async function createRoutineActivity(input: CreateRoutineActivityInput): Promise<void> {
    const newActivity = await addRoutineActivity(input)
    activities.value = [...activities.value, newActivity]
  }

  async function updateRoutineActivity(
    id: string,
    input: UpdateRoutineActivityInput,
  ): Promise<void> {
    const now = new Date().toISOString()

    activities.value = activities.value.map((activity) =>
      activity.id === id ? { ...activity, ...input, updatedAt: now } : activity,
    )

    await editRoutineActivity(id, input)
  }

  async function toggleRoutineActivity(id: string): Promise<void> {
    const target = activities.value.find((activity) => activity.id === id)
    if (!target) return
    await updateRoutineActivity(id, { checked: !target.checked })
  }

  async function deleteRoutineActivity(id: string): Promise<void> {
    activities.value = activities.value.filter((activity) => activity.id !== id)
    await removeRoutineActivity(id)
  }

  async function duplicateRoutineActivity(id: string): Promise<void> {
    const target = activities.value.find((activity) => activity.id === id)
    if (!target) return

    await createRoutineActivity({
      title: `${target.title} (Copy)`,
      description: target.description,
      category: target.category,
      day: target.day,
      startTime: target.startTime,
      endTime: target.endTime,
      priority: target.priority,
      notes: target.notes,
    })
  }

  async function duplicateDay(day: RoutineDay): Promise<void> {
    const dayActivities = getActivitiesByDay(day)

    for (const activity of dayActivities) {
      await createRoutineActivity({
        title: activity.title,
        description: activity.description,
        category: activity.category,
        day: activity.day,
        startTime: activity.startTime,
        endTime: activity.endTime,
        priority: activity.priority,
        notes: activity.notes,
      })
    }
  }

  async function copyDayToDays(fromDay: RoutineDay, toDays: RoutineDay[]): Promise<void> {
    const sourceActivities = getActivitiesByDay(fromDay)

    for (const targetDay of toDays) {
      for (const activity of sourceActivities) {
        await createRoutineActivity({
          title: activity.title,
          description: activity.description,
          category: activity.category,
          day: targetDay,
          startTime: activity.startTime,
          endTime: activity.endTime,
          priority: activity.priority,
          notes: activity.notes,
        })
      }
    }
  }

  return {
    activities,
    isLoading,
    selectedDay,
    activitiesForSelectedDay,
    todayActivities,
    getActivitiesByDay,
    setSelectedDay,
    loadRoutineActivities,
    createRoutineActivity,
    updateRoutineActivity,
    toggleRoutineActivity,
    deleteRoutineActivity,
    duplicateRoutineActivity,
    duplicateDay,
    copyDayToDays,
  }
})