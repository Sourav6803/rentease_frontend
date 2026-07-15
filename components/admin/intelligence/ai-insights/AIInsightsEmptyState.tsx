import { Sparkles } from 'lucide-react'
import { EmptyState } from '@/components/admin/intelligence/EmptyState'

interface AIInsightsEmptyStateProps {
  className?: string
}

export function AIInsightsEmptyState({ className }: AIInsightsEmptyStateProps) {
  return (
    <EmptyState
      className={className}
      icon={Sparkles}
      title="No AI insights generated yet."
      description="The AI engine analyzes behavior, rentals, vendors, and marketplace data to surface recommendations. Check back after more activity accrues."
    />
  )
}

export default AIInsightsEmptyState
