<script setup lang="ts">
import DownloadsGridCard, { type DownloadsGridCardProps } from './DownloadsGridCard.vue'

export interface DownloadsGridProps {
  items?: DownloadsGridCardProps[]
}

const props = defineProps<DownloadsGridProps>()
</script>

<template>
  <UPageGrid
    class="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 flex-1"
  >
    <DownloadsGridCard
      v-for="(item, index) in props.items"
      :key="index"
      v-bind="item"
    />
  </UPageGrid>
</template>
