import { defineStore, acceptHMRUpdate } from 'pinia'
import type { ProjectFetch } from '~~/shared/types/projects'

interface DataStoreState {
  encrypted: boolean
  projects: Project[]
  contributors: Contributor[]
}

export const useDataStore = defineStore('data', {
  state: (): DataStoreState => ({
    encrypted: true,
    projects: [] as Project[],
    contributors: [] as Contributor[]
  }),
  getters: {},
  actions: {
    async fetchProjects(): Promise<Project[]> {
      const { assetKey, siteUrl } = useRuntimeConfig().public
      const projectsBaseUrl = `${siteUrl}/assets/data/projects`
      const url = projectsBaseUrl + (this.encrypted ? '.dat' : '.json')

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch projects: ${response.status}`)

        let json: string

        if (this.encrypted) {
          if (!assetKey) throw new Error('NUXT_PUBLIC_ASSET_KEY environment variable is not set.')

          const rawKey = Uint8Array.from(atob(assetKey), c => c.charCodeAt(0))
          const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, true, ['decrypt'])

          const buffer = await response.arrayBuffer()
          const data = new Uint8Array(buffer)

          const iv = data.slice(0, 12)
          const encryptedData = data.slice(12)

          const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData)
          json = new TextDecoder().decode(decrypted)
        } else {
          json = await response.text()
        }

        const projects: ProjectFetch[] = JSON.parse(json)

        const remap = projects.map(c =>
          replaceNulls({
            id: c.id,
            to: c.html_url,
            name: c.name,
            fullName: c.full_name,
            description: c.description,
            owner: {
              src: c.owner?.avatar_url,
              alt: c.owner?.login
            },
            updatedAt: c.updated_at,
            stars: c.stargazers_count,
            forks: c.forks_count,
            release: {
              tag: c.latest_release?.tag,
              name: c.latest_release?.name,
              publishedAt: c.latest_release?.published_at,
              url: c.latest_release?.url,
              assets: c.latest_release?.assets?.map(a => ({
                name: a?.name,
                url: a?.url,
                type: a?.type,
                size: a?.size,
                downloads: a?.downloads
              }))
            }
          })
        )

        this.projects = remap

        return remap
      } catch (error) {
        console.error('Error loading projects:', error)
        return []
      }
    },
    async fetchContributors(): Promise<Contributor[]> {
      const { assetKey, siteUrl } = useRuntimeConfig().public
      const contributorsBaseUrl = `${siteUrl}/assets/data/contributors`
      const url = contributorsBaseUrl + (this.encrypted ? '.dat' : '.json')

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to fetch contributors: ${response.status}`)

        let json: string

        if (this.encrypted) {
          if (!assetKey) throw new Error('NUXT_PUBLIC_ASSET_KEY environment variable is not set.')

          const rawKey = Uint8Array.from(atob(assetKey), c => c.charCodeAt(0))
          const key = await crypto.subtle.importKey('raw', rawKey, { name: 'AES-GCM' }, true, ['decrypt'])

          const buffer = await response.arrayBuffer()
          const data = new Uint8Array(buffer)

          const iv = data.slice(0, 12)
          const encryptedData = data.slice(12)

          const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData)
          json = new TextDecoder().decode(decrypted)
        } else {
          json = await response.text()
        }

        const contributors: ContributorFetch[] = JSON.parse(json)

        const remap = contributors.map(c =>
          replaceNulls({
            id: c.id,
            avatar: {
              src: c.avatar_url,
              alt: c.login
            },
            username: c.login,
            to: c.html_url
          })
        )

        this.contributors = remap

        return remap
      } catch (error) {
        console.error('Error loading contributors:', error)
        return []
      }
    },
    getProjects({
      itemsToShow = 0,
      featured = [],
      sortBy = 'stars'
    }: {
      itemsToShow: number
      featured: string[]
      sortBy: 'name' | 'updated' | 'stars' | 'forks'
    }): Project[] {
      const filtered = featured.length > 0
        ? this.projects.filter(p => p.name && featured.includes(p.name))
        : [...this.projects]

      const sorted = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return (a.name ?? '').localeCompare(b.name ?? '')
          case 'updated':
            return new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
          case 'stars':
            return (b.stars ?? 0) - (a.stars ?? 0)
          case 'forks':
            return (b.forks ?? 0) - (a.forks ?? 0)
          default:
            return 0
        }
      })

      return itemsToShow > 0 ? sorted.slice(0, itemsToShow) : sorted
    },
    getContributors(): Contributor[] {
      return this.contributors
    },
    getProjectReleaseByName(name: string): Project | undefined {
      return this.projects.find(p => p.name === name)
    }
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDataStore, import.meta.hot))
}
