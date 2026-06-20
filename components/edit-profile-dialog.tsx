'use client'

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
import type { Profile, UpdateProfileInput } from '@/lib/types'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: Profile | null
  onSubmit: (input: UpdateProfileInput) => Promise<void> | void
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSubmit,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [boardId, setBoardId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Hydrate fields whenever a different profile is opened for editing.
  useEffect(() => {
    if (open && profile) {
      setName(profile.name)
      setDescription(profile.description ?? '')
      setLocation(profile.path)
      setBoardId(profile.boardId ?? '')
      setSubmitting(false)
    }
  }, [open, profile])

  if (!profile) return null

  const submit = async () => {
    if (!name.trim()) return
    setSubmitting(true)
    await onSubmit({
      slug: profile.slug,
      name: name.trim(),
      description,
      location: location.trim(),
      boardId: boardId.trim(),
    })
    setSubmitting(false)
  }

  const preview =
    `.\\Switch-Hermes-Profile.ps1 -Action update -Slug ${profile.slug} ` +
    `-Name "${name}"` +
    (boardId.trim() ? ` -BoardId "${boardId.trim()}"` : '')

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
              Edit Profile
            </DialogTitle>
            <DialogDescription>
              Update the display name, description, workspace path, or TaskBoard
              id. The slug{' '}
              <span className="font-mono text-gold">{profile.slug}</span> is the
              identity key and stays the same.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="ep-name">
                Name <span className="text-gold">*</span>
              </Label>
              <Input
                id="ep-name"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder="MyStudioChannel"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-desc">Description</Label>
              <Textarea
                id="ep-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Project description"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-path">Workspace path</Label>
              <Input
                id="ep-path"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="D:\Cursor_Projectz\MyStudioChannel"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-faint">
                Re-points the registry — files are not moved. The folder must
                already exist.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ep-board">TaskBoard id (optional)</Label>
              <Input
                id="ep-board"
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                placeholder="msc-website-v9-board-id"
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-faint">
                TaskBoardAI board this project opens to from Extras → Tools.
              </p>
            </div>

            <CommandPreview command={preview} />
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
              disabled={!name.trim() || submitting}
              className="gap-2 bg-gold font-medium text-primary-foreground hover:bg-gold/90"
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
