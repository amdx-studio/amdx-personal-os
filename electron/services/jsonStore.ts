import { app } from 'electron'
import fs from 'node:fs/promises'
import path from 'node:path'

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

/**
 * Membaca file JSON. Jika file belum ada, otomatis dibuat
 * dengan nilai default yang diberikan.
 */
export async function readJsonFile<T>(fileName: string, defaultValue: T): Promise<T> {
  await ensureDataDir()
  const filePath = getFilePath(fileName)

  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  } catch (error) {
    const isFileNotFound = (error as NodeJS.ErrnoException).code === 'ENOENT'

    if (isFileNotFound) {
      await writeJsonFile(fileName, defaultValue)
      return defaultValue
    }

    throw new Error(`Gagal membaca ${fileName}: ${(error as Error).message}`)
  }
}

/**
 * Menulis file JSON secara atomic: tulis ke file sementara
 * dulu, lalu rename. Mencegah file korup jika terjadi crash
 * di tengah proses penulisan.
 */
export async function writeJsonFile<T>(fileName: string, data: T): Promise<void> {
  await ensureDataDir()
  const filePath = getFilePath(fileName)
  const tempPath = `${filePath}.tmp`

  const content = JSON.stringify(data, null, 2)

  await fs.writeFile(tempPath, content, 'utf-8')
  await fs.rename(tempPath, filePath)
}