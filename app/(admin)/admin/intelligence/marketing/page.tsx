'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Megaphone,
  Workflow as WorkflowIcon,
  Mail,
  Users,
  RefreshCw,
  Calendar,
  Plus,
  Download,
  Upload,
  BarChart3,
  Zap,
  ShieldCheck,
  TrendingUp,
  Search,
  Clock,
  ArrowUpRight,
  Sparkles,
  X,
  Loader2,
  Trash2,
} from 'lucide-react'
import {
  listWorkflows,
  toggleWorkflow,
  listCampaigns,
  listEmailTemplates,
  listSegments,
  sendCampaign,
  scheduleCampaign,
  createEmailTemplate,
  updateEmailTemplate,
  createCampaign,
  createSegment,
  updateSegment,
  deleteCampaign,
  deleteEmailTemplate,
  deleteSegment,
  listCampaignAnalytics,
  computeMarketingOverview,
  formatCompactINR,
} from '@/lib/api/admin-intelligence'
import {
  IntelligencePageShell,
  KpiGrid,
  MarketingSkeleton,
  AutomationHealthBanner,
  WorkflowCard,
  WorkflowDrawer,
  CampaignTable,
  CampaignWizard,
  EmailTemplateGrid,
  EmailEditor,
  SegmentGrid,
  RuleBuilder,
  MarketingCharts,
  MarketingEmptyState,
} from '@/components/admin/intelligence'
import type {
  KpiCardItem,
  Workflow as WorkflowType,
  Campaign,
  EmailTemplate,
  CustomerSegment,
  MarketingOverview,
  CampaignWizardData,
  SegmentRule,
  CustomerSegmentExtended,
  EmailTemplateExtended,
  CampaignAnalyticsData,
} from '@/types/admin-intelligence.types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

const EMPTY_PAGINATION = { page: 1, limit: 50, total: 0, pages: 0 }

interface ConfirmDeleteState {
  kind: 'campaign' | 'template' | 'segment'
  id: string
  name: string
}

interface SegmentDialogState {
  open: boolean
  segment: CustomerSegmentExtended | null
  name: string
  description: string
}

export default function IntelligenceMarketingPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('workflows')
  const [drawerWorkflow, setDrawerWorkflow] = useState<WorkflowType | null>(null)
  const [campaignWizardOpen, setCampaignWizardOpen] = useState(false)
  const [editorTemplate, setEditorTemplate] = useState<EmailTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [draftSubject, setDraftSubject] = useState('')
  const [draftHtml, setDraftHtml] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [scheduleId, setScheduleId] = useState<string | null>(null)
  const [scheduleAt, setScheduleAt] = useState('')
  const [segmentDialog, setSegmentDialog] = useState<SegmentDialogState>({
    open: false,
    segment: null,
    name: '',
    description: '',
  })
  const [segmentRules, setSegmentRules] = useState<SegmentRule[]>([])
  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(null)

  const workflowsQ = useQuery({
    queryKey: ['ai', 'marketing', 'workflows'],
    queryFn: listWorkflows,
    staleTime: 60_000,
  })

  const campaignsQ = useQuery({
    queryKey: ['ai', 'marketing', 'campaigns'],
    queryFn: () => listCampaigns({ page: 1, limit: 50 }),
    staleTime: 30_000,
  })

  const templatesQ = useQuery({
    queryKey: ['ai', 'marketing', 'templates'],
    queryFn: () => listEmailTemplates(),
    staleTime: 60_000,
  })

  const segmentsQ = useQuery({
    queryKey: ['ai', 'marketing', 'segments'],
    queryFn: listSegments,
    staleTime: 60_000,
  })

  const analyticsQ = useQuery({
    queryKey: ['ai', 'marketing', 'campaign-analytics'],
    queryFn: listCampaignAnalytics,
    staleTime: 60_000,
  })

  // Demo mode = ANY fetch failed. Never show fabricated data as real — on
  // failure the page renders empty states so the banner is accurate.
  const demoMode =
    workflowsQ.isError || campaignsQ.isError || templatesQ.isError || segmentsQ.isError

  const workflows = (workflowsQ.data ?? []) as WorkflowType[]
  const campaignsData = (campaignsQ.data ?? {
    campaigns: [],
    pagination: EMPTY_PAGINATION,
  }) as { campaigns: Campaign[]; pagination: { page: number; limit: number; total: number; pages: number } }
  const campaigns = campaignsData?.campaigns ?? []
  const templates = (templatesQ.data ?? []) as EmailTemplateExtended[]
  const segments = (segmentsQ.data ?? []) as CustomerSegmentExtended[]

  const overview = useMemo(
    () => computeMarketingOverview({ workflows, campaigns: campaigns as Campaign[], segments: segments as CustomerSegment[] }),
    [workflows, campaigns, segments],
  )

  // Search filtering across every tab
  const q = searchQuery.trim().toLowerCase()
  const filteredWorkflows = useMemo(
    () => (q ? workflows.filter((w) => `${w.name} ${w.slug}`.toLowerCase().includes(q)) : workflows),
    [workflows, q],
  )
  const filteredCampaigns = useMemo(
    () => (q ? campaigns.filter((c) => c.name.toLowerCase().includes(q)) : campaigns),
    [campaigns, q],
  )
  const filteredTemplates = useMemo(
    () =>
      q
        ? templates.filter((t) => `${t.name} ${t.subject ?? ''}`.toLowerCase().includes(q))
        : templates,
    [templates, q],
  )
  const filteredSegments = useMemo(
    () => (q ? segments.filter((s) => s.name.toLowerCase().includes(q)) : segments),
    [segments, q],
  )

  const kpiItems: KpiCardItem[] = useMemo(() => {
    return [
      { key: 'workflows', title: 'Total Workflows', value: overview.totalWorkflows, icon: WorkflowIcon, accent: '#2563eb', sub: `${overview.activeWorkflows} active` },
      { key: 'campaigns', title: 'Active Campaigns', value: campaigns.filter((c) => c.status === 'sending' || c.status === 'sent').length, icon: Megaphone, accent: '#7c3aed', sub: `${campaigns.filter((c) => c.status === 'scheduled').length} scheduled` },
      { key: 'scheduled', title: 'Scheduled Emails', value: overview.scheduledCampaigns, icon: Calendar, accent: '#0891b2' },
      { key: 'sent-today', title: 'Emails Sent Today', value: overview.emailsSentToday, icon: Mail, accent: '#059669', sub: `${overview.emailsSentWeek} this week` },
      { key: 'open-rate', title: 'Open Rate', value: `${overview.openRate.toFixed(1)}%`, icon: TrendingUp, accent: '#2563eb', trend: overview.openRate > 40 ? 'up' : 'down' },
      { key: 'ctr', title: 'Click Rate', value: `${overview.clickRate.toFixed(1)}%`, icon: ArrowUpRight, accent: '#7c3aed', trend: overview.clickRate > 20 ? 'up' : 'down' },
      { key: 'revenue', title: 'Revenue Generated', value: formatCompactINR(overview.revenueGenerated), icon: BarChart3, accent: '#059669', trend: 'up' },
      { key: 'coupons', title: 'Coupon Redemption', value: overview.couponRedemption, icon: Zap, accent: '#d97706' },
      { key: 'engagement', title: 'Avg Engagement', value: `${overview.avgEngagementScore.toFixed(0)}/100`, icon: ShieldCheck, accent: '#0891b2' },
      { key: 'returning', title: 'Returning Customers', value: overview.returningCustomers, icon: Users, accent: '#9333ea', sub: 'Across segments' },
    ]
  }, [overview, campaigns])

  const toggleM = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) => toggleWorkflow(slug, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'workflows'] }),
  })

  const sendM = useMutation({
    mutationFn: (id: string) => sendCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaign-analytics'] })
      toast('Campaign sent successfully')
    },
    onError: () => toast('Failed to send campaign'),
  })

  const scheduleM = useMutation({
    mutationFn: ({ id, at }: { id: string; at: string }) => scheduleCampaign(id, at),
    onSuccess: () => {
      setScheduleId(null)
      setScheduleAt('')
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      toast('Campaign scheduled successfully')
    },
    onError: () => toast('Failed to schedule campaign'),
  })

  const saveTemplateM = useMutation({
    mutationFn: async ({
      template,
      name,
      subject,
      htmlBody,
    }: {
      template: EmailTemplate | null
      name: string
      subject: string
      htmlBody: string
    }) => {
      const payload = { name, subject, htmlBody }
      if (template) return updateEmailTemplate(template._id, payload)
      return createEmailTemplate(payload)
    },
    onSuccess: (_, vars) => {
      toast(vars.template ? 'Template updated' : 'Template created')
      setEditorTemplate(null)
      setTemplateName('')
      setDraftSubject('')
      setDraftHtml('')
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'templates'] })
    },
    onError: () => toast('Failed to save template'),
  })

  const duplicateTemplateM = useMutation({
    mutationFn: (t: EmailTemplateExtended) =>
      createEmailTemplate({
        name: `${t.name} (copy)`,
        subject: t.subject,
        htmlBody: t.htmlBody,
        category: t.category,
      }),
    onSuccess: () => {
      toast('Template duplicated')
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'templates'] })
    },
    onError: () => toast('Failed to duplicate template'),
  })

  const deleteTemplateM = useMutation({
    mutationFn: (id: string) => deleteEmailTemplate(id),
    onSuccess: () => {
      toast('Template deleted')
      setConfirmDelete(null)
      setEditorTemplate(null)
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'templates'] })
    },
    onError: () => toast('Failed to delete template'),
  })

  const createCampaignM = useMutation({
    mutationFn: (data: CampaignWizardData) =>
      createCampaign({
        name: data.name,
        subject: data.subject,
        htmlBody: data.htmlBody,
        audience: data.audience,
        template: data.templateId,
        status: data.scheduleType === 'scheduled' ? 'scheduled' : 'draft',
        scheduledAt:
          data.scheduleType === 'scheduled' && data.scheduledAt
            ? new Date(data.scheduledAt).toISOString()
            : undefined,
      }),
    onSuccess: () => {
      toast('Campaign created')
      setCampaignWizardOpen(false)
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaign-analytics'] })
    },
    onError: () => toast('Failed to create campaign'),
  })

  const deleteCampaignM = useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onSuccess: () => {
      toast('Campaign deleted')
      setConfirmDelete(null)
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'campaign-analytics'] })
    },
    onError: () => toast('Failed to delete campaign'),
  })

  const createSegmentM = useMutation({
    mutationFn: (payload: { name: string; description?: string; rules?: SegmentRule[] }) =>
      createSegment({
        name: payload.name,
        description: payload.description,
        ...(payload.rules
          ? { rules: payload.rules as unknown as Record<string, unknown> }
          : {}),
      }),
    onSuccess: () => {
      toast('Segment created')
      setSegmentDialog({ open: false, segment: null, name: '', description: '' })
      setSegmentRules([])
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'segments'] })
    },
    onError: () => toast('Failed to create segment'),
  })

  const updateSegmentM = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { name: string; description?: string; rules?: SegmentRule[] }
    }) =>
      updateSegment(id, {
        name: payload.name,
        description: payload.description,
        ...(payload.rules
          ? { rules: payload.rules as unknown as Record<string, unknown> }
          : {}),
      }),
    onSuccess: () => {
      toast('Segment updated')
      setSegmentDialog({ open: false, segment: null, name: '', description: '' })
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'segments'] })
    },
    onError: () => toast('Failed to update segment'),
  })

  const deleteSegmentM = useMutation({
    mutationFn: (id: string) => deleteSegment(id),
    onSuccess: () => {
      toast('Segment deleted')
      setConfirmDelete(null)
      queryClient.invalidateQueries({ queryKey: ['ai', 'marketing', 'segments'] })
    },
    onError: () => toast('Failed to delete segment'),
  })

  const openSegmentDialog = (segment: CustomerSegmentExtended | null) => {
    setSegmentDialog({
      open: true,
      segment,
      name: segment?.name ?? '',
      description: segment?.description ?? '',
    })
    setSegmentRules((segment?.rules as SegmentRule[]) ?? [])
  }

  const openTemplateEditor = (t: EmailTemplateExtended | null) => {
    setEditorTemplate(t)
    setTemplateName(t?.name ?? '')
    setDraftSubject(t?.subject ?? '')
    setDraftHtml(t?.htmlBody ?? '')
  }

  const invalidateAll = () =>
    queryClient.invalidateQueries({ queryKey: ['ai', 'marketing'] })

  const headerActions = useMemo(() => {
    const actions: React.ReactNode[] = [
      <Button
        key="new-campaign"
        className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
        onClick={() => setCampaignWizardOpen(true)}
      >
        <Plus className="h-3.5 w-3.5" /> New Campaign
      </Button>,
      <Button key="new-workflow" variant="outline" className="gap-1.5" onClick={() => toast('Workflow builder coming soon')}>
        <WorkflowIcon className="h-3.5 w-3.5" /> New Workflow
      </Button>,
      <Button key="import" variant="outline" className="gap-1.5" onClick={() => toast('Import template coming soon')}>
        <Upload className="h-3.5 w-3.5" /> Import Template
      </Button>,
      <Button key="export" variant="outline" className="gap-1.5" onClick={() => toast('Report exported')}>
        <Download className="h-3.5 w-3.5" /> Export Report
      </Button>,
      <Button key="refresh" variant="outline" size="icon" className="h-8 w-8" onClick={invalidateAll}>
        <RefreshCw className="h-3.5 w-3.5" />
      </Button>,
    ]
    return actions
  }, [queryClient, toast])

  return (
    <IntelligencePageShell
      title="Marketing Automation"
      subtitle="Automate customer engagement, lifecycle emails, personalized campaigns, and intelligent notifications"
      breadcrumbs={[
        { label: 'Admin', href: '/admin/dashboard' },
        { label: 'Intelligence', href: '/admin/intelligence' },
        { label: 'Marketing Automation' },
      ]}
      demoMode={demoMode}
      actions={
        <div className="flex flex-wrap items-center gap-2">{headerActions}</div>
      }
    >
      {/* Automation Health Banner */}
      <AutomationHealthBanner overview={overview} loading={workflowsQ.isLoading && campaignsQ.isLoading} className="mb-6" />

      {/* KPI Grid */}
      <KpiGrid items={kpiItems} columns={6} className="mb-8" />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="workflows" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <WorkflowIcon className="h-3.5 w-3.5" /> Workflows
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Mail className="h-3.5 w-3.5" /> Campaigns
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Templates
            </TabsTrigger>
            <TabsTrigger value="segments" className="gap-1.5 rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm">
              <Users className="h-3.5 w-3.5" /> Segments
            </TabsTrigger>
          </TabsList>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="h-9 w-56 pl-8 text-sm"
            />
          </div>
        </div>

        {/* WORKFLOWS TAB */}
        <TabsContent value="workflows" className="space-y-4">
          {workflowsQ.isLoading ? (
            <MarketingSkeleton />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredWorkflows.map((wf, i) => (
                  <WorkflowCard
                    key={wf._id}
                    workflow={wf}
                    index={i}
                    onToggle={(w: WorkflowType, next: boolean) => toggleM.mutate({ slug: w.slug, enabled: next })}
                    onOpen={setDrawerWorkflow}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
          {!workflowsQ.isLoading && filteredWorkflows.length === 0 && (
            <MarketingEmptyState
              variant="workflows"
              actionLabel={q ? 'Clear search' : 'Create your first workflow'}
              onAction={() => (q ? setSearchQuery('') : toast('Workflow builder coming soon'))}
            />
          )}
        </TabsContent>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-4">
          <CampaignTable
            campaigns={filteredCampaigns}
            stats={Object.fromEntries(
              campaigns.map((c: Campaign) => [c._id, c.metadata as unknown as import('@/types/admin-intelligence.types').CampaignStats]),
            )}
            loading={campaignsQ.isLoading}
            onView={(c: Campaign) => toast(`View ${c.name}`)}
            onSend={(c: Campaign) => sendM.mutate(c._id)}
            onSchedule={(c: Campaign) => setScheduleId(c._id)}
            onEdit={(c: Campaign) => toast(`Editing "${c.name}" is not available yet`)}
            onDelete={(c: Campaign) => setConfirmDelete({ kind: 'campaign', id: c._id, name: c.name })}
            onNewCampaign={() => setCampaignWizardOpen(true)}
          />

          {/* Schedule inline form */}
          <AnimatePresence>
            {scheduleId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="flex items-end gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-600">Schedule date &amp; time</label>
                  <Input
                    type="datetime-local"
                    value={scheduleAt}
                    onChange={(e) => setScheduleAt(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button
                  size="sm"
                  disabled={!scheduleAt || scheduleM.isPending}
                  onClick={() => scheduleM.mutate({ id: scheduleId, at: new Date(scheduleAt).toISOString() })}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {scheduleM.isPending ? <Clock className="h-3.5 w-3.5 animate-spin" /> : <Calendar className="h-3.5 w-3.5" />}
                  Confirm
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setScheduleId(null); setScheduleAt('') }}>
                  Cancel
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Campaign Analytics — real data from the backend */}
          {!campaignsQ.isLoading && campaigns.length > 0 && (
            <MarketingCharts
              data={(analyticsQ.data ?? {}) as CampaignAnalyticsData}
              loading={analyticsQ.isLoading}
            />
          )}
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-4">
          <EmailTemplateGrid
            templates={filteredTemplates}
            loading={templatesQ.isLoading}
            onUse={(t: EmailTemplateExtended) => openTemplateEditor(t)}
            onEdit={(t: EmailTemplateExtended) => openTemplateEditor(t)}
            onDuplicate={(t: EmailTemplateExtended) => duplicateTemplateM.mutate(t)}
            onDelete={(t: EmailTemplateExtended) => setConfirmDelete({ kind: 'template', id: t._id, name: t.name })}
            onPreview={(t: EmailTemplateExtended) => openTemplateEditor(t)}
            onCreate={() => openTemplateEditor(null)}
          />

          {/* Template Editor */}
          <AnimatePresence>
            {editorTemplate !== undefined && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editorTemplate ? `Edit: ${editorTemplate.name}` : 'New Template'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditorTemplate(null)
                      setTemplateName('')
                      setDraftSubject('')
                      setDraftHtml('')
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="mb-3">
                  <Label className="text-xs font-medium text-slate-600">Template name</Label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Welcome Email"
                    className="mt-1 h-9"
                  />
                </div>
                <EmailEditor
                  subject={draftSubject}
                  htmlBody={draftHtml}
                  templates={templates}
                  onChange={(next) => {
                    if (next.subject !== undefined) setDraftSubject(next.subject)
                    if (next.htmlBody !== undefined) setDraftHtml(next.htmlBody)
                  }}
                  onSelectTemplate={(t) => openTemplateEditor(t)}
                />
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditorTemplate(null)
                      setTemplateName('')
                      setDraftSubject('')
                      setDraftHtml('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    disabled={!templateName.trim() || saveTemplateM.isPending}
                    onClick={() =>
                      saveTemplateM.mutate({
                        template: editorTemplate,
                        name: templateName.trim(),
                        subject: draftSubject,
                        htmlBody: draftHtml,
                      })
                    }
                  >
                    {saveTemplateM.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-3.5 w-3.5" />
                    )}
                    Save Template
                  </Button>
                </div>
              </div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* SEGMENTS TAB */}
        <TabsContent value="segments" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Audience Segments</h3>
              <p className="text-xs text-slate-500">Build and manage customer segments for targeted campaigns</p>
            </div>
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-700" onClick={() => openSegmentDialog(null)}>
              <Plus className="h-3.5 w-3.5" /> New Segment
            </Button>
          </div>

          <SegmentGrid
            segments={filteredSegments}
            totalCustomers={segments.reduce((sum, s) => sum + (s.estimatedUsers ?? 0), 0)}
            loading={segmentsQ.isLoading}
            onEdit={(s: CustomerSegmentExtended) => openSegmentDialog(s)}
            onDuplicate={(s: CustomerSegmentExtended) =>
              createSegmentM.mutate({
                name: `${s.name} (copy)`,
                description: s.description,
              })
            }
            onDelete={(s: CustomerSegmentExtended) => setConfirmDelete({ kind: 'segment', id: s._id, name: s.name })}
          />

          {!segmentsQ.isLoading && segments.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="mb-3 text-sm font-semibold text-slate-900">Rule Builder</h4>
              <RuleBuilder
                rules={segmentRules}
                onChange={(rules: SegmentRule[]) => setSegmentRules(rules)}
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Rules are saved with the segment. Select a segment to edit its rules.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!segmentDialog.segment || updateSegmentM.isPending}
                  onClick={() => {
                    const active = segmentDialog.segment
                    if (active) {
                      updateSegmentM.mutate({
                        id: active._id,
                        payload: {
                          name: active.name,
                          description: active.description,
                          rules: segmentRules,
                        },
                      })
                    }
                  }}
                >
                  {updateSegmentM.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Save rules
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Workflow Drawer */}
      <WorkflowDrawer
        workflow={drawerWorkflow}
        open={!!drawerWorkflow}
        onOpenChange={(o: boolean) => !o && setDrawerWorkflow(null)}
        onToggle={(w: WorkflowType, next: boolean) => w && toggleM.mutate({ slug: w.slug, enabled: next })}
        onRun={() => drawerWorkflow && toast(`Running ${drawerWorkflow.name}`)}
        onEdit={() => drawerWorkflow && toast(`Editing ${drawerWorkflow.name}`)}
        onDuplicate={() => drawerWorkflow && toast(`Duplicating ${drawerWorkflow.name}`)}
      />

      {/* Campaign Wizard — creates real campaigns */}
      <CampaignWizard
        open={campaignWizardOpen}
        onOpenChange={setCampaignWizardOpen}
        templates={templates}
        segments={segments as CustomerSegment[]}
        creating={createCampaignM.isPending}
        onCreate={(data: CampaignWizardData) => createCampaignM.mutate(data)}
      />

      {/* Segment create/edit dialog */}
      <Dialog
        open={segmentDialog.open}
        onOpenChange={(open) => {
          if (!open) setSegmentDialog({ open: false, segment: null, name: '', description: '' })
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{segmentDialog.segment ? 'Edit Segment' : 'New Segment'}</DialogTitle>
            <DialogDescription>
              {segmentDialog.segment
                ? `Update "${segmentDialog.segment.name}" — changes apply to future campaign targeting.`
                : 'Create a named audience group for targeted campaigns.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Segment name</Label>
              <Input
                value={segmentDialog.name}
                onChange={(e) => setSegmentDialog({ ...segmentDialog, name: e.target.value })}
                placeholder="e.g. High Value Customers"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Description</Label>
              <Input
                value={segmentDialog.description}
                onChange={(e) => setSegmentDialog({ ...segmentDialog, description: e.target.value })}
                placeholder="Who belongs to this segment?"
                className="h-9"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSegmentDialog({ open: false, segment: null, name: '', description: '' })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!segmentDialog.name.trim() || createSegmentM.isPending || updateSegmentM.isPending}
              onClick={() => {
                const payload = {
                  name: segmentDialog.name.trim(),
                  description: segmentDialog.description.trim() || undefined,
                  ...(segmentDialog.segment ? {} : { rules: segmentRules }),
                }
                if (segmentDialog.segment) {
                  updateSegmentM.mutate({ id: segmentDialog.segment._id, payload })
                } else {
                  createSegmentM.mutate(payload)
                }
              }}
            >
              {(createSegmentM.isPending || updateSegmentM.isPending) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {segmentDialog.segment ? 'Save Changes' : 'Create Segment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete {confirmDelete?.kind}?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-slate-700">"{confirmDelete?.name}"</span> will be
              permanently removed. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-1.5"
              disabled={
                (confirmDelete?.kind === 'campaign' && deleteCampaignM.isPending) ||
                (confirmDelete?.kind === 'template' && deleteTemplateM.isPending) ||
                (confirmDelete?.kind === 'segment' && deleteSegmentM.isPending)
              }
              onClick={() => {
                if (!confirmDelete) return
                if (confirmDelete.kind === 'campaign') deleteCampaignM.mutate(confirmDelete.id)
                if (confirmDelete.kind === 'template') deleteTemplateM.mutate(confirmDelete.id)
                if (confirmDelete.kind === 'segment') deleteSegmentM.mutate(confirmDelete.id)
              }}
            >
              {(deleteCampaignM.isPending || deleteTemplateM.isPending || deleteSegmentM.isPending) && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </IntelligencePageShell>
  )
}
