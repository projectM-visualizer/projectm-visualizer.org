// generate-reports.ts
// Generate GitHub project and contributor reports
//   - arguments:
//   - options:
//     - "--encrypt, -e" (encrypt data before saving to files)
//     - "--encryptionKey, -k" (encryption key for data encryption)
//     - "--outputData, -d" (output directory for reports, default: 'public/data')
//     - "--outputAvatars, -a" (output directory for avatars, default: 'public/images/avatars')
//     - "--owner, -o" (GitHub owner name, default: 'projectm-visualizer')
//     - "--token, -t" (GitHub token for authentication)

import Bun from 'bun'

// ---------- Config & Constants ----------

const OWNER = 'projectm-visualizer'
const OUTPUT_DATA_DIR = 'public/assets/data'
const OUTPUT_AVATAR_DIR = 'public/assets/images/avatars'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const ENCRYPTION_KEY = process.env.NUXT_PUBLIC_ASSET_KEY

// ---------- Arg Parser ----------

function getArgValue(args: string[], long: string, short: string, fallback?: string): string | undefined {
  const index = args.indexOf(long) !== -1 ? args.indexOf(long) : args.indexOf(short)
  return index !== -1 && args[index + 1] && !args[index + 1]?.startsWith('-')
    ? args[index + 1]
    : fallback
}

function parseArgs() {
  const args = Bun.argv.slice(2)
  const encrypt = args.includes('--encrypt') || args.includes('-e')
  const encryptionKey = getArgValue(args, '--encryptionKey', '-k', ENCRYPTION_KEY)
  const outputDataDir = getArgValue(args, '--outputData', '-d', OUTPUT_DATA_DIR)
  const outputAvatarDir = getArgValue(args, '--outputAvatars', '-a', OUTPUT_AVATAR_DIR)
  const owner = getArgValue(args, '--owner', '-n', OWNER)
  const token = getArgValue(args, '--token', '-t', GITHUB_TOKEN)

  if (!encryptionKey && encrypt) {
    console.error('❌ Missing encryption key. Use --encryptionKey or -k to provide it or set NUXT_PUBLIC_ASSET_KEY environment variable.')
    process.exit(1)
  }

  if (!token) {
    console.error('❌ Missing GitHub token. Use --token or -t to provide it or set GITHUB_TOKEN environment variable.')
    process.exit(1)
  }

  return {
    encrypt,
    encryptionKey: encryptionKey as string,
    outputDataDir: outputDataDir as string,
    outputAvatarDir: outputAvatarDir as string,
    owner: owner as string,
    token
  }
}

// ---------- GitHub Helpers ----------

async function fetchAll<T>(url: string, headers: Record<string, string>): Promise<T[]> {
  let results: T[] = []
  let page = 1

  while (true) {
    const response = await fetch(`${url}?per_page=100&page=${page}`, { headers })
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`)

    const data: T[] = await response.json()
    results = results.concat(data)

    const linkHeader = response.headers.get('link')
    if (!linkHeader || !linkHeader.includes('rel="next"')) break

    page++
  }

  return results
}

// ---------- Contributors ----------

type Contributor = {
  id: number
  login: string
  avatar_url: string
  html_url: string
}

async function getRepoContributors(owner: string, repo: string, headers: Record<string, string>): Promise<Contributor[]> {
  return fetchAll<Contributor>(`https://api.github.com/repos/${owner}/${repo}/contributors`, headers)
}

async function getAllContributors(owner: string, repoNames: string[], headers: Record<string, string>): Promise<Contributor[]> {
  const allContributors: Map<number, Contributor> = new Map()

  for (const repo of repoNames) {
    console.log(`👥 Fetching contributors for: ${repo}`)
    try {
      const contributors = await getRepoContributors(owner, repo, headers)
      for (const user of contributors) {
        if (!allContributors.has(user.id)) {
          allContributors.set(user.id, user)
        }
      }
    } catch (error) {
      console.warn(`⚠️  Skipping ${repo}: ${(error as Error).message}`)
    }
  }

  return Array.from(allContributors.values())
}

// ---------- Avatar Downloader ----------

async function downloadOwnerAvatar(owner: string, headers: Record<string, string>, dir: string): Promise<{ login: string, avatar_url: string } | null | null> {
  const response = await fetch(`https://api.github.com/users/${owner}`, { headers })
  if (!response.ok) {
    console.warn(`⚠️  Failed to fetch owner avatar for ${owner}: ${response.statusText}`)
    return null
  }

  const user: Contributor = await response.json()
  const filePath = `${dir}/owner.jpg`
  const metaPath = filePath.replace('public', '')

  try {
    const exists = await Bun.file(filePath).exists()
    if (!exists) {
      const res = await fetch(user.avatar_url)
      if (!res.ok) throw new Error(`Failed to fetch owner avatar for ${user.login}`)
      const buffer = await res.arrayBuffer()
      await Bun.write(filePath, new Uint8Array(buffer), { createPath: true })
      console.log(`🖼️  Saved owner avatar: ${user.login} → ${filePath}`)
    } else {
      console.log(`🖼️  Owner avatar already exists: ${user.login} → ${filePath}`)
    }

    return { login: user.login, avatar_url: metaPath }
  } catch (err) {
    console.warn(`⚠️  Failed to download owner avatar for ${user.login}: ${(err as Error).message}`)
    return null
  }
}

async function downloadAvatars(contributors: Contributor[], dir: string): Promise<Contributor[]> {
  const updatedContributors: Contributor[] = []

  for (const contributor of contributors) {
    const filePath = `${dir}/${contributor.id}.jpg`
    const metaPath = filePath.replace('public', '')

    try {
      const exists = await Bun.file(filePath).exists()
      if (exists) {
        updatedContributors.push({
          ...contributor,
          avatar_url: metaPath
        })

        console.log(`🖼️  Avatar already exists: ${contributor.login} → ${filePath}`)

        continue
      }

      const res = await fetch(contributor.avatar_url)
      if (!res.ok) throw new Error(`Failed to fetch avatar for ${contributor.login}`)

      const buffer = await res.arrayBuffer()
      await Bun.write(filePath, new Uint8Array(buffer), { createPath: true })
      updatedContributors.push({
        ...contributor,
        avatar_url: metaPath
      })
      console.log(`🖼️  Saved avatar: ${contributor.login} → ${filePath}`)
    } catch (err) {
      console.warn(`⚠️  Failed to download avatar for ${contributor.login}: ${(err as Error).message}`)
    }
  }

  return updatedContributors
}

// ---------- Projects ----------

type Repository = {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  fork: boolean
  created_at: string
  updated_at: string
  pushed_at: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  forks_count: number
  open_issues_count: number
  default_branch: string
  archived: boolean
  disabled: boolean
  visibility: string
  topics?: string[]
  [key: string]: unknown
}

async function getAllRepos(owner: string, headers: Record<string, string>): Promise<Repository[]> {
  return fetchAll<Repository>(`https://api.github.com/orgs/${owner}/repos`, headers)
}

async function enrichWithTopics(owner: string, repos: Repository[], headers: Record<string, string>): Promise<Repository[]> {
  const enriched: Repository[] = []

  for (const repo of repos) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo.name}/topics`,
        {
          headers: {
            ...headers,
            Accept: 'application/vnd.github.mercy-preview+json'
          }
        }
      )

      if (response.ok) {
        const topicData = await response.json()
        repo.topics = topicData.names || []
      } else {
        console.warn(`⚠️  Failed to fetch topics for ${repo.name}: ${response.statusText}`)
      }
    } catch (error) {
      console.warn(`⚠️  Error fetching topics for ${repo.name}: ${(error as Error).message}`)
    }

    enriched.push(repo)
  }

  return enriched
}

// ---------- Releases ----------

type Release = {
  url: string
  tag_name: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  html_url: string
  assets: {
    name: string
    browser_download_url: string
    content_type: string
    size: number
    download_count: number
  }[]
}

async function getLatestRelease(owner: string, repo: string, headers: Record<string, string>): Promise<Release | null> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers })
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`Failed to fetch latest release for ${repo}: ${response.statusText}`)
  }

  return response.json()
}

async function enrichWithReleases(owner: string, repos: Repository[], headers: Record<string, string>) {
  for (const repo of repos) {
    try {
      const release = await getLatestRelease(owner, repo.name, headers)
      if (release) {
        repo.latest_release = {
          tag: release.tag_name,
          name: release.name,
          published_at: release.published_at,
          url: release.html_url,
          assets: release.assets.map(a => ({
            name: a.name,
            url: a.browser_download_url,
            type: a.content_type,
            size: a.size,
            downloads: a.download_count
          }))
        }
      }
    } catch (error) {
      console.warn(`⚠️  Skipping release for ${repo.name}: ${(error as Error).message}`)
    }
  }

  return repos
}

// ---------- Encryption ----------

async function encryptContent(encryptionKey: string, content: string): Promise<Uint8Array> {
  const rawKey = Uint8Array.from(atob(encryptionKey), c => c.charCodeAt(0))

  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const data = encoder.encode(content)

  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const encryptedBytes = new Uint8Array(encrypted)

  const combined = new Uint8Array(iv.length + encryptedBytes.length)
  combined.set(iv, 0)
  combined.set(encryptedBytes, iv.length)

  return combined
}

// ---------- Main ----------

async function main() {
  const { encrypt, encryptionKey, outputDataDir, outputAvatarDir, owner, token } = parseArgs()

  const headers = {
    'Accept': 'application/vnd.github+json',
    'Authorization': `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28'
  }

  console.log(`📦 Fetching repositories for org: ${owner}`)
  const repos = await getAllRepos(owner, headers)
  const repoNames = repos.map(repo => repo.name)

  console.log(`🔍 Collecting contributors from all repos...`)
  const contributors = await getAllContributors(owner, repoNames, headers)
  const contributorsWithAvatars = await downloadAvatars(contributors, outputAvatarDir)
  const contributorsOutput = encrypt
    ? await encryptContent(encryptionKey, JSON.stringify(contributorsWithAvatars, null, 2))
    : JSON.stringify(contributorsWithAvatars, null, 2)
  const contributorsFile = encrypt ? `${outputDataDir}/contributors.json.aes` : `${outputDataDir}/contributors.json`
  await Bun.write(contributorsFile, contributorsOutput, { createPath: true })
  console.log(`✅ Saved ${contributors.length} unique contributors → ${contributorsFile}`)

  console.log(`🖼️  Downloading owner avatar for ${owner}...`)
  const ownerInfo = await downloadOwnerAvatar(owner, headers, outputAvatarDir)
  console.log(`🏷️  Enriching ${repos.length} repositories with topics...`)
  const enrichedRepos = await enrichWithTopics(owner, repos, headers)
  console.log(`🏷️  Enriching ${enrichedRepos.length} repositories with latest releases...`)
  const enrichedReleases = await enrichWithReleases(owner, enrichedRepos, headers)
  if (ownerInfo) {
    for (const repo of enrichedRepos) {
      repo.owner = {
        login: ownerInfo.login,
        avatar_url: ownerInfo.avatar_url
      }
    }
  }
  const projectsOutput = encrypt
    ? await encryptContent(encryptionKey, JSON.stringify(enrichedReleases, null, 2))
    : JSON.stringify(enrichedRepos, null, 2)
  const projectsFile = encrypt ? `${outputDataDir}/projects.json.aes` : `${outputDataDir}/projects.json`
  await Bun.write(projectsFile, projectsOutput, { createPath: true })
  console.log(`✅ Saved ${enrichedRepos.length} repositories → ${projectsFile}`)

  console.log(`🎉 Report generation completed successfully.`)
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
