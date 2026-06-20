'use client'

import { ArrowRight, Check, Repeat, Search, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CommandPreview } from '@/components/command-preview'
import { Monogram } from '@/components/monogram'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { switchCommand } from '@/lib/commands'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profiles: Profile[]
  activeProfile: Profile | null
  dryRun: boolean
  onConfirm: (slug: string) => void
}

export function SwitchProfileDialog({
  open,
  onOpenChange,
  profiles,
  activeProfile,
  dryRun,
  onConfirm,
}: Props) {
  const [query, setQuery] = useState('')
  const [targetSlug, setTargetSlug] = useState<string | null>(null)

  // Reset transient state whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      const firstInactive = profiles.find((p) => !p.active)
      setTargetSlug(firstInactive?.slug ?? null)
    }
  }, [open, profiles])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return profiles
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.path.toLowerCase().includes(q),
    )
  }, [profiles, query])

  const target = useMemo(
    () => profiles.find((p) => p.slug === targetSlug) ?? null,
    [profiles, targetSlug],
  )

  const canSwitch = target && !target.active

  const confirm = () => {
    if (!target || target.active) return
    onConfirm(target.slug)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="glass-strong flex max-h-[88vh] w-[min(640px,94vw)] !max-w-none flex-col gap-0 overflow-hidden border-border p-0 sm:!max-w-none"
      >
        <DialogHeader className="border-b border-border/60 px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <span className="flex size-7 items-center justify-center rounded-lg border border-gold/30 bg-accent text-gold">
              <Repeat className="size-3.5" />
            </span>
            Switch Profile
          </DialogTitle>
          <DialogDescription>
            {activeProfile ? (
              <span className="inline-flex flex-wrap items-center gap-1.5">
                Currently active:
                <span className="inline-flex items-center gap-1 font-medium text-gold">
                  <Zap className="size-3" /> {activeProfile.name}
                </span>
                — pick a profile to make active.
              </span>
            ) : (
              'Pick a profile to make active.'
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="border-b border-border/60 px-5 py-3">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter profiles…"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
          </div>
        </div>

        {/* Profile list */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {filtered.length === 0 ? (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              No profiles match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {filtered.map((p) => {
                const isActive = !!p.active
                const isTarget = p.slug === targetSlug
                return (
                  <li key={p.slug}>
                    <button
                      type="button"
                      disabled={isActive}
                      onClick={() => setTargetSlug(p.slug)}
                      onDoubleClick={() => {
                        if (!isActive) {
                          setTargetSlug(p.slug)
                          confirm()
                        }
                      }}
                      aria-pressed={isTarget}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                        isActive
                          ? 'cursor-default border-gold/30 bg-accent/40'
                          : isTarget
                            ? 'border-gold/50 bg-accent'
                            : 'border-border bg-secondary/30 hover:border-gold/30 hover:bg-secondary/60',
                      )}
                    >
                      <Monogram name={p.name} active={isActive} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-foreground">
                            {p.name}
                          </span>
                          {isActive ? (
                            <span className="eyebrow rounded-full border border-gold/30 bg-accent px-1.5 py-[1px] text-[8px] font-medium text-gold">
                              Active
                            </span>
                          ) : null}
                        </div>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {p.path}
                        </p>
                      </div>
                      {isTarget && !isActive ? (
                        <Check className="size-4 shrink-0 text-gold" />
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Target preview + confirm */}
        <div className="border-t border-border/60 px-5 py-4">
          {target && !target.active ? (
            <div className="mb-3 flex items-center justify-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                {activeProfile?.name ?? 'None'}
              </span>
              <ArrowRight className="size-4 text-gold" />
              <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                <Monogram name={target.name} className="size-6 text-[11px]" />
                {target.name}
              </span>
            </div>
          ) : null}

          {target && !target.active ? (
            <CommandPreview
              command={switchCommand(target)}
              label={dryRun ? 'Dry-run command' : 'Will run'}
              className="mb-3"
            />
          ) : null}

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-border bg-secondary/40"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!canSwitch}
              onClick={confirm}
              className="gap-1.5 bg-gold font-medium text-primary-foreground hover:bg-gold/90 disabled:opacity-50"
            >
              <Repeat className="size-3.5" />
              {target && !target.active
                ? `Switch to ${target.name}`
                : 'Select a profile'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
