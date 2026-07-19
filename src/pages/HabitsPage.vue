<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Trash2, Flame } from 'lucide-vue-next'
import { useHabitsStore } from '../stores/useHabitsStore'

const habitsStore = useHabitsStore()
const newHabitName = ref('')

onMounted(() => {
  habitsStore.loadHabits()
})

function handleAddHabit(): void {
  const name = newHabitName.value.trim()
  if (!name) return

  habitsStore.createHabit({ name })
  newHabitName.value = ''
}
</script>

<template>
  <div class="space-y-4">
    <form class="flex gap-2" @submit.prevent="handleAddHabit">
      <input
        v-model="newHabitName"
        type="text"
        placeholder="Tambah habit baru..."
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

    <div v-if="habitsStore.isLoading" class="text-sm text-ink-muted">
      Memuat habits...
    </div>

    <div v-else-if="habitsStore.habits.length === 0" class="rounded-xl border border-border bg-surface p-8 text-center text-ink-muted">
      Belum ada habit. Tambahkan yang pertama!
    </div>

    <ul v-else class="space-y-2">
      <li
        v-for="habit in habitsStore.habits"
        :key="habit.id"
        class="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3"
      >
        <input
          type="checkbox"
          :checked="habitsStore.isCompletedToday(habit)"
          class="h-4 w-4 accent-accent"
          @change="habitsStore.toggleToday(habit.id)"
        />
        <span class="flex-1 text-sm text-ink">{{ habit.name }}</span>

        <span
          v-if="habitsStore.getStreak(habit) > 0"
          class="flex items-center gap-1 rounded-full bg-accent-bg-soft px-2 py-1 text-xs font-medium text-accent"
        >
          <Flame class="h-3 w-3" />
          {{ habitsStore.getStreak(habit) }} hari
        </span>

        <button
          type="button"
          class="text-ink-subtle transition-colors hover:text-red-500"
          @click="habitsStore.deleteHabit(habit.id)"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </li>
    </ul>
  </div>
</template>