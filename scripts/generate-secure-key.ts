// generate-secure-key.ts
// Generate a secure AES key and save it to a .env file
//   - arguments:
//   - options:
//     - "--env, -e" (path to .env file, default: '.env')
//     - "--force, -f" (overwrite existing key in .env if present)
//     - "--keyName, -k" (name of the key in .env, default: 'NUXT_PUBLIC_ASSET_KEY')

// ---------- Config & Constants ----------

const ENV_FILE = '.env'
const ENV_KEY = 'NUXT_PUBLIC_ASSET_KEY'

// ---------- Arg Parser ----------

function getArgValue(args: string[], long: string, short: string, fallback?: string): string | undefined {
  const index = args.indexOf(long) !== -1 ? args.indexOf(long) : args.indexOf(short)
  return index !== -1 && args[index + 1] && !args[index + 1]?.startsWith('-')
    ? args[index + 1]
    : fallback
}

function parseArgs() {
  const args = Bun.argv.slice(2)
  const envFile = getArgValue(args, '--env', '-e', ENV_FILE)
  const force = args.includes('--force') || args.includes('-f')
  const keyName = getArgValue(args, '--keyName', '-k', ENV_KEY)

  if (!envFile) {
    console.error('❌ Missing .env file path. Use --env or -e to provide it.')
    process.exit(1)
  }

  if (!keyName) {
    console.error('❌ Missing key name. Use --keyName or -k to provide it.')
    process.exit(1)
  }

  return {
    envFile: envFile as string,
    force,
    keyName: keyName as string
  }
}

// ---------- Key Generation ----------

async function generateSecureKey(): Promise<string> {
  const generatedKey = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256 // 256-bit key
    },
    true, // extractable
    ['encrypt', 'decrypt']
  )

  const exportedKey = await crypto.subtle.exportKey('raw', generatedKey)
  const base64Key = Buffer.from(exportedKey).toString('base64')

  console.log(`🔑 Generated secure key`)

  return base64Key
}

// ---------- .env File Handling ----------

async function saveKeyToEnv(filepath: string, keyName: string, keyValue: string, force = false): Promise<boolean> {
  try {
    const file = Bun.file(filepath)

    if (!(await file.exists())) {
      await Bun.write(filepath, `${keyName}="${keyValue}"\n`)
      console.log(`✅ ${filepath} created and ${keyName} set.`)
      return true
    }

    const content = await file.text()

    if (content.includes(`${keyName}=`)) {
      if (!force) {
        console.log(`⚠️ ${keyName} already exists in ${filepath}. Use --force to overwrite.`)
        return false
      }

      const updated = content.replace(
        new RegExp(`^${keyName}=.*$`, 'm'),
        `${keyName}="${keyValue}"`
      )
      await Bun.write(filepath, updated)
      console.log(`✅ ${keyName} updated in ${filepath}.`)
      return true
    } else {
      await Bun.write(filepath, content + `\n${keyName}="${keyValue}"`)
      console.log(`✅ ${keyName} appended to ${filepath}.`)
      return true
    }
  } catch (error) {
    console.error(`❌ Failed to write key to ${filepath}:`, error)
    return false
  }
}

// ---------- Main ----------

async function main() {
  const { envFile, force, keyName } = parseArgs()

  console.log(`🔍 Using .env file: ${envFile}`)

  console.log(`🔐 Generating secure AES key...`)
  const keyValue = await generateSecureKey()
  const saveSuccess = await saveKeyToEnv(envFile, keyName, keyValue, force)

  if (!saveSuccess) {
    console.error(`❌ Failed to save key. Exiting...`)
    process.exit(1)
  }

  console.log(`✅ Key generation and saving completed successfully.`)
}

main().catch((error) => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
