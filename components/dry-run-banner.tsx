'use client'

import { TerminalSquare } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useSettings } from '@/components/settings-provider'

export function DryRunBanner() {
  const { settings } = useSettings()
  const on = settings.advanced.dryRun

  return (
    <AnimatePresence>
      {on ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gold/40 bg-accent px-4 py-2 text-gold">
            <TerminalSquare className="size-4" />
            <span className="eyebrow text-[10px] font-medium">
              Dry-Run Mode
            </span>
            <span className="text-xs text-gold/80">
              Actions print their exact PowerShell command and are not executed.
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
