'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { PartyPopper, ShieldCheck, CalendarSearch, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type EmptyKind = 'pending-clear' | 'flagged-clear' | 'analytics-empty' | 'error';

interface AdminReviewsEmptyStateProps {
  kind: EmptyKind;
  onRetry?: () => void;
}

const COPY: Record<EmptyKind, { icon: React.ElementType; title: string; body: string }> = {
  'pending-clear': {
    icon: PartyPopper,
    title: 'Queue clear \ud83c\udf89',
    body: 'Every pending review has been triaged. New submissions will show up here automatically.',
  },
  'flagged-clear': {
    icon: ShieldCheck,
    title: 'Nothing flagged right now',
    body: 'No reviews currently have open reports. Reported reviews will appear here, sorted by report count.',
  },
  'analytics-empty': {
    icon: CalendarSearch,
    title: 'No data in this range',
    body: 'Try widening the date range — no reviews were created in the selected window.',
  },
  error: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    body: 'We couldn\u2019t load this data. Check your connection and try again.',
  },
};

/**
 * Shared empty/error state for the moderation console. Tone is celebratory for
 * an empty pending queue, neutral for flagged, and informational for analytics
 * with no rows in range.
 */
export function AdminReviewsEmptyState({ kind, onRetry }: AdminReviewsEmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const { icon: Icon, title, body } = COPY[kind];

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-16 text-center"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{body}</p>
      {kind === 'error' && onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      )}
    </motion.div>
  );
}

export default AdminReviewsEmptyState;
