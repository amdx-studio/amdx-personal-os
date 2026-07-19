<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarMenu from '../components/SidebarMenu.vue'
import AppHeader from '../components/AppHeader.vue'

const route = useRoute()

const pageTitle = computed(() => (route.meta.title as string) ?? '')
const pageSubtitle = computed(() => (route.meta.subtitle as string) ?? '')
</script>

<template>
  <div class="flex h-screen w-screen overflow-hidden bg-surface-muted">
    <SidebarMenu />

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader :title="pageTitle" :subtitle="pageSubtitle" />

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>

      <footer class="flex h-10 items-center justify-between border-t border-border bg-surface px-6 text-xs text-ink-subtle">
        <span>AMDX Personal OS</span>
        <span>v0.0.0</span>
      </footer>
    </div>
  </div>
</template>