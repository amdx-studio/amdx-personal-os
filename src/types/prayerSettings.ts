export type CalculationMethod = 'MWL' | 'Kemenag' | 'Karachi' | 'Makkah'
export type AsrMethod = 'Shafi' | 'Hanafi'

export interface PrayerSettings {
  cityName: string
  latitude: number
  longitude: number
  timezoneOffset: number // offset UTC dalam jam, mis. WIB = 7
  calculationMethod: CalculationMethod
  asrMethod: AsrMethod
}

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
  cityName: 'Jakarta',
  latitude: -6.2088,
  longitude: 106.8456,
  timezoneOffset: 7,
  calculationMethod: 'Kemenag',
  asrMethod: 'Shafi',
}

// Preset kota Indonesia yang umum, mempermudah pengisian awal
export const CITY_PRESETS: Array<Pick<PrayerSettings, 'cityName' | 'latitude' | 'longitude' | 'timezoneOffset'>> = [
  { cityName: 'Jakarta', latitude: -6.2088, longitude: 106.8456, timezoneOffset: 7 },
  { cityName: 'Bandung', latitude: -6.9175, longitude: 107.6191, timezoneOffset: 7 },
  { cityName: 'Pekanbaru', latitude: 0.5333, longitude: 101.45, timezoneOffset: 7 },
  { cityName: 'Surabaya', latitude: -7.2575, longitude: 112.7521, timezoneOffset: 7 },
  { cityName: 'Denpasar', latitude: -8.65, longitude: 115.2167, timezoneOffset: 8 },
  { cityName: 'Makassar', latitude: -5.1477, longitude: 119.4327, timezoneOffset: 8 },
  { cityName: 'Jayapura', latitude: -2.5333, longitude: 140.7, timezoneOffset: 9 },
]