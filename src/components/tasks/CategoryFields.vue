<script setup lang="ts">
import { computed } from 'vue'
import type { TaskCategory, KuliahDetails, JokiDetails, KlienDetails } from '../../types/task'
import { formatCurrency } from '../../utils/taskStyles'

const props = defineProps<{
  category: TaskCategory
}>()

const kuliah = defineModel<KuliahDetails>('kuliahDetails', { default: () => ({ mataKuliah: '' }) })
const joki = defineModel<JokiDetails>('jokiDetails', {
  default: () => ({ namaClient: '', harga: 0, dp: 0 }),
})
const klien = defineModel<KlienDetails>('klienDetails', {
  default: () => ({ namaClient: '', namaProject: '', nilaiProject: 0 }),
})

const sisaPembayaran = computed(() => (joki.value.harga || 0) - (joki.value.dp || 0))
</script>

<template>
  <div v-if="category === 'kuliah'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label class="col-span-2 flex flex-col gap-1 text-xs text-ink-muted">
      Mata Kuliah
      <input
        v-model="kuliah.mataKuliah"
        type="text"
        placeholder="Contoh: Pemrograman Web"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Dosen (opsional)
      <input
        v-model="kuliah.dosen"
        type="text"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Pertemuan (opsional)
      <input
        v-model="kuliah.pertemuan"
        type="text"
        placeholder="Contoh: Pertemuan 8"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  </div>

  <div v-else-if="category === 'joki'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Nama Client
      <input
        v-model="joki.namaClient"
        type="text"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Kontak Client (opsional)
      <input
        v-model="joki.kontakClient"
        type="text"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Harga (Rp)
      <input
        v-model.number="joki.harga"
        type="number"
        min="0"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      DP (Rp)
      <input
        v-model.number="joki.dp"
        type="number"
        min="0"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <p class="col-span-2 text-xs text-ink-muted">
      Sisa Pembayaran: <span class="font-medium text-ink">{{ formatCurrency(sisaPembayaran) }}</span>
    </p>
  </div>

  <div v-else-if="category === 'klien'" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Nama Client
      <input
        v-model="klien.namaClient"
        type="text"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Nama Project
      <input
        v-model="klien.namaProject"
        type="text"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Nilai Project (Rp)
      <input
        v-model.number="klien.nilaiProject"
        type="number"
        min="0"
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
    <label class="flex flex-col gap-1 text-xs text-ink-muted">
      Link Project (opsional)
      <input
        v-model="klien.linkProject"
        type="text"
        placeholder="https://..."
        class="rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
    </label>
  </div>
</template>
