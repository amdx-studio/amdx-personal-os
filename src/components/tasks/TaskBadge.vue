<script setup lang="ts">
defineProps<{
  label: string
  classes: string
}>()
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
    :class="classes"
  >
    {{ label }}
  </span>
</template>
