'use client'

import { ShieldCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { CommandPreview } from '@/components/command-preview'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adoptCommand } from '@/lib/commands'
import type { AdoptProfileInput } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: AdoptProfileInput) => Promise<void> | void
}

function leaf(path: string): string {
  const parts = path.replace(/[\\/]+$/, '').split(/[\\/]/)
  return parts[parts.length - 1] ?? ''
}

export function AdoptProfileDialog({ open, onOpenChange, onSubmit }: Props) {
  const [location, setLocation] = useState('')
  const [name, setName] = useState('')
  const [touchedName, setTouchedName] = useState(false)
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const effectiveName = touchedName ? name : leaf(location)

  useEffect(() => {
    if (!open) {
      setLocation('')
      setName('')
      setTouchedName(false)
      setDescription('')
      setSubmitting(false)
    }
  }, [open])

  const submit = async () => {
    if (!location.trim()) return
    setSubmitting(true)
    await onSubmit({
      location: location.trim(),
      name: effectiveName.trim() || leaf(location),
      description,
    })
    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="glass-strong max-w-lg gap-0 border-border p-0"
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <DialogHeader className="border-b border-border px-6 py-5 text-left">
            <DialogTitle className="text-lg tracking-tight">
              Adopt Existing Project
            </DialogTitle>
            <DialogDescription>
              Bring an existing folder under Hermes management.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="ap-path">
                Folder path <span className="text-gold">*</span>
              </Label>
              <Input
                id="ap-path"
                value={location}
                autoFocus
                onChange={(e) => setLocation(e.target.value)}
                placeholder="D:\Cursor_Projectz\MyStudioChannel"
                className="font-mono text-xs"
              />
              <div className="flex items-start gap-2 rounded-lg border border-info/20 bg-info/5 px-3 py-2 text-[11px] text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-info" />
                <span>
                  Your existing files are never overwritten — only missing
                  Hermes scaffolding is added.
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ap-name">Name</Label>
              <Input
                id="ap-name"
                value={effectiveName}
                onChange={(e) => {
                  setTouchedName(true)
                  setName(e.target.value)
                }}
                placeholder="MyStudioChannel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ap-desc">Description</Label>
              <Textarea
                id="ap-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="MSC website project"
                rows={2}
              />
            </div>

            <CommandPreview command={adoptCommand(location, effectiveName)} />
          </div>

          <DialogFooter className="border-t border-border px-6 py-4">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!location.trim() || submitting}
              className="gap-2 bg-gold font-medium text-primary-foreground hover:bg-gold/90"
            >
              {submitting ? 'Adopting…' : 'Adopt Project'}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
