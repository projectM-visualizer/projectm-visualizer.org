<script setup lang="ts">
import type { AboutProps } from '.'

const props = defineProps<AboutProps>()
</script>

<template>
  <UPageSection
    v-bind="props"
    :ui="{
      features: 'flex flex-col'
    }"
  >
    <template #features>
      <p v-for="(text, index) in props.summary" :key="index" class="text-base sm:text-lg text-muted">
        {{ text }}
      </p>
    </template>

    <NuxtImg
      v-if="props.image"
      :src="props.image.src"
      :alt="props.image.alt"
      class="w-full h-auto rounded-lg shadow-2xl"
    />

    <USkeleton
      v-else
      class="w-full h-[524px] rounded-lg shadow-2xl"
    />
  </UPageSection>
</template>
