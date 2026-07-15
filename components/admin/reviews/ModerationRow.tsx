'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { MoreVertical, ShieldCheck, Flag, BadgeCheck } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { StarRating } from './StarRating';
import { personName } from '@/lib/api/adminReviews';
import { productName, type ModerationTab, type Review } from '@/types/reviews.types';

interface ModerationRowProps {
  review: Review;
  tab: Extract<ModerationTab, 'pending' | 'flagged'>;
  selected: boolean;
  onToggleSelected: (id: string) => void;
  onOpenDetail: (review: Review) => void;
  onQuickModerate: (review: Review, status: 'approved' | 'rejected' | 'flagged') => void;
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  negative: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  rejected: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  flagged: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
};

function ModerationRowImpl({
  review,
  tab,
  selected,
  onToggleSelected,
  onOpenDetail,
  onQuickModerate,
}: ModerationRowProps) {
  const displayName = personName(review.user);
  const initials = displayName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const sentiment = review.sentiment?.sentiment;
  const createdLabel = formatDistanceToNow(new Date(review.createdAt), { addSuffix: true });
  const createdAbsolute = format(new Date(review.createdAt), 'PPpp');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -12, transition: { duration: 0.18 } }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group grid grid-cols-[auto_auto_1fr_auto_auto_auto_auto] items-center gap-3 border-b border-border/60 px-4 py-3 text-sm last:border-0',
        'hover:bg-muted/40 focus-within:bg-muted/40'
      )}
      role="row"
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggleSelected(review._id)}
        aria-label={`Select review ${review.reviewNumber}`}
        onClick={(e) => e.stopPropagation()}
      />

      <Avatar className="h-9 w-9">
        <AvatarImage src={review.user.profile?.avatar} alt="" />
        <AvatarFallback className="text-xs">{initials || '??'}</AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={() => onOpenDetail(review)}
        className="flex min-w-0 flex-col items-start gap-0.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
      >
        <div className="flex w-full items-center gap-2">
          <span className="truncate font-medium text-foreground">{displayName}</span>
          {review.verification?.isVerifiedPurchase && (
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-blue-500" aria-label="Verified purchase" />
              </TooltipTrigger>
              <TooltipContent>Verified purchase</TooltipContent>
            </Tooltip>
          )}
          <span className="truncate text-xs text-muted-foreground">
            on {productName(review.product)}
          </span>
        </div>
        <div className="flex w-full items-center gap-2">
          <StarRating value={review.ratings.overall} size="sm" />
          <span className="truncate text-xs text-muted-foreground">
            <span className="font-medium text-foreground/80">{review.title}</span> — {review.content}
          </span>
        </div>
      </button>

      {sentiment && (
        <Badge variant="outline" className={cn('shrink-0 border', SENTIMENT_STYLES[sentiment])}>
          {sentiment}
        </Badge>
      )}

      {tab === 'flagged' && (
        <Badge variant="outline" className="shrink-0 gap-1 border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <Flag className="h-3 w-3" /> {review.reported?.count ?? 0}
        </Badge>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">{createdLabel}</span>
        </TooltipTrigger>
        <TooltipContent>{createdAbsolute}</TooltipContent>
      </Tooltip>

      <div className="flex shrink-0 items-center gap-1">
        <Badge variant="outline" className={cn('border capitalize', STATUS_STYLES[review.moderation.status])}>
          {review.moderation.status}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Actions for review ${review.reviewNumber}`}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onOpenDetail(review)}>View details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickModerate(review, 'approved')}>
              <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickModerate(review, 'rejected')}>
              Reject…
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onQuickModerate(review, 'flagged')}>
              <Flag className="mr-2 h-4 w-4 text-orange-500" /> Flag
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

export const ModerationRow = memo(ModerationRowImpl);
export default ModerationRow;
