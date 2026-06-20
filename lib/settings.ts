import type { Settings } from './types'

export const SHORTCUT_DEFS: { id: string; action: string; default: string }[] = [
  { id: 'palette', action: 'Command Palette', default: 'Ctrl+K' },
  { id: 'new', action: 'New Profile', default: 'Ctrl+N' },
  { id: 'search', action: 'Focus Search', default: '/' },
  { id: 'switch', action: 'Switch Selected Profile', default: 'Enter' },
  { id: 'navigate', action: 'Navigate List', default: 'Arrow Keys' },
  { id: 'settings', action: 'Open Settings', default: 'Ctrl+,' },
  { id: 'close', action: 'Close Modals', default: 'Esc' },
  { id: 'dryRun', action: 'Toggle Dry-Run', default: 'Ctrl+D' },
]

export const ACCENT_PRESETS: { id: string; label: string; value: string }[] = [
  { id: 'gold', label: 'Jedi Gold', value: '#F5B841' },
  { id: 'green', label: 'Saber Green', value: '#3FB950' },
  { id: 'red', label: 'Sith Red', value: '#F85149' },
  { id: 'blue', label: 'Ice Blue', value: '#58A6FF' },
]

export const BACKGROUND_PRESETS: { id: string; label: string; value: string }[] =
  [
    { id: 'obsidian', label: 'Obsidian', value: '#070708' },
    { id: 'graphite', label: 'Graphite', value: '#101014' },
    { id: 'midnight', label: 'Midnight', value: '#080b14' },
    { id: 'espresso', label: 'Espresso', value: '#0e0a07' },
    { id: 'forest', label: 'Forest', value: '#070c09' },
  ]

export const OVERLAY_PRESETS: { id: string; label: string; value: string }[] = [
  { id: 'black', label: 'Black', value: '#070708' },
  { id: 'midnight', label: 'Midnight', value: '#0a0f1c' },
  { id: 'gold', label: 'Gold', value: '#3a2a08' },
  { id: 'green', label: 'Green', value: '#08160d' },
  { id: 'plum', label: 'Plum', value: '#1a0a18' },
]

export const DEFAULT_SETTINGS: Settings = {
  general: {
    defaultLocation: 'D:\\Hermes',
    defaultModel: 'vader-3-flash',
    descriptionTemplate: 'Hermes profile for {name}',
    autoLaunchOnSwitch: true,
    confirmBeforeSwitch: true,
    switchBehavior: 'close',
    autoSyncCliOnSwitch: true,
  },
  appearance: {
    theme: 'dark',
    accentColor: '#F5B841',
    activeColor: 'green',
    backgroundColor: '#070708',
    backgroundBrightness: 100,
    backgroundImage: '',
    backgroundImageBlur: 8,
    backgroundImageBrightness: 60,
    backgroundOverlayColor: '#070708',
    backgroundOverlayOpacity: 45,
    backgroundImageVignette: 55,
    accentIntensity: 'medium',
    glassIntensity: 'medium',
    filmGrain: true,
    vignette: true,
    wordmarkGlow: true,
    showMonograms: true,
    showCliStatus: true,
    compact: false,
    animationSpeed: 'full',
    font: 'geist',
  },
  console: {
    showFooter: true,
    waveformAnimation: true,
    waveformColor: 'gold',
    pollIntervalMs: 5000,
    showPorts: true,
    capsuleStyle: 'pill',
    services: [
      { id: 'litellm', name: 'LiteLLM', host: '127.0.0.1', port: 4000, enabled: true },
      { id: 'ngrok', name: 'ngrok', host: '127.0.0.1', port: 4040, enabled: true },
      { id: 'lmstudio', name: 'LM Studio', host: '127.0.0.1', port: 1234, enabled: true },
      { id: 'gateway', name: 'Hermes Gateway', host: '', enabled: true },
    ],
  },
  shortcuts: Object.fromEntries(SHORTCUT_DEFS.map((s) => [s.id, s.default])),
  integrations: {
    hermesPath:
      '%LOCALAPPDATA%\\hermes\\hermes-agent\\apps\\desktop\\release\\win-unpacked\\Hermes.exe',
    cursorPath: '%LOCALAPPDATA%\\Programs\\cursor\\Cursor.exe',
    executionPolicy: 'Bypass',
    templateSource:
      'D:\\Hermes\\custom-scriptz\\profile-switcher\\profile-template',
    switcherScript:
      'D:\\Hermes\\custom-scriptz\\profile-switcher\\Switch-Hermes-Profile.ps1',
    openFoldersWith: 'explorer',
    syncOnLaunch: true,
  },
  data: {
    registryPath:
      'D:\\Hermes\\custom-scriptz\\profile-switcher\\profiles.json',
    activeProfileFile: '%APPDATA%\\Hermes\\active-profile.json',
    mem0Path: '%USERPROFILE%\\.mem0',
    apiPort: 7780,
  },
  advanced: {
    dryRun: false,
    confirmDestructive: true,
    verboseLogging: false,
    bindAddress: '127.0.0.1',
  },
}

export const APP_VERSION = '1.0.0'
export const HERMES_DESKTOP_VERSION = '0.9.4'

/**
 * Test whether a keyboard event matches a human-readable binding string such
 * as "Ctrl+K", "/", "Ctrl+,". Modifier order is irrelevant; Cmd maps to Ctrl.
 */
export function matchesShortcut(e: KeyboardEvent, binding: string): boolean {
  if (!binding) return false
  const parts = binding.toLowerCase().split('+').map((p) => p.trim())
  const needCtrl = parts.includes('ctrl') || parts.includes('cmd')
  const needShift = parts.includes('shift')
  const needAlt = parts.includes('alt')
  const key = parts[parts.length - 1]

  if (needCtrl !== (e.ctrlKey || e.metaKey)) return false
  if (needShift !== e.shiftKey) return false
  if (needAlt !== e.altKey) return false

  const eventKey = e.key.toLowerCase()
  return eventKey === key
}

/** Convert a hex color (#RRGGBB) to an "r, g, b" string for rgba() use. */
export function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = Number.parseInt(full, 16)
  if (Number.isNaN(num)) return '245, 184, 65'
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `${r}, ${g}, ${b}`
}

/**
 * Scale a hex color's brightness by a percentage (100 = unchanged). Channels
 * are multiplied by percent/100 and clamped, returning a new hex string.
 */
export function adjustBrightness(hex: string, percent: number): string {
  const rgb = hexToRgb(hex)
    .split(',')
    .map((n) => Number(n.trim()))
  const factor = percent / 100
  const scaled = rgb.map((c) =>
    Math.max(0, Math.min(255, Math.round(c * factor))),
  )
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(scaled[0])}${toHex(scaled[1])}${toHex(scaled[2])}`
}

/** Deep-merge persisted settings over defaults so new keys always resolve. */
export function mergeSettings(partial: Partial<Settings> | null): Settings {
  if (!partial) return structuredClone(DEFAULT_SETTINGS)
  const d = DEFAULT_SETTINGS
  return {
    general: { ...d.general, ...partial.general },
    appearance: { ...d.appearance, ...partial.appearance },
    console: {
      ...d.console,
      ...partial.console,
      services: partial.console?.services ?? d.console.services,
    },
    shortcuts: { ...d.shortcuts, ...partial.shortcuts },
    integrations: { ...d.integrations, ...partial.integrations },
    data: { ...d.data, ...partial.data },
    advanced: { ...d.advanced, ...partial.advanced },
  }
}
