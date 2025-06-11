<script setup lang="ts">
const { projects } = useDataStore()

const formatName = (name: string): string => {
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const formatCount = (n: number): string => {
  return n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const filteredItems = computed(() => {
  let items = projects.items;

  if (projects.featured.length > 0) {
    items = items.filter(item => projects.featured.includes(item.full_name));
  }

  items = [...items];

  switch (projects.sortBy) {
    case 'name':
      items.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'updated':
      items.sort((a, b) => {
        const dateA = (a).updated_at ? new Date((a).updated_at).getTime() : 0;
        const dateB = (b).updated_at ? new Date((b).updated_at).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'stars':
      items.sort((a, b) => ((b).stargazers_count || 0) - ((a).stargazers_count || 0));
      break;
    case 'forks':
      items.sort((a, b) => ((b).forks_count || 0) - ((a).forks_count || 0));
      break;
  }

  if (projects.itemsToShow === 0) {
    return items;
  }

  return items.slice(0, projects.itemsToShow);
});
</script>

<template>
  <div>
    <UPageHeader title="Projects" description="Explore our open source projects." headline="open-source" />
    <UPageGrid class="py-6 lg:py-12">
      <UPageCard
v-for="(project, index) in filteredItems" :key="index" variant="ghost" :to="project.html_url"
        target="_blank" :ui="{
          footer: 'pt-4 mt-auto self-stretch'
        }">
        <template #body>
          <UUser
:name="formatName(project.name)" :description="project.description"
            :avatar="{ src: project.owner.avatar_url, alt: project.owner.login }" size="lg" class="relative"
            orientation="vertical" :ui="{
              description: 'text-xs pt-1',

            }" />
        </template>

        <template #footer>
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span v-if="project.updated_at" class="self-stretch">
              {{ formatDate(project.updated_at) }}
            </span>

            <div class="space-x-2 flex items-center">
              <span v-if="project.stargazers_count > 0" class="flex items-center">
                <UIcon name="i-lucide-star" class="mr-1 size-3" />
                {{ formatCount(project.stargazers_count) }}
              </span>
              <span v-if="project.forks_count > 0" class="flex items-center">
                <UIcon name="i-lucide-git-fork" class="mr-1 size-3" />
                {{ formatCount(project.forks_count) }}
              </span>
            </div>
          </div>
        </template>
      </UPageCard>
    </UPageGrid>
  </div>
</template>
