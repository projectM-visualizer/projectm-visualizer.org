<script setup lang="ts">
import { VideoPlayer } from '@videojs-player/vue'
import 'video.js/dist/video-js.css'

const { data: page } = await useAsyncData('index', () => queryCollection('index').first())

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

const projects = ref<ProjectItem[]>([])
const contributors = ref<ContributorItem[]>([])

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

const discordWidgetSrc = computed(() => {
  const widgetId = page.value?.connect?.discordWidgetId
  const color = useColorMode().value === 'dark' ? 'light' : 'dark'

  return widgetId ? `https://discord.com/widget?id=${widgetId}&theme=${color}` : undefined
})

const isClient = ref(false)

onMounted(async () => {
  isClient.value = true

  try {
    const projectData = await useProjects({
      itemsToShow: page.value?.projects?.itemsToShow || 6,
      featured: page.value?.projects?.featured || [],
      sortBy: page.value?.projects?.sortBy || 'stars'
    })

    projects.value = projectData

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
    const contributorData = await useContributors()

    contributors.value = contributorData

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
      <UPageGrid>
        <template v-if="loadingProjects">
          <USkeleton
            v-for="index in 6"
            :key="'project-' + index"
            class="h-[198px] rounded-xl"
          />
        </template>

        <template v-else>
          <UPageCard
            v-for="(project, index) in projects"
            :key="index"
            variant="ghost"
            :to="project.html_url"
            target="_blank"
            :ui="{
              footer: 'pt-4 mt-auto self-stretch'
            }"
          >
            <template #body>
              <UUser
                :name="useStyleName(project.name)"
                :description="project.description"
                :avatar="{ src: project.owner.avatar_url, alt: project.owner.login }"
                size="lg"
                class="relative"
                orientation="vertical"
                :ui="{
                  description: 'text-xs pt-1'

                }"
              />
            </template>

            <template #footer>
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span
                  v-if="project.updated_at"
                  class="self-stretch"
                >
                  {{ useStyleDate(project.updated_at) }}
                </span>

                <div class="space-x-2 flex items-center">
                  <span
                    v-if="project.stargazers_count > 0"
                    class="flex items-center"
                  >
                    <UIcon
                      name="i-lucide-star"
                      class="mr-1 size-3"
                    />
                    {{ useStyleCount(project.stargazers_count) }}
                  </span>
                  <span
                    v-if="project.forks_count > 0"
                    class="flex items-center"
                  >
                    <UIcon
                      name="i-lucide-git-fork"
                      class="mr-1 size-3"
                    />
                    {{ useStyleCount(project.forks_count) }}
                  </span>
                </div>
              </div>
            </template>
          </UPageCard>
        </template>
      </UPageGrid>
    </UPageSection>

    <UContainer
      v-if="page.contributors"
      class="flex flex-col gap-6 sm:gap-8 pb-16 sm:pb-24 lg:pb-32"
    >
      <UPageMarquee
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
            :to="item.html_url"
            target="_blank"
            class="flex items-center"
          >
            <UAvatar
              :src="item.avatar_url"
              :alt="item.login"
              class="mr-2"
            />
            <span>{{ item.login }}</span>
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
      </UPageMarquee>

      <UPageMarquee
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
            :to="item.html_url"
            target="_blank"
            class="flex items-center"
          >
            <UAvatar
              :src="item.avatar_url"
              :alt="item.login"
              class="mr-2"
            />
            <span>{{ item.login }}</span>
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
      </UPageMarquee>
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
    >
      <div class="w-full h-[524px] rounded-lg shadow-2xl ring ring-default overflow-hidden relative">
        <USkeleton class="absolute inset-0 w-full h-full z-0" />

        <iframe
          v-if="isClient && discordWidgetSrc"
          :src="discordWidgetSrc"
          allowtransparency="true"
          frameborder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          class="absolute inset-0 w-full h-full z-10 transition-opacity duration-300"
        />
      </div>
    </UPageSection>
  </div>
</template>
