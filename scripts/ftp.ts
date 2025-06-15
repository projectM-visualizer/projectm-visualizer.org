// ftp.ts
// Handles FTP operations for pulling and pushing assets and site files.
//   - arguments:
//     - "pull" or "push" (action to perform)
//     - "assets" or "site" (type of files to transfer)
//   - options:
//     - "--force, -f" (force upload even if files exist)
//     - "--localAssetsPath, -l" (local path for assets, default: 'public/assets')
//     - "--remoteAssetsPath, -r" (remote path for assets, default: '/projectm-visualizer.org/assets')
//     - "--localSitePath, -s" (local path for site files, default: '.output/public')
//     - "--remoteSitePath, -t" (remote path for site files, default: '/projectm-visualizer.org')
//     - "--remoteConnection, -c" (remote connection details in JSON format)

import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Client } from 'basic-ftp'

// ---------- Config & Constants ----------

const LOCAL_ASSETS_PATH = process.env.LOCAL_ASSETS_PATH || 'public/assets'
const REMOTE_ASSETS_PATH = process.env.REMOTE_ASSETS_PATH || '/projectm-visualizer.org/assets'
const LOCAL_SITE_PATH = process.env.LOCAL_SITE_PATH || '.output/public'
const REMOTE_SITE_PATH = process.env.REMOTE_SITE_PATH || '/projectm-visualizer.org'
const REMOTE_CONNECTION = process.env.REMOTE_CONNECTION

const client = new Client()
client.ftp.verbose = false

// ---------- Arg Parser ----------

type Action = 'pull' | 'push'
type Type = 'assets' | 'site'
interface Paths {
  assets: {
    local: string
    remote: string
  }
  site: {
    local: string
    remote: string
  }
}

function getArgValue(args: string[], long: string, short: string, fallback?: string): string | undefined {
  const index = args.indexOf(long) !== -1 ? args.indexOf(long) : args.indexOf(short)
  return index !== -1 && args[index + 1] && !args[index + 1]?.startsWith('-')
    ? args[index + 1]
    : fallback
}

function parseArgs() {
  const args = Bun.argv.slice(2)
  const action = args[0]
  const type = args[1]
  const force = args.includes('--force') || args.includes('-f')
  const localAssetsPath = getArgValue(args, '--localAssetsPath', '-l', LOCAL_ASSETS_PATH)
  const remoteAssetsPath = getArgValue(args, '--remoteAssetsPath', '-r', REMOTE_ASSETS_PATH)
  const localSitePath = getArgValue(args, '--localSitePath', '-s', LOCAL_SITE_PATH)
  const remoteSitePath = getArgValue(args, '--remoteSitePath', '-t', REMOTE_SITE_PATH)
  const remoteConnection = JSON.parse(getArgValue(args, '--remoteConnection', '-c', REMOTE_CONNECTION) || '{}') as RemoteConnection

  if (!action || !type) {
    throw new Error('❌ Missing arguments. Usage: bun ftp.ts pull|push assets|site')
  }

  if (!['pull', 'push'].includes(action)) {
    throw new Error('❌ Invalid action. Use: pull | push')
  }

  if (!['assets', 'site'].includes(type)) {
    throw new Error('❌ Invalid type. Use: assets | site')
  }

  if (!remoteConnection.host || !remoteConnection.username || !remoteConnection.password) {
    throw new Error('❌ Missing remote connection details. Use --remoteConnection or -c to provide them in JSON format (e.g. {"host":"example.com","port":21,"username":"user","password":"pass"}) or set REMOTE_CONNECTION environment variable.')
  }

  return {
    action: action as Action,
    type: type as Type,
    force,
    paths: {
      assets: {
        local: localAssetsPath as string,
        remote: remoteAssetsPath as string
      },
      site: {
        local: localSitePath as string,
        remote: remoteSitePath as string
      }
    },
    remoteConnection
  }
}

// ---------- Remote FTP Connection ----------

interface RemoteConnection {
  host: string
  port?: number
  username: string
  password: string
}

function validateRemoteConnection(remoteConnection: RemoteConnection): boolean {
  const { host, port, username, password } = remoteConnection
  return !!(host && port && username && password)
}

async function connectToRemote(remoteConnection: RemoteConnection) {
  if (!validateRemoteConnection(remoteConnection)) {
    throw new Error('❌ REMOTE_CONNECTION is missing or incomplete.')
  }

  console.log(`🔌 Connecting to ${remoteConnection.host}...`)
  await client.access({
    host: remoteConnection.host,
    port: remoteConnection.port || 21,
    user: remoteConnection.username,
    password: remoteConnection.password,
    secure: false
  })
  console.log(`✅ Connected to remote host.`)
}

async function disconnectFromRemote() {
  client.close()
  console.log(`🔌 Disconnected from remote host.`)
}

// ---------- Smart Upload ----------

async function smartUploadDir(localDir: string, remoteDir: string, force: boolean) {
  const entries = readdirSync(localDir, { withFileTypes: true })
  await client.ensureDir(remoteDir)

  const remoteList = await client.list(remoteDir)
  const remoteNames = new Set(remoteList.map(item => item.name))

  for (const entry of entries) {
    const localPath = join(localDir, entry.name)
    const remotePath = `${remoteDir}/${entry.name}`

    if (entry.isDirectory()) {
      await smartUploadDir(localPath, remotePath, force)
    } else {
      if (remoteNames.has(entry.name) && !force) {
        console.log(`⏭️  Skipping (exists): ${remotePath}`)
        continue
      }

      console.log(`📤 Uploading: ${remotePath}`)
      await client.uploadFrom(localPath, remotePath)
    }
  }
}

// ---------- Transfer Operations ----------

async function pull(remoteConnection: RemoteConnection, type: Type, paths: Paths) {
  const { local, remote } = paths[type]

  try {
    await connectToRemote(remoteConnection)
    console.log(`⬇️  Pulling ${type} from ${remote} to ${local}...`)
    await client.downloadToDir(local, remote)
    console.log(`✅ Pulled ${type} successfully.`)
  } catch (error) {
    console.error(`❌ Error pulling ${type}:`, error instanceof Error ? error.message : String(error))
  } finally {
    await disconnectFromRemote()
  }
}

async function push(remoteConnection: RemoteConnection, type: Type, paths: Paths, force: boolean) {
  const { local, remote } = paths[type]

  try {
    await connectToRemote(remoteConnection)
    console.log(`⬆️  Pushing ${type} from ${local} to ${remote}...`)
    await smartUploadDir(local, remote, force)
    console.log(`✅ Pushed ${type} successfully.`)
  } catch (error) {
    console.error(`❌ Error pushing ${type}:`, error instanceof Error ? error.message : String(error))
  } finally {
    await disconnectFromRemote()
  }
}

// ---------- Main ----------

async function main() {
  try {
    const { action, type, force, paths, remoteConnection } = parseArgs()

    console.log(`🚀 Starting ${action} for ${type}...`)

    if (action === 'pull') {
      await pull(remoteConnection, type, paths)
    } else {
      await push(remoteConnection, type, paths, force)
    }
  } catch (err) {
    console.error(err instanceof Error ? err.message : String(err))
    process.exit(1)
  }
}

main()
