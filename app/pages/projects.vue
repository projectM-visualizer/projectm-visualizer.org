<script setup lang="ts">
const { data: page } = await useAsyncData('page-projects', () => queryCollection('projects').first())
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

const projects = ref<Project[]>([])
const loadingProjects = ref(true)

onMounted(async () => {
  try {
    projects.value = dataStore.getProjects({
      itemsToShow: page.value?.projects?.itemsToShow || 0,
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
})
</script>

<template>
  <div v-if="page">
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
  </div>
</template>
