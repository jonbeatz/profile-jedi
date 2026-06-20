'use client'

import {
  Database,
  Info,
  Keyboard,
  Palette,
  Plug,
  Radio,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useSettings } from '@/components/settings-provider'
import { LastOutputDrawer } from '@/components/settings/last-output-drawer'
import { SettingsRail, type RailItem } from '@/components/settings/settings-rail'
import {
  AboutTab,
  AdvancedTab,
  AppearanceTab,
  ConsoleTab,
  DataTab,
  GeneralTab,
  IntegrationsTab,
  ShortcutsTab,
  type TabProps,
} from '@/components/settings/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DEFAULT_SETTINGS } from '@/lib/settings'
import type { Settings } from '@/lib/types'
import { cn } from '@/lib/utils'

const RAIL: RailItem[] = [
  { id: 'general', label: 'General', icon: SlidersHorizontal },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'console', label: 'Console', icon: Radio },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'data', label: 'Data & Storage', icon: Database },
  { id: 'advanced', label: 'Advanced', icon: Wrench },
  { id: 'about', label: 'About', icon: Info },
]

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { committed, save, previewAppearance } = useSettings()
  const [draft, setDraft] = useState<Settings>(committed)
  const [tab, setTab] = useState('general')
  const [discardOpen, setDiscardOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)
  const [lastOutputOpen, setLastOutputOpen] = useState(false)

  // Snapshot committed settings into the editable draft each time we open.
  useEffect(() => {
    if (open) {
      setDraft(structuredClone(committed))
      setTab('general')
    }
  }, [open, committed])

  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(committed),
    [draft, committed],
  )

  const setSection: TabProps['setSection'] = (section, patch) => {
    setDraft((prev) => {
      const next = { ...prev, [section]: { ...prev[section], ...patch } }
      // Appearance applies live (preview); other sections wait for Save.
      if (section === 'appearance') previewAppearance(next.appearance)
      return next
    })
  }

  const runAction: TabProps['runAction'] = async (factory) => {
    const res = await factory()
    if (res.ok) toast.success(res.message)
    else toast.error(res.message)
  }

  const closeAndRevert = () => {
    previewAppearance(null)
    onOpenChange(false)
  }

  const requestClose = () => {
    if (dirty) setDiscardOpen(true)
    else closeAndRevert()
  }

  const handleSave = async () => {
    await save(draft)
    onOpenChange(false)
    toast.success('Settings saved')
  }

  const handleResetAll = () => {
    const next = structuredClone(DEFAULT_SETTINGS)
    setDraft(next)
    previewAppearance(next.appearance)
    setResetOpen(false)
    toast.success('Settings restored to defaults — Save to confirm')
  }

  const tabProps: TabProps = {
    draft,
    setSection,
    runAction,
    onOpenLastOutput: () => setLastOutputOpen(true),
    onResetAllSettings: () => setResetOpen(true),
  }

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    general: <GeneralTab {...tabProps} />,
    appearance: <AppearanceTab {...tabProps} />,
    console: <ConsoleTab {...tabProps} />,
    shortcuts: <ShortcutsTab {...tabProps} />,
    integrations: <IntegrationsTab {...tabProps} />,
    data: <DataTab {...tabProps} />,
    advanced: <AdvancedTab {...tabProps} />,
    about: <AboutTab {...tabProps} />,
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) requestClose()
          else onOpenChange(true)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="glass-strong flex h-[88vh] !w-[min(1100px,94vw)] !max-w-none flex-col gap-0 overflow-hidden border-border p-0 sm:!max-w-none"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Header */}
            <header className="border-b border-border px-6 py-4">
              <h1 className="text-lg font-semibold tracking-[0.14em]">
                SETTINGS
              </h1>
              <p className="text-sm text-muted-foreground">
                A premium control panel for your Hermes environment.
              </p>
            </header>

            {/* Body: rail + content */}
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
              <SettingsRail items={RAIL} active={tab} onSelect={setTab} />
              <ScrollArea className="min-h-0 flex-1">
                <div className="p-5">{TAB_CONTENT[tab]}</div>
              </ScrollArea>
            </div>

            {/* Sticky footer */}
            <footer className="flex items-center justify-between gap-4 border-t border-border bg-background/40 px-6 py-3.5">
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    'size-2 rounded-full transition-colors',
                    dirty
                      ? 'bg-gold shadow-[0_0_8px_rgba(245,184,65,0.8)]'
                      : 'bg-border',
                  )}
                />
                <span className={dirty ? 'text-gold' : 'text-muted-foreground'}>
                  {dirty ? 'Unsaved changes' : 'All changes saved'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={requestClose}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!dirty}
                  className="bg-gold font-medium text-primary-foreground hover:bg-gold/90"
                >
                  Save Changes
                </Button>
              </div>
            </footer>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* Discard-changes confirmation */}
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent className="glass-strong border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved settings. Closing now will revert them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setDiscardOpen(false)
                closeAndRevert()
              }}
              className="bg-danger text-destructive-foreground hover:bg-danger/90"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset-all confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="glass-strong border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all settings?</AlertDialogTitle>
            <AlertDialogDescription>
              This restores all defaults. Profiles are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAll}
              className="bg-danger text-destructive-foreground hover:bg-danger/90"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <LastOutputDrawer
        open={lastOutputOpen}
        onOpenChange={setLastOutputOpen}
      />
    </>
  )
}
