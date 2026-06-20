'use client'

import { Terminal } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getLastCommandOutput } from '@/lib/api'

export function LastOutputDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [output, setOutput] = useState('Loading…')

  useEffect(() => {
    if (!open) return
    let active = true
    getLastCommandOutput().then((o) => {
      if (active) setOutput(o)
    })
    return () => {
      active = false
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="glass-strong max-w-2xl gap-0 border-border p-0"
      >
        <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-4 text-left">
          <Terminal className="size-4 text-gold" />
          <div>
            <DialogTitle className="text-base">Last Command Output</DialogTitle>
            <DialogDescription className="text-xs">
              stdout / stderr from the most recent backend invocation.
            </DialogDescription>
          </div>
        </DialogHeader>
        <pre className="scrollbar-thin max-h-[60vh] overflow-auto bg-background/60 p-5 font-mono text-[12px] leading-relaxed text-foreground/85">
          {output}
        </pre>
      </DialogContent>
    </Dialog>
  )
}
