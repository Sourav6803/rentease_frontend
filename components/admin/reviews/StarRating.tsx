'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_MAP = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

/**
 * Accessible star rating display. Purely presentational (read-only) — this
 * console never lets a moderator edit a review's rating, only its status.
 */
export function StarRating({ value, max = 5, size = 'md', label, className }: StarRatingProps) {
  const rounded = Math.round(value * 2) / 2; // nearest half star
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="img"
      aria-label={label ?? `Rated ${value.toFixed(1)} out of ${max} stars`}
    >
      {stars.map((star) => {
        const fill = rounded >= star ? 1 : rounded >= star - 0.5 ? 0.5 : 0;
        return (
          <span key={star} className="relative inline-flex" aria-hidden="true">
            <Star className={cn(SIZE_MAP[size], 'text-muted-foreground/30')} />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(SIZE_MAP[size], 'fill-amber-400 text-amber-400')} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;
