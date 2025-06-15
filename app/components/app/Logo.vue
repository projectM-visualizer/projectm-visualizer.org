<script lang="ts">
export interface LogoProps {
  to?: string
}
</script>

<script setup lang="ts">
const props = defineProps<LogoProps>()
</script>

<template>
  <component
    :is="props.to ? 'NuxtLink' : 'div'"
    :to="props.to"
    class="flex items-center font-logo text-lg md:text-xl font-normal text-primary"
  >
    ProjectM Visualizer
  </component>
</template>
