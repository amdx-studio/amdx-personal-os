# AMDX Personal OS — Progress Log

Dokumen ini merangkum apa yang sudah dikerjakan dan apa yang berikutnya. Berguna sebagai konteks jika sesi development dilanjutkan di lain waktu.

---

## Tentang Project

Aplikasi desktop produktivitas pribadi, offline-first, dibangun dengan:
- **Frontend:** Vue 3 + TypeScript + Vite + Pinia + Vue Router + Day.js
- **Desktop:** Electron
- **Storage:** JSON file lokal (rencana migrasi ke SQLite di masa depan)

## Arsitektur (Layer Architecture)

```
Vue Page → Pinia Store → Renderer Service (src/services/) → window.electronAPI (preload)
    → IPC (electron/ipc/) → Main Process Service (electron/services/) → JSON File
```

Prinsip kunci: **frontend tidak pernah membaca file JSON langsung**. Semua akses data lewat rantai di atas. Jika nanti migrasi ke SQLite, hanya `electron/services/*` yang berubah — sisanya tetap sama.

Lokasi data: `app.getPath('userData')/data/*.json` (bukan folder project — supaya writable setelah aplikasi di-install sebagai .exe).

---

## Status per Phase

### ✅ Phase 1 — Project Initialization
Vite + Vue + TypeScript scaffold, npm install semua dependency awal (Pinia, Vue Router, Day.js, UUID, Electron, Electron Builder, dll).

### ✅ Phase 2 — Frontend Foundation
Vue Router, Pinia, Day.js ter-install (baru diaktifkan penuh belakangan).

### ✅ Phase 3 — Electron Foundation
- `electron/main.ts` — window creation, lifecycle, keamanan (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`)
- `electron/preload.ts` — contextBridge, expose `window.electronAPI`
- `src/types/electron.d.ts` — type declaration global
- `vite-plugin-electron` terintegrasi di `vite.config.ts`
- `package.json` — field `"main": "dist-electron/main.js"`
- Teruji: dev mode & production build (`npm run build` + `npx electron .`)

### ✅ Phase 4 — Tailwind CSS
- Tailwind v4 (CSS-first config, tanpa `tailwind.config.js`)
- Design token custom di `src/style.css` (`@theme`) — gaya minimalis/clean, 1 warna aksen ungu (`#aa3bff`)

### ✅ Phase 5 — Folder Structure
Struktur `src/` lengkap: `components/`, `layouts/`, `pages/`, `router/`, `stores/`, `services/`, `types/`, `utils/`, `assets/`.

### ✅ Phase 6 — Application Layout
- `lucide-vue-next` untuk ikon
- `SidebarMenu.vue`, `AppHeader.vue`, `MainLayout.vue` (pakai slot, siap diganti `<router-view />`)

### ✅ Phase 7 — Routing
- `router/index.ts` — hash mode (`createWebHashHistory`, wajib untuk Electron production), lazy-loaded routes, `meta.title`/`meta.subtitle` per route
- `MainLayout.vue` baca judul otomatis dari route aktif
- `SidebarMenu.vue` pakai `<router-link>` sungguhan
- Pinia resmi diaktifkan (`app.use(createPinia())`) di `main.ts`

### ✅ Phase 8 — Local JSON Engine
- `electron/services/jsonStore.ts` — generic read/write JSON, atomic write (tulis ke `.tmp` lalu rename), auto-create default jika file belum ada
- Modul referensi: **Settings** (`settingsService.ts` di main & renderer, `settingsHandlers.ts`, `useSettingsStore.ts`)
- Teruji end-to-end: ubah data → restart aplikasi → data tetap ada

### ✅ Phase 9 — Dashboard
- Sapaan dinamis (pakai Day.js, locale Indonesia)
- `SummaryCard.vue` — komponen reusable untuk kartu ringkasan
- Kartu placeholder untuk Tasks/Habits/Finance/Notes (nilai `—`, ditandai jelas sebagai placeholder, siap diisi data asli)

### 🔄 Phase 10 — Modules (sedang berjalan)
Pola CRUD penuh per modul: `types/` → `electron/services/` → `electron/ipc/` → `preload.ts` → `src/services/` → `src/stores/` → `pages/*.vue`

- ✅ **10.1 Tasks** — selesai, teruji (tambah/toggle/hapus, persisten)
- ✅ **10.2 Habits** — selesai (tambah/toggle hari ini/hapus, streak dihitung di store, persisten — **menunggu konfirmasi hasil test dari kamu**)
- ⬜ 10.3 Notes
- ⬜ 10.4 Calendar
- ⬜ 10.5 Finance
- ⬜ 10.6 Goals
- ⬜ 10.7 Prayer Time
- ⬜ 10.8 Statistics (agregasi dari modul lain — dikerjakan paling akhir)

### ⬜ Phase 11 — Backup & Restore
### ⬜ Phase 12 — Packaging (installer .exe)

---

## Selanjutnya

1. **Konfirmasi test Habits** — kalau belum sempat: tambah habit, centang, cek streak, tutup-buka app lagi, pastikan data tetap ada.
2. Lanjut **Modul 10.3 — Notes** dengan pola yang identik ke Tasks/Habits.
3. Setelah semua 8 modul selesai → Phase 11 (Backup & Restore: export/import seluruh folder `data/` sebagai satu file zip/json gabungan).
4. Terakhir, Phase 12 (Packaging) — konfigurasi `electron-builder` untuk menghasilkan installer Windows `.exe`.

## Catatan Teknis Penting (jangan lupa)

- Import relatif di `electron/**/*.ts` **wajib** pakai ekstensi `.js` (karena `"module": "nodenext"`), meski file aslinya `.ts`.
- Import relatif di `src/**/*.ts` **tidak** pakai ekstensi (mode `bundler` dari Vite scaffold).
- Preload di-build sebagai `preload.mjs` (bukan `.js`) — sudah dikonfigurasi di `vite.config.ts`.
- Setiap modul baru wajib didaftarkan di 2 tempat: `electron/ipc/index.ts` dan `electron/preload.ts`.
- Pola optimistic update dipakai konsisten di semua Pinia store: ubah state lokal dulu, baru tulis ke file di belakang layar.
