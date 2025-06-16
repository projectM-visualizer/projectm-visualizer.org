<script lang="ts">
import type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'

export interface FooterProps {
  copyright?: string
  menuItems?: NavigationMenuItem[]
  socialButtons: (ButtonProps & {
    ariaLabel?: string
  })[]
}
</script>

<script setup lang="ts">
const { data: app } = await useAsyncData('app-footer', () => queryCollection('app').first())
</script>

<template>
  <UFooter v-if="app?.footer">
    <template #left>
      <p class="text-muted text-sm text-center max-w-[256px] sm:max-w-none">
        {{ app?.footer.copyright }}
      </p>
    </template>

    <UNavigationMenu
      v-if="app?.footer.links && app.footer.links.length > 0"
      :items="app?.footer.links"
      variant="link"
    />

    <template #right>
      <UButton
        v-for="item in app?.footer.socialButtons"
        :key="item.ariaLabel"
        :aria-label="item.ariaLabel"
        v-bind="item"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
