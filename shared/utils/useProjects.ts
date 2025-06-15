export type SortByEnum = 'name' | 'updated' | 'stars' | 'forks'

export interface ProjectItem {
  id: number
  html_url: string
  name: string
  full_name: string
  description: string
  owner: {
    login: string
    avatar_url: string
  }
  updated_at: string
  stargazers_count: number
  forks_count: number
}

export async function useProjects({
  itemsToShow,
  featured,
  sortBy
}: {
  featured: string[]
  sortBy: SortByEnum
  itemsToShow: number
}): Promise<ProjectItem[]> {
  const keyEnv = useRuntimeConfig().public.assetKey

  if (!keyEnv) {
    throw new Error('NUXT_PUBLIC_ASSET_KEY environment variable is not set.')
  }

  const rawKey = Uint8Array.from(atob(keyEnv), c => c.charCodeAt(0))
  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    true,
    ['decrypt']
  )

  const url = `${useRuntimeConfig().public.siteUrl}/assets/data/projects.dat`

  let items: ProjectItem[] = []

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`)
    }

    const buffer = await response.arrayBuffer()
    const data = new Uint8Array(buffer)

    const iv = data.slice(0, 12)
    const encryptedData = data.slice(12)

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    )

    const json = new TextDecoder().decode(decryptedBuffer)

    items = JSON.parse(json) as ProjectItem[]
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  const filtered = featured.length > 0
    ? items.filter(item => featured.includes(item.full_name))
    : [...items]

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'updated':
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      case 'stars':
        return (b.stargazers_count || 0) - (a.stargazers_count || 0)
      case 'forks':
        return (b.forks_count || 0) - (a.forks_count || 0)
      default:
        return 0
    }
  })

  return sorted.slice(0, Math.min(itemsToShow, sorted.length))
}
