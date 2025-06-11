<script setup lang="ts">
import { Navbar } from '~/components/app/navbar'
import { Footer } from '~/components/app/footer'

const { navbar, footer } = useDataStore()
</script>

<template>
  <Html>

  <Body>
    <NuxtLoadingIndicator />

    <UApp>
      <Navbar v-bind="navbar" />

      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>

      <Footer v-bind="footer" />
    </UApp>
  </Body>

  </Html>
</template>