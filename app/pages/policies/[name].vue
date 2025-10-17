<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(`page-${route.path}`, () => queryCollection('policies').path(route.path).first())

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found.', fatal: true })
}

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description
const timeZone = ref()

const headline = computed(() => {
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

  return `${_timeString} (${_dateString})`
})

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// defineOgImageComponent('Saas')

// if (page.value.image?.src) {
//   defineOgImage({
//     url: page.value.image.src
//   })
// } else {
//   defineOgImageComponent('myOgImage', {
//     headline: 'Blog'
//   })
// }

onMounted(() => {
  timeZone.value = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
})
</script>

<template>
  <UContainer>
    <UPageHeader
      :title="page?.title"
      :headline="headline"
    />

    <ContentRenderer
      v-if="page"
      :value="page"
    />
  </UContainer>
</template>
