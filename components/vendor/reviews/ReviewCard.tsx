/**
 * components/vendor/reviews/ReviewCard.tsx
 *
 * Renders a single review: reviewer identity, rating, content, pros/cons,
 * attachments (with a lightbox), helpful/sentiment/moderation badges, and
 * the vendor reply flow.
 *
 * Data-shape guards (see backend contract):
 *  - `product` / `rental` may be raw ObjectId strings — always check
 *    `typeof x === 'object'` before reading nested fields.
 *  - `responses[].user` is NOT populated on GET /vendor/reviews, so for a
 *    vendor's own reply we render the *current vendor's* name/avatar
 *    (passed in via props) rather than trying to resolve the raw id.
 *  - `hasVendorReply` is derived from `responses.some(r => r.isVendorResponse)`
 *    — the backend does not block a second reply, so we must prevent it here.
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { formatDistanceToNow, format } from 'date-fns'
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShieldAlert,
  ThumbsUp,
  X,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { personName } from '@/lib/api/reviews'
import { StarRating } from './StarRating'
import { ReplyDialog } from './ReplyDialog'
// import type { ModerationStatus, Review } from '@/app/(vendor)/vendor/reviews/types'
import { cn } from '@/lib/utils'
import { Review, ModerationStatus } from '@/types/reviews.types'

interface ReviewCardProps {
  review: Review
  vendorName: string
  vendorAvatar?: string
  onReply: (reviewId: string, content: string) => Promise<void>
  isReplying: boolean
  index: number
}

const STATUS_STYLES: Record<ModerationStatus, string> = {
  approved: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  flagged: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
  rejected: 'bg-muted text-muted-foreground',
}

const SENTIMENT_STYLES: Record<'positive' | 'neutral' | 'negative', string> = {
  positive: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  neutral: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  negative: 'bg-rose-500/10 text-rose-700 dark:text-rose-400',
}

const CONTENT_CLAMP_LENGTH = 260

export function ReviewCard({ review, vendorName, vendorAvatar, onReply, isReplying, index }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [replyOpen, setReplyOpen] = useState(false)
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const reduceMotion = useReducedMotion()

  const product = typeof review.product === 'object' ? review.product : null
  const rental = typeof review.rental === 'object' ? review.rental : null

  const vendorReply = review.responses?.find((r) => r.isVendorResponse)
  const hasVendorReply = Boolean(vendorReply)

  const createdDate = new Date(review.createdAt)
  const relativeTime = formatDistanceToNow(createdDate, { addSuffix: true })
  const absoluteTime = format(createdDate, 'PPPp')

  const isLong = review.content.length > CONTENT_CLAMP_LENGTH
  const displayedContent =
    isLong && !expanded ? `${review.content.slice(0, CONTENT_CLAMP_LENGTH).trimEnd()}…` : review.content

  const handleReplySubmit = async (content: string) => {
    await onReply(review._id, content)
    setReplyOpen(false)
  }

  return (
    <motion.div
      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.04, duration: 0.3 }}
      layout={!reduceMotion}
    >
      <Card className="rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="space-y-3 p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10 border">
                <AvatarImage src={review.user?.profile?.avatar} alt="" />
                <AvatarFallback>{personName(review.user).slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-medium text-foreground">{personName(review.user)}</span>
                  {review.verification?.isVerifiedPurchase && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Verified purchase" />
                      </TooltipTrigger>
                      <TooltipContent>Verified purchase</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <StarRating value={review.ratings.overall} size="sm" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-default">{relativeTime}</span>
                    </TooltipTrigger>
                    <TooltipContent>{absoluteTime}</TooltipContent>
                  </Tooltip>
                  {rental?.rentalNumber && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>Rental {rental.rentalNumber}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{review.reviewNumber}</span>
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1.5">
              <Badge className={cn('rounded-full font-normal', STATUS_STYLES[review.moderation.status])}>
                {review.moderation.status}
              </Badge>
              {review.sentiment?.sentiment && (
                <Badge
                  variant="secondary"
                  className={cn('rounded-full font-normal', SENTIMENT_STYLES[review.sentiment.sentiment])}
                >
                  {review.sentiment.sentiment}
                </Badge>
              )}
            </div>
          </div>

          {review.moderation.status === 'flagged' && (
            <div className="flex items-center gap-1.5 rounded-lg bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-700 dark:text-rose-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              This review has been flagged for moderation review.
            </div>
          )}

          {/* Product link */}
          {product?.basicInfo?.name && (
            <Link
              href={`/vendor/products/${product._id}`}
              className="inline-block text-xs font-medium text-primary hover:underline"
            >
              {product.basicInfo.name}
            </Link>
          )}

          {/* Title + content */}
          <div>
            <h3 className="font-semibold text-foreground">{review.title}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {displayedContent}
            </p>
            {isLong && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {expanded ? (
                  <>
                    Show less <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Read more <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Pros / cons */}
          {((review.pros?.length ?? 0) > 0 || (review.cons?.length ?? 0) > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {review.pros?.map((pro, i) => (
                <Badge
                  key={`pro-${i}`}
                  variant="secondary"
                  className="gap-1 rounded-full bg-emerald-500/10 font-normal text-emerald-700 dark:text-emerald-400"
                >
                  <Plus className="h-3 w-3" /> {pro}
                </Badge>
              ))}
              {review.cons?.map((con, i) => (
                <Badge
                  key={`con-${i}`}
                  variant="secondary"
                  className="gap-1 rounded-full bg-rose-500/10 font-normal text-rose-700 dark:text-rose-400"
                >
                  <Minus className="h-3 w-3" /> {con}
                </Badge>
              ))}
            </div>
          )}

          {/* Attachments */}
          {review.attachments && review.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.attachments.map((att, i) =>
                att.type === 'image' ? (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setLightboxUrl(att.url)}
                    className="h-16 w-16 overflow-hidden rounded-lg border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={att.caption ? `View image: ${att.caption}` : 'View attached image'}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={att.url} alt={att.caption ?? ''} className="h-full w-full object-cover" />
                  </button>
                ) : null
              )}
            </div>
          )}

          <Separator />

          {/* Helpful count */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ThumbsUp className="h-3.5 w-3.5" />
            {review.helpful.count} found this helpful
            {typeof review.helpfulPercentage === 'number' && review.helpful.count > 0 && (
              <span>({review.helpfulPercentage}%)</span>
            )}
          </div>

          {/* Reply block */}
          {hasVendorReply && vendorReply ? (
            <div className="rounded-xl border bg-primary/5 p-3">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border">
                  <AvatarImage src={vendorAvatar} alt="" />
                  <AvatarFallback>{vendorName.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground">{vendorName}</span>
                <Badge variant="outline" className="rounded-full text-[10px] font-normal">
                  Vendor response
                </Badge>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(vendorReply.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">{vendorReply.content}</p>
            </div>
          ) : (
            <div>
              <Button size="sm" variant="outline" onClick={() => setReplyOpen(true)}>
                Reply to review
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ReplyDialog
        open={replyOpen}
        onOpenChange={setReplyOpen}
        reviewTitle={review.title}
        isSubmitting={isReplying}
        onSubmit={handleReplySubmit}
      />

      <Dialog open={Boolean(lightboxUrl)} onOpenChange={(open) => !open && setLightboxUrl(null)}>
        <DialogContent className="max-w-2xl border-none bg-transparent p-0 shadow-none">
          <button
            type="button"
            onClick={() => setLightboxUrl(null)}
            className="absolute right-2 top-2 z-10 rounded-full bg-background/80 p-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close image preview"
          >
            <X className="h-4 w-4" />
          </button>
          {lightboxUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={lightboxUrl} alt="Review attachment" className="w-full rounded-2xl object-contain" />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

export default ReviewCard
