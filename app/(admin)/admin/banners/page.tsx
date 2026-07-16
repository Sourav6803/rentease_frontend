'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Search,
  X,
  TrendingUp,
  MousePointerClick,
  CalendarClock,
  Link as LinkIcon,
  LayoutPanelTop,
  Layers,
  Sparkles,
  Percent,
  Tag,
  Zap,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react'
import { bannerApi, type BannerCreateData } from '@/lib/api/admin-intelligence'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ---------------------------------------------------------------------------
// Shared style tokens — one place to keep the "no black" brand palette.
// Primary actions use an indigo→blue gradient instead of the default near-black
// shadcn primary, so nothing in this screen renders as a black button.
// ---------------------------------------------------------------------------

const PRIMARY_BTN =
  'gap-2 border-0 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-500/25 ' +
  'transition-all hover:from-indigo-500 hover:to-blue-500 hover:shadow-md hover:shadow-indigo-500/30 ' +
  'focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BannerType = 'hero' | 'promo' | 'strip' | 'deal'

interface Banner {
  _id: string
  title: string
  subtitle?: string
  description?: string
  type: BannerType
  image: {
    url: string
    mobileUrl?: string
    alt: string
  }
  cta: {
    label: string
    link: string
  }
  theme: {
    gradient: string
    textColor: string
    bgColor: string
    accent: string
  }
  badge?: string
  targetCategory?: { _id: string; name: string; slug: string }
  discountCode?: string
  displayOrder: number
  isActive: boolean
  schedule: {
    startDate?: string | null
    endDate?: string | null
  }
  stats: {
    impressions: number
    clicks: number
  }
  createdAt: string
  updatedAt: string
  aiPrompt?: string
  aiGenerated?: boolean
  aiGenerationError?: string | null
}

interface BannerListResponse {
  banners: Banner[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Extended banner payload for create/update with AI settings
interface BannerPayload extends Partial<Banner> {
  useAIImage?: boolean
  regenerateAIImage?: boolean
  aiPrompt?: string
}

// Dedicated, fully-required form state so every field is always a defined
// string/boolean/number. This is what caused the original type error: an
// object typed as `Partial<Banner>` lets `image.alt` collapse to
// `string | undefined`, which doesn't satisfy the API's `{ alt: string }`.
interface BannerFormState {
  title: string
  subtitle: string
  description: string
  type: BannerType
  image: { url: string; mobileUrl: string; alt: string }
  cta: { label: string; link: string }
  theme: { gradient: string; textColor: string; bgColor: string; accent: string }
  badge: string
  discountCode: string
  displayOrder: number
  isActive: boolean
  schedule: { startDate: string; endDate: string }
  // AI image generation state
  useAIImage: boolean
  aiImageLoading: boolean
  aiImageError: string | null
  aiImagePrompt: string
  aiImageGenerated: boolean
}

const TYPE_LABELS: Record<BannerType, string> = {
  hero: 'Hero',
  promo: 'Promo',
  strip: 'Strip',
  deal: 'Deal',
}

const TYPE_STYLES: Record<BannerType, string> = {
  hero: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  promo: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  strip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  deal: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
}

const EMPTY_FORM: BannerFormState = {
  title: '',
  subtitle: '',
  description: '',
  type: 'hero',
  image: { url: '', mobileUrl: '', alt: '' },
  cta: { label: 'Shop Now', link: '/products' },
  theme: {
    gradient: 'from-blue-600 to-indigo-600',
    textColor: '#ffffff',
    bgColor: '#2874F0',
    accent: '#FFD400',
  },
  badge: '',
  discountCode: '',
  displayOrder: 0,
  isActive: true,
  schedule: { startDate: '', endDate: '' },
  // AI image generation state — prompt is fetched from the backend on open.
  useAIImage: true,
  aiImageLoading: false,
  aiImageError: null,
  aiImagePrompt: '',
  aiImageGenerated: false,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toDateTimeLocal(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16)
}

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return '0'
  return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

function computeCtr(clicks: number, impressions: number) {
  if (!impressions) return 0
  return (clicks / impressions) * 100
}

function bannerToFormState(banner: Banner): BannerFormState {
  // The prompt is fetched fresh from the backend by the effect once the modal
  // opens (seeded here with any prompt persisted on the banner).
  const aiPrompt = (banner as any).aiPrompt ?? ''

  return {
    title: banner.title ?? '',
    subtitle: banner.subtitle ?? '',
    description: banner.description ?? '',
    type: banner.type,
    image: {
      url: banner.image?.url ?? '',
      mobileUrl: banner.image?.mobileUrl ?? '',
      alt: banner.image?.alt ?? '',
    },
    cta: {
      label: banner.cta?.label || 'Shop Now',
      link: banner.cta?.link || '/products',
    },
    theme: {
      gradient: banner.theme?.gradient || EMPTY_FORM.theme.gradient,
      textColor: banner.theme?.textColor || EMPTY_FORM.theme.textColor,
      bgColor: banner.theme?.bgColor || EMPTY_FORM.theme.bgColor,
      accent: banner.theme?.accent || EMPTY_FORM.theme.accent,
    },
    badge: banner.badge ?? '',
    discountCode: banner.discountCode ?? '',
    displayOrder: banner.displayOrder ?? 0,
    isActive: banner.isActive ?? true,
    schedule: {
      startDate: toDateTimeLocal(banner.schedule?.startDate),
      endDate: toDateTimeLocal(banner.schedule?.endDate),
    },
    // AI image generation state
    useAIImage: !!(banner as any).aiGenerated,
    aiImageLoading: false,
    aiImageError: (banner as any).aiGenerationError || null,
    aiImagePrompt: aiPrompt,
    aiImageGenerated: !!(banner as any).aiGenerated,
  }
}

function formStateToPayload(form: BannerFormState): BannerPayload {
  return {
    title: form.title.trim(),
    subtitle: form.subtitle.trim() || undefined,
    description: form.description.trim() || undefined,
    type: form.type,
    image: {
      url: form.image.url.trim(),
      alt: form.image.alt.trim(),
      ...(form.image.mobileUrl.trim() ? { mobileUrl: form.image.mobileUrl.trim() } : {}),
    },
    cta: {
      label: form.cta.label.trim() || 'Shop Now',
      link: form.cta.link.trim() || '/products',
    },
    theme: form.theme,
    badge: form.badge.trim() || undefined,
    discountCode: form.discountCode.trim() || undefined,
    displayOrder: form.displayOrder,
    isActive: form.isActive,
    schedule: {
      startDate: form.schedule.startDate ? new Date(form.schedule.startDate).toISOString() : null,
      endDate: form.schedule.endDate ? new Date(form.schedule.endDate).toISOString() : null,
    },
    // AI image generation settings
    useAIImage: form.useAIImage,
    regenerateAIImage: form.aiImageGenerated && form.useAIImage,
    aiPrompt: form.aiImagePrompt,
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function BannersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState<BannerFormState>(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch the editable AI prompt from the backend whenever the banner type,
  // title, description, or accent changes (debounced). The backend owns the
  // prompt templates; the admin can still edit the textarea afterwards, and
  // that edited text is what actually gets sent on generate.
  useEffect(() => {
    if (!formData.useAIImage) return
    const controller = new AbortController()
    const timeout = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/api/v1/banners/ai-prompt`, {
          params: {
            type: formData.type,
            title: formData.title,
            description: formData.description,
            accent: formData.theme.accent,
          },
          signal: controller.signal,
        })
        const prompt = data?.data?.prompt
        if (prompt) setFormData(f => ({ ...f, aiImagePrompt: prompt }))
      } catch {
        // Ignore aborts / transient errors — keep whatever is in the textarea.
      }
    }, 400)
    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [formData.type, formData.title, formData.description, formData.theme.accent, formData.useAIImage])

  // Debounce free-text search so we don't refetch on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(timeout)
  }, [searchInput])

  // Fixed: Properly handle the API response - bannerApi.list returns the data directly
  const { data: response, isLoading, isFetching, error } = useQuery<BannerListResponse>({
    queryKey: ['admin', 'banners', page],
    queryFn: async () => {
      const result = await bannerApi.list({
        page,
        limit: 20,
      })
      // The API returns { data: { banners, pagination } }
      // But bannerApi.list might already unwrap the data
      // Check the structure and handle accordingly
      if (result && typeof result === 'object' && 'data' in result) {
        // If result has a data property, it's wrapped
        const wrapped = result as { data: BannerListResponse }
        return wrapped.data
      }
      // Otherwise, assume result is already BannerListResponse
      return result as BannerListResponse
    },
  })

  const banners = response?.banners ?? []
  const pagination = response?.pagination ?? { page: 1, limit: 20, total: 0, pages: 1 }

  // Filter banners based on search term, type, and status (client-side)
  const filteredBanners = useMemo(() => {
    let result = banners

    if (search.trim() !== '') {
      const searchTerm = search.toLowerCase().trim()
      result = result.filter(
        banner =>
          banner.title.toLowerCase().includes(searchTerm) ||
          (banner.subtitle && banner.subtitle.toLowerCase().includes(searchTerm)) ||
          (banner.description && banner.description.toLowerCase().includes(searchTerm))
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter(banner => banner.type === typeFilter)
    }

    if (statusFilter === 'active') {
      result = result.filter(banner => banner.isActive === true)
    } else if (statusFilter === 'inactive') {
      result = result.filter(banner => banner.isActive === false)
    }

    return result
  }, [banners, search, typeFilter, statusFilter])

  // Premium overview metrics derived from the loaded page of banners.
  const overview = useMemo(() => {
    const active = banners.filter(b => b.isActive).length
    const impressions = banners.reduce((sum, b) => sum + (b.stats?.impressions ?? 0), 0)
    const clicks = banners.reduce((sum, b) => sum + (b.stats?.clicks ?? 0), 0)
    return {
      active,
      impressions,
      clicks,
      ctr: computeCtr(clicks, impressions),
    }
  }, [banners])

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] })

  const createMutation = useMutation({
    mutationFn: (data: BannerPayload) => bannerApi.create(data as BannerCreateData),
    onSuccess: () => {
      toast.success('Banner created')
      closeModal()
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not create banner'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BannerPayload }) => 
      bannerApi.update(id, data as Partial<Banner>),
    onSuccess: () => {
      toast.success('Banner updated')
      closeModal()
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update banner'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerApi.delete(id),
    onSuccess: () => {
      toast.success('Banner deleted')
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not delete banner'),
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => bannerApi.toggleStatus(id),
    onSuccess: () => {
      toast.success('Banner status updated')
      invalidate()
    },
    onError: (err: Error) => toast.error(err.message || 'Could not update status'),
  })

  const openCreateModal = () => {
    setEditingBanner(null)
    setFormData(EMPTY_FORM)
    setIsModalOpen(true)
  }

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData(bannerToFormState(banner))
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSubmitting) return
    setIsModalOpen(false)
    setEditingBanner(null)
    setFormData(EMPTY_FORM)
  }

  const generateAIImage = async () => {
    if (!formData.title || !formData.type) {
      toast.error('Title and type are required for AI image generation')
      return false
    }

    setFormData(f => ({
      ...f,
      aiImageLoading: true,
      aiImageError: null,
      aiImageGenerated: false,
    }))

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/v1/banners/ai-generate`,
        {
          title: formData.title,
          description: formData.description,
          type: formData.type,
          theme: formData.theme,
          // The (possibly admin-edited) prompt from the textarea drives generation.
          prompt: formData.aiImagePrompt,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // Remove if you're not using cookies/auth
        }
      )

      if (data?.data?.url) {
        setFormData(f => ({
          ...f,
          image: {
            ...f.image,
            url: data.data.url,
            mobileUrl: data.data.mobileUrl || data.data.url,
            alt: formData.title,
          },
          aiImageLoading: false,
          aiImageError: null,
          aiImageGenerated: true,
        }))

        toast.success('AI image generated successfully')
        return true
      }

      throw new Error(data?.message || 'No image URL in response')
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to generate AI image'

      setFormData(f => ({
        ...f,
        aiImageLoading: false,
        aiImageError: message,
      }))

      toast.error(`Failed to generate AI image: ${message}`)
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.image.alt.trim()) {
      toast.error('Alt text is required')
      return
    }

    setIsSubmitting(true)
    try {
      // Generate AI image if requested and no URL exists
      if (formData.useAIImage && !formData.image.url) {
        const success = await generateAIImage()
        if (!success && formData.useAIImage) {
          toast.error('AI image generation failed. Please provide an image URL or try again.')
          setIsSubmitting(false)
          return
        }
      }

      const payload = formStateToPayload(formData)

      if (editingBanner) {
        await updateMutation.mutateAsync({ id: editingBanner._id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Bug fix: `search` used to start as `undefined`, so `search !== ''` was
  // always true and the "Clear filters" chip showed on first paint. Now
  // `search` is always a string, and this reads cleanly.
  const hasFilters = search.trim() !== '' || typeFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearchInput('')
    setSearch('')
    setTypeFilter('all')
    setStatusFilter('all')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:border-gray-800 dark:bg-gray-900">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/25">
              <LayoutPanelTop className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Banners</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage homepage banners and promotional strips
                {pagination.total > 0 && (
                  <span className="ml-1">
                    · <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.total}</span> total
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button onClick={openCreateModal} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" />
            Create Banner
          </Button>
        </div>
      </div>

      {/* Overview stats — premium at-a-glance metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Layers className="h-5 w-5" />}
          label="Total banners"
          value={pagination.total.toLocaleString()}
          accent="indigo"
        />
        <StatCard
          icon={<Sparkles className="h-5 w-5" />}
          label="Active"
          value={overview.active.toLocaleString()}
          hint="on this page"
          accent="emerald"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Impressions"
          value={formatCompact(overview.impressions)}
          hint="on this page"
          accent="blue"
        />
        <StatCard
          icon={<Percent className="h-5 w-5" />}
          label="Avg. CTR"
          value={`${overview.ctr.toFixed(2)}%`}
          hint={`${formatCompact(overview.clicks)} clicks`}
          accent="violet"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center dark:border-gray-800 dark:bg-gray-900">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by title or subtitle…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={typeFilter} onValueChange={v => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {(Object.keys(TYPE_LABELS) as BannerType[]).map(t => (
              <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="All status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-gray-500 sm:ml-auto">
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <BannerGridSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
          Failed to load banners: {(error as Error).message}
        </div>
      ) : filteredBanners.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} onCreate={openCreateModal} />
      ) : (
        <div
          className={cn(
            'grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 transition-opacity',
            isFetching && 'opacity-60'
          )}
        >
          {filteredBanners.map(banner => (
            <BannerCard
              key={banner._id}
              banner={banner}
              onEdit={() => openEditModal(banner)}
              onDelete={() => {
                if (confirm(`Delete "${banner.title}"? This can't be undone.`)) {
                  deleteMutation.mutate(banner._id)
                }
              }}
              onToggle={() => toggleMutation.mutate(banner._id)}
              isToggling={toggleMutation.isPending && toggleMutation.variables === banner._id}
              isDeleting={deleteMutation.isPending && deleteMutation.variables === banner._id}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex flex-col gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page <span className="font-medium text-gray-700 dark:text-gray-300">{pagination.page}</span> of{' '}
            {pagination.pages} · {pagination.total} banners
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      <BannerFormDialog
        open={isModalOpen}
        isEditing={!!editingBanner}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onGenerateAI={generateAIImage}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

const STAT_ACCENTS: Record<string, string> = {
  indigo: 'from-indigo-500 to-blue-500 text-indigo-600 dark:text-indigo-300',
  emerald: 'from-emerald-500 to-teal-500 text-emerald-600 dark:text-emerald-300',
  blue: 'from-blue-500 to-sky-500 text-blue-600 dark:text-blue-300',
  violet: 'from-violet-500 to-fuchsia-500 text-violet-600 dark:text-violet-300',
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  hint?: string
  accent: keyof typeof STAT_ACCENTS
}) {
  const accentClasses = STAT_ACCENTS[accent] ?? STAT_ACCENTS.indigo
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div
        className={cn(
          'pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-10 blur-xl transition-opacity group-hover:opacity-20',
          accentClasses
        )}
      />
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm',
            accentClasses
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
      {hint && <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">{hint}</p>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Banner card
// ---------------------------------------------------------------------------

function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggle,
  isToggling,
  isDeleting,
}: {
  banner: Banner
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  isToggling: boolean
  isDeleting: boolean
}) {
  const scheduleLabel = banner.schedule?.startDate
    ? `${new Date(banner.schedule.startDate).toLocaleDateString()}${
        banner.schedule.endDate ? ` – ${new Date(banner.schedule.endDate).toLocaleDateString()}` : ' →'
      }`
    : 'Always on'

  const impressions = banner.stats?.impressions ?? 0
  const clicks = banner.stats?.clicks ?? 0
  const ctr = computeCtr(clicks, impressions)

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-indigo-200 dark:border-gray-800 dark:bg-gray-900 dark:hover:ring-indigo-500/30',
        isDeleting && 'pointer-events-none opacity-50'
      )}
    >
      {/* Preview */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {banner.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.image.url}
            alt={banner.image.alt || banner.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-700">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn('border-0 font-medium', TYPE_STYLES[banner.type])}>{TYPE_LABELS[banner.type]}</Badge>
            {banner.badge && (
              <Badge variant="secondary" className="border-0 bg-white/90 font-medium text-gray-800 shadow-sm backdrop-blur">
                {banner.badge}
              </Badge>
            )}
          </div>
          <button
            type="button"
            onClick={onToggle}
            disabled={isToggling}
            title={banner.isActive ? 'Active — click to disable' : 'Inactive — click to enable'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full shadow-sm backdrop-blur transition-all',
              isToggling && 'opacity-60',
              banner.isActive
                ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                : 'bg-white/90 text-gray-400 hover:text-gray-600'
            )}
          >
            {banner.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        {banner.discountCode && (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge className="gap-1 border-0 bg-white/90 font-medium text-indigo-700 shadow-sm backdrop-blur">
              <Tag className="h-3 w-3" />
              {banner.discountCode}
            </Badge>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold text-gray-900 dark:text-white">{banner.title}</h3>
          {banner.subtitle && (
            <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
          <LinkIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            <span className="font-medium text-gray-700 dark:text-gray-300">{banner.cta?.label}</span>
            {' → '}
            {banner.cta?.link}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800/50">
          <Metric icon={<TrendingUp className="h-3.5 w-3.5" />} label="Views" value={formatCompact(impressions)} />
          <Metric icon={<MousePointerClick className="h-3.5 w-3.5" />} label="Clicks" value={formatCompact(clicks)} />
          <Metric icon={<Percent className="h-3.5 w-3.5" />} label="CTR" value={`${ctr.toFixed(1)}%`} />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <CalendarClock className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{scheduleLabel}</span>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
          <span className="text-xs text-gray-400">Order: {banner.displayOrder}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 dark:text-gray-400 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
              onClick={onEdit}
              title="Edit banner"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              onClick={onDelete}
              disabled={isDeleting}
              title="Delete banner"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 text-center">
      <span className="flex items-center gap-1 text-gray-400">{icon}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Empty state & skeleton
// ---------------------------------------------------------------------------

function EmptyState({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean
  onClear: () => void
  onCreate: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/60 px-6 py-16 text-center dark:border-gray-800 dark:bg-gray-900/40">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 text-indigo-500 dark:text-indigo-300">
        <ImageIcon className="h-7 w-7" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white">
        {hasFilters ? 'No banners match your filters' : 'No banners yet'}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
        {hasFilters
          ? 'Try adjusting or clearing your search and filters.'
          : 'Create your first banner to start promoting deals on the homepage.'}
      </p>
      <div className="mt-5">
        {hasFilters ? (
          <Button variant="outline" onClick={onClear}>Clear filters</Button>
        ) : (
          <Button onClick={onCreate} className={PRIMARY_BTN}>
            <Plus className="h-4 w-4" />
            Create Banner
          </Button>
        )}
      </div>
    </div>
  )
}

function BannerGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Create / Edit dialog
// ---------------------------------------------------------------------------

function BannerFormDialog({
  open,
  isEditing,
  formData,
  setFormData,
  isSubmitting,
  onClose,
  onSubmit,
  onGenerateAI,
}: {
  open: boolean
  isEditing: boolean
  formData: BannerFormState
  setFormData: React.Dispatch<React.SetStateAction<BannerFormState>>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  onGenerateAI: () => Promise<boolean>
}) {
  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
        <form onSubmit={onSubmit} className="flex max-h-[90vh] flex-col">
          <DialogHeader className="border-b border-gray-100 bg-gradient-to-r from-indigo-50/60 to-blue-50/60 px-6 py-4 dark:border-gray-800 dark:from-indigo-950/20 dark:to-blue-950/20">
            <DialogTitle>{isEditing ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update the details for this banner.' : 'Fill in the details to add a new banner.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Content */}
            <FormSection title="Content">
              <Field label="Title" required className="sm:col-span-2">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Summer Sale Hero"
                  required
                />
              </Field>
              <Field label="Subtitle" className="sm:col-span-2">
                <Input
                  value={formData.subtitle}
                  onChange={(e) => setFormData((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Up to 50% off selected items"
                />
              </Field>
              <Field label="Description" className="sm:col-span-2">
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description of the banner content"
                />
              </Field>
              <Field label="Type" required>
                <Select value={formData.type} onValueChange={(v) => setFormData((f) => ({ ...f, type: v as BannerType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TYPE_LABELS) as BannerType[]).map(t => (
                      <SelectItem key={t} value={t}>{TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Display order">
                <Input
                  type="number"
                  min={0}
                  value={formData.displayOrder}
                  onChange={(e) => setFormData((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))}
                />
              </Field>
            </FormSection>

            {/* Media - AI-powered image generation */}
            <FormSection title="Media">
              <div className="sm:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <Label>AI Image Generation</Label>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.useAIImage}
                      onChange={(e) => setFormData((f) => ({ ...f, useAIImage: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">Generate with AI</span>
                  </label>
                </div>
                
                {formData.useAIImage && (
                  <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 p-5 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-blue-950/30">
                    <div className="space-y-4">
                      {/* Prompt Template Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={cn('border-0 font-medium', TYPE_STYLES[formData.type])}>
                            {TYPE_LABELS[formData.type]} Template
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Auto-generated based on banner type
                          </span>
                        </div>
                      </div>

                      {/* AI Prompt Editor */}
                      <div>
                        <Label htmlFor="aiPrompt" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          AI Image Prompt
                        </Label>
                        <Textarea
                          id="aiPrompt"
                          value={formData.aiImagePrompt}
                          onChange={(e) => setFormData((f) => ({ ...f, aiImagePrompt: e.target.value }))}
                          placeholder="Enter AI prompt for banner generation..."
                          rows={6}
                          className="mt-1.5 font-mono text-xs leading-relaxed"
                        />
                        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                          This prompt will be sent to the AI image generator. You can customize it as needed.
                        </p>
                      </div>
                      
                      {/* Generate Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={onGenerateAI}
                        disabled={formData.aiImageLoading || !formData.title.trim()}
                      >
                        {formData.aiImageLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            {formData.image.url ? 'Regenerate Image' : 'Generate AI Image'}
                          </>
                        )}
                      </Button>
                      
                      {/* Image Preview */}
                      {formData.image.url && (
                        <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                          <img
                            src={formData.image.url}
                            alt={formData.image.alt || 'Banner preview'}
                            className="h-full w-full object-cover"
                          />
                          {formData.aiImageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                              <div className="text-center text-white">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3" />
                                <p className="text-sm font-medium">Generating AI image...</p>
                                <p className="text-xs text-gray-300 mt-1">This may take a few seconds</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Error Message */}
                      {formData.aiImageError && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
                          <p className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span>{formData.aiImageError}</span>
                          </p>
                        </div>
                      )}
                      
                      {/* Success Message */}
                      {formData.aiImageGenerated && !formData.aiImageLoading && (
                        <div className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>AI image generated successfully</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {!formData.useAIImage && (
                  <>
                    <Field label="Image URL" required className="sm:col-span-2">
                      <Input
                        value={formData.image.url}
                        onChange={(e) => setFormData((f) => ({ ...f, image: { ...f.image, url: e.target.value } }))}
                        placeholder="https://example.com/banner.jpg"
                        required
                      />
                    </Field>
                    <Field label="Mobile image URL" hint="Optional — falls back to the image above">
                      <Input
                        value={formData.image.mobileUrl}
                        onChange={(e) => setFormData((f) => ({ ...f, image: { ...f.image, mobileUrl: e.target.value } }))}
                        placeholder="https://example.com/banner-mobile.jpg"
                      />
                    </Field>
                  </>
                )}
                
                <Field label="Alt text" required hint="Used for accessibility">
                  <Input
                    value={formData.image.alt}
                    onChange={(e) => setFormData((f) => ({ ...f, image: { ...f.image, alt: e.target.value } }))}
                    placeholder="Summer sale promotion with modern furniture"
                    required
                  />
                </Field>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Badge" hint="Small label shown on the banner (e.g., 'HOT DEAL', 'UP TO 50% OFF')">
                  <Input
                    value={formData.badge}
                    onChange={(e) => setFormData((f) => ({ ...f, badge: e.target.value }))}
                    placeholder="HOT DEAL"
                  />
                </Field>
                <Field label="Discount code" hint="Optional">
                  <Input
                    value={formData.discountCode}
                    onChange={(e) => setFormData((f) => ({ ...f, discountCode: e.target.value }))}
                    placeholder="SUMMER50"
                  />
                </Field>
              </div>
            </FormSection>

            {/* CTA */}
            <FormSection title="Call to action">
              <Field label="CTA label">
                <Input
                  value={formData.cta.label}
                  onChange={(e) => setFormData((f) => ({ ...f, cta: { ...f.cta, label: e.target.value } }))}
                  placeholder="Shop Now"
                />
              </Field>
              <Field label="CTA link">
                <Input
                  value={formData.cta.link}
                  onChange={(e) => setFormData((f) => ({ ...f, cta: { ...f.cta, link: e.target.value } }))}
                  placeholder="/products?category=sale"
                />
              </Field>
            </FormSection>

            {/* Appearance */}
            <FormSection title="Appearance">
              <Field label="Theme gradient" className="sm:col-span-2" hint="Tailwind gradient classes">
                <Input
                  value={formData.theme.gradient}
                  onChange={(e) => setFormData((f) => ({ ...f, theme: { ...f.theme, gradient: e.target.value } }))}
                  placeholder="from-blue-600 to-indigo-600"
                />
              </Field>
              <Field label="Accent color">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.theme.accent}
                    onChange={(e) => setFormData((f) => ({ ...f, theme: { ...f.theme, accent: e.target.value } }))}
                    className="h-9 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.theme.accent}
                    onChange={(e) => setFormData((f) => ({ ...f, theme: { ...f.theme, accent: e.target.value } }))}
                  />
                </div>
              </Field>
              <Field label="Background color">
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={formData.theme.bgColor}
                    onChange={(e) => setFormData((f) => ({ ...f, theme: { ...f.theme, bgColor: e.target.value } }))}
                    className="h-9 w-14 cursor-pointer p-1"
                  />
                  <Input
                    value={formData.theme.bgColor}
                    onChange={(e) => setFormData((f) => ({ ...f, theme: { ...f.theme, bgColor: e.target.value } }))}
                  />
                </div>
              </Field>
            </FormSection>

            {/* Scheduling & status */}
            <FormSection title="Scheduling & status">
              <Field label="Start date" hint="Leave blank to start immediately">
                <Input
                  type="datetime-local"
                  value={formData.schedule.startDate}
                  onChange={(e) => setFormData((f) => ({ ...f, schedule: { ...f.schedule, startDate: e.target.value } }))}
                />
              </Field>
              <Field label="End date" hint="Leave blank to run indefinitely">
                <Input
                  type="datetime-local"
                  value={formData.schedule.endDate}
                  onChange={(e) => setFormData((f) => ({ ...f, schedule: { ...f.schedule, endDate: e.target.value } }))}
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 sm:col-span-2 dark:border-gray-800">
                <div>
                  <Label htmlFor="isActive" className="cursor-pointer text-sm font-medium">Active</Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Inactive banners are hidden from the storefront</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((f) => ({ ...f, isActive: checked }))}
                />
              </div>
            </FormSection>
          </div>

          <DialogFooter className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className={PRIMARY_BTN}>
              {isSubmitting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Create banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{title}</h4>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({
  label,
  required,
  hint,
  className,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className}>
      <label className="mb-1 flex items-baseline gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  )
}