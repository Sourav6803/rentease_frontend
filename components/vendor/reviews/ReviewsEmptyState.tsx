/**
 * components/vendor/reviews/ReviewsEmptyState.tsx
 *
 * Empty state for the vendor reviews list. Shows distinct copy depending on
 * whether there are simply no reviews yet, or the current page has reviews
 * but none match the active client-side filters.
 */
'use client'

import { MessageSquareOff, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ReviewsEmptyStateProps {
  variant: 'no-reviews' | 'no-matches'
  onClearFilters?: () => void
}

export function ReviewsEmptyState({ variant, onClearFilters }: ReviewsEmptyStateProps) {
  const isNoMatches = variant === 'no-matches'

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-12 text-center">
      {isNoMatches ? (
        <SearchX className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      ) : (
        <MessageSquareOff className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      )}
      <div>
        <p className="font-medium text-foreground">
          {isNoMatches ? 'No reviews match your filters' : 'No reviews yet'}
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {isNoMatches
            ? 'Try adjusting or clearing your filters to see more reviews on this page.'
            : 'Once customers start reviewing your rentals, they will show up here for you to read and reply to.'}
        </p>
      </div>
      {isNoMatches && onClearFilters && (
        <Button variant="outline" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

export default ReviewsEmptyState
