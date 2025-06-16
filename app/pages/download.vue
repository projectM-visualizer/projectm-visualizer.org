<script setup lang="ts">
const { data: page } = await useAsyncData('page-download', () => queryCollection('download').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div v-if="page">
    <UPageSection
      v-if="page.download"
      v-bind="page.download"
      :ui="{
        container: 'pb-8 sm:pb-12 lg:pb-20 flex-col',
        features: 'flex'
      }"
    >
      <template #features>
        <UPageCard
          variant="subtle"
          class="rounded-2xl shadow-2xl flex-1"
        >
          <DownloadDownloadsGrid
            v-if="page.download.items"
            :items="page.download.items"
          />
        </UPageCard>
      </template>
    </UPageSection>
  </div>
</template>
