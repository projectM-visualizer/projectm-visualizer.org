<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'
import type { HeroProps } from '.'

const props = defineProps<HeroProps>();
</script>

<template>
  <UPageHero v-bind="props" :ui="{ title: 'text-3xl sm:text-4xl lg:text-5xl'}">
    <div class="rounded-lg shadow-2xl ring ring-default w-full aspect-video overflow-hidden">
      <VideoPlayer v-if="props.videoPlayer?.src" v-bind="props.videoPlayer" class="w-full aspect-video" />

      <USkeleton v-else class="w-full h-full" />
    </div>
  </UPageHero>
</template>
