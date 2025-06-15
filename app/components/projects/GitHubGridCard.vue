<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ProjectExportItem } from '#shared/utils/useProjects'

export interface GitHubGridCardProps extends ProjectExportItem {
  spotlight?: boolean
  spotlightClass?: HTMLAttributes['class']
}

const props = defineProps<GitHubGridCardProps>()
</script>

<template>
  <UPageCard
    variant="ghost"
    :to="props.to"
    target="_blank"
    :ui="{
      footer: 'pt-4 mt-auto self-stretch'
    }"
    :spotlight="props.spotlight"
    :class="props.spotlightClass"
  >
    <template #body>
      <UUser
        :name="useStyleName(props.name)"
        :description="props.description"
        :avatar="{ src: props.owner.src, alt: props.owner.alt }"
        class="relative"
        orientation="horizontal"
        :ui="{
          root: 'flex items-start gap-2.5',
          avatar: 'size-5 mb-0',
          name: 'text-base text-pretty font-semibold text-highlighted',
          description: 'text-[15px] text-pretty text-muted'
        }"
      />
    </template>

    <template #footer>
      <div class="flex items-center justify-between text-sm text-muted">
        <span
          v-if="props.updatedAt"
          class="self-stretch"
        >
          {{ useStyleDate(props.updatedAt) }}
        </span>

        <div class="space-x-2 flex items-center">
          <span
            class="flex items-center"
          >
            <UIcon
              name="i-lucide-star"
              class="mr-1 size-3"
            />
            {{ useStyleCount(props.stars) }}
          </span>
          <span
            class="flex items-center"
          >
            <UIcon
              name="i-lucide-git-fork"
              class="mr-1 size-3"
            />
            {{ useStyleCount(props.forks) }}
          </span>
        </div>
      </div>
    </template>
  </UPageCard>
</template>
