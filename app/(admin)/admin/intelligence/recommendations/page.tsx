'use client'

import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Lightbulb } from 'lucide-react'
import { IntelligencePageShell } from '@/components/admin/intelligence'
import { KpiGrid as KpiGridStat } from '@/components/admin/intelligence/kpi/KpiCard'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  RecommendationHeader,
  RecommendationHero,
  AlgorithmOverview,
  LivePreviewPanels,
  TestRecommendationTool,
  PipelineDiagram,
  ApiStatus,
  ConfigComingSoon,
  PlacementMap,
  RecommendationDocsModal,
  RecommendationSkeleton,
  RecommendationEmptyState,
  useRecommendationOverview,
  deriveRecommendationKpis,
} from '@/components/admin/intelligence/recommendations'
import { toCsv, downloadCsv } from '@/lib/api/admin-intelligence'
import type { RecProduct, ApiEndpointHealth } from '@/components/admin/intelligence/recommendations'

export default function IntelligenceRecommendationsPage() {
  const queryClient = useQueryClient()
  const [docsOpen, setDocsOpen] = useState(false)

  const overviewQ = useRecommendationOverview()
  const isLoading = overviewQ.isLoading
  const isError = overviewQ.isError
  const demoMode = isError

  const personalized = useMemo(() => overviewQ.data?.personalized ?? [], [overviewQ.data])
  const trending = useMemo(() => overviewQ.data?.trending ?? [], [overviewQ.data])
  const popular = useMemo(() => overviewQ.data?.popular ?? [], [overviewQ.data])
  const latencies = overviewQ.data?.latencies

  const kpis = useMemo(
    () => deriveRecommendationKpis(personalized, trending, popular, []),
    [personalized, trending, popular],
  )

  const endpoints: ApiEndpointHealth[] = useMemo(() => {
    const base: Array<{ id: string; label: string; path: string }> = [
      { id: 'recommendations', label: 'Personalized', path: '/api/v1/products/recommendations' },
      { id: 'trending', label: 'Trending', path: '/api/v1/products/trending' },
      { id: 'mostPopular', label: 'Most Popular', path: '/api/v1/products/most-popular' },
      { id: 'similar', label: 'Similar Products', path: '/api/v1/products/:id/similar' },
    ]
    return base.map((e) => {
      if (isLoading) return { ...e, status: 'loading' as const }
      if (isError)
        return { ...e, status: 'unavailable' as const }
      return {
        ...e,
        status: 'connected' as const,
        latencyMs: latencies?.[e.id as keyof typeof latencies],
      }
    })
  }, [isLoading, isError, latencies])

  const allProducts = useMemo<RecProduct[]>(
    () => [...personalized, ...trending, ...popular],
    [personalized, trending, popular],
  )

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['ai', 'recs'] })
  }

  const handleExport = () => {
    const rows = allProducts.map((p) => ({
      id: p._id,
      name: p.name,
      category: p.category ?? '',
      monthlyRent: p.monthlyRent ?? '',
      securityDeposit: p.securityDeposit ?? '',
      rating: p.rating ?? '',
      ratingCount: p.ratingCount ?? '',
      source: personalized.includes(p) ? 'personalized' : trending.includes(p) ? 'trending' : 'popular',
    }))
    downloadCsv(
      'recommendation-preview.csv',
      toCsv(rows, ['id', 'name', 'category', 'monthlyRent', 'securityDeposit', 'rating', 'ratingCount', 'source']),
    )
  }

  const lastUpdated = useMemo(() => {
    if (isLoading || !overviewQ.dataUpdatedAt) return undefined
    return new Date(overviewQ.dataUpdatedAt).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }, [isLoading, overviewQ.dataUpdatedAt])

  const hasData = !isLoading && !isError && allProducts.length > 0

  return (
    <IntelligencePageShell
      title="Recommendations"
      subtitle="Read-only preview of the live recommendation engine across storefront touchpoints"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Recommendations' },
      ]}
      demoMode={demoMode}
      actions={
        <RecommendationHeader
          onRefresh={handleRefresh}
          onExport={handleExport}
          onOpenDocs={() => setDocsOpen(true)}
          loading={overviewQ.isFetching}
          lastUpdated={lastUpdated}
        />
      }
    >
      {isLoading ? (
        <RecommendationSkeleton />
      ) : isError ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            Could not reach the recommendation APIs. Showing an empty state — the engine will populate
            once connectivity is restored.
          </div>
          <RecommendationEmptyState
            title="Recommendation engine unavailable"
            description="The recommendation APIs could not be reached. Refresh to retry, or use the docs to review the available endpoints."
            actionLabel="Refresh"
            onAction={handleRefresh}
          />
        </div>
      ) : !hasData ? (
        <RecommendationEmptyState
          actionLabel="Refresh"
          onAction={handleRefresh}
        />
      ) : (
        <div className="space-y-6">
          <TooltipProvider delayDuration={150}>
            <KpiGridStat kpis={kpis} columns={9} />
          </TooltipProvider>

          <RecommendationHero onOpenDocs={() => setDocsOpen(true)} />

          <LivePreviewPanels
            personalized={personalized}
            trending={trending}
            popular={popular}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AlgorithmOverview />
            <PlacementMap />
          </div>

          <PipelineDiagram />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TestRecommendationTool />
            </div>
            <div className="space-y-6">
              <ConfigComingSoon />
            </div>
          </div>

          <ApiStatus endpoints={endpoints} />

          <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <Lightbulb className="h-3 w-3" />
            Read-only monitoring console — no recommendation logic is computed here.
          </p>
        </div>
      )}

      <RecommendationDocsModal open={docsOpen} onOpenChange={setDocsOpen} />
    </IntelligencePageShell>
  )
}
