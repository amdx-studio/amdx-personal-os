<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus, Trash2, Target, CheckCircle2 } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useGoalsStore } from '../stores/useGoalsStore'

const goalsStore = useGoalsStore()

const showForm = ref(false)
const newTitle = ref('')
const newTarget = ref<number | null>(null)
const newUnit = ref('')
const newDeadline = ref('')

// Nilai input "tambah progress" per goal, di-key oleh goal id
const progressInputs = ref<Record<string, number | null>>({})

onMounted(() => {
  goalsStore.loadGoals()
})

async function handleAddGoal(): Promise<void> {
  const title = newTitle.value.trim()
  const unit = newUnit.value.trim()
  if (!title || !unit || newTarget.value === null || newTarget.value <= 0) return

  await goalsStore.createGoal({
    title,
    targetValue: newTarget.value,
    unit,
    deadline: newDeadline.value || undefined,
  })

  newTitle.value = ''
  newTarget.value = null
  newUnit.value = ''
  newDeadline.value = ''
  showForm.value = false
}

function handleAddProgress(goalId: string): void {
  const amount = progressInputs.value[goalId]
  if (!amount) return
  goalsStore.addProgress(goalId, amount)
  progressInputs.value[goalId] = null
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
      Tambah Goal
    </button>

    <form
      v-if="showForm"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      @submit.prevent="handleAddGoal"
    >
      <input
        v-model="newTitle"
        type="text"
        placeholder="Nama target (mis. Baca buku tahun ini)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
      />
      <input
        v-model.number="newTarget"
        type="number"
        min="1"
        placeholder="Target angka (mis. 12)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model="newUnit"
        type="text"
        placeholder="Satuan (mis. buku, km, kg)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model="newDeadline"
        type="date"
        placeholder="Deadline (opsional)"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
      />
      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-2"
      >
        Simpan Goal
      </button>
    </form>

    <div v-if="goalsStore.isLoading" class="text-sm text-ink-muted">
      Memuat goals...
    </div>

    <div
      v-else-if="goalsStore.goals.length === 0"
      class="rounded-xl border border-border bg-surface p-8 text-center text-sm text-ink-muted"
    >
      Belum ada goal. Tambahkan target pertamamu!
    </div>

    <ul v-else class="space-y-3">
      <li
        v-for="goal in goalsStore.goals"
        :key="goal.id"
        class="rounded-xl border border-border bg-surface p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <CheckCircle2
              v-if="goalsStore.isCompleted(goal)"
              class="h-4 w-4 shrink-0 text-green-500"
            />
            <Target v-else class="h-4 w-4 shrink-0 text-ink-subtle" />
            <span class="text-sm font-medium text-ink">{{ goal.title }}</span>
          </div>
          <button
            type="button"
            class="shrink-0 text-ink-subtle transition-colors hover:text-red-500"
            @click="goalsStore.deleteGoal(goal.id)"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>

        <p v-if="goal.deadline" class="mt-1 text-xs text-ink-muted">
          Deadline: {{ dayjs(goal.deadline).format('D MMM YYYY') }}
        </p>

        <div class="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            class="h-full rounded-full bg-accent transition-all"
            :style="{ width: goalsStore.getProgressPercent(goal) + '%' }"
          />
        </div>

        <div class="mt-2 flex items-center justify-between text-xs text-ink-muted">
          <span>{{ goal.currentValue }} / {{ goal.targetValue }} {{ goal.unit }}</span>
          <span>{{ goalsStore.getProgressPercent(goal) }}%</span>
        </div>

        <div v-if="!goalsStore.isCompleted(goal)" class="mt-3 flex gap-2">
          <input
            v-model.number="progressInputs[goal.id]"
            type="number"
            min="1"
            :placeholder="`Tambah ${goal.unit}...`"
            class="flex-1 rounded-lg border border-border bg-transparent px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
            @keyup.enter="handleAddProgress(goal.id)"
          />
          <button
            type="button"
            class="rounded-lg border border-border px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
            @click="handleAddProgress(goal.id)"
          >
            Tambah
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>