<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Trash2, CalendarDays } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useCalendarStore } from '../stores/useCalendarStore'

const calendarStore = useCalendarStore()

const newTitle = ref('')
const newDate = ref(dayjs().format('YYYY-MM-DD'))
const newTime = ref('')
const newDescription = ref('')
const showForm = ref(false)

onMounted(() => {
  calendarStore.loadEvents()
})

async function handleAddEvent(): Promise<void> {
  const title = newTitle.value.trim()
  if (!title || !newDate.value) return

  await calendarStore.createEvent({
    title,
    date: newDate.value,
    time: newTime.value || undefined,
    description: newDescription.value.trim() || undefined,
  })

  newTitle.value = ''
  newTime.value = ''
  newDescription.value = ''
  showForm.value = false
}

function formatDateHeader(dateStr: string): string {
  const target = dayjs(dateStr)
  const today = dayjs().startOf('day')

  if (target.isSame(today, 'day')) return 'Hari ini'
  if (target.isSame(today.add(1, 'day'), 'day')) return 'Besok'

  return target.locale('id').format('dddd, D MMMM YYYY')
}
</script>

<template>
  <div class="space-y-4">
    <button
      type="button"
      class="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
      @click="showForm = !showForm"
    >
      <Plus class="h-4 w-4" />
      Tambah Event
    </button>

    <form
      v-if="showForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      @submit.prevent="handleAddEvent"
    >
      <input
        v-model="newTitle"
        type="text"
        placeholder="Judul event"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
      />
      <input
        v-model="newDate"
        type="date"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model="newTime"
        type="time"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <textarea
        v-model="newDescription"
        placeholder="Deskripsi (opsional)"
        class="resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
        rows="2"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-2"
      >
        Simpan Event
      </button>
    </form>

    <div v-if="calendarStore.isLoading" class="text-sm text-ink-muted">
      Memuat kalender...
    </div>

    <div
      v-else-if="calendarStore.events.length === 0"
      class="rounded-xl border border-border bg-surface p-8 text-center text-sm text-ink-muted"
    >
      Belum ada event. Tambahkan yang pertama!
    </div>

    <div v-else class="space-y-5">
      <div v-for="[date, dayEvents] in calendarStore.eventsByDate" :key="date" class="space-y-2">
        <h3 class="flex items-center gap-2 text-sm font-medium text-ink-muted">
          <CalendarDays class="h-4 w-4" />
          {{ formatDateHeader(date) }}
        </h3>

        <ul class="space-y-2">
          <li
            v-for="event in dayEvents"
            :key="event.id"
            class="group flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
          >
            <span
              v-if="event.time"
              class="mt-0.5 shrink-0 rounded-full bg-accent-bg-soft px-2 py-1 text-xs font-medium text-accent"
            >
              {{ event.time }}
            </span>

            <div class="flex-1">
              <p class="text-sm text-ink">{{ event.title }}</p>
              <p v-if="event.description" class="mt-0.5 text-xs text-ink-muted">
                {{ event.description }}
              </p>
            </div>

            <button
              type="button"
              class="shrink-0 text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
              @click="calendarStore.deleteEvent(event.id)"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>