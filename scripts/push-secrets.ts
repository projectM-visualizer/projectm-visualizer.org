// push-secrets.ts
// Push secrets from a .env file to GitHub repository secrets
//   - arguments:
//   - options:
//     - "--env, -e" (path to .env file, default: '.env')
//     - "--force, -f" (overwrite existing secrets in GitHub if present)
//     - "--keyNames, -k" (comma-separated list of environment variable key names to push, default: 'NUXT_UI_PRO_LICENSE,NUXT_PUBLIC_SITE_URL,NUXT_PUBLIC_ASSET_KEY,REMOTE_CONNECTION')
//     - "--owner, -o" (GitHub owner name, default: 'projectm-visualizer')
//     - "--repo, -r" (GitHub repo name, default: 'projectm-visualizer.org')
//     - "--token, -t" (GitHub token for authentication)

import { Octokit } from 'octokit'
import _sodium from 'libsodium-wrappers'

// ---------- Config & Constants ----------

const ENV_FILE = '.env'
const ENV_KEYS = 'GH_TOKEN,NUXT_UI_PRO_LICENSE,NUXT_PUBLIC_SITE_URL,NUXT_PUBLIC_ASSET_KEY,REMOTE_CONNECTION'

const OWNER = 'projectm-visualizer'
const REPOSITORY = 'projectm-visualizer.org'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

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
  const keyNames = getArgValue(args, '--keyNames', '-k', ENV_KEYS)?.split(',').map(key => key.trim()) || []
  const owner = getArgValue(args, '--owner', '-o', OWNER)
  const repo = getArgValue(args, '--repo', '-r', REPOSITORY)
  const token = getArgValue(args, '--token', '-t', GITHUB_TOKEN)

  if (!token) {
    console.error('❌ Missing GitHub token. Use --token or -t to provide it or set GITHUB_TOKEN environment variable.')
    process.exit(1)
  }

  return {
    envFile: envFile as string,
    force,
    keyNames,
    owner: owner as string,
    repo: repo as string,
    token: token as string
  }
}

// ---------- Env ----------

async function getEnvValues(filepath: string, keyNames: string[]): Promise<Record<string, string>> {
  const file = Bun.file(filepath)

  if (!(await file.exists())) {
    console.error(`❌ ${filepath} not found.`)
    process.exit(1)
  }

  const envText = await file.text()
  const envLines = envText.split('\n')

  const values: Record<string, string> = {}

  for (const key of keyNames) {
    const line = envLines.find(line => line.startsWith(`${key}=`))
    if (!line) {
      console.warn(`⚠️ ${key} not found in ${filepath}. Skipping.`)
      continue
    }

    const match = line.match(/^([^=]+)=["']?(.*?)["']?$/)
    if (match && match[1] && match[2]) values[match[1]] = match[2]
  }

  return values
}

// ---------- GitHub ----------

async function encryptWithSodium(publicKey: string, secretValue: string): Promise<string> {
  await _sodium.ready
  const sodium = _sodium

  const keyBytes = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL)
  const valueBytes = sodium.from_string(secretValue)
  const encryptedBytes = sodium.crypto_box_seal(valueBytes, keyBytes)
  return sodium.to_base64(encryptedBytes, sodium.base64_variants.ORIGINAL)
}

async function pushSecrets(client: Octokit, owner: string, repo: string, secrets: Record<string, string>) {
  const {
    data: { key, key_id }
  } = await client.rest.actions.getRepoPublicKey({
    owner,
    repo
  })

  for (const [name, value] of Object.entries(secrets)) {
    try {
      const encryptedValue = await encryptWithSodium(key, value)

      await client.rest.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: name,
        encrypted_value: encryptedValue,
        key_id
      })

      console.log(`✅ Uploaded secret: ${name}`)
    } catch (error) {
      console.error(`❌ Error uploading secret ${name}:`, error instanceof Error ? error.message : String(error))
    }
  }
}

// ---------- Main ----------

async function main() {
  const { envFile, keyNames, owner, repo, token } = parseArgs()

  console.log(`🔐 Pushing ${keyNames.length} secrets to ${repo}`)

  const envValues = await getEnvValues(envFile, keyNames)

  const octokit = new Octokit({
    auth: token
  })

  await pushSecrets(octokit, owner, repo, envValues)

  console.log('🚀 All secrets pushed.')
}

main()
  .catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
