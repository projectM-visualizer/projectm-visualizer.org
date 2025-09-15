<script setup lang="ts">
definePageMeta({
  layout: 'docs'
})

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => queryCollection('docs').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('docs', route.path, {
    fields: ['description']
  })
})

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description
const timeZone = ref()

const date = computed(() => {
  if (!page.value?.date || !timeZone.value) {
    return undefined
  }

  const _date = new Date(page.value?.date)
  const _dateString = _date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timeZone.value
  })
  const _timeString = _date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone.value,
    timeZoneName: 'short'
  })

  return `Updated at ${_timeString} (${_dateString})`
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

defineOgImageComponent('Saas')

onMounted(() => {
  timeZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
})
</script>

<template>
  <UPage v-if="page">
    <UPageHeader
      :title="page.title"
      :description="page.description"
    />

    <UPageBody>
      <ContentRenderer
        v-if="page.body"
        :value="page"
      />

      <DateSeparator
        v-if="surround?.length"
        :label="date"
      />

      <UContentSurround :surround="surround" />
    </UPageBody>

    <template
      v-if="page?.body?.toc?.links?.length"
      #right
    >
      <UContentToc :links="page.body.toc.links" />
    </template>
  </UPage>
</template>
