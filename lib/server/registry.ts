import {
  copyFileSync,
  existsSync,
  readdirSync,
  statSync,
} from 'node:fs'
import path from 'node:path'
import { SERVER_CONFIG } from './config'

export type RegistryBackup = {
  name: string
  mtimeMs: number
}

export function listRegistryBackups(): RegistryBackup[] {
  const dir = SERVER_CONFIG.registryDir
  if (!existsSync(dir)) return []

  return readdirSync(dir)
    .filter((name) => name.startsWith('profiles.backup-') && name.endsWith('.json'))
    .map((name) => {
      const full = path.join(dir, name)
      return { name, mtimeMs: statSync(full).mtimeMs }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
}

export function restoreRegistryBackup(filename?: string): {
  ok: boolean
  message: string
} {
  const backups = listRegistryBackups()
  if (backups.length === 0) {
    return { ok: false, message: 'No profiles.backup-*.json files found' }
  }

  const pick = filename
    ? backups.find((b) => b.name === filename)
    : backups[0]
  if (!pick) {
    return { ok: false, message: `Backup not found: ${filename}` }
  }

  const registry = SERVER_CONFIG.registryPath
  if (!existsSync(registry)) {
    return { ok: false, message: 'profiles.json not found' }
  }

  const dir = path.dirname(registry)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const safety = path.join(dir, `profiles.pre-restore-${stamp}.json`)
  copyFileSync(registry, safety)
  copyFileSync(path.join(dir, pick.name), registry)

  return {
    ok: true,
    message: `Restored ${pick.name} (safety copy: ${path.basename(safety)})`,
  }
}
