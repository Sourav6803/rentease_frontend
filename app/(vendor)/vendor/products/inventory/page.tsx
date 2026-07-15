
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { useSession } from 'next-auth/react'
import {
  Package, Search, RefreshCw, Download, Upload,
  Plus, Edit, Trash2, Eye, MoreVertical,
  AlertTriangle, Wrench, BarChart3, TrendingUp,
  CheckCircle, XCircle, Clock, Layers, MapPin,
  QrCode, Tag, DollarSign, Calendar, X, ChevronLeft,
  ChevronRight, Filter, ArrowUpDown, Box, ShieldCheck,
  Zap, ClipboardList, Activity, Archive, RotateCcw,
  Loader2, FileDown, ScanLine, History, Info,
  ChevronDown, Check, AlertCircle, Star, Truck,
  BarChart2, PieChart, ArrowUp, ArrowDown, Hash,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/useToast'

// ─── Types ────────────────────────────────────────────────────────────────────
interface InventoryLocation { warehouse?: string; shelf?: string; city?: string; pincode?: string }
interface InventoryCondition { status: string; notes?: string; lastInspectionDate?: string; nextInspectionDate?: string }
interface PurchaseInfo { date?: string; price?: number; from?: string; invoiceNumber?: string; warrantyExpiry?: string }

interface InventoryItem {
  _id: string
  product: { _id: string; basicInfo: { name: string; brand: string }; media?: { images?: Array<{ url: string; thumbnail: string; isPrimary: boolean }> } }
  sku: string
  serialNumber?: string
  qrCode?: string
  location: InventoryLocation
  condition: InventoryCondition
  status: 'available' | 'reserved' | 'rented' | 'maintenance' | 'damaged' | 'retired' | 'lost'
  currentRental?: string
  rentalHistory: Array<{ rental: string; startDate: string; endDate?: string }>
  purchaseInfo: PurchaseInfo
  depreciation?: { rate?: number; currentValue?: number }
  createdAt: string
  updatedAt: string
}

interface InventoryAnalytics {
  totalItems?: number
  totalValue?: number
  byStatus?: Record<string, number>
  utilizationRate?: number
  avgRentalsPerItem?: number
}

interface LowStockAlert {
  _id: string
  product: { _id: string; basicInfo: { name: string; brand: string } }
  available: number
  total: number
}

interface MaintenanceDueItem {
  _id: string; sku: string
  product: { _id: string; basicInfo: { name: string } }
  condition: InventoryCondition; location: InventoryLocation
  nextInspectionDate?: string
}

interface ValueReport {
  totalPurchaseValue?: number
  totalCurrentValue?: number
  totalDepreciation?: number
  byProduct?: Array<{ productId: string; name: string; items: number; value: number }>
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  available:   { label: 'Available',   color: 'text-green-700',   bg: 'bg-green-50',   border: 'border-green-200',  icon: CheckCircle },
  reserved:    { label: 'Reserved',    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-200',   icon: Clock },
  rented:      { label: 'Rented',      color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-200', icon: Truck },
  maintenance: { label: 'Maintenance', color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200',  icon: Wrench },
  damaged:     { label: 'Damaged',     color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200',    icon: AlertTriangle },
  retired:     { label: 'Retired',     color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-200',  icon: Archive },
  lost:        { label: 'Lost',        color: 'text-rose-700',    bg: 'bg-rose-50',    border: 'border-rose-200',   icon: XCircle },
}

const CONDITION_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  new:       { label: 'New',       color: 'text-green-600',  dot: 'bg-green-500' },
  excellent: { label: 'Excellent', color: 'text-emerald-600', dot: 'bg-emerald-500' },
  good:      { label: 'Good',      color: 'text-blue-600',   dot: 'bg-blue-500' },
  fair:      { label: 'Fair',      color: 'text-amber-600',  dot: 'bg-amber-500' },
  poor:      { label: 'Poor',      color: 'text-orange-600', dot: 'bg-orange-500' },
  damaged:   { label: 'Damaged',   color: 'text-red-600',    dot: 'bg-red-500' },
}

// ─── Helper: auth headers ─────────────────────────────────────────────────────
function useAuthHeaders() {
  const { data: session } = useSession()
  return useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }), [session?.user?.accessToken])
}

// ─── Status Badge Component ───────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.available
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="h-3 w-3" />{cfg.label}
    </span>
  )
}

// ─── Condition Badge ──────────────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition: string }) {
  const cfg = CONDITION_CONFIG[condition] || CONDITION_CONFIG.good
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  )
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl">
      <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
      <Skeleton className="h-8 w-24 rounded-lg" />
    </div>
  )
}

// ─── Add/Edit Item Modal ──────────────────────────────────────────────────────
function ItemModal({
  open, onClose, item, products, onSave, getHeaders,
}: {
  open: boolean; onClose: () => void
  item: InventoryItem | null
  products: Array<{ _id: string; basicInfo: { name: string; brand: string } }>
  onSave: () => void
  getHeaders: () => Record<string, string>
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    productId: '', quantity: 1,
    purchasePrice: '', purchaseFrom: '', purchaseDate: '',
    warrantyExpiry: '', invoiceNumber: '',
    warehouse: '', shelf: '', city: '', pincode: '',
    condition: 'new', conditionNotes: '',
  })
  const toast = useToast()

  useEffect(() => {
    if (item) {
      setForm({
        productId: item.product?._id || '',
        quantity: 1,
        purchasePrice: item.purchaseInfo?.price?.toString() || '',
        purchaseFrom: item.purchaseInfo?.from || '',
        purchaseDate: item.purchaseInfo?.date ? item.purchaseInfo.date.split('T')[0] : '',
        warrantyExpiry: item.purchaseInfo?.warrantyExpiry ? item.purchaseInfo.warrantyExpiry.split('T')[0] : '',
        invoiceNumber: item.purchaseInfo?.invoiceNumber || '',
        warehouse: item.location?.warehouse || '',
        shelf: item.location?.shelf || '',
        city: item.location?.city || '',
        pincode: item.location?.pincode || '',
        condition: item.condition?.status || 'new',
        conditionNotes: item.condition?.notes || '',
      })
    } else {
      setForm({ productId: '', quantity: 1, purchasePrice: '', purchaseFrom: '', purchaseDate: '', warrantyExpiry: '', invoiceNumber: '', warehouse: '', shelf: '', city: '', pincode: '', condition: 'new', conditionNotes: '' })
    }
  }, [item, open])

  const handleSave = async () => {
    if (!form.productId) { toast.error('Select a product'); return }
    setSaving(true)
    try {
      const payload = {
        productId: form.productId,
        quantity: Number(form.quantity),
        purchaseInfo: {
          price: form.purchasePrice ? Number(form.purchasePrice) : undefined,
          from: form.purchaseFrom || undefined,
          date: form.purchaseDate || undefined,
          warrantyExpiry: form.warrantyExpiry || undefined,
          invoiceNumber: form.invoiceNumber || undefined,
        },
        location: { warehouse: form.warehouse, shelf: form.shelf, city: form.city, pincode: form.pincode },
        condition: { status: form.condition, notes: form.conditionNotes },
      }
      if (item) {
        await axios.put(`${BASE_URL}/api/v1/inventory/items/${item._id}`, payload, { headers: getHeaders() })
        toast.success('Item updated successfully')
      } else {
        await axios.post(`${BASE_URL}/api/v1/inventory/items`, payload, { headers: getHeaders() })
        toast.success(`${form.quantity} item(s) created successfully`)
      }
      onSave(); onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save item')
    } finally { setSaving(false) }
  }

  const F = ({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] bg-[#fafafa]"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-110! max-h-[90vh] overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ebf3fb] rounded-lg flex items-center justify-center">
              <Package className="h-4 w-4 text-[#2874f0]" />
            </div>
            {item ? 'Edit Inventory Item' : 'Add Inventory Items'}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {item ? 'Update item details, location, and condition.' : 'Create new inventory items for a product.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Product + Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <F label="Product" required>
              <Select value={form.productId} onValueChange={v => setForm(p => ({ ...p, productId: v }))} disabled={!!item}>
                <SelectTrigger className={inputCls + ' h-auto'}>
                  <SelectValue placeholder="Select product…" />
                </SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p._id} value={p._id}>
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-sm">{p.basicInfo.name}</span>
                        <span className="text-[11px] text-slate-400">{p.basicInfo.brand}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </F>
            {!item && (
              <F label="Quantity to Create" required>
                <input type="number" min={1} max={500} value={form.quantity}
                  onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))}
                  className={inputCls} placeholder="1" />
              </F>
            )}
          </div>

          {/* Condition */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Condition</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {Object.entries(CONDITION_CONFIG).map(([val, cfg]) => (
                <button key={val} type="button"
                  onClick={() => setForm(p => ({ ...p, condition: val }))}
                  className={`py-1.5 px-2 rounded-lg border-2 text-xs font-semibold transition-all ${form.condition === val ? 'border-[#2874f0] bg-[#ebf3fb] text-[#2874f0]' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <span className={`w-2 h-2 rounded-full inline-block mr-1 ${cfg.dot}`} />{cfg.label}
                </button>
              ))}
            </div>
            <F label="Condition Notes">
              <textarea value={form.conditionNotes}
                onChange={e => setForm(p => ({ ...p, conditionNotes: e.target.value }))}
                className={inputCls + ' resize-none'} rows={2} placeholder="Any notes about the condition…" />
            </F>
          </div>

          {/* Purchase Info */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Purchase Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <F label="Purchase Price (₹)">
                <input type="number" value={form.purchasePrice}
                  onChange={e => setForm(p => ({ ...p, purchasePrice: e.target.value }))}
                  className={inputCls} placeholder="e.g., 15000" />
              </F>
              <F label="Purchased From">
                <input type="text" value={form.purchaseFrom}
                  onChange={e => setForm(p => ({ ...p, purchaseFrom: e.target.value }))}
                  className={inputCls} placeholder="Vendor / Store name" />
              </F>
              <F label="Purchase Date">
                <input type="date" value={form.purchaseDate}
                  onChange={e => setForm(p => ({ ...p, purchaseDate: e.target.value }))}
                  className={inputCls} />
              </F>
              <F label="Warranty Expiry">
                <input type="date" value={form.warrantyExpiry}
                  onChange={e => setForm(p => ({ ...p, warrantyExpiry: e.target.value }))}
                  className={inputCls} />
              </F>
              <F label="Invoice Number">
                <input type="text" value={form.invoiceNumber}
                  onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                  className={inputCls} placeholder="INV-001" />
              </F>
            </div>
          </div>

          {/* Location */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Storage Location</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'warehouse', label: 'Warehouse', ph: 'WH-1' },
                { key: 'shelf', label: 'Shelf', ph: 'A-12' },
                { key: 'city', label: 'City', ph: 'Mumbai' },
                { key: 'pincode', label: 'Pincode', ph: '400001' },
              ].map(({ key, label, ph }) => (
                <F key={key} label={label}>
                  <input type="text" value={(form as any)[key]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className={inputCls} placeholder={ph} />
                </F>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-bold text-sm rounded-xl disabled:opacity-60 transition-colors">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Saving…' : item ? 'Update Item' : `Create Item${Number(form.quantity) > 1 ? 's' : ''}`}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Status Update Modal ──────────────────────────────────────────────────────
function StatusModal({
  open, onClose, item, onSave, getHeaders,
}: {
  open: boolean; onClose: () => void
  item: InventoryItem | null; onSave: () => void
  getHeaders: () => Record<string, string>
}) {
  const [status, setStatus] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  useEffect(() => { if (item) { setStatus(item.status); setReason('') } }, [item, open])

  const handleSave = async () => {
    if (!item) return
    setSaving(true)
    try {
      await axios.patch(`${BASE_URL}/api/v1/inventory/items/${item._id}/status`, { status, reason }, { headers: getHeaders() })
      toast.success('Status updated successfully')
      onSave(); onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update status')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Activity className="h-4 w-4 text-[#2874f0]" />Update Item Status
          </DialogTitle>
          {item && <DialogDescription className="text-xs">SKU: <span className="font-mono font-semibold text-slate-700">{item.sku}</span></DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_CONFIG).map(([val, cfg]) => {
              const Icon = cfg.icon
              return (
                <button key={val} type="button"
                  onClick={() => setStatus(val)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border-2 text-xs font-semibold transition-all text-left ${status === val ? `border-[#2874f0] ${cfg.bg} ${cfg.color}` : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />{cfg.label}
                </button>
              )
            })}
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Reason / Notes</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="Reason for status change…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] resize-none bg-[#fafafa]" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving || !status || status === item?.status}
            className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-bold text-sm rounded-xl disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {saving ? 'Updating…' : 'Update Status'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Schedule Maintenance Modal ───────────────────────────────────────────────
function MaintenanceModal({
  open, onClose, onSave, getHeaders,
}: {
  open: boolean; onClose: () => void; onSave: () => void
  getHeaders: () => Record<string, string>
}) {
  const [form, setForm] = useState({ itemId: '', type: 'routine', scheduledDate: '', notes: '', estimatedCost: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/inventory/maintenance/schedule`, {
        itemId: form.itemId, type: form.type,
        scheduledDate: form.scheduledDate, notes: form.notes,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : undefined,
      }, { headers: getHeaders() })
      toast.success('Maintenance scheduled successfully')
      onSave(); onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to schedule maintenance')
    } finally { setSaving(false) }
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] bg-[#fafafa]"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Wrench className="h-4 w-4 text-amber-500" />Schedule Maintenance
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Item ID / SKU</label>
            <input value={form.itemId} onChange={e => setForm(p => ({ ...p, itemId: e.target.value }))} className={inputCls} placeholder="Enter inventory item ID or SKU" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Maintenance Type</label>
            <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
              <SelectTrigger className={inputCls + ' h-auto'}><SelectValue /></SelectTrigger>
              <SelectContent>
                {['routine', 'repair', 'cleaning', 'inspection', 'upgrade'].map(t => (
                  <SelectItem key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Scheduled Date</label>
              <input type="date" value={form.scheduledDate} onChange={e => setForm(p => ({ ...p, scheduledDate: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Est. Cost (₹)</label>
              <input type="number" value={form.estimatedCost} onChange={e => setForm(p => ({ ...p, estimatedCost: e.target.value }))} className={inputCls} placeholder="500" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
              className={inputCls + ' resize-none'} placeholder="Details about the maintenance…" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
            {saving ? 'Scheduling…' : 'Schedule'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Audit Modal ──────────────────────────────────────────────────────────────
function AuditModal({
  open, onClose, onSave, getHeaders,
}: {
  open: boolean; onClose: () => void; onSave: () => void
  getHeaders: () => Record<string, string>
}) {
  const [form, setForm] = useState({ location: '', notes: '', discrepancies: '' })
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.post(`${BASE_URL}/api/v1/inventory/audit`, form, { headers: getHeaders() })
      toast.success('Audit completed successfully')
      onSave(); onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Audit failed')
    } finally { setSaving(false) }
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] bg-[#fafafa]"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <ClipboardList className="h-4 w-4 text-[#2874f0]" />Perform Inventory Audit
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Record the result of a physical inventory count.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Location (Optional)</label>
            <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className={inputCls} placeholder="Warehouse / city being audited" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Discrepancies Found</label>
            <textarea value={form.discrepancies} onChange={e => setForm(p => ({ ...p, discrepancies: e.target.value }))} rows={2}
              className={inputCls + ' resize-none'} placeholder="Describe any mismatches…" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Audit Notes</label>
            <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
              className={inputCls + ' resize-none'} placeholder="General observations…" />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">This will log an official audit record and timestamp. Make sure physical count is complete before submitting.</p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-bold text-sm rounded-xl disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ClipboardList className="h-4 w-4" />}
            {saving ? 'Submitting…' : 'Submit Audit'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Item Detail Modal ────────────────────────────────────────────────────────
function ItemDetailModal({
  open, onClose, itemId, getHeaders,
}: {
  open: boolean; onClose: () => void; itemId: string | null
  getHeaders: () => Record<string, string>
}) {
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [history, setHistory] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (!open || !itemId) return
    setLoading(true); setItem(null); setHistory(null); setTab('details')
    Promise.all([
      axios.get(`${BASE_URL}/api/v1/inventory/items/${itemId}`, { headers: getHeaders() }),
      axios.get(`${BASE_URL}/api/v1/inventory/items/${itemId}/history`, { headers: getHeaders() }),
    ]).then(([ir, hr]) => {
      setItem(ir.data.data?.item || null)
      setHistory(hr.data.data || null)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [open, itemId])

  const dl = (label: string, value?: string | number | null) => value != null ? (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-xs font-semibold text-slate-800 text-right max-w-[60%]">{value}</span>
    </div>
  ) : null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Eye className="h-4 w-4 text-[#2874f0]" />Item Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#2874f0]" /></div>
        ) : item ? (
          <div>
            {/* Item header */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-4">
              <div className="w-10 h-10 bg-[#ebf3fb] rounded-lg flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-[#2874f0]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{item.product?.basicInfo?.name}</p>
                <p className="text-[11px] text-slate-500 font-mono">{item.sku}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>

            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full grid grid-cols-3 mb-4 h-9">
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="purchase" className="text-xs">Purchase</TabsTrigger>
                <TabsTrigger value="history" className="text-xs">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-0">
                {dl('SKU', item.sku)}
                {dl('Serial Number', item.serialNumber)}
                {dl('Condition', item.condition?.status)}
                {item.condition?.notes && dl('Condition Notes', item.condition.notes)}
                {dl('Warehouse', item.location?.warehouse)}
                {dl('Shelf', item.location?.shelf)}
                {dl('City', item.location?.city)}
                {dl('Pincode', item.location?.pincode)}
                {dl('Current Value', item.depreciation?.currentValue ? `₹${item.depreciation.currentValue.toLocaleString()}` : undefined)}
                {dl('Last Updated', new Date(item.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }))}
              </TabsContent>

              <TabsContent value="purchase">
                {dl('Purchase Price', item.purchaseInfo?.price ? `₹${item.purchaseInfo.price.toLocaleString()}` : undefined)}
                {dl('Purchased From', item.purchaseInfo?.from)}
                {dl('Purchase Date', item.purchaseInfo?.date ? new Date(item.purchaseInfo.date).toLocaleDateString('en-IN') : undefined)}
                {dl('Invoice Number', item.purchaseInfo?.invoiceNumber)}
                {dl('Warranty Expiry', item.purchaseInfo?.warrantyExpiry ? new Date(item.purchaseInfo.warrantyExpiry).toLocaleDateString('en-IN') : undefined)}
              </TabsContent>

              <TabsContent value="history">
                {history ? (
                  <div className="space-y-3">
                    {history.rentals?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Rental History ({history.rentals.length})</p>
                        <div className="space-y-1.5">
                          {history.rentals.slice(0, 5).map((r: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg">
                              <span className="text-slate-600">Rental #{r.rental?.toString().slice(-6)}</span>
                              <span className="text-slate-500">{new Date(r.startDate).toLocaleDateString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {history.status?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Status Changes ({history.status.length})</p>
                        <div className="space-y-1.5">
                          {history.status.slice(0, 5).map((s: any, i: number) => (
                            <div key={i} className="flex justify-between text-xs p-2 bg-slate-50 rounded-lg">
                              <StatusBadge status={s.status} />
                              <span className="text-slate-400">{s.reason || '—'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(!history.rentals?.length && !history.status?.length) && (
                      <p className="text-sm text-slate-400 text-center py-6">No history recorded yet.</p>
                    )}
                  </div>
                ) : <p className="text-sm text-slate-400 text-center py-6">Loading history…</p>}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-12">Item not found.</p>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Analytics Panel ──────────────────────────────────────────────────────────
function AnalyticsPanel({ analytics, valueReport }: { analytics: InventoryAnalytics | null; valueReport: ValueReport | null }) {
  const byStatus = analytics?.byStatus || {}

  const statusOrder = ['available', 'rented', 'reserved', 'maintenance', 'damaged', 'retired', 'lost']
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="space-y-4">
      {/* Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: analytics?.totalItems ?? '—', icon: Box, color: '#2874f0', light: '#ebf3fb' },
          { label: 'Total Value', value: analytics?.totalValue ? `₹${(analytics.totalValue / 1000).toFixed(0)}K` : '—', icon: DollarSign, color: '#21a056', light: '#e8f5e9' },
          { label: 'Utilization', value: analytics?.utilizationRate ? `${analytics.utilizationRate.toFixed(0)}%` : '—', icon: Activity, color: '#fb641b', light: '#fff3e0' },
          { label: 'Avg Rentals/Item', value: analytics?.avgRentalsPerItem?.toFixed(1) ?? '—', icon: TrendingUp, color: '#9c27b0', light: '#f3e5f5' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-3.5 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-12 h-12 rounded-bl-full opacity-10" style={{ background: s.color }} />
              <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{ background: s.light }}>
                <Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
              </div>
              <p className="text-lg font-bold text-slate-900">{String(s.value)}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Status Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <PieChart className="h-4 w-4 text-[#2874f0]" />Status Distribution
        </p>
        <div className="space-y-2.5">
          {statusOrder.filter(s => byStatus[s] > 0).map(s => {
            const cfg = STATUS_CONFIG[s]
            const Icon = cfg.icon
            const pct = Math.round((byStatus[s] / total) * 100)
            return (
              <div key={s}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`flex items-center gap-1.5 text-xs font-medium ${cfg.color}`}>
                    <Icon className="h-3 w-3" />{cfg.label}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{byStatus[s]} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6, delay: 0.1 }}
                    className={`h-1.5 rounded-full ${cfg.bg.replace('bg-', 'bg-').replace('-50', '-400')}`}
                    style={{ backgroundColor: s === 'available' ? '#4ade80' : s === 'rented' ? '#a78bfa' : s === 'reserved' ? '#60a5fa' : s === 'maintenance' ? '#fbbf24' : s === 'damaged' ? '#f87171' : '#94a3b8' }}
                  />
                </div>
              </div>
            )
          })}
          {Object.keys(byStatus).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No data available yet.</p>
          )}
        </div>
      </div>

      {/* Value Report */}
      {valueReport && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-[#2874f0]" />Value Report
          </p>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Purchase Value', value: valueReport.totalPurchaseValue || 0, color: 'text-slate-800' },
              { label: 'Current Value', value: valueReport.totalCurrentValue || 0, color: 'text-green-700' },
              { label: 'Depreciation', value: valueReport.totalDepreciation || 0, color: 'text-red-600' },
            ].map(v => (
              <div key={v.label} className="text-center p-3 bg-slate-50 rounded-xl">
                <p className={`text-sm font-bold ${v.color}`}>₹{(v.value / 1000).toFixed(1)}K</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{v.label}</p>
              </div>
            ))}
          </div>
          {valueReport.byProduct && valueReport.byProduct.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">By Product</p>
              <div className="space-y-1.5">
                {valueReport.byProduct.slice(0, 5).map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium truncate max-w-[60%]">{p.name}</span>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">₹{(p.value / 1000).toFixed(1)}K</span>
                      <span className="text-slate-400 ml-2">({p.items} items)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Bulk Import Modal ────────────────────────────────────────────────────────
function BulkImportModal({
  open, onClose, onSave, getHeaders,
}: {
  open: boolean; onClose: () => void; onSave: () => void
  getHeaders: () => Record<string, string>
}) {
  const [json, setJson] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  const sample = JSON.stringify([
    { productId: 'PRODUCT_ID_HERE', quantity: 5, purchaseInfo: { price: 15000, from: 'Supplier', date: '2024-01-01' }, location: { city: 'Mumbai', pincode: '400001' } }
  ], null, 2)

  const handleImport = async () => {
    setError('')
    let items
    try { items = JSON.parse(json) } catch { setError('Invalid JSON format. Please check your input.'); return }
    if (!Array.isArray(items)) { setError('Data must be an array of items.'); return }
    setSaving(true)
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/inventory/bulk-import`, { items }, { headers: getHeaders() })
      toast.success(`Bulk import completed: ${res.data.data?.created || 0} created`)
      onSave(); onClose(); setJson('')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Import failed')
    } finally { setSaving(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Upload className="h-4 w-4 text-[#2874f0]" />Bulk Import Inventory
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">Paste JSON array of items to import in bulk.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="bg-slate-900 rounded-xl p-3 text-[11px] font-mono text-green-400 overflow-x-auto">
            <p className="text-slate-500 mb-1">// Sample format:</p>
            <pre className="whitespace-pre-wrap">{sample}</pre>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Your JSON Data</label>
            <textarea value={json} onChange={e => { setJson(e.target.value); setError('') }} rows={8}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] resize-none bg-[#fafafa]"
              placeholder="Paste your JSON array here…" />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold border border-slate-200 rounded-xl hover:bg-slate-50">Cancel</button>
          <button onClick={handleImport} disabled={saving || !json.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] hover:bg-[#1a5fd4] text-white font-bold text-sm rounded-xl disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {saving ? 'Importing…' : 'Import Items'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function InventoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const toast = useToast()
  const getHeaders = useAuthHeaders()
  const isFetchingRef = useRef(false)

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'items' | 'analytics' | 'alerts' | 'maintenance'>('items')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [analytics, setAnalytics] = useState<InventoryAnalytics | null>(null)
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[]>([])
  const [maintenanceDue, setMaintenanceDue] = useState<MaintenanceDueItem[]>([])
  const [valueReport, setValueReport] = useState<ValueReport | null>(null)
  const [products, setProducts] = useState<Array<{ _id: string; basicInfo: { name: string; brand: string } }>>([])

  const [loading, setLoading] = useState(true)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [exporting, setExporting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [conditionFilter, setConditionFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  // Modals
  const [addModal, setAddModal] = useState(false)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [statusModal, setStatusModal] = useState<InventoryItem | null>(null)
  const [detailItemId, setDetailItemId] = useState<string | null>(null)
  const [maintenanceModal, setMaintenanceModal] = useState(false)
  const [auditModal, setAuditModal] = useState(false)
  const [bulkImportModal, setBulkImportModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)

  // ── Fetch items ────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async (showLoad = true) => {
    if (isFetchingRef.current || status !== 'authenticated') return
    isFetchingRef.current = true
    if (showLoad) setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(currentPage), limit: '15',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(conditionFilter !== 'all' && { condition: conditionFilter }),
      })
      // Use first product's ID or generic endpoint
      // const res = await axios.get(`${BASE_URL}/api/v1/vendor/products?${params}`, { headers: getHeaders() })
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/items?${params}`, { 
        headers: getHeaders() 
      })
      
      if (res.data.success) {
        setItems(res.data.data?.items || [])
        setTotalPages(res.data.data?.pagination?.page || 1)
        setTotalItems(res.data.data?.pagination?.total || 0)
      }
    } catch {
      // fallback: try /items endpoint
      // try {
        
      //   const res = await axios.get(`${BASE_URL}/api/v1/inventory/items?page=${currentPage}&limit=15`, { headers: getHeaders() })
      //   setItems(res.data.data?.items || [])
      // } catch { /* silently fail */ }
    } finally { setLoading(false); isFetchingRef.current = false }
  }, [currentPage, searchTerm, statusFilter, conditionFilter, status, getHeaders])

  const fetchAnalytics = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoadingAnalytics(true)
    try {
      const [ar, vr] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/inventory/analytics`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/v1/inventory/reports/value`, { headers: getHeaders() }),
      ])
      setAnalytics(ar.data.data || null)
      setValueReport(vr.data.data || null)
    } catch { /* silently fail */ }
    finally { setLoadingAnalytics(false) }
  }, [status, getHeaders])

  const fetchAlerts = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const [la, md] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/inventory/alerts/low-stock`, { headers: getHeaders() }),
        axios.get(`${BASE_URL}/api/v1/inventory/alerts/maintenance-due`, { headers: getHeaders() }),
      ])
      setLowStockAlerts(la.data.data?.alerts || [])
      setMaintenanceDue(md.data.data?.items || [])
    } catch { /* silently fail */ }
  }, [status, getHeaders])

  const fetchProducts = useCallback(async () => {
    if (status !== 'authenticated') return
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/vendor/products?limit=100`, { headers: getHeaders() })
      setProducts(res.data.data?.products || [])
    } catch { /* silently fail */ }
  }, [status, getHeaders])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') { fetchItems(); fetchAlerts(); fetchProducts() }
  }, [status])

  useEffect(() => { if (status === 'authenticated') fetchItems(false) }, [currentPage, searchTerm, statusFilter, conditionFilter])

  useEffect(() => { if (activeTab === 'analytics' && status === 'authenticated') fetchAnalytics() }, [activeTab, status])

  const handleRefresh = () => {
    setRefreshing(true)
    Promise.all([fetchItems(false), fetchAlerts()]).finally(() => setTimeout(() => setRefreshing(false), 800))
  }

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/v1/inventory/export?format=${format}`, {
        headers: getHeaders(), responseType: format === 'csv' ? 'blob' : 'json',
      })
      if (format === 'csv') {
        const url = URL.createObjectURL(new Blob([res.data]))
        const a = document.createElement('a'); a.href = url; a.download = 'inventory-export.csv'; a.click()
        URL.revokeObjectURL(url)
      } else {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = 'inventory-export.json'; a.click()
        URL.revokeObjectURL(url)
      }
      toast.success(`Inventory exported as ${format.toUpperCase()}`)
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const handleDelete = async () => {
    if (!deleteItem) return
    try {
      await axios.patch(`${BASE_URL}/api/v1/inventory/items/${deleteItem._id}/status`, { status: 'retired', reason: 'Deleted by vendor' }, { headers: getHeaders() })
      toast.success('Item retired successfully')
      fetchItems(false)
    } catch { toast.error('Failed to retire item') }
    finally { setDeleteItem(null) }
  }

  const totalAlerts = lowStockAlerts.length + maintenanceDue.length

  // ── Render ─────────────────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-[3px] border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading inventory…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet" />

      {/* Modals */}
      <ItemModal open={addModal || !!editItem} onClose={() => { setAddModal(false); setEditItem(null) }}
        item={editItem} products={products} onSave={() => fetchItems(false)} getHeaders={getHeaders} />
      <StatusModal open={!!statusModal} onClose={() => setStatusModal(null)}
        item={statusModal} onSave={() => fetchItems(false)} getHeaders={getHeaders} />
      <MaintenanceModal open={maintenanceModal} onClose={() => setMaintenanceModal(false)}
        onSave={() => { fetchItems(false); fetchAlerts() }} getHeaders={getHeaders} />
      <AuditModal open={auditModal} onClose={() => setAuditModal(false)}
        onSave={() => fetchItems(false)} getHeaders={getHeaders} />
      <BulkImportModal open={bulkImportModal} onClose={() => setBulkImportModal(false)}
        onSave={() => fetchItems(false)} getHeaders={getHeaders} />
      <ItemDetailModal open={!!detailItemId} onClose={() => setDetailItemId(null)}
        itemId={detailItemId} getHeaders={getHeaders} />

      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <AlertDialogTitle className="text-lg font-bold">Retire Item?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-slate-500">
              Item <span className="font-mono font-semibold text-slate-700">{deleteItem?.sku}</span> will be marked as <strong>Retired</strong>. This cannot be undone easily.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold">
              <Archive className="h-4 w-4 mr-1.5" />Retire Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── PAGE ── */}
      <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="max-w-[1280px] mx-auto px-4 py-6 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="h-6 w-6 text-[#2874f0]" />Inventory Management
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {totalItems} items tracked · {lowStockAlerts.length} low stock · {maintenanceDue.length} maintenance due
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Export dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button disabled={exporting} className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-60 transition-colors">
                    {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 text-slate-500" />}
                    Export
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('csv')}><Download className="h-4 w-4 mr-2" />Export CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('json')}><Download className="h-4 w-4 mr-2" />Export JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <button onClick={() => setBulkImportModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <Upload className="h-4 w-4 text-slate-500" />Bulk Import
              </button>

              <button onClick={() => setAuditModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
                <ClipboardList className="h-4 w-4 text-slate-500" />Audit
              </button>

              <button onClick={() => setAddModal(true)}
                className="flex items-center gap-2 bg-[#fb641b] hover:bg-[#e55c18] text-white font-bold text-sm px-5 py-2 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95">
                <Plus className="h-4 w-4" />Add Items
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { label: 'Available', key: 'available', color: '#4ade80', lightBg: 'bg-green-50' },
              { label: 'Rented', key: 'rented', color: '#a78bfa', lightBg: 'bg-purple-50' },
              { label: 'Reserved', key: 'reserved', color: '#60a5fa', lightBg: 'bg-blue-50' },
              { label: 'Maintenance', key: 'maintenance', color: '#fbbf24', lightBg: 'bg-amber-50' },
              { label: 'Damaged', key: 'damaged', color: '#f87171', lightBg: 'bg-red-50' },
              { label: 'Retired', key: 'retired', color: '#94a3b8', lightBg: 'bg-slate-50' },
              { label: 'Lost', key: 'lost', color: '#fb7185', lightBg: 'bg-rose-50' },
            ].map(s => {
              const count = items.filter(i => i.status === s.key).length
              const Icon = STATUS_CONFIG[s.key]?.icon || Package
              return (
                <motion.button key={s.key}
                  whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { setStatusFilter(statusFilter === s.key ? 'all' : s.key); setCurrentPage(1) }}
                  className={`${s.lightBg} border ${statusFilter === s.key ? 'border-[#2874f0] ring-2 ring-[#2874f0]/20' : 'border-slate-200'} rounded-xl p-3 text-left transition-all`}>
                  <Icon className="h-4 w-4 mb-1.5" style={{ color: s.color }} />
                  <p className="text-base font-bold text-slate-900">{count}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{s.label}</p>
                </motion.button>
              )
            })}
          </div>

          {/* Alert Banners */}
          <AnimatePresence>
            {totalAlerts > 0 && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lowStockAlerts.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{lowStockAlerts.length} Low Stock Alert{lowStockAlerts.length > 1 ? 's' : ''}</p>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        {lowStockAlerts.slice(0, 2).map(a => a.product?.basicInfo?.name).join(', ')}
                        {lowStockAlerts.length > 2 ? ` +${lowStockAlerts.length - 2} more` : ''}
                      </p>
                    </div>
                    <button onClick={() => setActiveTab('alerts')}
                      className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors">
                      View All →
                    </button>
                  </div>
                )}
                {maintenanceDue.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 flex items-start gap-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{maintenanceDue.length} Maintenance Due</p>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        {maintenanceDue.slice(0, 2).map(m => m.product?.basicInfo?.name || m.sku).join(', ')}
                        {maintenanceDue.length > 2 ? ` +${maintenanceDue.length - 2} more` : ''}
                      </p>
                    </div>
                    <button onClick={() => setMaintenanceModal(true)}
                      className="text-[11px] font-bold bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors">
                      Schedule →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Tab headers */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {([
                { key: 'items', label: 'All Items', icon: Box, badge: totalItems },
                { key: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
                { key: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: totalAlerts },
                { key: 'maintenance', label: 'Maintenance', icon: Wrench, badge: maintenanceDue.length },
              ] as const).map(t => {
                const Icon = t.icon
                const isActive = activeTab === t.key
                return (
                  <button key={t.key} onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${isActive ? 'border-[#2874f0] text-[#2874f0] bg-[#ebf3fb]/50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
                    <Icon className="h-4 w-4" />
                    {t.label}
                    {t.badge !== null && t.badge > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#2874f0] text-white' : t.key === 'alerts' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                        {t.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Items Tab ── */}
            {activeTab === 'items' && (
              <div className="p-4">
                {/* Search + Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                      placeholder="Search by SKU, serial number, location…"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0] bg-[#fafafa]"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1) }}
                      className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0]">
                      <option value="all">All Status</option>
                      {Object.entries(STATUS_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                    <select value={conditionFilter} onChange={e => { setConditionFilter(e.target.value); setCurrentPage(1) }}
                      className="px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#2874f0]/25 focus:border-[#2874f0]">
                      <option value="all">All Conditions</option>
                      {Object.entries(CONDITION_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                    </select>
                    <button onClick={handleRefresh} disabled={refreshing}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-[#fafafa] hover:bg-slate-100 disabled:opacity-50 transition-colors">
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-[#2874f0]' : 'text-slate-400'}`} />
                      <span className="hidden sm:inline text-slate-600">Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Table Header */}
                {!loading && items.length > 0 && (
                  <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-4 px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    <span>Product / SKU</span>
                    <span>Status</span>
                    <span>Condition</span>
                    <span>Location</span>
                    <span>Purchase</span>
                    <span>Rentals</span>
                    <span>Actions</span>
                  </div>
                )}

                {/* Items List */}
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-[#ebf3fb] rounded-full flex items-center justify-center mb-4">
                      <Package className="h-8 w-8 text-[#2874f0]" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1.5">No inventory items found</h3>
                    <p className="text-sm text-slate-500 max-w-xs mb-5">
                      {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters.' : 'Start by adding inventory items for your products.'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                      <button onClick={() => setAddModal(true)}
                        className="flex items-center gap-2 bg-[#2874f0] text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-sm">
                        <Plus className="h-4 w-4" />Add First Item
                      </button>
                    )}
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-2">
                      {items.map((item, idx) => (
                        <motion.div key={item._id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }} transition={{ delay: idx * 0.03 }}
                          className="group bg-white border border-slate-200 hover:border-[#2874f0]/30 hover:shadow-sm rounded-xl transition-all duration-200"
                        >
                          {/* Mobile layout */}
                          <div className="flex items-start gap-3 p-4 lg:hidden">
                            <div className="w-10 h-10 bg-[#ebf3fb] rounded-lg flex items-center justify-center shrink-0">
                              <Package className="h-5 w-5 text-[#2874f0]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">{item.product?.basicInfo?.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{item.sku}</p>
                              <div className="flex flex-wrap gap-2 mt-2">
                                <StatusBadge status={item.status} />
                                <ConditionBadge condition={item.condition?.status} />
                              </div>
                              {item.location?.city && (
                                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{item.location.city}{item.location.shelf ? ` · ${item.location.shelf}` : ''}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col gap-1">
                              <button onClick={() => setDetailItemId(item._id)} className="p-1.5 rounded-lg hover:bg-slate-100"><Eye className="h-4 w-4 text-slate-400" /></button>
                              <button onClick={() => setEditItem(item)} className="p-1.5 rounded-lg hover:bg-slate-100"><Edit className="h-4 w-4 text-slate-400" /></button>
                              <button onClick={() => setStatusModal(item)} className="p-1.5 rounded-lg hover:bg-slate-100"><Activity className="h-4 w-4 text-slate-400" /></button>
                            </div>
                          </div>

                          {/* Desktop layout */}
                          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1.5fr_auto] gap-4 items-center px-4 py-3.5">
                            {/* Product */}
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-9 h-9 bg-[#ebf3fb] rounded-lg flex items-center justify-center shrink-0">
                                <Package className="h-4 w-4 text-[#2874f0]" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{item?.product?.basicInfo?.name || '—'}</p>
                                <p className="text-[11px] font-mono text-slate-400">{item.sku}</p>
                              </div>
                            </div>

                            {/* Status */}
                            <div><StatusBadge status={item.status} /></div>

                            {/* Condition */}
                            <div><ConditionBadge condition={item.condition?.status} /></div>

                            {/* Location */}
                            <div>
                              {item.location?.city ? (
                                <div>
                                  <p className="text-xs font-medium text-slate-700 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" />{item.location.city}
                                  </p>
                                  {item.location.shelf && <p className="text-[11px] text-slate-400">Shelf: {item.location.shelf}</p>}
                                </div>
                              ) : <span className="text-[11px] text-slate-300">—</span>}
                            </div>

                            {/* Purchase */}
                            <div>
                              {item.purchaseInfo?.price ? (
                                <div>
                                  <p className="text-xs font-bold text-slate-800">₹{item.purchaseInfo.price.toLocaleString()}</p>
                                  {item.purchaseInfo.date && <p className="text-[11px] text-slate-400">{new Date(item.purchaseInfo.date).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })}</p>}
                                </div>
                              ) : <span className="text-[11px] text-slate-300">—</span>}
                            </div>

                            {/* Rentals */}
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-slate-800">{item.rentalHistory?.length || 0}</span>
                                <span className="text-[11px] text-slate-400">rentals</span>
                              </div>
                              {item.currentRental && (
                                <span className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100 px-1.5 py-0.5 rounded-full font-semibold">Currently Rented</span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button onClick={() => setDetailItemId(item._id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="View Details">
                                <Eye className="h-3.5 w-3.5 text-slate-400 hover:text-[#2874f0]" />
                              </button>
                              <button onClick={() => setEditItem(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Edit">
                                <Edit className="h-3.5 w-3.5 text-slate-400 hover:text-[#2874f0]" />
                              </button>
                              <button onClick={() => setStatusModal(item)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Update Status">
                                <Activity className="h-3.5 w-3.5 text-slate-400 hover:text-amber-500" />
                              </button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                                    <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 text-sm">
                                  <DropdownMenuItem onClick={() => setMaintenanceModal(true)}>
                                    <Wrench className="h-3.5 w-3.5 mr-2 text-amber-500" />Schedule Maintenance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.sku); toast.success('SKU copied') }}>
                                    <Tag className="h-3.5 w-3.5 mr-2" />Copy SKU
                                  </DropdownMenuItem>
                                  {item.serialNumber && (
                                    <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(item.serialNumber!); toast.success('Serial copied') }}>
                                      <Hash className="h-3.5 w-3.5 mr-2" />Copy Serial
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-red-600 focus:text-red-600">
                                    <Archive className="h-3.5 w-3.5 mr-2" />Retire Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Page <span className="font-bold text-slate-700">{currentPage}</span> of <span className="font-bold text-slate-700">{totalPages}</span>
                      <span className="hidden sm:inline"> · {totalItems} total items</span>
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        <ChevronLeft className="h-4 w-4 text-slate-600" />
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <button key={p} onClick={() => setCurrentPage(p)}
                            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${currentPage === p ? 'bg-[#2874f0] text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                            {p}
                          </button>
                        )
                      })}
                      <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        <ChevronRight className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Analytics Tab ── */}
            {activeTab === 'analytics' && (
              <div className="p-4">
                {loadingAnalytics ? (
                  <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-[#2874f0]" /></div>
                ) : (
                  <AnalyticsPanel analytics={analytics} valueReport={valueReport} />
                )}
              </div>
            )}

            {/* ── Alerts Tab ── */}
            {activeTab === 'alerts' && (
              <div className="p-4 space-y-5">
                {/* Low Stock */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Low Stock Alerts
                    <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{lowStockAlerts.length}</span>
                  </h3>
                  {lowStockAlerts.length === 0 ? (
                    <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-700">All stock levels are healthy!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockAlerts.map((alert, i) => {
                        const pct = alert.total > 0 ? Math.round((alert.available / alert.total) * 100) : 0
                        return (
                          <motion.div key={alert._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-4 p-4 bg-white border border-amber-200 rounded-xl hover:shadow-sm transition-all">
                            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{alert.product?.basicInfo?.name}</p>
                              <p className="text-[11px] text-slate-500">{alert.product?.basicInfo?.brand}</p>
                              <div className="mt-1.5 flex items-center gap-2">
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[120px]">
                                  <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-[11px] font-semibold text-amber-700">{alert.available} of {alert.total} left</span>
                              </div>
                            </div>
                            <button onClick={() => setAddModal(true)}
                              className="shrink-0 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg transition-colors">
                              + Restock
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Maintenance Due */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Wrench className="h-4 w-4 text-blue-500" />
                    Maintenance Due
                    <span className="text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{maintenanceDue.length}</span>
                  </h3>
                  {maintenanceDue.length === 0 ? (
                    <div className="text-center py-8 bg-green-50 rounded-xl border border-green-100">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-700">No maintenance due!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {maintenanceDue.map((m, i) => (
                        <motion.div key={m._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-white border border-blue-200 rounded-xl hover:shadow-sm transition-all">
                          <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                            <Wrench className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{m.product?.basicInfo?.name || '—'}</p>
                            <p className="text-[11px] font-mono text-slate-400">{m.sku}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <ConditionBadge condition={m.condition?.status} />
                              {m.location?.city && (
                                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />{m.location.city}
                                </span>
                              )}
                              {m.nextInspectionDate && (
                                <span className="text-[11px] text-blue-600 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />Due: {new Date(m.nextInspectionDate).toLocaleDateString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => setMaintenanceModal(true)}
                            className="shrink-0 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors">
                            Schedule
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Maintenance Tab ── */}
            {activeTab === 'maintenance' && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-500" />Maintenance Management
                  </h3>
                  <button onClick={() => setMaintenanceModal(true)}
                    className="flex items-center gap-1.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl transition-colors">
                    <Plus className="h-4 w-4" />Schedule New
                  </button>
                </div>

                {/* Maintenance info cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {[
                    { label: 'Due This Week', value: maintenanceDue.filter(m => {
                        if (!m.nextInspectionDate) return false
                        const d = new Date(m.nextInspectionDate)
                        const now = new Date()
                        const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                        return diff <= 7
                      }).length, color: '#fb641b', bg: 'bg-orange-50', icon: Clock },
                    { label: 'Due This Month', value: maintenanceDue.length, color: '#2874f0', bg: 'bg-blue-50', icon: Calendar },
                    { label: 'In Maintenance', value: items.filter(i => i.status === 'maintenance').length, color: '#fbbf24', bg: 'bg-amber-50', icon: Wrench },
                  ].map(s => {
                    const Icon = s.icon
                    return (
                      <div key={s.label} className={`${s.bg} border border-slate-200 rounded-xl p-4 flex items-center gap-3`}>
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                          <Icon className="h-5 w-5" style={{ color: s.color }} />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-slate-900">{s.value}</p>
                          <p className="text-[11px] text-slate-500">{s.label}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {maintenanceDue.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-600 mb-1">No maintenance scheduled</p>
                    <p className="text-xs text-slate-400 mb-4">Keep your inventory in top shape.</p>
                    <button onClick={() => setMaintenanceModal(true)}
                      className="flex items-center gap-2 bg-amber-500 text-white font-bold text-sm px-4 py-2 rounded-xl mx-auto">
                      <Plus className="h-4 w-4" />Schedule Maintenance
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {maintenanceDue.map((m, i) => (
                      <div key={m._id} className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:shadow-sm transition-all">
                        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                          <Wrench className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-800">{m.product?.basicInfo?.name}</p>
                          <p className="text-[11px] font-mono text-slate-400 mb-1">{m.sku}</p>
                          <div className="flex flex-wrap gap-2">
                            <ConditionBadge condition={m.condition?.status} />
                            {m.nextInspectionDate && (
                              <span className={`text-[11px] font-medium flex items-center gap-1 ${new Date(m.nextInspectionDate) < new Date() ? 'text-red-500' : 'text-slate-500'}`}>
                                <Calendar className="h-3 w-3" />
                                {new Date(m.nextInspectionDate) < new Date() ? 'Overdue: ' : 'Due: '}
                                {new Date(m.nextInspectionDate).toLocaleDateString('en-IN')}
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setStatusModal(items.find(it => it._id === m._id) || null)}
                          className="shrink-0 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                          Update
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom info bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap gap-5 items-center justify-between">
              <div className="flex flex-wrap gap-5">
                {[
                  [ShieldCheck, 'Inventory Protected', 'text-[#21a056]'],
                  [QrCode, 'QR Scanning Ready', 'text-[#2874f0]'],
                  [History, 'Full Audit Trail', 'text-slate-500'],
                ].map(([Icon, label, cls]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    {/* @ts-ignore */}
                    <Icon className={`h-4 w-4 ${cls}`} />
                    <span className={`text-xs font-medium ${cls}`}>{String(label)}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setAddModal(true)}
                className="text-xs font-semibold text-[#2874f0] hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" />Add more items
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

