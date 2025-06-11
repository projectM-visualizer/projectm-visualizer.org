<script setup lang="ts">
import type { FooterProps } from '.';

const props = defineProps<FooterProps>();
</script>

<template>
  <UFooter>
    <template #left>
      <p class="text-muted text-sm">{{ props.copyright }}</p>
    </template>

    <UNavigationMenu :items="props.menuItems" variant="link" />

    <template #right>
      <UButton
          v-for="item in props.socialButtons" 
          :key="item.ariaLabel"
          :aria-label="item.ariaLabel"
          v-bind="item"
          color="neutral"
          variant="ghost"
        />
    </template>
  </UFooter>
</template>