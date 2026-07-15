'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw, Download, Share2, LifeBuoy, Sparkles } from 'lucide-react'
import { IntelligencePageShell } from '@/components/admin/intelligence'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { getAiInsights, toCsv, downloadCsv } from '@/lib/api/admin-intelligence'
import {
  ExecutiveSummary,
  InsightCard,
  RecommendationPanel,
  BusinessOpportuntyCards,
  RiskPanel,
  InsightTimeline,
  RevenueDriversChart,
  CategoryGrowthChart,
  InsightPlaceholderChart,
  AIInsightsSkeleton,
  AIInsightsEmptyState,
  deriveInsights,
  AI_DEMO,
} from '@/components/admin/intelligence/ai-insights'

export default function IntelligenceAiInsightsPage() {
  const toast = useToast()
  const aiQ = useQuery({
    queryKey: ['ai', 'ai-insights'],
    queryFn: () => getAiInsights(),
    staleTime: 60_000,
  })

  const isError = aiQ.isError
  const data = isError ? AI_DEMO : aiQ.data
  const demoMode = isError

  const insights = useMemo(() => deriveInsights(data ?? AI_DEMO), [data])
  const lastUpdated = useMemo(
    () =>
      aiQ.dataUpdatedAt
        ? new Date(aiQ.dataUpdatedAt).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : undefined,
    [aiQ.dataUpdatedAt],
  )

  const handleExport = () => {
    const d = data ?? AI_DEMO
    const rows = (d.insights ?? []).map((it, i) => ({
      index: i + 1,
      type: it.type,
      message: it.message,
      confidence: it.confidence,
      recommendedAction: it.recommendedAction ?? '',
    }))
    downloadCsv(
      'ai-insights.csv',
      toCsv(rows, ['index', 'type', 'message', 'confidence', 'recommendedAction']),
    )
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title: 'AI Business Insights', url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Report link copied to clipboard')
      }
    } catch {
      toast.info('Share cancelled')
    }
  }

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2">
      {lastUpdated && (
        <span className="hidden text-xs text-slate-400 lg:inline">Updated {lastUpdated}</span>
      )}
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleExport}>
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
        <Share2 className="h-3.5 w-3.5" />
        Share Report
      </Button>
      <Link
        href="/admin/help"
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        <LifeBuoy className="h-3.5 w-3.5" />
        Help & Support
      </Link>
      <Button
        size="sm"
        className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:brightness-105"
        onClick={() => aiQ.refetch()}
        disabled={aiQ.isFetching}
      >
        <RefreshCw className={`h-3.5 w-3.5 ${aiQ.isFetching ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  )

  const hasData = (data?.insights?.length ?? 0) > 0

  return (
    <IntelligencePageShell
      title="AI Business Insights"
      subtitle="Automatically generated business recommendations and executive summaries powered by customer behavior, rentals, vendors, and marketplace analytics."
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'AI Insights' },
      ]}
      demoMode={demoMode}
      demoMessage="Live AI API unreachable — showing demo insights."
      actions={headerActions}
    >
      {aiQ.isLoading ? (
        <AIInsightsSkeleton />
      ) : !hasData && !demoMode ? (
        <AIInsightsEmptyState />
      ) : (
        <div className="space-y-6">
          <ExecutiveSummary
            summary={data?.executiveSummary ?? 'No summary available.'}
            insights={insights}
            timestamp={data?.generatedAt ? new Date(data.generatedAt).toLocaleString('en-IN') : undefined}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((it, i) => (
              <InsightCard key={it.id} insight={it} index={i} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RiskPanel insights={insights} />
            </div>
            <RecommendationPanel insights={insights} />
          </div>

          <BusinessOpportuntyCards
            categoryRevenue={data?.categoryRevenue ?? []}
            highViewsLowRentals={data?.highViewsLowRentals ?? []}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <InsightTimeline
                insights={insights}
                generatedAt={data?.generatedAt ? new Date(data.generatedAt).toLocaleString('en-IN') : undefined}
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-900">Signal Coverage</h3>
              </div>
              <p className="text-xs leading-snug text-slate-500">
                Insights are generated from behavior, inventory, and vendor signals. Deeper
                rental, marketing, vendor-health, and satisfaction trends live in their dedicated
                analytics modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevenueDriversChart categoryRevenue={data?.categoryRevenue ?? []} />
            <CategoryGrowthChart categoryRevenue={data?.categoryRevenue ?? []} />
            <InsightPlaceholderChart title="Rental Trends" description="Rental volume over time" />
            <InsightPlaceholderChart title="Marketing Performance" description="Campaign conversion & spend" />
            <InsightPlaceholderChart title="Vendor Health" description="Vendor rating & fulfillment" />
            <InsightPlaceholderChart title="Customer Satisfaction" description="CSAT & review sentiment" />
          </div>
        </div>
      )}
    </IntelligencePageShell>
  )
}
