<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import GitHubGridCard, { type GitHubGridCardProps } from './GitHubGridCard.vue'

interface GitHubGrid {
  items: GitHubGridCardProps[]
  itemsToShow?: number
  spotlight: boolean
  spotlightClass?: HTMLAttributes['class']
  loading?: boolean
}

const props = defineProps<GitHubGrid>()
</script>

<template>
  <UPageGrid>
    <template v-if="props?.loading">
      <USkeleton
        v-for="index in props?.itemsToShow || 6"
        :key="'project-' + index"
        class="h-[220px] rounded-xl"
      />
    </template>

    <template v-else>
      <GitHubGridCard
        v-for="(item, index) in props?.items"
        :key="index"
        v-bind="item"
        :spotlight="props?.spotlight"
        :spotlight-class="props?.spotlightClass"
      />
    </template>
  </UPageGrid>
</template>
