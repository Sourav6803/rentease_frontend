'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { X, ShieldCheck, ShieldX, Flag, BadgeCheck, MessageSquare, Flag as FlagIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { ModerateDialog } from './ModerateDialog';
import { adminReviewsApi, personName } from '@/lib/api/adminReviews';
import { AdminReviewsEmptyState } from './AdminReviewsEmptyState';
import { productName, vendorName, type SingleModerationAction } from '@/types/reviews.types';

interface ReviewDetailDrawerProps {
  reviewId: string | null;
  onClose: () => void;
}

const SUB_RATING_LABELS: Record<string, string> = {
  quality: 'Quality',
  condition: 'Condition',
  accuracy: 'Accuracy as described',
  communication: 'Communication',
  professionalism: 'Professionalism',
  responsiveness: 'Responsiveness',
  timeliness: 'On-time delivery',
  packaging: 'Packaging',
  courtesy: 'Courtesy',
};

function subRatingLabel(key: string) {
  return SUB_RATING_LABELS[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function SubRatingGroup({ title, ratings }: { title: string; ratings?: Record<string, number> }) {
  if (!ratings || Object.keys(ratings).length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      <div className="space-y-2">
        {Object.entries(ratings).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-xs text-muted-foreground">{subRatingLabel(key)}</span>
            <Progress value={(value / 5) * 100} className="h-2 flex-1" aria-label={`${subRatingLabel(key)}: ${value} of 5`} />
            <span className="w-6 text-right text-xs font-medium text-foreground">{value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReviewDetailDrawer({ reviewId, onClose }: ReviewDetailDrawerProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [moderateAction, setModerateAction] = useState<SingleModerationAction | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const queryClient = useQueryClient();
  const open = reviewId !== null;

  const { data: review, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-review-detail', reviewId],
    queryFn: () => adminReviewsApi.getReview(reviewId as string),
    enabled: open,
  });

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Review details"
            initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
            animate={prefersReducedMotion ? { opacity: 1 } : { x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {review ? `Review ${review.reviewNumber}` : 'Review details'}
                </h2>
                {review && (
                  <p className="text-xs text-muted-foreground">
                    {productName(review.product)} · {vendorName(review.vendor)}
                  </p>
                )}
              </div>
              <Button ref={closeButtonRef} variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 px-5 py-4">
              {isLoading && (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              )}

              {isError && <AdminReviewsEmptyState kind="error" onRetry={() => refetch()} />}

              {review && (
                <div className="space-y-6">
                  <section className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{personName(review.user)}</span>
                        {review.verification?.isVerifiedPurchase && (
                          <Badge variant="outline" className="gap-1 border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <BadgeCheck className="h-3 w-3" /> Verified
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground" title={format(new Date(review.createdAt), 'PPpp')}>
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <StarRating value={review.ratings.overall} size="lg" />
                    <h3 className="text-base font-semibold text-foreground">{review.title}</h3>
                    <p className="whitespace-pre-wrap text-sm text-foreground/90">{review.content}</p>
                  </section>

                  {(review.pros?.length || review.cons?.length) && (
                    <section className="grid grid-cols-2 gap-4">
                      {review.pros && review.pros.length > 0 && (
                        <div>
                          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Pros</h4>
                          <ul className="space-y-1 text-sm text-foreground/90">
                            {review.pros.map((p, i) => (
                              <li key={i}>+ {p}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {review.cons && review.cons.length > 0 && (
                        <div>
                          <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Cons</h4>
                          <ul className="space-y-1 text-sm text-foreground/90">
                            {review.cons.map((c, i) => (
                              <li key={i}>− {c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </section>
                  )}

                  {review.attachments && review.attachments.length > 0 && (
                    <section>
                      <h4 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {review.attachments.map((a, i) =>
                          a.type === 'image' ? (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setLightboxUrl(a.url)}
                              className="aspect-square overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={a.url} alt={a.caption || 'Review attachment'} className="h-full w-full object-cover" />
                            </button>
                          ) : (
                            <a
                              key={i}
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground"
                            >
                              Video
                            </a>
                          )
                        )}
                      </div>
                    </section>
                  )}

                  <Separator />

                  <section className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ratings breakdown</h4>
                    <SubRatingGroup title="Product" ratings={review.ratings.product} />
                    <SubRatingGroup title="Vendor" ratings={review.ratings.vendor} />
                    <SubRatingGroup title="Delivery" ratings={review.ratings.delivery} />
                  </section>

                  {review.reported && review.reported.count > 0 && (
                    <>
                      <Separator />
                      <section className="space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">
                          <FlagIcon className="h-3.5 w-3.5" /> Reports ({review.reported.count})
                        </h4>
                        <ul className="space-y-2">
                          {review.reported.reasons?.map((r, i) => (
                            <li key={i} className="rounded-lg border border-orange-500/20 bg-orange-500/5 px-3 py-2 text-xs">
                              <div className="flex items-center justify-between text-muted-foreground">
                                <span>{format(new Date(r.reportedAt), 'PP')}</span>
                                {r.status && <Badge variant="outline" className="capitalize">{r.status}</Badge>}
                              </div>
                              <p className="mt-1 text-foreground/90">{r.reason}</p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    </>
                  )}

                  {review.responses && review.responses.length > 0 && (
                    <>
                      <Separator />
                      <section className="space-y-2">
                        <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <MessageSquare className="h-3.5 w-3.5" /> Responses
                        </h4>
                        {review.responses.map((r, i) => (
                          <div key={i} className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{r.isVendorResponse ? 'Vendor response' : 'Response'}</span>
                              <span>{format(new Date(r.createdAt), 'PP')}</span>
                            </div>
                            <p className="text-foreground/90">{r.content}</p>
                          </div>
                        ))}
                      </section>
                    </>
                  )}

                  <Separator />

                  <section className="space-y-1.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Moderation history</h4>
                    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                      <p>
                        Status: <span className="font-medium capitalize text-foreground">{review.moderation.status}</span>
                      </p>
                      {review.moderation.reviewedAt && (
                        <p>Reviewed {format(new Date(review.moderation.reviewedAt), 'PPpp')}</p>
                      )}
                      {review.moderation.rejectionReason && <p>Rejection reason: {review.moderation.rejectionReason}</p>}
                      {review.moderation.moderationNotes && <p>Notes: {review.moderation.moderationNotes}</p>}
                    </div>
                  </section>
                </div>
              )}
            </ScrollArea>

            {review && (
              <div className="flex items-center gap-2 border-t border-border px-5 py-3">
                <Button
                  size="sm"
                  className="flex-1 bg-emerald-500 text-white hover:bg-emerald-500/90"
                  onClick={() => setModerateAction('approved')}
                >
                  <ShieldCheck className="mr-1.5 h-4 w-4" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
                  onClick={() => setModerateAction('rejected')}
                >
                  <ShieldX className="mr-1.5 h-4 w-4" /> Reject
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 dark:text-orange-400"
                  onClick={() => setModerateAction('flagged')}
                >
                  <Flag className="mr-1.5 h-4 w-4" /> Flag
                </Button>
              </div>
            )}
          </motion.div>

          <ModerateDialog
            review={review ?? null}
            defaultAction={moderateAction ?? 'approved'}
            open={moderateAction !== null}
            onOpenChange={(o) => !o && setModerateAction(null)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['admin-review-detail', reviewId] });
              onClose();
            }}
          />

          <Dialog open={lightboxUrl !== null} onOpenChange={(o) => !o && setLightboxUrl(null)}>
            <DialogContent className="max-w-3xl bg-transparent p-0 shadow-none">
              {lightboxUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lightboxUrl} alt="Attachment full size" className="max-h-[85vh] w-full rounded-lg object-contain" />
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </AnimatePresence>
  );
}

export default ReviewDetailDrawer;
