import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../pages/DashboardPage.vue'),
    meta: { title: 'Dashboard', subtitle: 'Ringkasan aktivitas harian kamu' },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('../pages/TasksPage.vue'),
    meta: { title: 'Tasks', subtitle: 'Kelola daftar tugas kamu' },
  },
  {
    path: '/habits',
    name: 'habits',
    component: () => import('../pages/HabitsPage.vue'),
    meta: { title: 'Habits', subtitle: 'Pantau kebiasaan harian kamu' },
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../pages/NotesPage.vue'),
    meta: { title: 'Notes', subtitle: 'Catatan dan ide kamu' },
  },
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('../pages/CalendarPage.vue'),
    meta: { title: 'Calendar', subtitle: 'Jadwal dan agenda kamu' },
  },
  {
    path: '/finance',
    name: 'finance',
    component: () => import('../pages/FinancePage.vue'),
    meta: { title: 'Finance', subtitle: 'Pantau keuangan pribadi kamu' },
  },
  {
    path: '/goals',
    name: 'goals',
    component: () => import('../pages/GoalsPage.vue'),
    meta: { title: 'Goals', subtitle: 'Target dan pencapaian kamu' },
  },
  {
    path: '/prayer',
    name: 'prayer',
    component: () => import('../pages/PrayerPage.vue'),
    meta: { title: 'Prayer Time', subtitle: 'Jadwal waktu sholat' },
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: () => import('../pages/StatisticsPage.vue'),
    meta: { title: 'Statistics', subtitle: 'Ringkasan statistik aktivitas kamu' },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('../pages/SettingsPage.vue'),
    meta: { title: 'Settings', subtitle: 'Pengaturan aplikasi' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router