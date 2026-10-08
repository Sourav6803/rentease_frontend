import Image from 'next/image'

import { cn } from '@/lib/utils'

/**
 * The RentEase brand mark — a premium dimensional "R" on a royal-blue → violet
 * gradient tile.
 *
 * The source asset (public/logo-512.png) is exported pre-cropped to the tile
 * with transparent rounded corners, so `size` is the exact rendered size and no
 * wrapper clipping is required.
 *
 * `alt` defaults to empty on purpose: the logo always sits next to the
 * "RentEase" wordmark, so announcing it again would duplicate the brand name
 * for screen readers. Pass `alt` only where the mark stands completely alone.
 */
export function RentEaseLogo({
  size = 44,
  alt = '',
  withRing = false,
}: {
  size?: number
  alt?: string
  withRing?: boolean
}) {
  return (
    <Image
      src="/logo-512.png"
      alt={alt}
      width={size}
      height={size}
      priority
      className={cn(
        'shrink-0 drop-shadow-md',
        // corner radius matches the artwork's own rounding (~20% of the tile)
        withRing && 'rounded-[20%] ring-1 ring-white/25',
      )}
    />
  )
}
