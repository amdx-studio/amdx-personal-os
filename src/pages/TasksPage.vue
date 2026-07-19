<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Trash2 } from 'lucide-vue-next'
import { useTasksStore } from '../stores/useTasksStore'

const tasksStore = useTasksStore()
const newTaskTitle = ref('')

onMounted(() => {
  tasksStore.loadTasks()
})

function handleAddTask(): void {
  const title = newTaskTitle.value.trim()
  if (!title) return

  tasksStore.createTask({ title })
  newTaskTitle.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <form class="flex gap-2" @submit.prevent="handleAddTask">
      <input
        v-model="newTaskTitle"
        type="text"
        placeholder="Tambah task baru..."
        class="flex-1 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <button
        type="submit"
        class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      >
        <Plus class="h-4 w-4" />
        Tambah
      </button>
    </form>

    <div v-if="tasksStore.isLoading" class="text-sm text-ink-muted">
      Memuat tasks...
    </div>

    <div v-else-if="tasksStore.tasks.length === 0" class="rounded-xl border border-border bg-surface p-8 text-center text-ink-muted">
      Belum ada task. Tambahkan yang pertama!
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="task in tasksStore.tasks"
        :key="task.id"
        class="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
      >
        <input
          type="checkbox"
          :checked="task.completed"
          class="h-4 w-4 accent-accent"
          @change="tasksStore.toggleTask(task.id)"
        />
        <span
          class="flex-1 text-sm"
          :class="task.completed ? 'text-ink-subtle line-through' : 'text-ink'"
        >
          {{ task.title }}
        </span>
        <button
          type="button"
          class="text-ink-subtle transition-colors hover:text-red-500"
          @click="tasksStore.deleteTask(task.id)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </div>
</template>