'use client'

import { FolderPlus, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { ProfileCard } from '@/components/profile-card'
import { Button } from '@/components/ui/button'
import type { Profile } from '@/lib/types'

type Props = {
  profiles: Profile[]
  selectedSlug: string | null
  onSelect: (slug: string) => void
  onSwitch: (slug: string) => void
  onCreate: () => void
  onAdopt: () => void
  onRepairCli?: () => void
  repairingCli?: boolean
}

export function ProfileList({
  profiles,
  selectedSlug,
  onSelect,
  onSwitch,
  onCreate,
  onAdopt,
  onRepairCli,
  repairingCli = false,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const missingCli = profiles.filter((p) => !p.cliProfile).length

  // Arrow-key navigation across the list.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return
      const idx = profiles.findIndex((p) => p.slug === selectedSlug)
      if (idx === -1) return
      e.preventDefault()
      const next =
        e.key === 'ArrowDown'
          ? Math.min(profiles.length - 1, idx + 1)
          : Math.max(0, idx - 1)
      const slug = profiles[next].slug
      onSelect(slug)
      cardRefs.current[slug]?.focus()
    }
    el.addEventListener('keydown', handler)
    return () => el.removeEventListener('keydown', handler)
  }, [profiles, selectedSlug, onSelect])

  return (
    <section
      className="glass flex h-full flex-col rounded-2xl"
      aria-label="Known profiles"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">
            Known Profiles
          </h2>
          <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
            {profiles.length} profiles
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={onCreate}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-gold"
          >
            <Plus className="size-3.5" /> New
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onAdopt}
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-gold"
          >
            <FolderPlus className="size-3.5" /> Adopt
          </Button>
        </div>
      </header>

      {missingCli > 0 && onRepairCli ? (
        <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-gold">{missingCli}</span> profile
            {missingCli === 1 ? '' : 's'} missing CLI home — scaffold + sync in
            one click.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={repairingCli}
            onClick={onRepairCli}
            className="h-7 shrink-0 gap-1.5 border-gold/40 text-xs text-gold hover:bg-accent"
          >
            <RefreshCw
              className={`size-3.5 ${repairingCli ? 'animate-spin' : ''}`}
            />
            Repair CLI
          </Button>
        </div>
      ) : null}

      <div
        ref={containerRef}
        className="scrollbar-thin flex-1 space-y-2.5 overflow-y-auto p-4"
      >
        {profiles.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-gold/30 bg-accent">
              <Sparkles className="size-6 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium">No profiles yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create your first Hermes profile to begin.
              </p>
            </div>
            <Button
              onClick={onCreate}
              variant="outline"
              className="border-gold/40 text-gold hover:bg-accent hover:text-gold"
            >
              <Plus className="size-4" /> New Profile
            </Button>
          </div>
        ) : (
          profiles.map((p) => (
            <ProfileCard
              key={p.slug}
              ref={(node) => {
                cardRefs.current[p.slug] = node
              }}
              profile={p}
              selected={selectedSlug === p.slug}
              onSelect={() => onSelect(p.slug)}
              onSwitch={() => onSwitch(p.slug)}
            />
          ))
        )}
      </div>
    </section>
  )
}
