<script setup lang="ts">
export interface DownloadsGridCardProps {
  icon?: string
  title?: string
  description?: string
  items?: {
    icon?: string
    label?: string
    repoName?: string
    releaseUrl?: string
    version?: string
    releaseDate?: string
    downloadUrl?: string
  }[]
}

const props = defineProps<DownloadsGridCardProps>()

const dataStore = useDataStore()

const remapItems = computed(() => {
  return props.items?.map((item) => {
    if (!item.repoName) return item

    const project = dataStore.getProjectReleaseByName(item.repoName)
    const release = project?.release
    const assets = release?.assets ?? []

    const title = props.title?.toLowerCase() || ''

    let downloadAsset = undefined

    if (title.includes('windows')) {
      downloadAsset = assets.find(asset =>
        asset.url?.toLowerCase().includes('.exe')
        || asset.url?.toLowerCase().includes('.zip')
      )
    } else if (title.includes('macos')) {
      downloadAsset = assets.find(asset =>
        asset.url?.toLowerCase().includes('.dmg')
        || asset.url?.toLowerCase().includes('.pkg')
      )

      if (!downloadAsset) {
        downloadAsset = assets.find(asset =>
          asset.url?.toLowerCase().includes('.tar.gz')
          || asset.url?.toLowerCase().includes('.zip')
        )
      }
    } else if (title.includes('linux')) {
      downloadAsset = assets.find(asset =>
        asset.url?.toLowerCase().includes('.tar.gz')
        || asset.url?.toLowerCase().includes('.deb')
      )
    }

    return {
      ...item,
      label: item.label,
      releaseUrl: release?.url || item.releaseUrl,
      downloadUrl: downloadAsset?.url,
      version: release?.tag || item.version,
      releaseDate: release?.publishedAt || item.releaseDate
    }
  }) || []
})
</script>

<template>
  <UPageCard
    variant="ghost"
    target="_blank"
    v-bind="props"
  >
    <UPageList>
      <div
        v-for="(item, index) in remapItems"
        :key="index"
        class="flex gap-4  mb-4"
      >
        <UButton
          :icon="item.icon"
          :label="item.label"
          :to="item.downloadUrl"
          :disabled="!item.downloadUrl"
          variant="outline"
          size="xl"
          :ui="{
            base: 'w-full'
          }"
        >
          <template #trailing>
            <span class="ml-auto text-xs text-muted">
              {{ item.version }} ({{ item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 'N/A' }})
            </span>
          </template>
        </UButton>

        <UButton
          :disabled="!item.releaseUrl"
          :to="item.releaseUrl"
          icon="i-simple-icons-github"
          variant="ghost"
          size="xl"
        />
      </div>
    </UPageList>
  </UPageCard>
</template>
