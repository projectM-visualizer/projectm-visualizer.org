export interface ContributorItem {
  id: number
  avatar_url: string
  login: string
  html_url: string
}

export async function useContributors(): Promise<ContributorItem[]> {
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

  const url = `${useRuntimeConfig().public.siteUrl}/assets/data/contributors.dat`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch contributors: ${response.status}`)
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
    const contributors: ContributorItem[] = JSON.parse(json)

    return contributors
  } catch (error) {
    console.error('Error fetching contributors:', error)
    return []
  }
}
