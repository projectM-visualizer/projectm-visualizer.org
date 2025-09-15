<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

const { data: page } = await useAsyncData('page-index', () => queryCollection('index').first())
const dataStore = useDataStore()

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

const { isMobile } = useDevice()

const videoReady = ref(false)

const projects = ref<Project[]>([])
const contributors = ref<Contributor[]>([])

const loadingProjects = ref(true)
const loadingContributors = ref(true)

const batchOne = computed(() => {
  if (!contributors.value.length) return []
  const mid = Math.ceil(contributors.value.length / 2)
  return contributors.value.slice(0, mid)
})
const batchTwo = computed(() => {
  if (!contributors.value.length) return []
  const mid = Math.ceil(contributors.value.length / 2)
  return contributors.value.slice(mid)
})

onMounted(async () => {
  try {
    projects.value = dataStore.getProjects({
      itemsToShow: page.value?.projects?.itemsToShow || 6,
      featured: page.value?.projects?.featured || [],
      sortBy: page.value?.projects?.sortBy || 'stars'
    })

    await new Promise(resolve => setTimeout(resolve, 300))
  } catch (error) {
    console.error('Error loading projects:', error)
  } finally {
    if (projects.value.length > 0) {
      loadingProjects.value = false
    } else {
      console.warn('No projects found.')
    }
  }

  try {
    contributors.value = dataStore.getContributors()

    await new Promise(resolve => setTimeout(resolve, 300))
  } catch (error) {
    console.error('Error loading contributors:', error)
  } finally {
    if (contributors.value.length > 0) {
      loadingContributors.value = false
    } else {
      console.warn('No contributors found.')
    }
  }
})
</script>

<template>
  <div v-if="page">
    <UPageHero
      v-if="page.hero"
      v-bind="page.hero"
    >
      <div class="relative">
        <UPageCard
          variant="subtle"
          class="rounded-2xl shadow-2xl"
        >
          <div
            class="relative w-full overflow-hidden rounded-lg ring ring-default"
            style="aspect-ratio: 16 / 9;"
          >
            <USkeleton
              v-if="!videoReady"
              class="absolute inset-0 w-full h-full"
            />

            <ClientOnly>
              <VideoPlayer
                v-if="page.hero.video && (page.hero.video.src || page.hero.video.srcMobile)"
                v-show="videoReady"
                v-bind="page.hero.video"
                :src="isMobile
                  ? useRuntimeConfig().public.siteUrl + page.hero.video.srcMobile
                  : useRuntimeConfig().public.siteUrl + page.hero.video.src"
                class="absolute inset-0 w-full h-full object-cover"
                @ready="videoReady = true"
              />
            </ClientOnly>
          </div>
        </UPageCard>
      </div>
    </UPageHero>

    <UPageSection
      v-if="page.projects"
      v-bind="page.projects"
      :ui="{
        container: 'pb-8 sm:pb-12 lg:pb-20'
      }"
    >
      <ProjectsGitHubGrid
        :items="projects"
        :items-to-show="page.projects.itemsToShow"
        :spotlight="true"
        spotlight-class="[--spotlight-color:var(--ui-primary)] [--spotlight-size:360px]"
        :loading="loadingProjects"
      />
    </UPageSection>

    <UContainer
      v-if="page.contributors"
      class="flex flex-col gap-6 sm:gap-8 pb-16 sm:pb-24 lg:pb-32"
    >
      <UMarquee
        v-if="loadingContributors || batchOne.length"
        v-bind="page.contributors"
        :ui="{
          root: '[--duration:360s]'
        }"
      >
        <template v-if="!loadingContributors">
          <NuxtLink
            v-for="item in batchOne"
            :key="item.id"
            :to="item.to"
            target="_blank"
            class="flex items-center"
          >
            <UAvatar
              :src="useRuntimeConfig().public.siteUrl + item.avatar?.src"
              :alt="item.avatar?.alt"
              class="mr-2"
            />
            <span>{{ item.avatar?.alt }}</span>
          </NuxtLink>
        </template>

        <template v-else>
          <div
            v-for="index in 80"
            :key="'skeleton-contrib-1-' + index"
            class="flex items-center mr-4"
          >
            <USkeleton class="rounded-full h-8 w-8 mr-2" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </template>
      </UMarquee>

      <UMarquee
        v-if="loadingContributors || batchTwo.length"
        v-bind="page.contributors"
        :reverse="true"
        :ui="{
          root: '[--duration:360s]'
        }"
      >
        <template v-if="!loadingContributors">
          <NuxtLink
            v-for="item in batchTwo"
            :key="item.id"
            :to="item.to"
            target="_blank"
            class="flex items-center"
          >
            <UAvatar
              :src="useRuntimeConfig().public.siteUrl + item.avatar?.src"
              :alt="item.avatar?.alt"
              class="mr-2"
            />
            <span>{{ item.avatar?.alt }}</span>
          </NuxtLink>
        </template>

        <template v-else>
          <div
            v-for="index in 80"
            :key="'skeleton-contrib-2-' + index"
            class="flex items-center mr-4"
          >
            <USkeleton class="rounded-full h-8 w-8 mr-2" />
            <USkeleton class="h-6 w-24 rounded-full" />
          </div>
        </template>
      </UMarquee>
    </UContainer>

    <UPageSection
      v-if="page.about"
      v-bind="page.about"
      :ui="{
        features: 'flex flex-col'
      }"
    >
      <template #features>
        <p
          v-for="(text, index) in page.about.summary"
          :key="index"
          class="text-base sm:text-lg text-muted"
        >
          {{ text }}
        </p>
      </template>

      <div
        class="w-full h-[524px] rounded-lg shadow-2xl ring ring-default overflow-hidden relative flex items-center justify-center"
      >
        <NuxtImg
          v-if="page.about.image && page.about.image.src"
          :src="useRuntimeConfig().public.siteUrl + page.about.image.src"
          :srcset="useRuntimeConfig().public.siteUrl + page.about.image.src"
          :alt="page.about.image.alt"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <USkeleton
          v-else
          class="absolute inset-0 w-full h-full"
        />
      </div>
    </UPageSection>

    <UPageSection
      v-if="page.connect"
      v-bind="page.connect"
      :ui="{
        features: 'block'
      }"
    >
      <template #features>
        <UButton
          v-if="page.connect.button"
          v-bind="page.connect.button"
          class="bg-[#5865F2]"
          color="neutral"
          variant="subtle"
          size="xl"
        />
      </template>

      <div
        class="w-full h-[524px] rounded-lg shadow-2xl ring ring-default overflow-hidden relative flex items-center justify-center"
      >
        <NuxtImg
          v-if="page.connect.image && page.connect.image.src"
          :src="useRuntimeConfig().public.siteUrl + page.connect.image.src"
          :srcset="useRuntimeConfig().public.siteUrl + page.connect.image.src"
          :alt="page.connect.image.alt"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <USkeleton
          v-else
          class="absolute inset-0 w-full h-full"
        />
      </div>
    </UPageSection>
  </div>
</template>
