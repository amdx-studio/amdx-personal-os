<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTasksStore } from '../stores/useTasksStore'
import type { Task, CreateTaskInput, UpdateTaskInput } from '../types/task'
import TaskSummaryCards from '../components/tasks/TaskSummaryCards.vue'
import TaskToolbar from '../components/tasks/TaskToolbar.vue'
import TaskCard from '../components/tasks/TaskCard.vue'
import TaskFormModal from '../components/tasks/TaskFormModal.vue'
import TaskDetailDrawer from '../components/tasks/TaskDetailDrawer.vue'

const tasksStore = useTasksStore()

const isFormOpen = ref(false)
const editingTask = ref<Task | null>(null)

onMounted(() => {
  tasksStore.loadTasks()
})

function openCreateForm(): void {
  editingTask.value = null
  isFormOpen.value = true
}

function openEditForm(task: Task): void {
  editingTask.value = task
  isFormOpen.value = true
  tasksStore.selectTask(null) // close drawer while editing
}

function closeForm(): void {
  isFormOpen.value = false
  editingTask.value = null
}

async function handleSave(payload: CreateTaskInput | UpdateTaskInput): Promise<void> {
  if ('id' in payload) {
    await tasksStore.updateTask(payload)
  } else {
    await tasksStore.createTask(payload)
  }
  closeForm()
}

async function handleDelete(id: string): Promise<void> {
  await tasksStore.deleteTask(id)
}

async function handleDuplicate(id: string): Promise<void> {
  await tasksStore.duplicateTask(id)
}

async function handleMarkDone(id: string): Promise<void> {
  await tasksStore.markAsDone(id)
}

async function handleExtendDeadline(id: string, newDeadline: string): Promise<void> {
  await tasksStore.extendDeadline(id, newDeadline)
}

async function handleArchive(id: string, archived: boolean): Promise<void> {
  await tasksStore.toggleArchive(id, archived)
}

async function handleUpdateProgress(id: string, progress: number): Promise<void> {
  await tasksStore.updateTask({ id, progress })
}

async function handleUpdateNotes(id: string, notes: string): Promise<void> {
  await tasksStore.updateTask({ id, notes })
}
</script>

<template>
  <div class="space-y-4">
    <TaskSummaryCards :summary="tasksStore.summary" />

    <TaskToolbar v-model:filters="tasksStore.filters" @add-task="openCreateForm" />

    <div v-if="tasksStore.isLoading" class="text-sm text-ink-muted">Memuat tasks...</div>

    <div
      v-else-if="tasksStore.filteredTasks.length === 0"
      class="rounded-xl border border-border bg-surface p-8 text-center text-ink-muted"
    >
      Tidak ada task yang cocok dengan filter saat ini.
    </div>

    <ul v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <TaskCard
        v-for="task in tasksStore.filteredTasks"
        :key="task.id"
        :task="task"
        @click="tasksStore.selectTask(task.id)"
      />
    </ul>

    <TaskFormModal
      :open="isFormOpen"
      :task="editingTask"
      @close="closeForm"
      @save="handleSave"
    />

    <TaskDetailDrawer
      :task="tasksStore.selectedTask"
      @close="tasksStore.selectTask(null)"
      @edit="openEditForm"
      @delete="handleDelete"
      @duplicate="handleDuplicate"
      @mark-done="handleMarkDone"
      @extend-deadline="handleExtendDeadline"
      @archive="handleArchive"
      @update-progress="handleUpdateProgress"
      @update-notes="handleUpdateNotes"
    />
  </div>
</template>
