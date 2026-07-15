'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save, Ticket, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { discountApi } from '@/lib/api/admin-intelligence'
import type {
  ApplicableType,
  Discount,
  DiscountPayload,
  DiscountType,
  UserEligibilityType,
} from '@/types/admin-intelligence.types'

const TYPE_OPTIONS: { value: DiscountType; label: string }[] = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed Amount (₹)' },
  { value: 'cashback', label: 'Cashback' },
  { value: 'free_delivery', label: 'Free Delivery' },
  { value: 'no_deposit', label: 'No Deposit' },
  { value: 'referral', label: 'Referral' },
  { value: 'festival', label: 'Festival' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'first_rental', label: 'First Rental' },
  { value: 'return_customer', label: 'Return Customer' },
]

const APPLICABLE_OPTIONS: { value: ApplicableType; label: string }[] = [
  { value: 'all', label: 'All products' },
  { value: 'category', label: 'Specific categories' },
  { value: 'product', label: 'Specific products' },
  { value: 'vendor', label: 'Specific vendors' },
  { value: 'rental_tenure', label: 'Rental tenure' },
  { value: 'first_rental', label: 'First rental only' },
]

const ELIGIBILITY_OPTIONS: { value: UserEligibilityType; label: string }[] = [
  { value: 'all', label: 'All users' },
  { value: 'new', label: 'New users' },
  { value: 'existing', label: 'Existing users' },
  { value: 'specific', label: 'Specific users' },
]

const VALUE_TYPES: DiscountType[] = ['percentage', 'fixed', 'cashback']

interface FormState {
  name: string
  code: string
  description: string
  type: DiscountType
  value: string
  maxDiscountAmount: string
  minOrderValue: string
  applicableType: ApplicableType
  applicableIds: string // comma separated
  tenureMonths: string // comma separated
  userType: UserEligibilityType
  userIds: string
  minRentalsCompleted: string
  minAmountSpent: string
  perUser: string
  global: string
  startDate: string
  endDate: string
  timezone: string
  stackable: boolean
  priority: string
  showOnCheckout: boolean
  showOnProduct: boolean
  autoApply: boolean
}

const CODE_RE = /^[A-Z0-9]{4,12}$/

function toLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  // format as yyyy-MM-ddThh:mm for datetime-local
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function emptyState(): FormState {
  return {
    name: '',
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    maxDiscountAmount: '',
    minOrderValue: '',
    applicableType: 'all',
    applicableIds: '',
    tenureMonths: '',
    userType: 'all',
    userIds: '',
    minRentalsCompleted: '',
    minAmountSpent: '',
    perUser: '1',
    global: '',
    startDate: '',
    endDate: '',
    timezone: 'Asia/Kolkata',
    stackable: false,
    priority: '0',
    showOnCheckout: true,
    showOnProduct: false,
    autoApply: false,
  }
}

function fromDiscount(d: Discount): FormState {
  const a = d.applicableOn
  const idList =
    a?.type === 'category'
      ? a.categoryIds
      : a?.type === 'product'
        ? a.productIds
        : a?.type === 'vendor'
          ? a.vendorIds
          : []
  return {
    name: d.name ?? '',
    code: d.code ?? '',
    description: d.description ?? '',
    type: d.type ?? 'percentage',
    value: d.value != null ? String(d.value) : '',
    maxDiscountAmount: d.maxDiscountAmount != null ? String(d.maxDiscountAmount) : '',
    minOrderValue: d.minOrderValue != null ? String(d.minOrderValue) : '',
    applicableType: a?.type ?? 'all',
    applicableIds: (idList ?? []).join(', '),
    tenureMonths: (a?.tenureMonths ?? []).join(', '),
    userType: d.userEligibility?.userType ?? 'all',
    userIds: (d.userEligibility?.userIds ?? []).join(', '),
    minRentalsCompleted:
      d.userEligibility?.minRentalsCompleted != null
        ? String(d.userEligibility.minRentalsCompleted)
        : '',
    minAmountSpent:
      d.userEligibility?.minAmountSpent != null ? String(d.userEligibility.minAmountSpent) : '',
    perUser: d.usageLimits?.perUser != null ? String(d.usageLimits.perUser) : '1',
    global: d.usageLimits?.global != null ? String(d.usageLimits.global) : '',
    startDate: toLocalInput(d.validity?.startDate),
    endDate: toLocalInput(d.validity?.endDate),
    timezone: d.validity?.timezone ?? 'Asia/Kolkata',
    stackable: !!d.stackable,
    priority: d.priority != null ? String(d.priority) : '0',
    showOnCheckout: d.displayConditions?.showOnCheckout ?? true,
    showOnProduct: d.displayConditions?.showOnProduct ?? false,
    autoApply: d.displayConditions?.autoApply ?? false,
  }
}

function splitList(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function validate(s: FormState): Record<string, string> {
  const e: Record<string, string> = {}
  if (s.name.trim().length < 3 || s.name.trim().length > 100)
    e.name = 'Name must be 3–100 characters'
  if (s.code && !CODE_RE.test(s.code)) e.code = 'Code must be 4–12 uppercase letters/numbers'
  if (s.description.length > 500) e.description = 'Description must be ≤ 500 characters'
  if (VALUE_TYPES.includes(s.type)) {
    const v = Number(s.value)
    if (s.value === '' || Number.isNaN(v) || v < 0) e.value = 'Value is required and must be ≥ 0'
    else if (s.type === 'percentage' && v > 100) e.value = 'Percentage cannot exceed 100'
  }
  if (!s.startDate) e.startDate = 'Start date is required'
  if (!s.endDate) e.endDate = 'End date is required'
  if (s.startDate && s.endDate && new Date(s.endDate) <= new Date(s.startDate))
    e.endDate = 'End date must be after start date'
  if (s.applicableType !== 'all' && s.applicableType !== 'first_rental') {
    if (s.applicableType === 'rental_tenure') {
      if (!splitList(s.tenureMonths).length) e.tenureMonths = 'Add at least one tenure'
    } else if (!splitList(s.applicableIds).length) {
      e.applicableIds = 'Add at least one ID'
    }
  }
  if (s.userType === 'specific' && !splitList(s.userIds).length)
    e.userIds = 'Add at least one user ID'
  return e
}

function buildPayload(s: FormState): DiscountPayload {
  const applicableOn: DiscountPayload['applicableOn'] = { type: s.applicableType }
  if (s.applicableType === 'category') applicableOn.categoryIds = splitList(s.applicableIds)
  if (s.applicableType === 'product') applicableOn.productIds = splitList(s.applicableIds)
  if (s.applicableType === 'vendor') applicableOn.vendorIds = splitList(s.applicableIds)
  if (s.applicableType === 'rental_tenure')
    applicableOn.tenureMonths = splitList(s.tenureMonths).map(Number).filter((n) => !Number.isNaN(n))

  const userEligibility: DiscountPayload['userEligibility'] = { userType: s.userType }
  if (s.userType === 'specific') userEligibility.userIds = splitList(s.userIds)
  if (s.minRentalsCompleted) userEligibility.minRentalsCompleted = Number(s.minRentalsCompleted)
  if (s.minAmountSpent) userEligibility.minAmountSpent = Number(s.minAmountSpent)

  const payload: DiscountPayload = {
    name: s.name.trim(),
    type: s.type,
    description: s.description.trim() || undefined,
    minOrderValue: s.minOrderValue ? Number(s.minOrderValue) : 0,
    applicableOn,
    userEligibility,
    usageLimits: {
      perUser: s.perUser ? Number(s.perUser) : 1,
      global: s.global ? Number(s.global) : null,
    },
    validity: {
      startDate: new Date(s.startDate).toISOString(),
      endDate: new Date(s.endDate).toISOString(),
      timezone: s.timezone || 'Asia/Kolkata',
    },
    stackable: s.stackable,
    priority: s.priority ? Number(s.priority) : 0,
    displayConditions: {
      showOnCheckout: s.showOnCheckout,
      showOnProduct: s.showOnProduct,
      autoApply: s.autoApply,
    },
  }
  if (s.code) payload.code = s.code
  if (VALUE_TYPES.includes(s.type)) payload.value = Number(s.value)
  if (s.type === 'percentage' && s.maxDiscountAmount)
    payload.maxDiscountAmount = Number(s.maxDiscountAmount)
  return payload
}

interface DiscountFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the sheet edits this discount; otherwise it creates a new one. */
  discount?: Discount | null
  onSuccess?: () => void
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium text-slate-700">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  )
}

export function DiscountFormSheet({
  open,
  onOpenChange,
  discount,
  onSuccess,
}: DiscountFormSheetProps) {
  const isEdit = !!discount
  const [form, setForm] = useState<FormState>(emptyState)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const queryClient = useQueryClient()

  useEffect(() => {
    if (open) {
      setForm(discount ? fromDiscount(discount) : emptyState())
      setErrors({})
    }
  }, [open, discount])

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }))

  const showValue = VALUE_TYPES.includes(form.type)
  const showMaxCap = form.type === 'percentage'
  const idLabel = useMemo(() => {
    switch (form.applicableType) {
      case 'category':
        return 'Category IDs'
      case 'product':
        return 'Product IDs'
      case 'vendor':
        return 'Vendor IDs'
      default:
        return 'IDs'
    }
  }, [form.applicableType])

  const mutation = useMutation({
    mutationFn: (payload: DiscountPayload) =>
      isEdit ? discountApi.update(discount!._id, payload) : discountApi.create(payload),
    onSuccess: () => {
      toast.success(isEdit ? 'Coupon updated' : 'Coupon created')
      queryClient.invalidateQueries({ queryKey: ['ai', 'coupons'] })
      onSuccess?.()
      onOpenChange(false)
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to save coupon'
      toast.error(msg)
    },
  })

  const handleSubmit = () => {
    const e = validate(form)
    setErrors(e)
    if (Object.keys(e).length) {
      toast.error('Please fix the highlighted fields')
      return
    }
    mutation.mutate(buildPayload(form))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto p-0 sm:max-w-xl"
      >
        <SheetHeader className="sticky top-0 z-10 border-b border-slate-100 bg-white p-5">
          <SheetTitle className="flex items-center gap-2 text-lg font-semibold">
            <Ticket className="h-5 w-5 text-blue-600" />
            {isEdit ? 'Edit Coupon' : 'Create New Coupon'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? `Update the configuration for ${discount?.code}.`
              : 'Configure discount rules, eligibility, limits and validity.'}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-7 p-5">
          {/* Basics */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Basics</h3>
            <Field label="Name *" htmlFor="d-name" error={errors.name}>
              <Input
                id="d-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Welcome 20% Off"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Code"
                htmlFor="d-code"
                error={errors.code}
                hint="Leave blank to auto-generate"
              >
                <Input
                  id="d-code"
                  value={form.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="WELCOME20"
                />
              </Field>
              <Field label="Type *" error={errors.type}>
                <Select value={form.type} onValueChange={(v) => set('type', v as DiscountType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Description" htmlFor="d-desc" error={errors.description}>
              <Textarea
                id="d-desc"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={2}
                placeholder="Shown to customers at checkout"
              />
            </Field>
          </section>

          {/* Value */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Value</h3>
            <div className="grid grid-cols-2 gap-4">
              {showValue && (
                <Field
                  label={form.type === 'percentage' ? 'Percentage *' : 'Amount (₹) *'}
                  htmlFor="d-value"
                  error={errors.value}
                >
                  <Input
                    id="d-value"
                    type="number"
                    min={0}
                    max={form.type === 'percentage' ? 100 : undefined}
                    value={form.value}
                    onChange={(e) => set('value', e.target.value)}
                  />
                </Field>
              )}
              {showMaxCap && (
                <Field
                  label="Max discount cap (₹)"
                  htmlFor="d-maxcap"
                  hint="Optional ceiling for %"
                >
                  <Input
                    id="d-maxcap"
                    type="number"
                    min={0}
                    value={form.maxDiscountAmount}
                    onChange={(e) => set('maxDiscountAmount', e.target.value)}
                  />
                </Field>
              )}
              <Field label="Minimum order value (₹)" htmlFor="d-minorder">
                <Input
                  id="d-minorder"
                  type="number"
                  min={0}
                  value={form.minOrderValue}
                  onChange={(e) => set('minOrderValue', e.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>
            {!showValue && (
              <p className="rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                {form.type === 'free_delivery' || form.type === 'no_deposit'
                  ? 'This benefit is applied during rental calculation — no numeric value needed.'
                  : 'No fixed value required for this coupon type.'}
              </p>
            )}
          </section>

          {/* Applicability */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Applicability
            </h3>
            <Field label="Applies to">
              <Select
                value={form.applicableType}
                onValueChange={(v) => set('applicableType', v as ApplicableType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICABLE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {(form.applicableType === 'category' ||
              form.applicableType === 'product' ||
              form.applicableType === 'vendor') && (
              <Field
                label={idLabel}
                htmlFor="d-ids"
                error={errors.applicableIds}
                hint="Comma-separated IDs"
              >
                <Input
                  id="d-ids"
                  value={form.applicableIds}
                  onChange={(e) => set('applicableIds', e.target.value)}
                  placeholder="6501..., 6502..."
                />
              </Field>
            )}
            {form.applicableType === 'rental_tenure' && (
              <Field
                label="Tenure months"
                htmlFor="d-tenure"
                error={errors.tenureMonths}
                hint="Comma-separated, e.g. 3, 6, 12"
              >
                <Input
                  id="d-tenure"
                  value={form.tenureMonths}
                  onChange={(e) => set('tenureMonths', e.target.value)}
                  placeholder="3, 6, 12"
                />
              </Field>
            )}
          </section>

          {/* Eligibility */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Eligibility
            </h3>
            <Field label="User type">
              <Select
                value={form.userType}
                onValueChange={(v) => set('userType', v as UserEligibilityType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ELIGIBILITY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {form.userType === 'specific' && (
              <Field
                label="User IDs"
                htmlFor="d-userids"
                error={errors.userIds}
                hint="Comma-separated user IDs"
              >
                <Input
                  id="d-userids"
                  value={form.userIds}
                  onChange={(e) => set('userIds', e.target.value)}
                />
              </Field>
            )}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Min rentals completed" htmlFor="d-minrentals">
                <Input
                  id="d-minrentals"
                  type="number"
                  min={0}
                  value={form.minRentalsCompleted}
                  onChange={(e) => set('minRentalsCompleted', e.target.value)}
                />
              </Field>
              <Field label="Min amount spent (₹)" htmlFor="d-minspent">
                <Input
                  id="d-minspent"
                  type="number"
                  min={0}
                  value={form.minAmountSpent}
                  onChange={(e) => set('minAmountSpent', e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Limits */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Usage limits
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Per user" htmlFor="d-peruser">
                <Input
                  id="d-peruser"
                  type="number"
                  min={1}
                  value={form.perUser}
                  onChange={(e) => set('perUser', e.target.value)}
                />
              </Field>
              <Field label="Global total" htmlFor="d-global" hint="Blank = unlimited">
                <Input
                  id="d-global"
                  type="number"
                  min={1}
                  value={form.global}
                  onChange={(e) => set('global', e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Validity */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Validity</h3>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date *" htmlFor="d-start" error={errors.startDate}>
                <Input
                  id="d-start"
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => set('startDate', e.target.value)}
                />
              </Field>
              <Field label="End date *" htmlFor="d-end" error={errors.endDate}>
                <Input
                  id="d-end"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => set('endDate', e.target.value)}
                />
              </Field>
            </div>
          </section>

          {/* Advanced */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-400">Advanced</h3>
            <Field label="Priority" htmlFor="d-priority" hint="0–100, higher wins when stacking">
              <Input
                id="d-priority"
                type="number"
                min={0}
                max={100}
                value={form.priority}
                onChange={(e) => set('priority', e.target.value)}
              />
            </Field>
            <div className="space-y-3 rounded-lg border border-slate-100 p-3">
              <ToggleRow
                label="Stackable with other coupons"
                checked={form.stackable}
                onChange={(v) => set('stackable', v)}
              />
              <ToggleRow
                label="Show on checkout"
                checked={form.showOnCheckout}
                onChange={(v) => set('showOnCheckout', v)}
              />
              <ToggleRow
                label="Show on product page"
                checked={form.showOnProduct}
                onChange={(v) => set('showOnProduct', v)}
              />
              <ToggleRow
                label="Auto-apply at checkout"
                checked={form.autoApply}
                onChange={(v) => set('autoApply', v)}
              />
            </div>
          </section>
        </div>

        <SheetFooter className="sticky bottom-0 z-10 flex-row justify-end gap-2 border-t border-slate-100 bg-white p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-1.5">
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              <Save className="h-4 w-4" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
            {isEdit ? 'Save changes' : 'Create coupon'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export default DiscountFormSheet
