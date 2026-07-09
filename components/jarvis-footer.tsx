'use client'

import { FolderPlus, Plus, Repeat } from 'lucide-react'
import { AppControl } from '@/components/app-control'
import { ServiceCapsule } from '@/components/service-capsule'
import { useSettings } from '@/components/settings-provider'
import { Waveform } from '@/components/waveform'
import { Button } from '@/components/ui/button'
import type { Service } from '@/lib/types'

type Props = {
  services: Service[]
  onSwitch: () => void
  onCreate: () => void
  onAdopt: () => void
}

/** Fleet footer — DRAVEN bridge + service probes + profile quick actions. */
export function JarvisFooter({ services, onSwitch, onCreate, onAdopt }: Props) {
  const { settings } = useSettings()
  const c = settings.console

  return (
    <footer className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-3">
      <div className="flex items-center gap-3">
        <Waveform active={c.waveformAnimation} color={c.waveformColor} />
        <span className="eyebrow font-mono text-[10px] text-gold">
          DRAVEN Active
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <AppControl />
        {services.map((s) => (
          <ServiceCapsule
            key={s.id}
            service={s}
            showPort={c.showPorts}
            style={c.capsuleStyle}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onSwitch}
          className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
        >
          <Repeat className="size-3.5" /> Switch Profile
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCreate}
          className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
        >
          <Plus className="size-3.5" /> Create New
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onAdopt}
          className="gap-1.5 border-border bg-secondary/40 hover:border-gold/30 hover:text-gold"
        >
          <FolderPlus className="size-3.5" /> Adopt Project
        </Button>
      </div>
    </footer>
  )
}

/** @deprecated Use JarvisFooter — kept for imports during DRAVEN rebrand. */
export const DravenFooter = JarvisFooter
