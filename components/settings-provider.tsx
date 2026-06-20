'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getSettings, updateSettings } from '@/lib/api'
import { adjustBrightness, DEFAULT_SETTINGS, hexToRgb } from '@/lib/settings'
import type { Settings } from '@/lib/types'

type Appearance = Settings['appearance']

type SettingsContextValue = {
  /** Effective settings used by the app (committed + live appearance preview). */
  settings: Settings
  /** The persisted/committed settings (ignores any live appearance preview). */
  committed: Settings
  loaded: boolean
  /** Persist a full settings object and clear any appearance preview. */
  save: (next: Settings) => Promise<void>
  /** Live-preview appearance without persisting. Pass null to revert. */
  previewAppearance: (appearance: Appearance | null) => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const GLOW_BY_INTENSITY: Record<Appearance['accentIntensity'], string> = {
  subtle: '0.55',
  medium: '1',
  bold: '1.7',
}

function applyAppearance(a: Appearance) {
  const root = document.documentElement
  // Accent color recolors brand tokens consumed across the whole app.
  root.style.setProperty('--gold', a.accentColor)
  root.style.setProperty('--primary', a.accentColor)
  root.style.setProperty('--ring', a.accentColor)
  root.style.setProperty('--accent-rgb', hexToRgb(a.accentColor))
  root.style.setProperty('--accent-glow', GLOW_BY_INTENSITY[a.accentIntensity])

  // Active-profile identity color — Saber Green (default) or Jedi Gold.
  root.style.setProperty(
    '--active-rgb',
    a.activeColor === 'gold' ? '245, 184, 65' : '63, 185, 80',
  )

  // Font family swap
  root.style.setProperty(
    '--font-sans',
    a.font === 'space-grotesk'
      ? 'var(--font-space-grotesk), var(--font-geist-sans)'
      : 'var(--font-geist-sans)',
  )

  // Data attributes consumed by globals.css
  root.dataset.glass = a.glassIntensity
  root.dataset.anim = a.animationSpeed
  root.dataset.compact = a.compact ? 'true' : 'false'
  root.dataset.grain = a.filmGrain ? 'true' : 'false'
  root.dataset.vignette = a.vignette ? 'true' : 'false'
  root.dataset.wordmarkGlow = a.wordmarkGlow ? 'true' : 'false'

  // Theme
  let resolvedDark = true
  if (a.theme === 'light') {
    root.classList.remove('dark')
    root.dataset.theme = 'light'
    resolvedDark = false
  } else if (a.theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
    root.dataset.theme = prefersDark ? 'dark' : 'light'
    resolvedDark = prefersDark
  } else {
    root.classList.add('dark')
    root.dataset.theme = 'dark'
  }

  // Custom canvas background (dark only — light theme keeps its own palette).
  if (resolvedDark) {
    root.style.setProperty(
      '--background',
      adjustBrightness(a.backgroundColor, a.backgroundBrightness),
    )
  } else {
    root.style.removeProperty('--background')
  }

  // Background image backdrop (blur / brightness / overlay tint / vignette).
  const hasImage = Boolean(a.backgroundImage)
  root.dataset.bgImage = hasImage ? 'true' : 'false'
  root.style.setProperty(
    '--bg-image',
    hasImage ? `url("${a.backgroundImage}")` : 'none',
  )
  root.style.setProperty('--bg-image-blur', `${a.backgroundImageBlur}px`)
  root.style.setProperty(
    '--bg-image-brightness',
    String(a.backgroundImageBrightness / 100),
  )
  root.style.setProperty(
    '--bg-overlay-color',
    `rgba(${hexToRgb(a.backgroundOverlayColor)}, ${a.backgroundOverlayOpacity / 100})`,
  )
  root.style.setProperty(
    '--bg-vignette-alpha',
    String(a.backgroundImageVignette / 100),
  )
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [committed, setCommitted] = useState<Settings>(DEFAULT_SETTINGS)
  const [preview, setPreview] = useState<Appearance | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let active = true
    getSettings().then((s) => {
      if (!active) return
      setCommitted(s)
      setLoaded(true)
    })
    return () => {
      active = false
    }
  }, [])

  const effectiveAppearance = preview ?? committed.appearance

  // Apply appearance side-effects whenever the effective appearance changes.
  useEffect(() => {
    if (!loaded) return
    applyAppearance(effectiveAppearance)
  }, [loaded, effectiveAppearance])

  const save = useCallback(async (next: Settings) => {
    setCommitted(next)
    setPreview(null)
    await updateSettings(next)
  }, [])

  const previewAppearance = useCallback((a: Appearance | null) => {
    setPreview(a)
  }, [])

  const settings = useMemo<Settings>(
    () => ({ ...committed, appearance: effectiveAppearance }),
    [committed, effectiveAppearance],
  )

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, committed, loaded, save, previewAppearance }),
    [settings, committed, loaded, save, previewAppearance],
  )

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx)
    throw new Error('useSettings must be used within a SettingsProvider')
  return ctx
}
