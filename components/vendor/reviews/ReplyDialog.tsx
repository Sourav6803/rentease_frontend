/**
 * components/vendor/reviews/ReplyDialog.tsx
 *
 * Modal composer the vendor uses to reply to a single review. Enforces the
 * 500-char model limit client-side and disables submit until there's
 * non-empty content. The actual mutation (and the "already replied" guard)
 * lives one level up in ReviewCard/page.tsx — this component is purely the
 * composer UI.
 */
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

const MAX_LENGTH = 500

interface ReplyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reviewTitle: string
  isSubmitting: boolean
  onSubmit: (reply: string) => Promise<void> | void
}

export function ReplyDialog({ open, onOpenChange, reviewTitle, isSubmitting, onSubmit }: ReplyDialogProps) {
  const [value, setValue] = useState('')
  const trimmed = value.trim()
  const isOverLimit = value.length > MAX_LENGTH
  const canSubmit = trimmed.length > 0 && !isOverLimit && !isSubmitting

  const handleOpenChange = (next: boolean) => {
    if (!next) setValue('')
    onOpenChange(next)
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit(trimmed)
    setValue('')
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reply to review</DialogTitle>
          <DialogDescription className="line-clamp-2">
            Replying to “{reviewTitle}”. Your response is public and visible to the reviewer.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Textarea
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Thank the customer, address their feedback, and offer a resolution if needed…"
            rows={5}
            aria-label="Your reply"
            aria-invalid={isOverLimit}
          />
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              This reply is final — it can&apos;t be edited after posting.
            </span>
            <span className={cn('tabular-nums', isOverLimit ? 'text-destructive' : 'text-muted-foreground')}>
              {value.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting…
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" /> Post reply
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ReplyDialog
