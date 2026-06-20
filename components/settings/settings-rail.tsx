'use client'

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type RailItem = {
  id: string
  label: string
  icon: LucideIcon
}

export function SettingsRail({
  items,
  active,
  onSelect,
}: {
  items: RailItem[]
  active: string
  onSelect: (id: string) => void
}) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex shrink-0 gap-1 overflow-x-auto border-b border-border p-2 md:flex-col md:overflow-y-auto md:border-b-0 md:border-r md:p-3"
    >
      {items.map((item) => {
        const isActive = item.id === active
        const Icon = item.icon
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'group relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
              isActive
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
            )}
          >
            {isActive ? (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_8px_rgba(245,184,65,0.8)]" />
            ) : null}
            <Icon
              className={cn(
                'size-4 shrink-0',
                isActive ? 'text-gold' : 'text-muted-foreground',
              )}
            />
            <span className="whitespace-nowrap font-medium">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
