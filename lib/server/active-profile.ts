import { existsSync, readFileSync } from 'node:fs'
import { SERVER_CONFIG } from './config'

/** Strip UTF-8 BOM — PowerShell Set-Content -Encoding utf8 writes BOM and breaks JSON.parse. */
function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text
}

export function readActiveSlug(): string | null {
  try {
    const file = SERVER_CONFIG.activeProfileFile
    if (!existsSync(file)) return null
    const raw = stripBom(readFileSync(file, 'utf8'))
    const json = JSON.parse(raw) as { profile?: string }
    const slug = json.profile?.trim()
    return slug || null
  } catch {
    return null
  }
}
