// extract-icons.ts
// Extract icons from the project and add to nuxt.config.ts icons
//   - arguments:
//   - options:
//     - "--dirs, -d" (comma-separated directories to scan, default: './app,./content,./shared')
//     - "--write, -w" (write changes to nuxt.config.ts, default: false)

import { join, extname } from 'node:path'
import { readdirSync, statSync } from 'node:fs'

// ---------- Config & Constants ----------

// const NUXT_CONFIG_FILE = 'nuxt.config.ts'
// Match only icons that start with "i-" and follow the pattern: i-[namespace]-[icon-name]
const ICON_REGEX = /\bi-([\w]+-[\w-]+)\b/g
const VALID_EXTENSIONS = ['.yml', '.yaml', '.json', '.md', '.vue', '.ts']
const DIRS = ['./app', './content', './shared']

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

// TODO: Implement this function to update the Nuxt config file with the extracted icons
//   without overwriting existing icons.
// async function updateNuxtConfig(icons: string[]) {
//   const nuxtConfigPath = join(process.cwd(), NUXT_CONFIG_FILE)
//   const config = await Bun.file(nuxtConfigPath).text()

//   const mergedIcons = new Set([
//     ...(config.icon?.clientBundle?.icons || []),
//     ...icons
//   ])

//   config.icon.clientBundle.icons = mergedIcons

//   await Bun.write(nuxtConfigPath, config)
//   console.log(`✅ Updated ${NUXT_CONFIG_FILE} with ${icons.length} icons.`)
// }

// ---------- Format ----------

function cleanIcons(icons: Set<string>): string[] {
  return Array.from(icons)
    .map(icon => icon.trim())
    .filter(icon => icon.length > 0 && !icon.includes(' '))
    .map(icon => icon.replace(/_/g, '-'))
    .map((icon) => {
      const lastDash = icon.lastIndexOf('-')
      return lastDash !== -1
        ? icon.slice(0, lastDash) + ':' + icon.slice(lastDash + 1)
        : icon
    })
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
  console.log(`🔍 Found ${sortedIcons.length} styled icons:`)
  console.log(sortedIcons.map(i => `  '${i}'`).join(',\n'))

  if (write) {
    // await updateNuxtConfig(sortedIcons)
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
