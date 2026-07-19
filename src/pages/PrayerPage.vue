<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Settings, Clock } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { usePrayerStore } from '../stores/usePrayerStore'
import { CITY_PRESETS } from '../types/prayerSettings'
import type { CalculationMethod, AsrMethod } from '../types/prayerSettings'

const prayerStore = usePrayerStore()
const showSettings = ref(false)

// Form draft, disinkronkan dari store saat settings dimuat / panel dibuka
const draftCity = ref('')
const draftLatitude = ref(0)
const draftLongitude = ref(0)
const draftTimezone = ref(7)
const draftMethod = ref<CalculationMethod>('Kemenag')
const draftAsrMethod = ref<AsrMethod>('Shafi')

onMounted(async () => {
  await prayerStore.loadSettings()
  syncDraftFromStore()
})

function syncDraftFromStore(): void {
  draftCity.value = prayerStore.settings.cityName
  draftLatitude.value = prayerStore.settings.latitude
  draftLongitude.value = prayerStore.settings.longitude
  draftTimezone.value = prayerStore.settings.timezoneOffset
  draftMethod.value = prayerStore.settings.calculationMethod
  draftAsrMethod.value = prayerStore.settings.asrMethod
}

function applyPreset(cityName: string): void {
  const preset = CITY_PRESETS.find((city) => city.cityName === cityName)
  if (!preset) return
  draftCity.value = preset.cityName
  draftLatitude.value = preset.latitude
  draftLongitude.value = preset.longitude
  draftTimezone.value = preset.timezoneOffset
}

async function handleSaveSettings(): Promise<void> {
  await prayerStore.updateSettings({
    cityName: draftCity.value,
    latitude: draftLatitude.value,
    longitude: draftLongitude.value,
    timezoneOffset: draftTimezone.value,
    calculationMethod: draftMethod.value,
    asrMethod: draftAsrMethod.value,
  })
  showSettings.value = false
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <p class="text-sm text-ink-muted">
        {{ prayerStore.settings.cityName }} · {{ dayjs().format('dddd, D MMMM YYYY') }}
      </p>
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-ink transition-colors hover:border-accent hover:text-accent"
        @click="
          () => {
            showSettings = !showSettings
            if (showSettings) syncDraftFromStore()
          }
        "
      >
        <Settings class="h-4 w-4" />
        Lokasi & Metode
      </button>
    </div>

    <form
      v-if="showSettings"
      class="grid gap-3 rounded-xl border border-border bg-surface p-4 sm:grid-cols-2"
      @submit.prevent="handleSaveSettings"
    >
      <select
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent sm:col-span-2"
        @change="applyPreset(($event.target as HTMLSelectElement).value)"
      >
        <option value="" disabled selected>Pilih kota (opsional, isi manual di bawah)</option>
        <option v-for="city in CITY_PRESETS" :key="city.cityName" :value="city.cityName">
          {{ city.cityName }}
        </option>
      </select>

      <input
        v-model="draftCity"
        type="text"
        placeholder="Nama lokasi"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model.number="draftTimezone"
        type="number"
        step="1"
        placeholder="Zona waktu UTC+"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model.number="draftLatitude"
        type="number"
        step="0.0001"
        placeholder="Latitude"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <input
        v-model.number="draftLongitude"
        type="number"
        step="0.0001"
        placeholder="Longitude"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      />
      <select
        v-model="draftMethod"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option value="Kemenag">Kemenag (Indonesia)</option>
        <option value="MWL">Muslim World League</option>
        <option value="Karachi">Karachi</option>
        <option value="Makkah">Umm al-Qura (Makkah)</option>
      </select>
      <select
        v-model="draftAsrMethod"
        class="rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-ink outline-none focus:border-accent"
      >
        <option value="Shafi">Ashar - Syafi'i/Maliki/Hanbali</option>
        <option value="Hanafi">Ashar - Hanafi</option>
      </select>

      <button
        type="submit"
        class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover sm:col-span-2"
      >
        Simpan Pengaturan
      </button>
    </form>

    <div v-if="prayerStore.isLoading" class="text-sm text-ink-muted">
      Memuat jadwal...
    </div>

    <template v-else>
      <div
        v-if="prayerStore.nextPrayer"
        class="flex items-center gap-3 rounded-xl border border-accent bg-accent-bg-soft p-4"
      >
        <Clock class="h-5 w-5 text-accent" />
        <div>
          <p class="text-xs text-ink-muted">Waktu sholat berikutnya</p>
          <p class="text-lg font-medium text-ink">
            {{ prayerStore.nextPrayer.label }} · {{ prayerStore.nextPrayer.time }}
          </p>
        </div>
      </div>

      <ul class="divide-y divide-border rounded-xl border border-border bg-surface">
        <li
          v-for="entry in prayerStore.scheduleList"
          :key="entry.key"
          class="flex items-center justify-between px-4 py-3"
          :class="{ 'text-accent font-medium': entry.key === prayerStore.nextPrayer?.key }"
        >
          <span class="text-sm text-ink">{{ entry.label }}</span>
          <span class="text-sm">{{ entry.time }}</span>
        </li>
      </ul>

      <p class="text-xs text-ink-subtle">
        Jadwal dihitung otomatis berdasarkan lokasi & metode di atas. Untuk kebutuhan ibadah,
        selalu cek ulang dengan jadwal resmi masjid/lembaga setempat — terutama untuk Subuh dan
        Isya yang paling sensitif terhadap metode kalkulasi.
      </p>
    </template>
  </div>
</template>