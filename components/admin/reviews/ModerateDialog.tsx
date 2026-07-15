'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ShieldCheck, ShieldX, Flag } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { adminReviewsApi } from '@/lib/api/adminReviews';
import type { Review, ReviewListResult, SingleModerationAction } from '@/types/reviews.types';

interface ModerateDialogProps {
  review: Review | null;
  /** Pre-select an action, e.g. when opened from the row's "Reject…" menu item. */
  defaultAction?: SingleModerationAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful moderation so callers can close a parent drawer, etc. */
  onSuccess?: (reviewId: string, status: SingleModerationAction) => void;
}

const REASON_MIN = 5;
const REASON_MAX = 500;
const NOTES_MAX = 500;

const ACTIONS: { value: SingleModerationAction; label: string; icon: typeof ShieldCheck; activeClass: string }[] = [
  { value: 'approved', label: 'Approve', icon: ShieldCheck, activeClass: 'bg-emerald-500 text-white hover:bg-emerald-500/90' },
  { value: 'rejected', label: 'Reject', icon: ShieldX, activeClass: 'bg-rose-500 text-white hover:bg-rose-500/90' },
  { value: 'flagged', label: 'Flag', icon: Flag, activeClass: 'bg-orange-500 text-white hover:bg-orange-500/90' },
];

/**
 * Single-review moderation dialog. Reject requires a reason (5-500 chars),
 * validated client-side to mirror the backend validator before enabling submit.
 *
 * Per the known-500 backend risk, we only update local query caches inside
 * onSuccess (i.e. after the mutation has actually resolved) — never before
 * the request is sent.
 */
export function ModerateDialog({ review, defaultAction = 'approved', open, onOpenChange, onSuccess }: ModerateDialogProps) {
  const [action, setAction] = useState<SingleModerationAction>(defaultAction);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setAction(defaultAction);
      setReason('');
      setNotes('');
    }
  }, [open, defaultAction]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!review) throw new Error('No review selected');
      return adminReviewsApi.moderate(review._id, {
        status: action,
        reason: action === 'rejected' ? reason.trim() : undefined,
        notes: notes.trim() ? notes.trim() : undefined,
      });
    },
    onSuccess: () => {
      if (!review) return;
      // Remove the moderated review from any cached pending/flagged pages so the
      // queue reflects the change immediately, without waiting on a full refetch.
      queryClient.setQueriesData<ReviewListResult | undefined>(
        { queryKey: ['admin-reviews'] },
        (old) => {
          if (!old) return old;
          return { ...old, reviews: old.reviews.filter((r) => r._id !== review._id) };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-analytics'] });
      toast.success(
        action === 'approved' ? 'Review approved' : action === 'rejected' ? 'Review rejected' : 'Review flagged'
      );
      onSuccess?.(review._id, action);
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 500) {
        // TODO(backend): req.admin is currently undefined server-side for this route.
        toast.error('Moderation service error — contact backend');
      } else {
        toast.error('Could not moderate this review. Please try again.');
      }
    },
  });

  const reasonValid = action !== 'rejected' || (reason.trim().length >= REASON_MIN && reason.trim().length <= REASON_MAX);
  const notesValid = notes.length <= NOTES_MAX;
  const canSubmit = reasonValid && notesValid && !mutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !mutation.isPending && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Moderate review</DialogTitle>
          <DialogDescription>
            {review ? `#${review.reviewNumber} · ${review.title}` : 'Choose an outcome for this review.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div role="radiogroup" aria-label="Moderation action" className="grid grid-cols-3 gap-2">
            {ACTIONS.map(({ value, label, icon: Icon, activeClass }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={action === value}
                onClick={() => setAction(value)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  action === value ? activeClass : 'border-border bg-card hover:bg-muted/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {action === 'rejected' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="reject-reason">
                  Reason <span className="text-rose-500">*</span>
                </Label>
                <span
                  className={cn(
                    'text-xs',
                    reason.length > REASON_MAX ? 'text-rose-500' : 'text-muted-foreground'
                  )}
                >
                  {reason.length}/{REASON_MAX}
                </span>
              </div>
              <Textarea
                id="reject-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this review is being rejected (min 5 characters)…"
                maxLength={REASON_MAX}
                rows={3}
                aria-invalid={!reasonValid}
                aria-describedby="reject-reason-hint"
              />
              <p id="reject-reason-hint" className="text-xs text-muted-foreground">
                Required, 5–500 characters. Shown to the reviewer.
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="mod-notes">Internal notes (optional)</Label>
              <span className={cn('text-xs', notes.length > NOTES_MAX ? 'text-rose-500' : 'text-muted-foreground')}>
                {notes.length}/{NOTES_MAX}
              </span>
            </div>
            <Textarea
              id="mod-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes visible only to the admin team…"
              maxLength={NOTES_MAX}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!canSubmit}>
            {mutation.isPending ? 'Submitting…' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ModerateDialog;
