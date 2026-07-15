/**
 * app/(vendor)/vendor/reviews/page.tsx
 * Route: /vendor/reviews
 *
 * ── IMPORTANT — CLIENT-SIDE FILTERING CAVEAT ───────────────────────────────
 * The backend (`GET /api/v1/vendor/reviews`) only supports `page` and
 * `limit` as query params. Search, star rating, moderation status,
 * reply-state, and sort are all applied CLIENT-SIDE over the reviews on the
 * CURRENTLY FETCHED PAGE ONLY — we deliberately do NOT fetch every page to
 * reconcile a "global" filtered view, since that would mean pulling a
 * vendor's entire review history on every keystroke. Result counts in the
 * filter bar are explicitly labeled "on this page" so this isn't confusing
 * for the vendor. A true global filter/search would need a backend change
 * (e.g. `?rating=&status=&search=&sort=`) — noted here as a follow-up, not
 * implemented silently.
 *
 * ── "REPLY ONLY ONCE" BEHAVIOR ──────────────────────────────────────────
 * `POST /vendor/reviews/:id/reply` does NOT reject a second reply on the
 * backend. We derive `hasVendorReply = responses.some(r => r.isVendorResponse)`
 * per review and hide/disable the reply CTA once that's true, so a vendor
 * can never accidentally post a duplicate reply through this UI.
 * ────────────────────────────────────────────────────────────────────────
 */
'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { reviewsApi, personName } from '@/lib/api/reviews'
import { ReviewStatsHeader } from '@/components/vendor/reviews/ReviewStatsHeader'
import { RatingDistributionBar } from '@/components/vendor/reviews/RatingDistributionBar'
import { ReviewFilters } from '@/components/vendor/reviews/ReviewFilters'
import { ReviewCard } from '@/components/vendor/reviews/ReviewCard'
import { ReviewsEmptyState } from '@/components/vendor/reviews/ReviewsEmptyState'
import { ReviewsSkeleton } from '@/components/vendor/reviews/ReviewsSkeleton'
import { DEFAULT_FILTERS, type Review, type ReviewFiltersState } from '@/types/reviews.types'

const PAGE_LIMIT = 10

function applyClientFilters(reviews: Review[], filters: ReviewFiltersState): Review[] {
  let result = reviews

  if (filters.star !== 'all') {
    const star = Number(filters.star)
    result = result.filter((r) => Math.round(r.ratings.overall) === star)
  }

  if (filters.status !== 'all') {
    result = result.filter((r) => r.moderation.status === filters.status)
  }

  if (filters.reply !== 'all') {
    result = result.filter((r) => {
      const hasReply = r.responses.some((resp) => resp.isVendorResponse)
      return filters.reply === 'replied' ? hasReply : !hasReply
    })
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    result = result.filter((r) => {
      const productName = typeof r.product === 'object' ? r.product.basicInfo?.name ?? '' : ''
      const reviewerName = personName(r.user)
      return (
        r.title.toLowerCase().includes(q) ||
        r.content.toLowerCase().includes(q) ||
        reviewerName.toLowerCase().includes(q) ||
        productName.toLowerCase().includes(q) ||
        r.reviewNumber.toLowerCase().includes(q)
      )
    })
  }

  const sorted = [...result]
  switch (filters.sort) {
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'highest':
      sorted.sort((a, b) => b.ratings.overall - a.ratings.overall)
      break
    case 'lowest':
      sorted.sort((a, b) => a.ratings.overall - b.ratings.overall)
      break
    case 'most-helpful':
      sorted.sort((a, b) => b.helpful.count - a.helpful.count)
      break
    case 'newest':
    default:
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      break
  }

  return sorted
}

export default function VendorReviewsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1)
  const [filters, setFilters] = useState<ReviewFiltersState>(DEFAULT_FILTERS)
  const [replyingId, setReplyingId] = useState<string | null>(null)

  const setPage = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(next))
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleFiltersChange = useCallback(
    (next: ReviewFiltersState) => {
      setFilters(next)
      setPage(1) // reset to page 1 whenever filters change
    },
    [setPage]
  )

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['vendor-reviews', page, PAGE_LIMIT],
    queryFn: () => reviewsApi.listVendorReviews({ page, limit: PAGE_LIMIT }),
    placeholderData: keepPreviousData,
  })

  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: string; reply: string }) =>
      reviewsApi.replyToReview(reviewId, reply),
    onMutate: ({ reviewId }) => setReplyingId(reviewId),
    onSuccess: (result, { reviewId }) => {
      toast.success('Reply posted')
      // Optimistically append the new response into the cached page so the
      // UI updates instantly, then invalidate to reconcile with the server.
      queryClient.setQueryData(['vendor-reviews', page, PAGE_LIMIT], (old: typeof data) => {
        if (!old) return old
        return {
          ...old,
          reviews: old.reviews.map((r) =>
            r._id === reviewId ? { ...r, responses: [...r.responses, result.response] } : r
          ),
        }
      })
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews'] })
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to post reply'
      toast.error(message)
    },
    onSettled: () => setReplyingId(null),
  })

  const handleReply = useCallback(
    async (reviewId: string, content: string) => {
      await replyMutation.mutateAsync({ reviewId, reply: content })
    },
    [replyMutation]
  )

  const filteredReviews = useMemo(
    () => (data ? applyClientFilters(data.reviews, filters) : []),
    [data, filters]
  )

  const stats = useMemo(() => {
    if (!data) return { total: 0, replied: 0, needsReply: 0, attention: 0 }
    const total = data.reviews.length
    const replied = data.reviews.filter((r) => r.responses.some((resp) => resp.isVendorResponse)).length
    const needsReply = total - replied
    const attention = data.reviews.filter(
      (r) => r.moderation.status === 'pending' || r.moderation.status === 'flagged'
    ).length
    return { total, replied, needsReply, attention }
  }, [data])

  const vendorName = personName(
    session?.user
      ? {
          _id: (session.user as { id?: string }).id ?? '',
          email: session.user.email ?? undefined,
          profile: {
            firstName: (session.user as { firstName?: string }).firstName,
            lastName: (session.user as { lastName?: string }).lastName,
          },
        }
      : null,
    'You'
  )
  const vendorAvatar = (session?.user as { image?: string } | undefined)?.image

  const pagination = data?.pagination
  const hasNoReviewsAtAll = !isLoading && (data?.pagination.total ?? 0) === 0
  const hasNoMatches = !isLoading && !hasNoReviewsAtAll && filteredReviews.length === 0

  if (isError) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-2xl border border-dashed p-12 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-foreground">Couldn&apos;t load reviews</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Something went wrong while fetching your reviews. Please try again.
          </p>
        </div>
        <Button
          onClick={() => {
            refetch()
            toast.error('Retrying…')
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 lg:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reviews</h1>
          <p className="text-sm text-muted-foreground">See what customers are saying and reply to their feedback.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="Refresh reviews"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <ReviewsSkeleton />
      ) : (
        <>
          <ReviewStatsHeader
            distribution={data!.distribution}
            totalReviews={stats.total}
            repliedCount={stats.replied}
            needsReplyCount={stats.needsReply}
            attentionCount={stats.attention}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
              <RatingDistributionBar
                distribution={data!.distribution}
                activeStar={filters.star}
                onStarClick={(star) => handleFiltersChange({ ...filters, star })}
              />
            </div>

            <div className="space-y-4">
              <ReviewFilters filters={filters} onChange={handleFiltersChange} resultCount={filteredReviews.length} />

              {hasNoReviewsAtAll && <ReviewsEmptyState variant="no-reviews" />}
              {hasNoMatches && (
                <ReviewsEmptyState variant="no-matches" onClearFilters={() => handleFiltersChange(DEFAULT_FILTERS)} />
              )}

              {!hasNoReviewsAtAll && !hasNoMatches && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {filteredReviews.map((review, i) => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      vendorName={vendorName}
                      vendorAvatar={vendorAvatar}
                      onReply={handleReply}
                      isReplying={replyingId === review._id && replyMutation.isPending}
                      index={i}
                    />
                  ))}
                </div>
              )}

              {pagination && pagination.pages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => page > 1 && setPage(page - 1)}
                        aria-disabled={page <= 1}
                        className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: pagination.pages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => page < pagination.pages && setPage(page + 1)}
                        aria-disabled={page >= pagination.pages}
                        className={page >= pagination.pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
