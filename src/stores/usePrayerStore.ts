import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchPrayerSettings, savePrayerSettings } from '../services/prayerService'
import { calculatePrayerTimes } from '../utils/prayerTimeCalculator'
import type { PrayerTimes } from '../utils/prayerTimeCalculator'
import { DEFAULT_PRAYER_SETTINGS } from '../types/prayerSettings'
import type { PrayerSettings } from '../types/prayerSettings'

const PRAYER_ORDER: Array<keyof PrayerTimes> = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  fajr: 'Subuh',
  sunrise: 'Terbit',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya',
}

export const usePrayerStore = defineStore('prayer', () => {
  const settings = ref<PrayerSettings>(DEFAULT_PRAYER_SETTINGS)
  const isLoading = ref(false)

  // Derived data: dihitung ulang dari settings + tanggal hari ini, tidak disimpan di file
  const todayTimes = computed<PrayerTimes>(() =>
    calculatePrayerTimes(
      new Date(),
      settings.value.latitude,
      settings.value.longitude,
      settings.value.timezoneOffset,
      settings.value.calculationMethod,
      settings.value.asrMethod,
    ),
  )

  const scheduleList = computed(() =>
    PRAYER_ORDER.map((key) => ({
      key,
      label: PRAYER_LABELS[key],
      time: todayTimes.value[key],
    })),
  )

  // Sholat berikutnya berdasarkan jam saat ini, dibungkus ke besok jika sudah lewat Isya
  const nextPrayer = computed(() => {
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes()

    for (const entry of scheduleList.value) {
      if (entry.key === 'sunrise') continue // sunrise bukan waktu sholat
      const [h, m] = entry.time.split(':').map(Number)
      if (h * 60 + m > nowMinutes) return entry
    }

    // Semua waktu hari ini sudah lewat -> Subuh besok
    return scheduleList.value.find((entry) => entry.key === 'fajr')
  })

  async function loadSettings(): Promise<void> {
    isLoading.value = true
    try {
      settings.value = await fetchPrayerSettings()
    } finally {
      isLoading.value = false
    }
  }

  async function updateSettings(input: PrayerSettings): Promise<void> {
    settings.value = input
    await savePrayerSettings(input)
  }

  return {
    settings,
    isLoading,
    todayTimes,
    scheduleList,
    nextPrayer,
    loadSettings,
    updateSettings,
  }
})