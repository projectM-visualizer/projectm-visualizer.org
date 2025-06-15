<script lang="ts">
import type { ButtonProps, NavigationMenuItem } from '@nuxt/ui'
import type { LogoProps } from '~/components/app/Logo.vue'

export interface HeaderProps {
  logo?: LogoProps
  menuItems?: NavigationMenuItem[]
  enableColorModeButton?: boolean
  customButtons?: (ButtonProps & {
    ariaLabel?: string
  })[]
}
</script>

<script setup lang="ts">
const route = useRoute()

const { data: app } = await useAsyncData('app-header', () => queryCollection('app').first())

const menuItems = computed<NavigationMenuItem[]>(() => {
  if (!app.value?.links || app.value?.links.length === 0) {
    return []
  }

  return app.value?.links.map((item) => {
    const isHome = item.to === '/'
    const isActive = isHome
      ? route.path === '/'
      : item.to
        ? route.path.startsWith(item.to as string)
        : false

    return {
      ...item,
      active: isActive
    }
  })
})
</script>

<template>
  <UHeader v-if="app?.header">
    <template #title>
      <AppLogo
        v-if="app?.header.logo"
        class="w-auto h-6 shrink-0"
        v-bind="app?.header.logo"
      />
    </template>

    <UNavigationMenu
      v-if="menuItems.length > 0"
      :items="menuItems"
    />

    <template #right>
      <UColorModeButton v-if="app?.header.enableColorModeButton" />

      <UButton
        v-for="item in app?.header.customButtons"
        :key="item.label"
        :aria-label="item.label"
        v-bind="item"
        color="neutral"
        variant="ghost"
      />
    </template>

    <template #body>
      <UNavigationMenu
        v-if="menuItems.length > 0"
        :items="menuItems"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator
        v-if="menuItems.length > 0"
        class="my-6"
      />

      <UButton
        v-for="item in app?.header.customButtons"
        :key="item.ariaLabel"
        :aria-label="item.ariaLabel"
        v-bind="item"
        color="neutral"
        variant="ghost"
        class="mb-3"
      />
    </template>
  </UHeader>
</template>
