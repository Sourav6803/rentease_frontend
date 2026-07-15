'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, ShieldCheck, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminReviewsApi } from '@/lib/api/adminReviews';
import type { BulkModerationAction } from '@/types/reviews.types';

interface BulkModerateBarProps {
  selectedIds: string[];
  onCleared: () => void;
}

/**
 * Sticky bar shown when one or more queue rows are selected. Bulk moderation
 * only supports 'approved' | 'rejected' — the backend rejects 'flagged' here,
 * so no flag option is offered.
 */
export function BulkModerateBar({ selectedIds, onCleared }: BulkModerateBarProps) {
  const [confirmAction, setConfirmAction] = useState<BulkModerationAction | null>(null);
  const [reason, setReason] = useState('');
  const [failedSummary, setFailedSummary] = useState<{ id: string; reason: string }[] | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (status: BulkModerationAction) =>
      adminReviewsApi.bulkModerate({
        reviewIds: selectedIds,
        status,
        reason: reason.trim() ? reason.trim() : undefined,
      }),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-analytics'] });
      toast.success(`${result.successful.length} review${result.successful.length === 1 ? '' : 's'} moderated`);
      if (result.failed.length) {
        setFailedSummary(result.failed);
      } else {
        setFailedSummary(null);
      }
      setConfirmAction(null);
      setReason('');
      onCleared();
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 500) {
        // TODO(backend): req.admin is currently undefined server-side for bulk moderate.
        toast.error('Moderation service error — contact backend');
      } else {
        toast.error('Bulk moderation failed. Please try again.');
      }
    },
  });

  const count = selectedIds.length;
  if (count === 0 && !failedSummary) return null;

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sticky bottom-4 z-20 mx-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-lg"
            role="region"
            aria-label="Bulk moderation actions"
          >
            <span className="text-sm font-medium text-foreground">
              {count} review{count === 1 ? '' : 's'} selected
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onCleared}>
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                onClick={() => setConfirmAction('rejected')}
              >
                <ShieldX className="mr-1.5 h-4 w-4" /> Reject all
              </Button>
              <Button
                size="sm"
                className="bg-emerald-500 text-white hover:bg-emerald-500/90"
                onClick={() => setConfirmAction('approved')}
              >
                <ShieldCheck className="mr-1.5 h-4 w-4" /> Approve all
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {failedSummary && failedSummary.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/5 p-3 text-sm">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-rose-600 dark:text-rose-400">
              {failedSummary.length} review{failedSummary.length === 1 ? '' : 's'} could not be moderated
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setFailedSummary(null)} aria-label="Dismiss">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ul className="space-y-0.5 text-xs text-muted-foreground">
            {failedSummary.map((f) => (
              <li key={f.id}>
                <span className="font-mono">{f.id}</span> — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dialog open={confirmAction !== null} onOpenChange={(v) => !v && setConfirmAction(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{confirmAction === 'approved' ? 'Approve' : 'Reject'} {count} review{count === 1 ? '' : 's'}?</DialogTitle>
            <DialogDescription>
              This applies to all currently selected rows on this page. Reason is optional for bulk actions.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional reason shown to reviewers…"
            maxLength={500}
            rows={3}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAction(null)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => confirmAction && mutation.mutate(confirmAction)}
              disabled={mutation.isPending}
              className={confirmAction === 'approved' ? 'bg-emerald-500 text-white hover:bg-emerald-500/90' : 'bg-rose-500 text-white hover:bg-rose-500/90'}
            >
              {mutation.isPending ? 'Submitting…' : `Confirm ${confirmAction === 'approved' ? 'approve' : 'reject'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BulkModerateBar;
