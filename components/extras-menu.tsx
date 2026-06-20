'use client'

import {
  CalendarDays,
  CircleStop,
  ExternalLink,
  KanbanSquare,
  LayoutGrid,
  LayoutDashboard,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'
import {
  getTaskboardStatus,
  openTaskboard,
  stopTaskboard,
  type TaskboardTarget,
} from '@/lib/api'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Profile } from '@/lib/types'

type Props = {
  activeProfile: Profile | null
}

const TOOLS: {
  id: TaskboardTarget
  label: string
  description: string
  icon: LucideIcon
}[] = [
  {
    id: 'taskboard',
    label: 'TaskBoard Manager',
    description: "Open this project's board",
    icon: LayoutGrid,
  },
  {
    id: 'kanban',
    label: 'Hermes Kanban Board',
    description: 'Drag-and-drop workflow board',
    icon: KanbanSquare,
  },
  {
    id: 'dashboard',
    label: 'Hermes Dashboard',
    description: 'Agent activity + system stats',
    icon: LayoutDashboard,
  },
]

export function ExtrasMenu({ activeProfile }: Props) {
  const [busy, setBusy] = useState(false)
  const { data: status } = useSWR('taskboard-status', getTaskboardStatus, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  })

  const boardId = activeProfile?.boardId?.trim() || undefined

  const open = async (target: TaskboardTarget) => {
    setBusy(true)
    try {
      const res = await openTaskboard(
        target,
        target === 'taskboard' ? boardId : undefined,
      )
      if (res.started) {
        toast.message('Starting Kanban stack…', {
          description: 'Opening in a few seconds once it boots.',
        })
        // Give the stack a moment to bind ports before opening the tab.
        setTimeout(() => window.open(res.url, '_blank', 'noopener'), 6000)
      } else {
        window.open(res.url, '_blank', 'noopener')
      }
    } catch {
      toast.error('Could not open the board')
    } finally {
      setBusy(false)
    }
  }

  const stop = async () => {
    setBusy(true)
    try {
      await stopTaskboard()
      toast.success('Stopping Kanban stack')
    } catch {
      toast.error('Could not stop the stack')
    } finally {
      setBusy(false)
    }
  }

  const anyUp = status?.taskboard || status?.kanban || status?.dashboard

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Extras and tools"
        className="relative flex size-9 items-center justify-center rounded-xl border border-border bg-secondary/40 text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold data-[popup-open]:border-gold/30 data-[popup-open]:text-gold"
      >
        <LayoutGrid className="size-4" />
        {anyUp ? (
          <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-success shadow-[0_0_8px_rgba(63,185,80,0.8)]" />
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="eyebrow text-[10px] text-muted-foreground">
            Tools · {activeProfile?.name ?? 'No active profile'}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        {TOOLS.map((tool) => {
          const Icon = tool.icon
          const isBoard = tool.id === 'taskboard'
          const live =
            (tool.id === 'taskboard' && status?.taskboard) ||
            (tool.id === 'kanban' && status?.kanban) ||
            (tool.id === 'dashboard' && status?.dashboard)
          return (
            <DropdownMenuItem
              key={tool.id}
              disabled={busy}
              className="gap-3 py-2"
              onSelect={(e) => {
                e.preventDefault()
                void open(tool.id)
              }}
            >
              <Icon className="size-4 text-gold" />
              <span className="flex flex-1 flex-col">
                <span className="text-sm text-foreground">{tool.label}</span>
                <span className="text-xs text-muted-foreground">
                  {isBoard && !boardId
                    ? 'No board id set — opens default'
                    : tool.description}
                </span>
              </span>
              {live ? (
                <span className="size-1.5 rounded-full bg-success" />
              ) : (
                <ExternalLink className="size-3.5 text-muted-foreground" />
              )}
            </DropdownMenuItem>
          )
        })}

        {isBoardHintNeeded(activeProfile) ? (
          <DropdownMenuItem
            disabled
            className="gap-2 py-1.5 text-muted-foreground"
            onSelect={(e) => e.preventDefault()}
          >
            <TriangleAlert className="size-3.5 text-warning" />
            <span className="text-[11px]">
              Set a TaskBoard id via Edit Profile for per-project boards
            </span>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={busy || !anyUp}
          className="gap-3 py-2"
          onSelect={(e) => {
            e.preventDefault()
            void stop()
          }}
        >
          <CircleStop className="size-4 text-muted-foreground" />
          <span className="text-sm">Stop Kanban stack</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled
          className="gap-3 py-2 text-muted-foreground"
          onSelect={(e) => e.preventDefault()}
        >
          <CalendarDays className="size-4" />
          <span className="flex flex-1 flex-col">
            <span className="text-sm text-foreground">Postiz Calendar</span>
            <span className="text-xs text-muted-foreground">
              Schedule and publish content
            </span>
          </span>
          <span className="eyebrow rounded-full border border-border px-1.5 py-0.5 text-[8px] text-muted-foreground">
            Soon
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function isBoardHintNeeded(profile: Profile | null): boolean {
  return Boolean(profile) && !profile?.boardId?.trim()
}
