<script setup lang="ts">
import type { NavbarProps, NavigationMenuItem } from '.'
import { Logo } from '@/components/app/logo'

const route = useRoute()

const props = defineProps<NavbarProps>();

const menuItems = computed<NavigationMenuItem[]>(() => {
  return props.menuItems.map((item) => {
    const isHome = item.to === '/'
    const isActive = isHome
      ? route.path === '/'
      : item.to
        ? route.path.startsWith(item.to as string)
        : false

    return {
      ...item,
      active: isActive,
    }
  })
})
</script>

<template>
    <UHeader>
      <template #title>
        <Logo 
          class="h-6 w-auto"
          v-bind="props.logo"
        />
      </template>

      <UNavigationMenu :items="menuItems" />

      <!-- TODO: add search-bar -->

      <template #right>
        <UColorModeButton v-if="props.enableColorModeButton" />

        <UButton
          v-for="item in props.customButtons" 
          :key="item.ariaLabel"
          :aria-label="item.ariaLabel"
          v-bind="item"
          color="neutral"
          variant="ghost"
        />
      </template>

      <template #body>
        <UNavigationMenu :items="menuItems" orientation="vertical" class="-mx-2.5" />
      </template>
    </UHeader>
</template>