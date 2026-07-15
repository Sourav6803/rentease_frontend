'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Circle,
  Clock3,
  MapPin,
  Truck,
  PackageCheck,
  PackageX,
  Ban,
  Navigation,
  RotateCcw,
  Warehouse,
} from 'lucide-react';

/**
 * Mirrors the delivery status enum from the Delivery History API reference:
 * scheduled · batched · assigned · out_for_delivery · in_transit · reached ·
 * delivered · picked_up · failed · cancelled · rescheduled · returned_to_warehouse
 */
export type DeliveryStatus =
  | 'scheduled'
  | 'batched'
  | 'assigned'
  | 'out_for_delivery'
  | 'in_transit'
  | 'reached'
  | 'delivered'
  | 'picked_up'
  | 'failed'
  | 'cancelled'
  | 'rescheduled'
  | 'returned_to_warehouse';

export interface TimelineEvent {
  status: DeliveryStatus;
  timestamp: string;
  location?: { coordinates: [number, number]; address?: string };
  note?: string;
}

interface StatusMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon badge: text + bg + ring */
  tone: string;
  /** Tailwind classes for badges/chips elsewhere in the page */
  badge: string;
}

export const STATUS_META: Record<DeliveryStatus, StatusMeta> = {
  scheduled: {
    label: 'Scheduled',
    icon: Clock3,
    tone: 'text-amber-500 bg-amber-500/10 ring-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
  },
  batched: {
    label: 'Batched',
    icon: PackageCheck,
    tone: 'text-amber-500 bg-amber-500/10 ring-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
  },
  assigned: {
    label: 'Assigned',
    icon: Circle,
    tone: 'text-orange-400 bg-orange-400/10 ring-orange-400/30',
    badge: 'bg-orange-400/10 text-orange-500 dark:text-orange-300 ring-1 ring-orange-400/30',
  },
  out_for_delivery: {
    label: 'Out for delivery',
    icon: Truck,
    tone: 'text-orange-500 bg-orange-500/10 ring-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 ring-1 ring-orange-500/30',
  },
  in_transit: {
    label: 'In transit',
    icon: Navigation,
    tone: 'text-orange-500 bg-orange-500/10 ring-orange-500/30',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-300 ring-1 ring-orange-500/30',
  },
  reached: {
    label: 'Reached',
    icon: MapPin,
    tone: 'text-amber-400 bg-amber-400/10 ring-amber-400/30',
    badge: 'bg-amber-400/10 text-amber-600 dark:text-amber-300 ring-1 ring-amber-400/30',
  },
  delivered: {
    label: 'Delivered',
    icon: CheckCircle2,
    tone: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30',
  },
  picked_up: {
    label: 'Picked up',
    icon: PackageCheck,
    tone: 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/30',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30',
  },
  failed: {
    label: 'Failed',
    icon: PackageX,
    tone: 'text-red-500 bg-red-500/10 ring-red-500/30',
    badge: 'bg-red-500/10 text-red-600 dark:text-red-400 ring-1 ring-red-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    icon: Ban,
    tone: 'text-stone-400 bg-stone-400/10 ring-stone-400/30',
    badge: 'bg-stone-400/10 text-stone-500 dark:text-stone-400 ring-1 ring-stone-400/30',
  },
  rescheduled: {
    label: 'Rescheduled',
    icon: RotateCcw,
    tone: 'text-amber-500 bg-amber-500/10 ring-amber-500/30',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/30',
  },
  returned_to_warehouse: {
    label: 'Returned to warehouse',
    icon: Warehouse,
    tone: 'text-stone-400 bg-stone-400/10 ring-stone-400/30',
    badge: 'bg-stone-400/10 text-stone-500 dark:text-stone-400 ring-1 ring-stone-400/30',
  },
};

export function DeliveryTimeline({ events }: { events: TimelineEvent[] }) {
  if (!events?.length) {
    return (
      <p className="text-sm text-stone-500 dark:text-stone-400">
        No timeline events recorded for this delivery yet.
      </p>
    );
  }

  return (
    <ol className="relative" aria-label="Delivery status timeline">
      {events.map((event, i) => {
        const meta = STATUS_META[event.status] ?? STATUS_META.assigned;
        const Icon = meta.icon;
        const isLast = i === events.length - 1;

        return (
          <motion.li
            key={`${event.status}-${event.timestamp}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.25 }}
            className="relative pb-7 pl-10 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-px bg-gradient-to-b from-orange-300 to-orange-100 dark:from-orange-800 dark:to-orange-950"
              />
            )}
            <span
              className={`absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full ring-1 ${meta.tone}`}
              aria-hidden
            >
              <Icon className="h-4 w-4" />
            </span>

            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {meta.label}
              </p>
              <time
                dateTime={event.timestamp}
                className="text-xs font-medium text-stone-500 dark:text-stone-400"
              >
                {format(new Date(event.timestamp), 'MMM d, h:mm a')}
              </time>
            </div>

            {event.note && (
              <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-300">{event.note}</p>
            )}
            {event.location?.address && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <MapPin className="h-3 w-3 shrink-0" /> {event.location.address}
              </p>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}