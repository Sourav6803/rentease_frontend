'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MoreHorizontal,
  Eye,
  Send,
  CalendarClock,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from '@/components/admin/intelligence/StatusBadge'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'
import type { Campaign, CampaignStats } from '@/types/admin-intelligence.types'
import { MarketingEmptyState } from './MarketingEmptyState'

interface CampaignTableProps {
  campaigns: Campaign[]
  stats?: Record<string, CampaignStats>
  loading?: boolean
  onView?: (campaign: Campaign) => void
  onSend?: (campaign: Campaign) => void
  onSchedule?: (campaign: Campaign) => void
  onEdit?: (campaign: Campaign) => void
  onDelete?: (campaign: Campaign) => void
  onNewCampaign?: () => void
  className?: string
}

const AUDIENCE_LABEL: Record<Campaign['audience']['type'], string> = {
  all: 'All customers',
  selected: 'Manual list',
  segment: 'Segment',
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}

export function CampaignTable({
  campaigns,
  stats = {},
  loading = false,
  onView,
  onSend,
  onSchedule,
  onEdit,
  onDelete,
  onNewCampaign,
  className,
}: CampaignTableProps) {
  const [menuFor, setMenuFor] = useState<string | null>(null)

  if (!loading && campaigns.length === 0) {
    return (
      <MarketingEmptyState
        variant="campaigns"
        actionLabel="Create campaign"
        onAction={onNewCampaign}
        className={className}
      />
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className,
      )}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Campaign
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Audience
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Schedule
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Performance
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full max-w-[140px] rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : campaigns.map((campaign, idx) => {
                  const s = stats[campaign._id]
                  const canSend = campaign.status === 'draft' || campaign.status === 'scheduled'
                  return (
                    <TableRow
                      key={campaign._id}
                      className="group cursor-pointer hover:bg-slate-50/70"
                      onClick={() => onView?.(campaign)}
                    >
                      <motion.td
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="p-3 align-middle"
                      >
                        <p className="text-sm font-semibold text-slate-900">{campaign.name}</p>
                        {campaign.subject && (
                          <p className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400">
                            {campaign.subject}
                          </p>
                        )}
                      </motion.td>
                      <TableCell className="p-3">
                        <StatusBadge status={campaign.status} />
                      </TableCell>
                      <TableCell className="p-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {AUDIENCE_LABEL[campaign.audience.type]}
                          {campaign.audience.type === 'segment' && campaign.audience.segmentId && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-violet-200 bg-violet-50 px-1.5 py-0 text-[10px] font-medium text-violet-700"
                            >
                              seg
                            </Badge>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="p-3 text-sm text-slate-600">
                        {campaign.scheduledAt ? (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarClock className="h-3.5 w-3.5 text-indigo-400" />
                            {new Date(campaign.scheduledAt).toLocaleDateString()}
                          </span>
                        ) : campaign.sentAt ? (
                          new Date(campaign.sentAt).toLocaleDateString()
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="p-3">
                        {s ? (
                          <div className="flex items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Users className="h-3 w-3 text-blue-400" />
                              {s.sent}
                            </span>
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <TrendingUp className="h-3 w-3 text-emerald-400" />
                              {pct(s.openRate)}
                            </span>
                            <span className="font-semibold text-emerald-600">
                              {formatPrice(s.revenue)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">No stats</span>
                        )}
                      </TableCell>
                      <TableCell
                        className="p-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenu
                          open={menuFor === campaign._id}
                          onOpenChange={(o) => setMenuFor(o ? campaign._id : null)}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => onView?.(campaign)}>
                              <Eye className="h-4 w-4" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit?.(campaign)}>
                              <Pencil className="h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            {canSend && (
                              <DropdownMenuItem onClick={() => onSend?.(campaign)}>
                                <Send className="h-4 w-4" /> Send now
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onSchedule?.(campaign)}>
                              <CalendarClock className="h-4 w-4" /> Schedule
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => onDelete?.(campaign)}
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CampaignTable
