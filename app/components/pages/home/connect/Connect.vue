<script setup lang="ts">
import type { ConnectProps } from '.'

const props = defineProps<ConnectProps>()

const colorMode = useColorMode()
const widgetSrc = computed(() => {
  const theme = colorMode.value === 'dark' ? 'light' : 'dark'
  
  return `https://discord.com/widget?id=737206408482914387&theme=${theme}`
})
</script>

<template>
  <UPageSection
    v-bind="props"
  >
    <iframe 
      :src="widgetSrc" 
      allowtransparency="true" 
      frameborder="0" 
      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
      class="w-full h-[524px] rounded-lg shadow-2xl ring ring-default overflow-hidden"
    />
  </UPageSection>
</template>
