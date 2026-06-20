'use client'

import { FolderPlus, Plus, Zap } from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import type { Profile } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profiles: Profile[]
  onSwitch: (slug: string) => void
  onCreate: () => void
  onAdopt: () => void
}

export function ProfileCommandPalette({
  open,
  onOpenChange,
  profiles,
  onSwitch,
  onCreate,
  onAdopt,
}: Props) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Command palette"
      description="Jump to or switch profiles"
      className="glass-strong"
    >
      <CommandInput placeholder="Switch profile or run an action…" />
      <CommandList>
        <CommandEmpty>No matches found.</CommandEmpty>
        <CommandGroup heading="Switch to profile">
          {profiles.map((p) => (
            <CommandItem
              key={p.slug}
              value={`${p.name} ${p.slug}`}
              onSelect={() => onSwitch(p.slug)}
            >
              <Zap className="size-4 text-gold" />
              <span>{p.name}</span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                {p.slug}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="create new profile" onSelect={onCreate}>
            <Plus className="size-4" />
            Create New Profile
          </CommandItem>
          <CommandItem value="adopt existing project" onSelect={onAdopt}>
            <FolderPlus className="size-4" />
            Adopt Existing Project
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
