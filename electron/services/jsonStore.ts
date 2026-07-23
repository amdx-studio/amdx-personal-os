import { app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

function getDataDir(): string {
  return path.join(app.getPath('userData'), 'data')
}

async function ensureDataDir(): Promise<void> {
  const dir = getDataDir()
  await fs.mkdir(dir, { recursive: true })
}

function getFilePath(fileName: string): string {
  return path.join(getDataDir(), fileName)
}

/* ------------------------------------------------------------------ */
/* Per-file write queue (mutex sederhana, tanpa library eksternal)     */
/* ------------------------------------------------------------------ */

/**
 * Setiap file (berdasarkan path absolutnya) punya antrean sendiri.
 * Semua operasi baca/tulis/transaksi untuk file yang SAMA dijalankan
 * berurutan (FIFO) — persis seperti Operation A -> B -> C yang diminta.
 * Tidak akan pernah ada dua operasi I/O berjalan bersamaan pada file
 * yang sama.
 *
 * File yang BERBEDA tetap punya antrean terpisah dan berjalan paralel
 * seperti biasa, jadi ini tidak membuat seluruh aplikasi jadi
 * single-threaded — hanya operasi pada file yang sama yang diserialkan.
 *
 * Implementasinya murni chaining Promise, tidak ada dependency baru.
 */
const fileQueues = new Map<string, Promise<void>>()

function withFileQueue<T>(key: string, task: () => Promise<T>): Promise<T> {
  // Ambil "ekor" antrean saat ini (promise yang sudah pasti settle,
  // tidak pernah reject -- lihat di bawah). Kalau belum ada antrean
  // untuk file ini, mulai dari promise yang sudah resolved.
  const previous = fileQueues.get(key) ?? Promise.resolve()

  // Task baru ini akan dieksekusi setelah task sebelumnya (di file yang
  // sama) selesai, apa pun hasilnya.
  const result = previous.then(() => task())

  // Simpan versi "settled" dari task ini sebagai ekor antrean berikutnya.
  // Sengaja tidak pernah reject, supaya kalau task ini gagal, task
  // BERIKUTNYA di antrean tetap bisa jalan (antrean tidak macet
  // selamanya gara-gara satu error).
  const settled = result.then(
    () => undefined,
    () => undefined,
  )
  fileQueues.set(key, settled)

  // Bersihkan entry map kalau memang tidak ada task lain yang menyusul
  // untuk key ini, supaya Map tidak terus membesar selama app berjalan.
  void settled.finally(() => {
    if (fileQueues.get(key) === settled) {
      fileQueues.delete(key)
    }
  })

  // Error dari task tetap dilempar ke pemanggil aslinya lewat `result`.
  return result
}

/* ------------------------------------------------------------------ */
/* Low-level atomic file I/O (TIDAK melewati antrean di sini --        */
/* pemanggilnya yang bertanggung jawab memastikan sudah di dalam       */
/* antrean, supaya tidak terjadi deadlock kalau dipanggil bersarang)   */
/* ------------------------------------------------------------------ */

async function readFileDirect<T>(filePath: string, fileName: string, defaultValue: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch (error) {
    const isFileNotFound = (error as NodeJS.ErrnoException).code === 'ENOENT'

    if (isFileNotFound) {
      await writeFileDirect(filePath, defaultValue)
      return defaultValue
    }

    throw new Error(`Gagal membaca ${fileName}: ${(error as Error).message}`)
  }
}

/**
 * Menulis file secara atomic & durable:
 * 1. Tulis ke file sementara dengan nama UNIK (bukan `${file}.tmp` yang
 *    tetap) -- jadi walau ada bug lain yang memanggil ini tanpa antrean,
 *    dua write tidak akan pernah rebutan nama file sementara yang sama.
 * 2. fsync isi file temp ke disk (bukan cuma masuk OS buffer).
 * 3. rename() ke nama final -- rename dalam satu filesystem bersifat
 *    atomic di level OS, jadi tidak pernah ada state "file setengah
 *    tertulis" yang terbaca oleh proses lain.
 * 4. fsync direktori supaya rename-nya sendiri juga persisten di disk
 *    (best practice Linux/macOS; di Windows fsync direktori tidak
 *    didukung, jadi error di langkah ini diabaikan karena tidak fatal).
 * 5. Kalau ada error di tengah jalan, file temp dibersihkan supaya
 *    tidak ada sampah `.tmp` yang menumpuk.
 */
async function writeFileDirect<T>(filePath: string, data: T): Promise<void> {
  const dir = path.dirname(filePath)
  const tempPath = `${filePath}.${process.pid}-${randomUUID()}.tmp`
  const content = JSON.stringify(data, null, 2)

  let fileHandle: Awaited<ReturnType<typeof fs.open>> | undefined

  try {
    fileHandle = await fs.open(tempPath, 'w')
    await fileHandle.writeFile(content, 'utf-8')
    await fileHandle.sync()
    await fileHandle.close()
    fileHandle = undefined

    await fs.rename(tempPath, filePath)

    try {
      const dirHandle = await fs.open(dir, 'r')
      try {
        await dirHandle.sync()
      } finally {
        await dirHandle.close()
      }
    } catch {
      // Tidak fatal. Beberapa platform (terutama Windows) tidak
      // mendukung fsync pada file descriptor direktori. rename() di
      // atas tetap dianggap berhasil.
    }
  } catch (error) {
    if (fileHandle) {
      await fileHandle.close().catch(() => {})
    }
    // Fallback cleanup: pastikan tidak ada file .tmp yang tersisa.
    await fs.rm(tempPath, { force: true }).catch(() => {})
    throw error
  }
}

/* ------------------------------------------------------------------ */
/* Public API -- SIGNATURE TIDAK BERUBAH                               */
/* ------------------------------------------------------------------ */

/**
 * Membaca file JSON. Jika file belum ada, otomatis dibuat dengan nilai
 * default yang diberikan.
 *
 * Dijalankan lewat antrean per-file, jadi tidak akan pernah membaca
 * file di tengah-tengah proses tulis file yang sama sedang berlangsung.
 */
export async function readJsonFile<T>(fileName: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  const filePath = getFilePath(fileName)

  return withFileQueue(filePath, () => readFileDirect(filePath, fileName, defaultValue))
}

/**
 * Menulis file JSON secara atomic & durable (lihat writeFileDirect).
 *
 * Dijalankan lewat antrean per-file, sehingga dua pemanggilan
 * writeJsonFile() untuk file yang sama TIDAK PERNAH berjalan
 * bersamaan -- inilah yang menghilangkan error ENOENT saat rename.
 */
export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = getFilePath(fileName)

  return withFileQueue(filePath, () => writeFileDirect(filePath, data))
}

/**
 * Konteks yang diberikan ke callback withFileTransaction(). `read` dan
 * `write` di sini SENGAJA tidak memanggil readJsonFile/writeJsonFile
 * publik (yang akan masuk antrean lagi dan menyebabkan deadlock),
 * melainkan langsung ke operasi file, karena kita sudah berada di
 * dalam slot antrean.
 */
export interface FileTransactionContext {
  read<T>(defaultValue: T): Promise<T>
  write<T>(data: T): Promise<void>
}

/**
 * Menjalankan `run` secara EKSKLUSIF untuk satu file: selama `run`
 * berjalan, tidak ada readJsonFile/writeJsonFile/withFileTransaction
 * LAIN untuk file yang sama yang bisa menyela di tengah-tengah.
 *
 * Ini untuk pola "baca semua data -> ubah sebagian -> simpan lagi"
 * (read-modify-write) seperti yang dipakai financeService. Tanpa ini,
 * dua operasi read-modify-write yang berjalan bersamaan tetap bisa
 * saling menimpa perubahan satu sama lain (lost update) walaupun
 * masing-masing write individualnya sudah aman secara file I/O.
 */
export async function withFileTransaction<T>(
  fileName: string,
  run: (ctx: FileTransactionContext) => Promise<T>,
): Promise<T> {
  await ensureDataDir()
  const filePath = getFilePath(fileName)

  return withFileQueue(filePath, () => {
    const ctx: FileTransactionContext = {
      read: (defaultValue) => readFileDirect(filePath, fileName, defaultValue),
      write: (data) => writeFileDirect(filePath, data),
    }
    return run(ctx)
  })
}