import type { Profile } from './types'

const SCRIPT = 'Switch-Hermes-Profile.ps1'

/** PowerShell scripts behind the local LiteLLM + ngrok (Google API) stack. */
export const GOOGLE_API_SCRIPTS = {
  start: 'start-google-api-desktop.ps1',
  stop: 'stop-google-api-desktop.ps1',
  restart: 'restart-google-api-desktop.ps1',
} as const

export function cliProfileHome(slug: string): string {
  return `%LOCALAPPDATA%\\hermes\\profiles\\${slug}`
}

export function memCollection(slug: string): string {
  return `${slug}_memories`
}

export function desktopShortcut(name: string): string {
  return `%USERPROFILE%\\Desktop\\Hermes - ${name}.lnk`
}

export function switchCommand(profile: Profile, noKill = false): string {
  return `${SCRIPT} -Action switch -Profile ${profile.name}${
    noKill ? ' -NoKill' : ''
  }`
}

export function quickActionCommand(action: string, profile: Profile): string {
  switch (action) {
    case 'launch':
      return `${SCRIPT} -Action launch -Profile ${profile.name}`
    case 'sync':
      return `${SCRIPT} -Action sync -Profile ${profile.name}`
    case 'open':
      return `Start-Process "${profile.path}"`
    case 'shortcut':
      return `Start-Process "${desktopShortcut(profile.name)}"`
    case 'cursor':
      return `cursor "${profile.path}"`
    default:
      return switchCommand(profile)
  }
}

export function createCommand(
  name: string,
  location: string,
  description: string,
): string {
  return `${SCRIPT} -Action new -Name "${name || '<Name>'}" -Location "${
    location || '<loc>'
  }" -Description "${description || '<desc>'}"`
}

export function adoptCommand(location: string, name: string): string {
  return `${SCRIPT} -Action adopt -Location "${location || '<path>'}" -Name "${
    name || '<Name>'
  }"`
}
