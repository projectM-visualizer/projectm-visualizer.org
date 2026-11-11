<script setup lang="ts">
const { data: page } = await useAsyncData('page-presets', () => queryCollection('presets').first())

useSeoMeta({
  titleTemplate: '',
  title: page.value?.title,
  ogTitle: page.value?.title,
  description: page.value?.description,
  ogDescription: page.value?.description
})
</script>

<template>
  <UPageSection
    v-if="page?.presets"
    v-bind="page.presets"
    :ui="{
      container: 'pb-8 sm:pb-12 lg:pb-20'
    }"
  >
    <div
      v-for="group in page.presets.groups"
      :key="group.title"
      class="flex flex-col gap-4"
    >
      <h2 class="text-xl font-semibold text-highlighted">
        {{ group.title }}
      </h2>

      <UPageGrid>
        <UPageCard
          v-for="item in group.items"
          :key="item.to"
          variant="ghost"
          :to="item.to"
          target="_blank"
          :ui="{
            footer: 'pt-4 mt-auto'
          }"
          spotlight
          class="[--spotlight-color:var(--ui-primary)] [--spotlight-size:360px]"
        >
          <template #body>
            <UUser
              :name="item.title"
              :description="item.description"
              :avatar="{ icon: 'i-lucide-package' }"
              :ui="{
                root: 'flex items-start gap-2.5',
                avatar: 'size-5 mb-0',
                name: 'text-base text-pretty font-semibold text-highlighted',
                description: 'text-[15px] text-pretty text-muted'
              }"
            />
          </template>

          <template #footer>
            <span class="text-sm text-muted">{{ item.count }}</span>
          </template>
        </UPageCard>
      </UPageGrid>
    </div>
  </UPageSection>
</template>
