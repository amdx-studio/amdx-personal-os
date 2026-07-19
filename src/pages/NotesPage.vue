<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Plus, Trash2, FileText } from 'lucide-vue-next'
import { useNotesStore } from '../stores/useNotesStore'
import type { Note } from '../types/note'

const notesStore = useNotesStore()

const selectedId = ref<string | null>(null)
const draftTitle = ref('')
const draftContent = ref('')

const selectedNote = computed<Note | undefined>(() =>
  notesStore.notes.find((note) => note.id === selectedId.value),
)

onMounted(() => {
  notesStore.loadNotes()
})

async function handleCreateNote(): Promise<void> {
  await notesStore.createNote({ title: 'Catatan baru', content: '' })
  const created = notesStore.notes[notesStore.notes.length - 1]
  selectNote(created)
}

function selectNote(note: Note): void {
  selectedId.value = note.id
  draftTitle.value = note.title
  draftContent.value = note.content
}

function handleSave(): void {
  if (!selectedId.value) return
  notesStore.updateNote(selectedId.value, {
    title: draftTitle.value,
    content: draftContent.value,
  })
}

function handleDelete(id: string): void {
  notesStore.deleteNote(id)
  if (selectedId.value === id) {
    selectedId.value = null
    draftTitle.value = ''
    draftContent.value = ''
  }
}
</script>

<template>
  <div class="flex h-full gap-4">
    <!-- Notes list -->
    <div class="w-72 shrink-0 space-y-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
        @click="handleCreateNote"
      >
        <Plus class="h-4 w-4" />
        Catatan Baru
      </button>

      <div v-if="notesStore.isLoading" class="text-sm text-ink-muted">
        Memuat catatan...
      </div>

      <div
        v-else-if="notesStore.notes.length === 0"
        class="rounded-xl border border-border bg-surface p-8 text-center text-sm text-ink-muted"
      >
        Belum ada catatan.
      </div>

      <ul v-else class="space-y-2">
        <li
          v-for="note in notesStore.notes"
          :key="note.id"
          class="group flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 transition-colors"
          :class="
            note.id === selectedId
              ? 'border-accent bg-accent-bg-soft'
              : 'border-border bg-surface hover:border-accent'
          "
          @click="selectNote(note)"
        >
          <FileText class="mt-0.5 h-4 w-4 shrink-0 text-ink-subtle" />
          <span class="flex-1 truncate text-sm text-ink">
            {{ note.title || 'Tanpa judul' }}
          </span>
          <button
            type="button"
            class="shrink-0 text-ink-subtle opacity-0 transition-colors group-hover:opacity-100 hover:text-red-500"
            @click.stop="handleDelete(note.id)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </li>
      </ul>
    </div>

    <!-- Editor -->
    <div class="flex-1 rounded-xl border border-border bg-surface p-4">
      <div v-if="!selectedNote" class="flex h-full items-center justify-center text-sm text-ink-muted">
        Pilih catatan di sebelah kiri, atau buat yang baru.
      </div>

      <div v-else class="flex h-full flex-col gap-3">
        <input
          v-model="draftTitle"
          type="text"
          placeholder="Judul catatan"
          class="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-base font-medium text-ink outline-none focus:border-accent"
          @blur="handleSave"
        />
        <textarea
          v-model="draftContent"
          placeholder="Tulis catatan di sini..."
          class="min-h-0 flex-1 resize-none rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          @blur="handleSave"
        />
      </div>
    </div>
  </div>
</template>