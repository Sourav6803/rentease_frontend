'use client'

import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { AlertTriangle, RefreshCw, Radio } from 'lucide-react'

import { IntelligencePageShell } from '@/components/admin/intelligence'
import {
  InterestHeader,
  InterestHero,
  InterestKPIs,
  InterestFilterBar,
  InterestTable,
  InterestDrawer,
  type InterestRowAction,
  ScoringModal,
  AutomationPanel,
  InterestAnalytics,
  InterestHeatmapCard,
  InterestSkeleton,
  InterestEmptyState,
  useInterests,
  deriveAnalytics,
  deriveKpis,
  filterInterests,
  customerName,
  productName,
} from '@/components/admin/intelligence'
import type { InterestFilters, InterestItem, RecommendationCard } from '@/components/admin/intelligence'
import { downloadCsv, toCsv } from '@/lib/api/admin-intelligence'
import { Button } from '@/components/ui/button'
import {
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'

const PAGE_SIZE = 12

const DEFAULT_FILTERS: InterestFilters = {
  search: '',
  category: 'all',
  user: 'all',
  returning: false,
  signalType: 'all',
  marketingTriggered: 'all',
  sortBy: 'score_desc',
  startDate: '',
  endDate: '',
}

function exportRows(rows: InterestItem[]) {
  const columns = [
    'customer',
    'email',
    'product',
    'category',
    'score',
    'views',
    'timeSpentSeconds',
    'signals',
    'marketingTriggered',
    'lastViewed',
  ]
  const csv = toCsv(
    rows.map((r) => ({
      customer: customerName(r),
      email: r.user?.email ?? '',
      product: productName(r),
      category: r.product?.category?.name ?? 'Uncategorized',
      score: r.interactionScore,
      views: r.viewCount ?? 0,
      timeSpentSeconds: r.totalTimeSpentSeconds ?? 0,
      signals: (r.signals ?? []).map((s) => s.type).join('|'),
      marketingTriggered: r.isInterested ? 'yes' : 'no',
      lastViewed: r.lastViewedAt ?? '',
    })),
    columns,
  )
  downloadCsv('interest-detection.csv', csv)
  toast.success(`Exported ${rows.length} record${rows.length === 1 ? '' : 's'} to CSV`)
}

export default function InterestDetectionPage() {
  const [page, setPage] = useState(1)
  const [minScore, setMinScore] = useState(0)
  const [filters, setFilters] = useState<InterestFilters>(DEFAULT_FILTERS)
  const [selected, setSelected] = useState<InterestItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scoringOpen, setScoringOpen] = useState(false)

  const query = useInterests({ page, limit: PAGE_SIZE, minScore })
  const { data, isLoading, isError, isFetching, refetch } = query

  const items = useMemo(() => data?.items ?? [], [data])
  const pagination = data?.pagination
  const total = pagination?.total ?? 0
  const pages = pagination?.pages ?? 1

  const analytics = useMemo(() => deriveAnalytics(items), [items])
  const kpis = useMemo(
    () => deriveKpis(items, total, analytics.dailyTrend),
    [items, total, analytics.dailyTrend],
  )
  const filteredItems = useMemo(() => filterInterests(items, filters), [items, filters])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    for (const i of items) set.add(i.product?.category?.name ?? 'Uncategorized')
    return [...set]
  }, [items])

  const lastUpdated = useMemo(
    () =>
      data
        ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        : undefined,
    [data],
  )

  const openDrawer = useCallback((item: InterestItem) => {
    setSelected(item)
    setDrawerOpen(true)
  }, [])

  const handleRowAction = useCallback(
    (action: InterestRowAction, item: InterestItem) => {
      switch (action) {
        case 'details':
          openDrawer(item)
          break
        case 'offer':
          toast.success(`Rental offer queued for ${customerName(item)}`)
          break
        case 'campaign':
          toast.success(`Added ${productName(item)} intent to high-intent campaign`)
          break
        case 'export':
          exportRows([item])
          break
        case 'customer':
          toast(`Opening customer 360 for ${customerName(item)}`)
          break
      }
    },
    [openDrawer],
  )

  const handleDrawerAction = useCallback(
    (action: string, item: InterestItem) => {
      const labels: Record<string, string> = {
        email: 'Email sent',
        push: 'Push notification sent',
        discount: 'Discount generated',
        rental: 'Rental offer created',
        reminder: 'Wishlist reminder scheduled',
        stock: 'Back-in-stock alert enabled',
        price: 'Price-drop alert enabled',
        campaign: 'Added to campaign',
        automation: 'Opening automation workflows',
      }
      toast.success(labels[action] ?? 'Action executed', {
        description: `${customerName(item)} · ${productName(item)}`,
      })
    },
    [],
  )

  const handleApplyRecommendation = useCallback(
    (card: RecommendationCard) => {
      toast.success(`${card.action} triggered`, {
        description: card.reason,
      })
    },
    [],
  )

  const handleExportAll = useCallback(() => {
    if (!filteredItems.length) {
      toast('No records to export')
      return
    }
    exportRows(filteredItems)
  }, [filteredItems])

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setMinScore(0)
    setPage(1)
  }, [])

  const headerActions = (
    <InterestHeader
      onRefresh={() => refetch()}
      onExport={handleExportAll}
      onOpenRules={() => setScoringOpen(true)}
      loading={isFetching}
      lastUpdated={lastUpdated}
    />
  )

  if (isLoading) {
    return (
      <IntelligencePageShell
        title="Interest Detection Engine"
        subtitle="Automatically detect high-intent customers using behavioral signals and trigger personalized marketing automation."
        actions={headerActions}
      >
        <InterestSkeleton />
      </IntelligencePageShell>
    )
  }

  if (isError) {
    return (
      <IntelligencePageShell
        title="Interest Detection Engine"
        subtitle="Automatically detect high-intent customers using behavioral signals and trigger personalized marketing automation."
        actions={headerActions}
      >
        <ErrorState onRetry={() => refetch()} />
      </IntelligencePageShell>
    )
  }

  return (
    <TooltipProvider>
      <IntelligencePageShell
      title="Interest Detection Engine"
      subtitle="Automatically detect high-intent customers using behavioral signals and trigger personalized marketing automation."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Interest Detection' },
      ]}
      actions={headerActions}
    >
      <InterestHero onOpenRules={() => setScoringOpen(true)} className="mb-6" />

      <InterestKPIs kpis={kpis} columns={9} className="mb-6" />

      <InterestFilterBar
        filters={filters}
        onChange={(next) => {
          setFilters(next)
          setPage(1)
        }}
        onReset={resetFilters}
        minScore={minScore}
        onMinScoreChange={(v) => {
          setMinScore(v)
          setPage(1)
        }}
        categories={categoryOptions}
        loading={isFetching}
        className="mb-4"
      />

      {total === 0 && page === 1 && minScore === 0 && !hasActiveFilters(filters) ? (
        <InterestEmptyState
          actionLabel="Refresh"
          onAction={() => refetch()}
          className="mb-8"
        />
      ) : (
        <InterestTable
          items={filteredItems}
          loading={isFetching && !data}
          page={page}
          pages={pages}
          total={total}
          limit={PAGE_SIZE}
          onPageChange={setPage}
          onRowClick={openDrawer}
          onAction={handleRowAction}
          className="mb-8"
        />
      )}

      <InterestAnalytics analytics={analytics} className="mb-4" />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <InterestHeatmapCard />
        </div>
        <AutomationPanel />
      </div>

      <InterestDrawer
        item={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAction={handleDrawerAction}
        onApplyRecommendation={(card) => handleApplyRecommendation(card)}
      />

      <ScoringModal open={scoringOpen} onOpenChange={setScoringOpen} />
    </IntelligencePageShell>
    </TooltipProvider>
  )
}

function hasActiveFilters(f: InterestFilters): boolean {
  return (
    f.search.trim() !== '' ||
    f.category !== 'all' ||
    f.user !== 'all' ||
    f.signalType !== 'all' ||
    f.marketingTriggered !== 'all' ||
    f.startDate !== '' ||
    f.endDate !== ''
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <Alert className="mb-4 border-red-200 bg-red-50 text-red-900">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-sm">
          We couldn’t reach the Interest Detection API. Please verify connectivity and try again.
        </AlertDescription>
      </Alert>
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
          <Radio className="h-7 w-7 text-red-500" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">API unavailable</h3>
          <p className="mt-1 max-w-sm text-sm text-slate-500">
            The interest detection service is unreachable. Check your network or permissions and
            retry the request.
          </p>
        </div>
        <Button className="gap-1.5" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    </motion.div>
  )
}
