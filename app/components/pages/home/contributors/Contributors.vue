<script setup lang="ts">
import type { ContributorsProps } from '.'

const props = defineProps<ContributorsProps>();

const batchOne = computed(() => {
  if (!props.items?.length) return [];
  const midIndex = Math.ceil(props.items.length / 2);
  return props.items.slice(0, midIndex);
});
const batchTwo = computed(() => {
  if (!props.items?.length) return [];
  const midIndex = Math.ceil(props.items.length / 2);
  return props.items.slice(midIndex);
});
</script>

<template>
  <div class="flex flex-col gap-6 pb-24">
    <UPageMarquee
      v-if="batchOne.length"
      v-bind="props"
      :ui="{
        root: '[--duration:360s]',
      }"
    >
      <NuxtLink v-for="item in batchOne" :key="item.id" :to="item.html_url" target="_blank" class="flex items-center">
        <UAvatar :src="item.avatar_url" :alt="item.login" class="mr-2" />
        <span>{{ item.login }}</span>
      </NuxtLink>
    </UPageMarquee>

    <UPageMarquee
        v-if="batchTwo.length"
        v-bind="props"
        :reverse="true"
        :ui="{
          root: '[--duration:360s]',
        }"
      >
      <NuxtLink v-for="item in batchTwo" :key="item.id" :to="item.html_url" target="_blank" class="flex items-center">
        <UAvatar :src="item.avatar_url" :alt="item.login" class="mr-2" />
        <span>{{ item.login }}</span>
      </NuxtLink>
    </UPageMarquee>
  </div>
</template>
