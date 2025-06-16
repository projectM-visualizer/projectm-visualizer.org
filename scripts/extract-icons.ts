// extract-icons.ts
// Extract icons from the project and add to nuxt.config.ts icons
//   - arguments:
//   - options:
//     - "--dirs, -d" (comma-separated directories to scan, default: './app,./content,./shared')
//     - "--write, -w" (write changes to nuxt.config.ts, default: false)

import { join, extname } from 'node:path'
import { readdirSync, statSync } from 'node:fs'

// ---------- Config & Constants ----------

const NUXT_CONFIG_FILE = 'nuxt.config.ts'
// Match only icons that start with "i-" and follow the pattern: i-[namespace]-[icon-name]
const ICON_REGEX = /\bi-([a-zA-Z0-9_-]+)\b/g
const VALID_EXTENSIONS = ['.yml', '.yaml', '.json', '.md', '.vue', '.ts']
const DIRS = ['./app', './content', './shared']
const ICON_COLLECTIONS = [
  'lucide',
  'simple-icons'
]

// ---------- Arg Parser ----------

function getArgValue(args: string[], long: string, short: string, fallback?: string): string | undefined {
  const index = args.indexOf(long) !== -1 ? args.indexOf(long) : args.indexOf(short)
  return index !== -1 && args[index + 1] && !args[index + 1]?.startsWith('-')
    ? args[index + 1]
    : fallback
}

function parseArgs() {
  const args = Bun.argv.slice(2)
  const dirs = getArgValue(args, '--dirs', '-d', DIRS.join(','))
    ?.split(',')
    .map(dir => dir.trim())
    .filter(Boolean) || DIRS
  const write = args.includes('--write') || args.includes('-w')

  if (dirs.length === 0) {
    console.error('❌ No directories provided. Use --dirs or -d to specify directories.')
    process.exit(1)
  }

  return {
    dirs,
    write
  }
}

// ---------- Icon Extraction ----------

async function extractIconsFromFile(filePath: string, icons: Set<string>) {
  const content = await Bun.file(filePath).text()
  let match: RegExpExecArray | null
  while ((match = ICON_REGEX.exec(content))) {
    if (match[1]) {
      icons.add(match[1])
    }
  }
}

async function scanDirRecursively(dir: string, icons: Set<string>) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const stats = statSync(fullPath)

    if (stats.isDirectory()) {
      await scanDirRecursively(fullPath, icons)
    } else if (stats.isFile() && VALID_EXTENSIONS.includes(extname(fullPath))) {
      await extractIconsFromFile(fullPath, icons)
    }
  }
}

// ---------- Nuxt Config Update ----------

async function updateNuxtConfig(icons: string[]) {
  const nuxtConfigPath = join(process.cwd(), NUXT_CONFIG_FILE)
  const configContent = await Bun.file(nuxtConfigPath).text()

  const formattedIcons = icons.map(icon => `      '${icon}'`).join(',\n  ')

  const updated = configContent.replace(
    /icons:\s*\[[\s\S]*?\]/m,
    `icons: [\n  ${formattedIcons}\n      ]`
  )

  if (updated === configContent) {
    console.warn('⚠️ No change made. Could not locate icons array to update.')
    return
  }

  await Bun.write(nuxtConfigPath, updated)
  console.log(`✅ Updated ${NUXT_CONFIG_FILE} with ${icons.length} icons.`)
}

// ---------- Format ----------

function cleanIcons(icons: Set<string>): string[] {
  return Array.from(icons)
    .map(icon => icon.trim())
    .filter(icon => ICON_COLLECTIONS.some(collection => icon.includes(`${collection}-`)))
    .map((icon) => {
      const raw = icon.replace(/i-/, '').trim()

      const matchedCollection = ICON_COLLECTIONS
        .filter(collection => raw.startsWith(`${collection}-`))
        .sort((a, b) => b.length - a.length)[0]

      if (!matchedCollection) {
        console.warn(`⚠️ Unknown icon collection for: ${icon}`)
        return null
      }

      const iconName = raw.slice(matchedCollection.length + 1)

      if (!iconName) {
        console.warn(`⚠️ Empty icon name for: ${icon}`)
        return null
      }

      return `${matchedCollection}:${iconName}`
    })
    .filter((icon): icon is string => !!icon)
    .filter((icon, index, self) => self.indexOf(icon) === index)
    .sort((a, b) => a.localeCompare(b))
}

// ---------- Main ----------

async function main() {
  const { dirs, write } = parseArgs()
  const icons = new Set<string>()

  for (const dir of dirs) {
    await scanDirRecursively(dir, icons)
  }

  const sortedIcons = cleanIcons(icons)
  console.log(`🔍 Extracted ${icons.size} icons from directories: ${dirs.join(', ')}`)
  console.log(sortedIcons.map(i => `  '${i}'`).join(',\n'))
  console.log(`🔍 Sorted ${sortedIcons.length} icons:`)

  if (write) {
    await updateNuxtConfig(sortedIcons)
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
