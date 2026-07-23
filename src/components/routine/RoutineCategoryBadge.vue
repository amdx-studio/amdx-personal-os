<script setup lang="ts">
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'
import { getRoutineCategoryDefinition } from '../../constants/routineCategories'
import type { RoutineCategoryId } from '../../types/routine'

const props = withDefaults(
  defineProps<{
    categoryId: RoutineCategoryId
    size?: 'sm' | 'md'
  }>(),
  {
    size: 'md',
  },
)

const definition = computed(() => getRoutineCategoryDefinition(props.categoryId))

const iconComponent = computed(() => {
  const icons = LucideIcons as unknown as Record<string, unknown>
  return icons[definition.value.icon] ?? LucideIcons.Sparkles
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full font-medium"
    :class="size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'"
    :style="{
      backgroundColor: `${definition.color}1A`,
      color: definition.color,
    }"
  >
    <component :is="iconComponent" :class="size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'" />
    {{ definition.name }}
  </span>
</template>