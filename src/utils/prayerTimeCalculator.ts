import type { CalculationMethod, AsrMethod } from '../types/prayerSettings'

export interface PrayerTimes {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
}

// Sudut kemiringan matahari di bawah horizon untuk Fajr & Isha, per metode.
// Angka-angka ini adalah konvensi umum yang dipakai berbagai organisasi keislaman,
// BUKAN aturan matematis mutlak — selalu bisa berbeda beberapa menit dari jadwal resmi setempat.
const METHOD_ANGLES: Record<CalculationMethod, { fajr: number; isha: number }> = {
  MWL: { fajr: 18, isha: 17 },
  Kemenag: { fajr: 20, isha: 18 },
  Karachi: { fajr: 18, isha: 18 },
  Makkah: { fajr: 18.5, isha: 18 },
}

const SUNRISE_SUNSET_ANGLE = 0.833 // koreksi refraksi atmosfer standar

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

function toDegrees(rad: number): number {
  return (rad * 180) / Math.PI
}

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// Deklinasi matahari & equation of time, pendekatan standar (Cooper's equation)
// Akurat dalam rentang beberapa menit, cukup untuk kebutuhan pengingat jadwal pribadi.
function sunPosition(date: Date): { declination: number; equationOfTime: number } {
  const n = dayOfYear(date)
  const b = toRadians((360 / 365) * (n - 81))

  const declination = 23.45 * Math.sin(b)
  const equationOfTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b) // menit

  return { declination, equationOfTime }
}

// Selisih jam dari Dhuhr untuk sudut matahari tertentu di bawah/atas horizon
function hourAngle(latitude: number, declination: number, angle: number): number {
  const latRad = toRadians(latitude)
  const decRad = toRadians(declination)

  const cosH =
    (Math.sin(toRadians(-angle)) - Math.sin(latRad) * Math.sin(decRad)) /
    (Math.cos(latRad) * Math.cos(decRad))

  const clamped = Math.min(1, Math.max(-1, cosH))
  return toDegrees(Math.acos(clamped)) / 15 // dalam jam
}

// Sudut matahari saat panjang bayangan mencapai faktor Asr (Shafi=1, Hanafi=2)
function asrAngle(latitude: number, declination: number, shadowFactor: number): number {
  const latRad = toRadians(latitude)
  const decRad = toRadians(declination)
  const altitude = Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latRad - decRad))))
  return toDegrees(altitude)
}

function formatHour(decimalHours: number): string {
  let hours = Math.floor(decimalHours)
  let minutes = Math.round((decimalHours - hours) * 60)

  if (minutes === 60) {
    minutes = 0
    hours += 1
  }
  hours = ((hours % 24) + 24) % 24

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezoneOffset: number,
  calculationMethod: CalculationMethod,
  asrMethod: AsrMethod,
): PrayerTimes {
  const { declination, equationOfTime } = sunPosition(date)
  const angles = METHOD_ANGLES[calculationMethod]
  const shadowFactor = asrMethod === 'Hanafi' ? 2 : 1

  const dhuhr = 12 + timezoneOffset - longitude / 15 - equationOfTime / 60

  const fajrOffset = hourAngle(latitude, declination, angles.fajr)
  const ishaOffset = hourAngle(latitude, declination, angles.isha)
  const sunOffset = hourAngle(latitude, declination, SUNRISE_SUNSET_ANGLE)
  const asrOffset = hourAngle(latitude, declination, 90 - asrAngle(latitude, declination, shadowFactor))

  return {
    fajr: formatHour(dhuhr - fajrOffset),
    sunrise: formatHour(dhuhr - sunOffset),
    dhuhr: formatHour(dhuhr),
    asr: formatHour(dhuhr + asrOffset),
    maghrib: formatHour(dhuhr + sunOffset),
    isha: formatHour(dhuhr + ishaOffset),
  }
}