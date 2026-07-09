'use client'

import { Search, Settings } from 'lucide-react'
import { forwardRef } from 'react'
import { ExtrasMenu } from '@/components/extras-menu'
import type { Profile } from '@/lib/types'

type Props = {
  query: string
  onQueryChange: (q: string) => void
  onSearchFocus: () => void
  activeProfile: Profile | null
  selectedProfile: Profile | null
  onOpenSettings: () => void
}

export const TopBar = forwardRef<HTMLInputElement, Props>(function TopBar(
  {
    query,
    onQueryChange,
    onSearchFocus,
    activeProfile,
    selectedProfile,
    onOpenSettings,
  },
  ref,
) {
  const extrasProfile = selectedProfile ?? activeProfile

  return (
    <header className="glass flex items-center gap-4 rounded-2xl px-4 py-3">
      {/* Wordmark */}
      <div className="glow-wordmark flex shrink-0 items-center gap-2.5">
        <span
          className="flex size-7 rotate-45 items-center justify-center rounded-[6px] border border-gold/40 bg-accent"
          aria-hidden
        >
          <span className="size-2 -rotate-45 rounded-[2px] bg-gold shadow-[0_0_10px_rgba(245,184,65,0.8)]" />
        </span>
        <div className="leading-none">
          <span className="block text-sm font-semibold tracking-[0.18em]">
            PROFILE JEDI
          </span>
          <span className="mt-1 block h-px w-full bg-gradient-to-r from-gold to-transparent" />
        </div>
      </div>

      {/* Search / command */}
      <div className="relative mx-auto w-full max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onSearchFocus}
          placeholder="Search profiles or press Ctrl+K"
          aria-label="Search profiles"
          className="h-10 w-full rounded-xl border border-border bg-secondary/40 pl-9 pr-16 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-gold/30"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          Ctrl K
        </kbd>
      </div>

      {/* Active profile capsule + settings */}
      <div className="flex shrink-0 items-center gap-2">
        <div
          className="active-border active-bg flex max-w-[12rem] flex-col gap-0.5 rounded-xl border px-3 py-1.5"
          title={
            selectedProfile && !selectedProfile.active
              ? `Browsing ${selectedProfile.name} — switch to make active`
              : undefined
          }
        >
          <div className="flex items-center gap-2">
            <span className="active-dot size-2 shrink-0 rounded-full" aria-hidden />
            <span className="eyebrow text-[9px] text-muted-foreground">
              Active
            </span>
            <span className="truncate text-xs font-medium text-foreground">
              {activeProfile?.name ?? 'None'}
            </span>
          </div>
          {selectedProfile && !selectedProfile.active ? (
            <span className="truncate pl-4 text-[10px] text-muted-foreground">
              Viewing: {selectedProfile.name}
            </span>
          ) : null}
        </div>
        <ExtrasMenu toolsProfile={extrasProfile} />
        <button
          type="button"
          aria-label="Settings"
          onClick={onOpenSettings}
          className="flex size-9 items-center justify-center rounded-xl border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
        >
          <Settings className="size-4" />
        </button>
      </div>
    </header>
  )
})
