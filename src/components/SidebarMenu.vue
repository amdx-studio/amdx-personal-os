<script setup lang="ts">
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  CheckSquare,
  StickyNote,
  Wallet,
  Target,
  BarChart3,
  Settings,
} from 'lucide-vue-next'

interface NavItem {
  routeName: string
  label: string
  icon: typeof LayoutDashboard
}

const navItems: NavItem[] = [
  { routeName: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { routeName: 'tasks', label: 'Tasks', icon: CheckSquare },
  { routeName: 'notes', label: 'Notes', icon: StickyNote },
  { routeName: 'finance', label: 'Finance', icon: Wallet },
  { routeName: 'goals', label: 'Goals', icon: Target },
  { routeName: 'statistics', label: 'Statistics', icon: BarChart3 },
]

const route = useRoute()
</script>

<template>
  <aside class="flex h-full w-64 flex-col border-r border-border bg-surface">
    <div class="flex h-16 items-center border-b border-border px-6">
      <span class="text-lg font-semibold text-ink">AMDX</span>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto p-3">
      <router-link
        v-for="item in navItems"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          route.name === item.routeName
            ? 'bg-accent-bg-soft text-accent'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
        "
      >
        <component :is="item.icon" class="h-4 w-4" />
        {{ item.label }}
      </router-link>
    </nav>

    <div class="border-t border-border p-3">
      <router-link
        :to="{ name: 'settings' }"
        class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
        :class="
          route.name === 'settings'
            ? 'bg-accent-bg-soft text-accent'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
        "
      >
        <Settings class="h-4 w-4" />
        Settings
      </router-link>
    </div>
  </aside>
</template>