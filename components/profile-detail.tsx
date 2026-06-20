'use client'

import {
  Check,
  Copy,
  FolderOpen,
  Link2,
  Pencil,
  Play,
  RefreshCw,
  SquarePen,
  Terminal,
  TriangleAlert,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { CommandPreview } from '@/components/command-preview'
import { Monogram } from '@/components/monogram'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { ProfileAction } from '@/lib/api'
import {
  cliProfileHome,
  desktopShortcut,
  memCollection,
  quickActionCommand,
  switchCommand,
} from '@/lib/commands'
import type { Profile } from '@/lib/types'
import { cn } from '@/lib/utils'

type Props = {
  profile: Profile | null
  onSwitch: (slug: string) => void
  onAction: (action: ProfileAction, profile: Profile) => void
  onEdit: (profile: Profile) => void
}

function StatCard({
  label,
  value,
  action,
  copyable,
}: {
  label: string
  value: string
  action?: { label: string; onClick: () => void }
  copyable?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore
    }
  }
  return (
    <div className="glass group flex flex-col justify-between gap-2 rounded-xl p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow font-mono text-[10px] text-muted-foreground">
          {label}
        </span>
        {copyable ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={copy}
                  aria-label={`Copy ${label}`}
                  className="text-faint opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                />
              }
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </TooltipTrigger>
            <TooltipContent>{copied ? 'Copied' : 'Copy full path'}</TooltipContent>
          </Tooltip>
        ) : null}
      </div>
      <p className="break-all font-mono text-[12px] leading-relaxed text-foreground/90">
        {value}
      </p>
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-1 inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <FolderOpen className="size-3" /> {action.label}
        </button>
      ) : null}
    </div>
  )
}

const QUICK_ACTIONS: {
  id: string
  label: string
  icon: typeof Play
}[] = [
  { id: 'launch', label: 'Launch Hermes', icon: Play },
  { id: 'sync', label: 'Sync CLI Profile', icon: RefreshCw },
  { id: 'open', label: 'Open Folder', icon: FolderOpen },
  { id: 'shortcut', label: 'Reveal Shortcut', icon: Link2 },
  { id: 'cursor', label: 'Edit in Cursor', icon: SquarePen },
]

export function ProfileDetail({
  profile,
  onSwitch,
  onAction,
  onEdit,
}: Props) {
  const [hoverCommand, setHoverCommand] = useState<string | null>(null)

  if (!profile) {
    return (
      <section className="glass flex h-full items-center justify-center rounded-2xl">
        <p className="text-sm text-muted-foreground">
          Select a profile to inspect.
        </p>
      </section>
    )
  }

  const command = hoverCommand ?? switchCommand(profile)
  const isActive = !!profile.active

  return (
    <section
      className="glass relative flex h-full flex-col overflow-hidden rounded-2xl"
      aria-label="Profile detail"
    >
      {/* shimmer sweep on selection change */}
      <AnimatePresence mode="wait">
        <motion.span
          key={profile.slug}
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(245,184,65,0.06), transparent)',
          }}
        />
      </AnimatePresence>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <Monogram name={profile.name} size="lg" active={isActive} />
            <div className="min-w-0">
              <span className="eyebrow text-[10px] text-muted-foreground">
                {isActive ? 'Active profile' : 'Selected profile'}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-semibold tracking-tight">
                  {profile.name}
                </h1>
                <span className="rounded-md border border-border bg-secondary px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  {profile.slug}
                </span>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        className={cn(
                          'inline-flex cursor-default items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-medium',
                          profile.cliProfile
                            ? 'border-success/25 text-success'
                            : 'border-warning/25 text-warning',
                        )}
                      />
                    }
                  >
                    {profile.cliProfile ? (
                      <Terminal className="size-3" />
                    ) : (
                      <TriangleAlert className="size-3" />
                    )}
                    {profile.cliProfile ? 'CLI ok' : 'CLI missing'}
                  </TooltipTrigger>
                  <TooltipContent>
                    {profile.cliProfile
                      ? 'A matching Hermes CLI profile exists — terminal sessions resolve to this workspace.'
                      : 'No matching CLI profile yet — switching will scaffold one for terminal use.'}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="mt-2 max-w-lg text-sm text-muted-foreground">
                {profile.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label="Edit profile"
                    onClick={() => onEdit(profile)}
                    className="flex size-9 items-center justify-center rounded-xl border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                  />
                }
              >
                <Pencil className="size-4" />
              </TooltipTrigger>
              <TooltipContent>Edit name, path, or board id</TooltipContent>
            </Tooltip>
            {isActive ? (
              <span className="active-border active-bg active-text inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium">
                <Check className="size-4" /> Active
              </span>
            ) : (
              <Button
                onClick={() => onSwitch(profile.slug)}
                onMouseEnter={() => setHoverCommand(switchCommand(profile))}
                onMouseLeave={() => setHoverCommand(null)}
                className="gap-2 bg-gold font-medium text-primary-foreground hover:bg-gold/90"
              >
                <Zap className="size-4" /> Switch to this
              </Button>
            )}
          </div>
        </div>

        {/* 2x2 stat bento */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            label="Workspace path"
            value={profile.path}
            copyable
            action={{
              label: 'Open Folder',
              onClick: () => onAction('open', profile),
            }}
          />
          <StatCard label="CLI profile home" value={cliProfileHome(profile.slug)} />
          <StatCard label="Mem0 collection" value={memCollection(profile.slug)} />
          <StatCard
            label="Desktop shortcut"
            value={desktopShortcut(profile.name)}
            action={{
              label: 'Reveal Shortcut',
              onClick: () => onAction('shortcut', profile),
            }}
          />
        </div>

        {/* Quick actions */}
        <div className="mt-6">
          <span className="eyebrow text-[10px] text-muted-foreground">
            Quick actions
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="outline"
                size="sm"
                onMouseEnter={() =>
                  setHoverCommand(quickActionCommand(id, profile))
                }
                onMouseLeave={() => setHoverCommand(null)}
                onClick={() => onAction(id as ProfileAction, profile)}
                className="gap-2 border-border bg-secondary/40 text-foreground/90 hover:border-gold/30 hover:text-gold"
              >
                <Icon className="size-3.5" /> {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Command preview */}
        <div className="mt-6">
          <CommandPreview command={command} />
          <p className="mt-2 text-[11px] text-faint">
            Jedi transparency — this is the exact PowerShell the current action
            will run.
          </p>
        </div>
      </div>
    </section>
  )
}
