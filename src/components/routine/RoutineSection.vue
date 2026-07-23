<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import RoutineCategoryBadge from './RoutineCategoryBadge.vue'
import RoutineItem from './RoutineItem.vue'
import type { RoutineActivity, RoutineCategoryId } from '../../types/routine'

const props = defineProps<{
  categoryId: RoutineCategoryId
  activities: RoutineActivity[]
}>()

const emit = defineEmits<{
  (event: 'toggle', id: string): void
  (event: 'edit', activity: RoutineActivity): void
  (event: 'duplicate', id: string): void
  (event: 'delete', id: string): void
}>()

const isCollapsed = ref(false)

const checkedCount = computed(
  () => props.activities.filter((activity) => activity.checked).length,
)

function toggleCollapse(): void {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="rounded-xl border border-border bg-surface">
    <button
      type="button"
      class="flex w-full items-center justify-between px-4 py-3"
      @click="toggleCollapse"
    >
      <div class="flex items-center gap-3">
        <RoutineCategoryBadge :category-id="categoryId" size="sm" />
        <span class="text-xs text-ink-subtle">
          {{ checkedCount }}/{{ activities.length }}
        </span>
      </div>
      <ChevronDown
        class="h-4 w-4 text-ink-subtle transition-transform"
        :class="isCollapsed ? '-rotate-90' : ''"
      />
    </button>

    <div v-if="!isCollapsed" class="space-y-1 border-t border-border px-2 pb-2 pt-2">
      <RoutineItem
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
        @toggle="emit('toggle', $event)"
        @edit="emit('edit', $event)"
        @duplicate="emit('duplicate', $event)"
        @delete="emit('delete', $event)"
      />
    </div>
  </div>
</template>