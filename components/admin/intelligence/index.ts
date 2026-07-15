export { IntelligencePageShell } from './IntelligencePageShell'
export { KpiGrid } from './KpiGrid'
export { PeriodSelector } from './PeriodSelector'
export { DateRangePicker } from './DateRangePicker'
export type { DateRangeValue } from './DateRangePicker'
export { ExportButton } from './ExportButton'
export { ChartCard } from './ChartCard'
export { DataTable } from './DataTable'
export type { DataTableColumn } from './DataTable'
export { EmptyState } from './EmptyState'
export { StatusBadge } from './StatusBadge'
export { TrendPill } from './TrendPill'
export { IntelligenceModulePlaceholder } from './IntelligenceModulePlaceholder'
export { DiscountFormSheet } from './DiscountFormSheet'
export { DiscountUsageSheet } from './DiscountUsageSheet'
export { MarketingSkeleton } from './marketing/MarketingSkeleton'
export { MarketingEmptyState } from './marketing/MarketingEmptyState'
export { AutomationHealthBanner } from './marketing/AutomationHealthBanner'
export { WorkflowCard } from './marketing/WorkflowCard'
export { WorkflowFlow } from './marketing/WorkflowFlow'
export { WorkflowDrawer } from './marketing/WorkflowDrawer'
export { CampaignTable } from './marketing/CampaignTable'
export { CampaignWizard } from './marketing/CampaignWizard'
export { EmailTemplateGrid } from './marketing/EmailTemplateGrid'
export { EmailEditor } from './marketing/EmailEditor'
export { SegmentGrid } from './marketing/SegmentGrid'
export { RuleBuilder } from './marketing/RuleBuilder'
export { MarketingCharts } from './marketing/MarketingCharts'
export {
  BehaviorSkeleton,
  BehaviorEmptyState,
  BehaviorFilterBar,
  AnalyticsCards,
  EventOverviewChart,
  TopProductsChart,
  SearchAnalytics,
  DeviceAnalytics,
  TrafficAnalytics,
  ConversionFunnel,
  SessionMetrics,
  BehaviorHeatmapCard,
  BehaviorEventTable,
  BehaviorDrawer,
  ImplementationGuide,
  JsonPayloadViewer,
} from './behavior'

export {
  NotificationSkeleton,
  NotificationEmptyState,
  NotificationFilterBar,
  ChannelStatusPanel,
  ComposePanel,
  PreviewPanel,
  TemplateGrid,
  TemplateEditor,
  NotificationTable,
  NotificationDrawer,
  AnalyticsPanel,
  CampaignDrawer,
} from './notifications'

export * from './kpi'
export * from './interests'
export * from './recommendations'

export const INTELLIGENCE_MODULES = [
  { key: 'hub', label: 'Hub', href: '/admin/intelligence', description: 'Central command dashboard' },
  { key: 'analytics', label: 'Analytics', href: '/admin/intelligence/analytics', description: 'Overview cards, charts & KPIs' },
  { key: 'coupons', label: 'Coupons', href: '/admin/intelligence/coupons', description: 'Discount & promotion analytics' },
  { key: 'crm', label: 'CRM', href: '/admin/intelligence/crm', description: 'Customer 360 & email outreach' },
  { key: 'marketing', label: 'Marketing', href: '/admin/intelligence/marketing', description: 'Workflows, campaigns & segments' },
  { key: 'products', label: 'Products', href: '/admin/intelligence/products', description: 'Product performance & demand' },
  { key: 'behavior', label: 'Behavior', href: '/admin/intelligence/behavior', description: 'User events & session analytics' },
  { key: 'interests', label: 'Interests', href: '/admin/intelligence/interests', description: 'High-intent product signals' },
  { key: 'recommendations', label: 'Recommendations', href: '/admin/intelligence/recommendations', description: 'Recommendation engine preview' },
  { key: 'vendors', label: 'Vendors', href: '/admin/intelligence/vendors', description: 'Vendor leaderboard & KPIs' },
  { key: 'notifications', label: 'Notifications', href: '/admin/intelligence/notifications', description: 'Broadcast & delivery monitoring' },
  { key: 'operations', label: 'Operations', href: '/admin/intelligence/operations', description: 'Deliveries, pickups & daily ops' },
  { key: 'ai-insights', label: 'AI Insights', href: '/admin/intelligence/ai-insights', description: 'Automated business insights' },
] as const
