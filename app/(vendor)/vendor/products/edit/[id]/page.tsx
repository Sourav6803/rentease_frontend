
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession, getSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Save, Trash2, Camera, Package, DollarSign,
  Shield, Truck, CheckCircle, AlertCircle, X, ImageIcon,
  Layers, Tag, Info, RefreshCw, AlertTriangle, Star,
  ChevronRight, Eye, TrendingUp, MapPin, RotateCcw
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  _id: string
  name: string
  slug: string
}

interface ProductImage {
  url: string
  thumbnail: string
  isPrimary: boolean
  file?: File
}

interface BasicInfo {
  name: string
  brand: string
  description: string
  sku: string
}

interface Pricing {
  monthlyRent: number
  securityDeposit: number
  deliveryCharges: number
}

interface Inventory {
  totalQuantity: number
  availableQuantity: number
  location?: string
}

interface Shipping {
  weight: number
  dimensions: { length: number; width: number; height: number }
  returnPolicy: string
}

interface ProductFormData {
  basicInfo: BasicInfo
  pricing: Pricing
  inventory: Inventory
  media: { images: ProductImage[] }
  condition: string
  category: CategoryOption
  specifications: Record<string, string>
  shipping: Shipping
}

interface Product extends ProductFormData {
  _id: string
  status: { isActive: boolean; isVerified: boolean }
  ratings: { average: number; count: number }
  rentalCount?: number
  revenue?: number
  createdAt: string
}

interface ValidationErrors {
  basicInfo?: { name?: string; brand?: string; description?: string; sku?: string }
  pricing?: { monthlyRent?: string; securityDeposit?: string }
  inventory?: { totalQuantity?: string }
  condition?: string
  category?: string
  images?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const getAuthHeaders = async () => {
  const session = await getSession()
  return {
    Authorization: session?.user?.accessToken
      ? `Bearer ${session.user.accessToken}`
      : '',
  }
}

const CONDITION_OPTIONS = [
  { value: 'new', label: 'New', description: 'Brand new, never used', icon: '✨', color: 'emerald' },
  { value: 'like-new', label: 'Like New', description: 'Used briefly, no wear', icon: '🌟', color: 'sky' },
  { value: 'good', label: 'Good', description: 'Light signs of use', icon: '👍', color: 'blue' },
  { value: 'fair', label: 'Fair', description: 'Visible wear, works perfectly', icon: '📦', color: 'amber' },
  { value: 'refurbished', label: 'Refurbished', description: 'Professionally restored', icon: '🔧', color: 'violet' },
]

const RETURN_POLICIES = [
  '7 days replacement only',
  '15 days replacement only',
  '30 days replacement only',
  'No return on this product',
  'Exchange within 7 days',
]

const NAV_SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: Package, desc: 'Name, brand, SKU' },
  { id: 'images', label: 'Images', icon: Camera, desc: 'Product photos' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, desc: 'Rent & deposits' },
  { id: 'inventory', label: 'Inventory', icon: Layers, desc: 'Stock management' },
  { id: 'specifications', label: 'Specifications', icon: Tag, desc: 'Condition & specs' },
  { id: 'shipping', label: 'Shipping', icon: Truck, desc: 'Weight & dimensions' },
]

// ─── Validation ───────────────────────────────────────────────────────────────

const validateForm = (data: ProductFormData): ValidationErrors => {
  const errors: ValidationErrors = {}

  if (!data.basicInfo.name.trim())
    errors.basicInfo = { ...errors.basicInfo, name: 'Product name is required' }
  else if (data.basicInfo.name.length < 3)
    errors.basicInfo = { ...errors.basicInfo, name: 'Name must be at least 3 characters' }
  else if (data.basicInfo.name.length > 100)
    errors.basicInfo = { ...errors.basicInfo, name: 'Name must be less than 100 characters' }

  if (!data.basicInfo.brand.trim())
    errors.basicInfo = { ...errors.basicInfo, brand: 'Brand is required' }

  if (!data.basicInfo.description.trim())
    errors.basicInfo = { ...errors.basicInfo, description: 'Description is required' }
  else if (data.basicInfo.description.length < 20)
    errors.basicInfo = { ...errors.basicInfo, description: 'At least 20 characters required' }

  if (!data.basicInfo.sku.trim())
    errors.basicInfo = { ...errors.basicInfo, sku: 'SKU is required' }

  if (!data.pricing.monthlyRent || data.pricing.monthlyRent <= 0)
    errors.pricing = { ...errors.pricing, monthlyRent: 'Monthly rent must be greater than 0' }
  else if (data.pricing.monthlyRent > 1000000)
    errors.pricing = { ...errors.pricing, monthlyRent: 'Must be less than ₹10,00,000' }

  if (data.pricing.securityDeposit < 0)
    errors.pricing = { ...errors.pricing, securityDeposit: 'Cannot be negative' }

  if (!data.inventory.totalQuantity || data.inventory.totalQuantity < 1)
    errors.inventory = { totalQuantity: 'At least 1 item required' }

  if (!data.condition) errors.condition = 'Please select a condition'
  if (!data.category) errors.category = 'Please select a category'
  if (data.media.images.length === 0) errors.images = 'At least one product image is required'

  return errors
}

// ─── Input Field ──────────────────────────────────────────────────────────────

function Field({
  label, required, error, hint, children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
  className? : string
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-[13px] font-semibold text-slate-600 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 text-base leading-none">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

function Input({
  error, prefix, className = '', ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string; prefix?: string }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm select-none">
          {prefix}
        </span>
      )}
      <input
        {...props}
        className={`
          w-full py-2.5 border rounded-lg text-sm text-slate-800 placeholder:text-slate-300
          focus:outline-none focus:ring-2 transition-all
          ${prefix ? 'pl-8 pr-3.5' : 'px-3.5'}
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400'
            : 'border-slate-200 bg-white focus:ring-[#2874f0]/20 focus:border-[#2874f0]'
          }
          ${className}
        `}
      />
    </div>
  )
}

// ─── Image Upload ─────────────────────────────────────────────────────────────

function ImageUpload({
  images, onChange, onRemove, error,
}: {
  images: ProductImage[]
  onChange: (images: ProductImage[]) => void
  onRemove: (index: number) => void
  error?: string
}) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const handleFiles = async (files: FileList | null) => {
    if (!files) return
    if (images.length + files.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }
    const newImages = [...images]
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} is not an image`); continue }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} exceeds 5MB`); continue }
      const preview = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })
      newImages.push({ url: preview, thumbnail: preview, isPrimary: newImages.length === 0, file })
    }
    onChange(newImages)
  }

  const setPrimary = (index: number) =>
    onChange(images.map((img, i) => ({ ...img, isPrimary: i === index })))

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl
          border-2 border-dashed cursor-pointer transition-all duration-200
          ${isDragging ? 'border-[#2874f0] bg-[#f0f5ff] scale-[1.01]' : ''}
          ${error ? 'border-red-400 bg-red-50' : !isDragging ? 'border-slate-200 hover:border-[#2874f0] hover:bg-slate-50/70' : ''}
        `}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? 'bg-[#2874f0]' : 'bg-slate-100'}`}>
          <Camera className={`h-7 w-7 ${isDragging ? 'text-white' : 'text-slate-400'}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-700">Drop images here or <span className="text-[#2874f0]">browse</span></p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — up to 5MB each · Max 10 images</p>
        </div>
        <div className="flex gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> High resolution</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Multiple angles</span>
          <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Clear background</span>
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {error}</p>}

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {images.map((img, idx) => (
            <div key={idx} className="relative group aspect-square">
              <div className={`w-full h-full rounded-xl overflow-hidden border-2 transition-colors ${img.isPrimary ? 'border-[#2874f0]' : 'border-transparent'}`}>
                <img src={img.url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
              {img.isPrimary && (
                <div className="absolute top-1.5 left-1.5 bg-[#2874f0] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md tracking-wide">
                  COVER
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all rounded-xl flex flex-col items-center justify-center gap-1.5">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPrimary(idx) }}
                    className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg text-[10px] font-semibold text-slate-700 hover:bg-[#2874f0] hover:text-white transition-colors"
                  >
                    <Star className="h-3 w-3" /> Set Cover
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(idx) }}
                  className="flex items-center gap-1 px-2 py-1 bg-white/90 rounded-lg text-[10px] font-semibold text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            </div>
          ))}
          {images.length < 10 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-[#2874f0] hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-[#2874f0]"
            >
              <Camera className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Add More</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Specifications Editor ────────────────────────────────────────────────────

function SpecificationsEditor({ specs, onChange }: { specs: Record<string, string>; onChange: (specs: Record<string, string>) => void }) {
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const QUICK_SPECS = ['Material', 'Color', 'Size', 'Model Number', 'Warranty', 'Power', 'Capacity', 'Connectivity']

  const addSpec = () => {
    if (newKey.trim() && newValue.trim()) {
      onChange({ ...specs, [newKey.trim()]: newValue.trim() })
      setNewKey(''); setNewValue('')
    }
  }

  const removeSpec = (key: string) => {
    const updated = { ...specs }
    delete updated[key]
    onChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Quick Add Chips */}
      <div>
        <p className="text-xs text-slate-500 font-medium mb-2">Quick add common specs:</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SPECS.filter(s => !specs[s]).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setNewKey(s)}
              className={`px-3 py-1 text-xs rounded-full border transition-all font-medium
                ${newKey === s ? 'bg-[#2874f0] text-white border-[#2874f0]' : 'border-slate-200 text-slate-500 hover:border-[#2874f0] hover:text-[#2874f0]'}
              `}
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      {/* Existing Specs */}
      {Object.entries(specs).length > 0 && (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(specs).map(([key, value], i) => (
                <tr key={key} className={`flex items-center ${i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="w-44 px-4 py-2.5 font-semibold text-slate-600 text-xs uppercase tracking-wide border-r border-slate-100">{key}</td>
                  <td className="flex-1 px-4 py-2.5 text-slate-700">{value}</td>
                  <td className="px-3">
                    <button type="button" onClick={() => removeSpec(key)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group">
                      <X className="h-3.5 w-3.5 text-slate-300 group-hover:text-red-500 transition-colors" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add New */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Property name"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSpec()}
          className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/20 focus:border-[#2874f0] placeholder:text-slate-300"
        />
        <input
          type="text"
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSpec()}
          className="flex-1 px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/20 focus:border-[#2874f0] placeholder:text-slate-300"
        />
        <button
          type="button"
          onClick={addSpec}
          disabled={!newKey.trim() || !newValue.trim()}
          className="px-5 py-2.5 bg-[#2874f0] text-white rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#1a5fd4] transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, accent = false, children }: {
  title: string; icon: React.ElementType; accent?: boolean; children: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
    >
      <div className={`px-6 py-4 border-b border-slate-100 flex items-center gap-3 ${accent ? 'bg-gradient-to-r from-[#f8fbff] to-white' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#2874f0]/10 flex items-center justify-center">
          <Icon className="h-4.5 w-4.5 text-[#2874f0]" style={{ width: 18, height: 18 }} />
        </div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session, status } = useSession()
  const toast = useToast()

  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [activeSection, setActiveSection] = useState('basic')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [saveProgress, setSaveProgress] = useState(0)

  useEffect(() => {
    if (status === 'authenticated' && params.id) fetchProduct()
    else if (status === 'unauthenticated') router.push('/vendor/login')
  }, [status, params.id])

  const fetchProduct = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/products/${params.id}`, { headers })
      const data = await res.json()
      if (data.success) {
        const prod = data.data.product
        setProduct(prod)
        setFormData({
          basicInfo: prod.basicInfo,
          pricing: prod.pricing,
          inventory: prod.inventory,
          media: prod.media,
          condition: prod.condition,
          category: prod.category || '',
          specifications: prod.specifications || {},
          shipping: prod.shipping || { weight: 0, dimensions: { length: 0, width: 0, height: 0 }, returnPolicy: '7 days replacement only' },
        })
      } else {
        toast.error(data.message || 'Failed to load product')
        router.push('/vendor/products')
      }
    } catch {
      toast.error('Failed to load product')
      router.push('/vendor/products')
    } finally {
      setIsLoading(false)
    }
  }

  // ✅ Fixed: properly typed to avoid "Spread types may only be created from object types"
  const handleInputChange = <S extends keyof ProductFormData>(
    section: S,
    field: keyof ProductFormData[S],
    value: ProductFormData[S][keyof ProductFormData[S]]
  ) => {
    if (!formData) return
    const sectionData = formData[section]
    if (typeof sectionData !== 'object' || sectionData === null || Array.isArray(sectionData)) return
    setFormData({
      ...formData,
      [section]: { ...(sectionData as object), [field]: value },
    })
    setErrors((prev) => ({ ...prev, [section]: undefined }))
  }

  const handleImageChange = (images: ProductImage[]) => {
    if (!formData) return
    setFormData({ ...formData, media: { images } })
    setErrors((prev) => ({ ...prev, images: undefined }))
  }

  const handleImageRemove = (index: number) => {
    if (!formData) return
    const updated = formData.media.images.filter((_, i) => i !== index)
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) updated[0].isPrimary = true
    handleImageChange(updated)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!formData) return

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      toast.error('Please fix the errors before submitting')
      return
    }

    setIsSaving(true)
    setSaveProgress(10)

    try {
      const submitData: Record<string, unknown> = {
        basicInfo: formData.basicInfo,
        pricing: formData.pricing,
        inventory: { totalQuantity: formData.inventory.totalQuantity, availableQuantity: formData.inventory.availableQuantity, location: formData.inventory.location },
        condition: formData.condition,
        category: formData.category._id,
        specifications: formData.specifications,
        shipping: formData.shipping,
      }

      setSaveProgress(30)
      const hasNewImages = formData.media.images.some((img) => img.file)

      if (hasNewImages) {
        const imageFormData = new FormData()
        formData.media.images.forEach((img) => { if (img.file) imageFormData.append('images', img.file) })
        imageFormData.append('isPrimary', formData.media.images.findIndex((img) => img.isPrimary).toString())
        const headers = await getAuthHeaders()
        setSaveProgress(50)
        const uploadRes = await fetch(`${BASE_URL}/api/v1/products/${params.id}/images`, {
          method: 'POST',
          headers: { Authorization: headers.Authorization },
          body: imageFormData,
        })
        const uploadData = await uploadRes.json()
        if (!uploadData.success) throw new Error(uploadData.message || 'Image upload failed')
        const existingImages = formData.media.images.filter((img) => !img.file).map(({ url, thumbnail, isPrimary }) => ({ url, thumbnail, isPrimary }))
        submitData.media = { images: [...existingImages, ...uploadData.data.images] }
      } else {
        submitData.media = formData.media
      }

      setSaveProgress(75)
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/products/${params.id}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      })

      setSaveProgress(95)
      const data = await res.json()
      if (data.success) {
        setSaveProgress(100)
        toast.success('Product updated successfully!')
        setTimeout(() => router.push('/vendor/products'), 400)
      } else {
        toast.error(data.message || 'Failed to update product')
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update product')
    } finally {
      setIsSaving(false)
      setSaveProgress(0)
    }
  }

  const handleDelete = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/vendor/products/${params.id}`, { method: 'DELETE', headers })
      const data = await res.json()
      if (data.success) {
        toast.success('Product deleted')
        router.push('/vendor/products')
      } else {
        toast.error(data.message || 'Failed to delete product')
      }
    } catch {
      toast.error('Failed to delete product')
    }
    setShowDeleteDialog(false)
  }

  // ─── Loading State ────────────────────────────────────────────────────────────

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-[#f0f3f7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#2874f0]/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#2874f0] animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500">Loading product details…</p>
        </div>
      </div>
    )
  }

  const completionScore = (() => {
    let score = 0
    if (formData.basicInfo.name) score += 15
    if (formData.basicInfo.brand) score += 10
    if (formData.basicInfo.description.length > 20) score += 15
    if (formData.basicInfo.sku) score += 5
    if (formData.media.images.length > 0) score += 20
    if (formData.pricing.monthlyRent > 0) score += 15
    if (formData.inventory.totalQuantity > 0) score += 10
    if (formData.condition) score += 5
    if (Object.keys(formData.specifications).length > 0) score += 5
    return score
  })()

  const sectionHasError = (id: string) => {
    if (id === 'basic') return !!(errors.basicInfo || errors.category)
    if (id === 'images') return !!errors.images
    if (id === 'pricing') return !!errors.pricing
    if (id === 'inventory') return !!errors.inventory
    if (id === 'specifications') return !!errors.condition
    return false
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      {/* Save Progress Bar */}
      {isSaving && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-100">
          <motion.div
            className="h-full bg-[#2874f0]"
            initial={{ width: '0%' }}
            animate={{ width: `${saveProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      <div className="min-h-screen bg-[#f0f3f7]">

        {/* Top Header Bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-slate-600" />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">Edit Product</h1>
                {product && (
                  <p className="text-xs text-slate-400 leading-tight truncate max-w-xs">
                    {product.basicInfo.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Completion Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completionScore >= 80 ? 'bg-emerald-500' : completionScore >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                    style={{ width: `${completionScore}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-500">{completionScore}%</span>
              </div>

              <button
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>

              <button
                onClick={() => handleSubmit()}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2 bg-[#2874f0] text-white rounded-xl text-sm font-bold hover:bg-[#1a5fd4] disabled:opacity-60 transition-all shadow-sm shadow-[#2874f0]/30"
              >
                {isSaving ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="h-4 w-4" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-5">

            {/* ── Sidebar ── */}
            <aside className="hidden lg:block w-60 shrink-0 space-y-3">

              {/* Product Stats Card */}
              {product && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-100">
                    {formData.media.images[0] ? (
                      <img src={formData.media.images[0].url} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">Status</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.status.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {product.status.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                    {product.rentalCount !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Total Rentals</span>
                        <span className="text-xs font-bold text-slate-700">{product.rentalCount}</span>
                      </div>
                    )}
                    {product.ratings.count > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Rating</span>
                        <span className="text-xs font-bold text-amber-600">★ {product.ratings.average.toFixed(1)} ({product.ratings.count})</span>
                      </div>
                    )}
                    {product.status.isVerified && (
                      <div className="flex items-center gap-1.5 text-xs text-[#2874f0] font-semibold">
                        <Shield className="h-3.5 w-3.5" /> Verified Product
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Nav */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
                <nav className="space-y-0.5">
                  {NAV_SECTIONS.map((item) => {
                    const Icon = item.icon
                    const hasErr = sectionHasError(item.id)
                    const isActive = activeSection === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                          ${isActive ? 'bg-[#2874f0] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}
                        `}
                      >
                        <Icon className="h-4 w-4 shrink-0" style={{ width: 16, height: 16 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold leading-tight">{item.label}</p>
                          <p className={`text-[10px] leading-tight ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{item.desc}</p>
                        </div>
                        {hasErr && !isActive && (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        )}
                        {!hasErr && isActive && (
                          <ChevronRight className="h-3.5 w-3.5 text-white/60 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Completion */}
              <div className="bg-gradient-to-br from-[#2874f0] to-[#1a5fd4] rounded-2xl p-4 text-white">
                <p className="text-xs font-bold opacity-80 mb-2">Listing Completeness</p>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-3xl font-black">{completionScore}%</span>
                  <TrendingUp className="h-5 w-5 opacity-60" />
                </div>
                <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completionScore}%` }} />
                </div>
                {completionScore < 80 && (
                  <p className="text-[10px] opacity-70 mt-2">Add images & description to boost visibility</p>
                )}
              </div>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 min-w-0 space-y-4">

              {/* Mobile section picker */}
              <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {NAV_SECTIONS.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  const hasErr = sectionHasError(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all
                        ${isActive ? 'bg-[#2874f0] text-white' : 'bg-white text-slate-600 border border-slate-200'}
                      `}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ width: 14, height: 14 }} />
                      {item.label}
                      {hasErr && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </button>
                  )
                })}
              </div>

              <AnimatePresence mode="wait">

                {/* ── Basic Info ── */}
                {activeSection === 'basic' && (
                  <SectionCard key="basic" title="Basic Information" icon={Package} accent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Product Name" required error={errors.basicInfo?.name}>
                        <Input
                          value={formData.basicInfo.name}
                          onChange={(e) => handleInputChange('basicInfo', 'name', e.target.value)}
                          placeholder="e.g., Sony WH-1000XM4 Headphones"
                          error={errors.basicInfo?.name}
                        />
                      </Field>

                      <Field label="Brand" required error={errors.basicInfo?.brand}>
                        <Input
                          value={formData.basicInfo.brand}
                          onChange={(e) => handleInputChange('basicInfo', 'brand', e.target.value)}
                          placeholder="e.g., Sony, Samsung"
                          error={errors.basicInfo?.brand}
                        />
                      </Field>

                      <Field label="SKU" required error={errors.basicInfo?.sku} hint="Unique identifier for your product">
                        <Input
                          value={formData.basicInfo.sku}
                          onChange={(e) => handleInputChange('basicInfo', 'sku', e.target.value)}
                          placeholder="e.g., SONY-WH1000XM4-BLK"
                          error={errors.basicInfo?.sku}
                        />
                      </Field>

                      <Field label="Category" error={errors.category}>
                        <div className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-slate-50">
                          {formData.category.name}
                          <span className="text-slate-400 text-xs ml-2">(cannot be changed)</span>
                        </div>
                      </Field>

                      <Field label="Description" required error={errors.basicInfo?.description} className="sm:col-span-2">
                        <textarea
                          value={formData.basicInfo.description}
                          onChange={(e) => handleInputChange('basicInfo', 'description', e.target.value)}
                          rows={5}
                          placeholder="Describe the product in detail — features, condition notes, included accessories, rental terms…"
                          className={`
                            w-full px-3.5 py-2.5 text-sm border rounded-lg resize-y
                            focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300
                            ${errors.basicInfo?.description
                              ? 'border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400'
                              : 'border-slate-200 bg-white focus:ring-[#2874f0]/20 focus:border-[#2874f0]'}
                          `}
                        />
                        <div className="flex justify-between mt-1">
                          {errors.basicInfo?.description
                            ? <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.basicInfo.description}</p>
                            : <span />
                          }
                          <span className={`text-xs ${formData.basicInfo.description.length > 4500 ? 'text-red-500' : 'text-slate-400'}`}>
                            {formData.basicInfo.description.length} / 5000
                          </span>
                        </div>
                      </Field>
                    </div>
                  </SectionCard>
                )}

                {/* ── Images ── */}
                {activeSection === 'images' && (
                  <SectionCard key="images" title="Product Images" icon={Camera}>
                    <ImageUpload
                      images={formData.media.images}
                      onChange={handleImageChange}
                      onRemove={handleImageRemove}
                      error={errors.images}
                    />
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-blue-700 mb-1.5">📸 Tips for great product photos</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• Use bright, natural lighting and a neutral background</li>
                        <li>• Show multiple angles — front, back, sides, and close-ups</li>
                        <li>• Highlight any wear, damage, or unique features honestly</li>
                        <li>• First image is shown as cover in search results</li>
                      </ul>
                    </div>
                  </SectionCard>
                )}

                {/* ── Pricing ── */}
                {activeSection === 'pricing' && (
                  <SectionCard key="pricing" title="Pricing & Fees" icon={DollarSign}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Monthly Rent" required error={errors.pricing?.monthlyRent} hint="Set competitive pricing based on market rates">
                        <Input
                          type="number"
                          value={formData.pricing.monthlyRent}
                          onChange={(e) => handleInputChange('pricing', 'monthlyRent', parseFloat(e.target.value))}
                          placeholder="e.g., 999"
                          prefix="₹"
                          error={errors.pricing?.monthlyRent}
                        />
                      </Field>

                      <Field label="Security Deposit" error={errors.pricing?.securityDeposit} hint="Refundable deposit collected before rental">
                        <Input
                          type="number"
                          value={formData.pricing.securityDeposit}
                          onChange={(e) => handleInputChange('pricing', 'securityDeposit', parseFloat(e.target.value))}
                          placeholder="e.g., 5000"
                          prefix="₹"
                          error={errors.pricing?.securityDeposit}
                        />
                      </Field>

                      <Field label="Delivery Charges" hint="Set to 0 for free delivery">
                        <Input
                          type="number"
                          value={formData.pricing.deliveryCharges}
                          onChange={(e) => handleInputChange('pricing', 'deliveryCharges', parseFloat(e.target.value))}
                          placeholder="e.g., 199"
                          prefix="₹"
                        />
                      </Field>

                      {/* Pricing Summary Card */}
                      <div className="sm:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Pricing Summary</p>
                        <div className="space-y-2">
                          {[
                            { label: 'Monthly Rent', value: formData.pricing.monthlyRent },
                            { label: 'Security Deposit', value: formData.pricing.securityDeposit },
                            { label: 'Delivery Charges', value: formData.pricing.deliveryCharges },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between items-center">
                              <span className="text-sm text-slate-300">{label}</span>
                              <span className="text-sm font-bold">
                                {value > 0 ? `₹${value.toLocaleString('en-IN')}` : <span className="text-emerald-400 text-xs font-semibold">FREE</span>}
                              </span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-slate-700 flex justify-between">
                            <span className="text-sm font-bold text-slate-200">Customer pays (1st month)</span>
                            <span className="text-base font-black text-[#78b7ff]">
                              ₹{(formData.pricing.monthlyRent + formData.pricing.securityDeposit + formData.pricing.deliveryCharges).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* ── Inventory ── */}
                {activeSection === 'inventory' && (
                  <SectionCard key="inventory" title="Inventory Management" icon={Layers}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Total Quantity" required error={errors.inventory?.totalQuantity}>
                        <Input
                          type="number"
                          value={formData.inventory.totalQuantity}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value)
                            handleInputChange('inventory', 'totalQuantity', qty)
                            if (formData.inventory.availableQuantity > qty)
                              handleInputChange('inventory', 'availableQuantity', qty)
                          }}
                          min={1} max={1000}
                          error={errors.inventory?.totalQuantity}
                        />
                      </Field>

                      <Field label="Available Quantity" hint={`Currently rented: ${Math.max(0, formData.inventory.totalQuantity - formData.inventory.availableQuantity)}`}>
                        <Input
                          type="number"
                          value={formData.inventory.availableQuantity}
                          onChange={(e) => handleInputChange('inventory', 'availableQuantity', parseInt(e.target.value))}
                          min={0}
                          max={formData.inventory.totalQuantity}
                        />
                      </Field>

                      {/* Inventory visual */}
                      <div className="sm:col-span-2 bg-slate-50 rounded-xl p-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                          <span>Available</span>
                          <span>{formData.inventory.availableQuantity} / {formData.inventory.totalQuantity}</span>
                        </div>
                        <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${formData.inventory.totalQuantity > 0 ? (formData.inventory.availableQuantity / formData.inventory.totalQuantity) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                          <span>0 rented out → all available</span>
                          <span>All rented out</span>
                        </div>
                      </div>

                      <Field label="Storage Location" hint="Optional — helps with warehouse management" className="sm:col-span-2">
                        <Input
                          value={formData.inventory.location || ''}
                          onChange={(e) => handleInputChange('inventory', 'location', e.target.value)}
                          placeholder="e.g., Warehouse A, Shelf 3B"
                        />
                      </Field>
                    </div>

                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                      <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-800">Inventory Update Note</p>
                        <p className="text-xs text-amber-700 mt-0.5">Reducing total quantity removes available items first. Items currently rented cannot be removed and are excluded from available count automatically.</p>
                      </div>
                    </div>
                  </SectionCard>
                )}

                {/* ── Specifications ── */}
                {activeSection === 'specifications' && (
                  <div key="specifications" className="space-y-4">
                    {/* Condition */}
                    <SectionCard title="Product Condition" icon={Eye}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {CONDITION_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, condition: opt.value })}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all
                              ${formData.condition === opt.value ? 'border-[#2874f0] bg-[#f0f5ff] shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}
                            `}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-2xl">{opt.icon}</span>
                              {formData.condition === opt.value && (
                                <div className="w-5 h-5 rounded-full bg-[#2874f0] flex items-center justify-center">
                                  <CheckCircle className="h-3.5 w-3.5 text-white" />
                                </div>
                              )}
                            </div>
                            <p className="font-bold text-slate-800 text-sm">{opt.label}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{opt.description}</p>
                          </button>
                        ))}
                      </div>
                      {errors.condition && <p className="mt-2 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" /> {errors.condition}</p>}
                    </SectionCard>

                    {/* Specs */}
                    <SectionCard title="Specifications" icon={Tag}>
                      <SpecificationsEditor
                        specs={formData.specifications}
                        onChange={(specs) => setFormData({ ...formData, specifications: specs })}
                      />
                    </SectionCard>
                  </div>
                )}

                {/* ── Shipping ── */}
                {activeSection === 'shipping' && (
                  <SectionCard key="shipping" title="Shipping & Returns" icon={Truck}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Field label="Weight (kg)" hint="Used to calculate shipping costs">
                        <Input
                          type="number"
                          value={formData.shipping.weight}
                          onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, weight: parseFloat(e.target.value) } })}
                          step="0.1"
                          placeholder="e.g., 2.5"
                        />
                      </Field>

                      <Field label="Return Policy">
                        <select
                          value={formData.shipping.returnPolicy}
                          onChange={(e) => setFormData({ ...formData, shipping: { ...formData.shipping, returnPolicy: e.target.value } })}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]/20 focus:border-[#2874f0] bg-white"
                        >
                          {RETURN_POLICIES.map((p) => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </Field>

                      <Field label="Dimensions (cm)" hint="Length × Width × Height" className="sm:col-span-2">
                        <div className="grid grid-cols-3 gap-3">
                          {(['length', 'width', 'height'] as const).map((dim) => (
                            <div key={dim} className="space-y-1">
                              <Input
                                type="number"
                                placeholder={dim.charAt(0).toUpperCase() + dim.slice(1)}
                                value={formData.shipping.dimensions[dim]}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  shipping: { ...formData.shipping, dimensions: { ...formData.shipping.dimensions, [dim]: parseFloat(e.target.value) } }
                                })}
                              />
                              <p className="text-center text-[10px] text-slate-400 font-medium">{dim}</p>
                            </div>
                          ))}
                        </div>
                      </Field>

                      {/* Return Policy Info Banner */}
                      <div className="sm:col-span-2 flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <RotateCcw className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">Return Policy</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Selected: <span className="font-semibold text-slate-700">{formData.shipping.returnPolicy}</span>
                          </p>
                          <p className="text-xs text-slate-400 mt-1">This policy will be shown to customers before they rent.</p>
                        </div>
                      </div>
                    </div>
                  </SectionCard>
                )}

              </AnimatePresence>

              {/* Bottom Save Bar */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {Object.keys(errors).length > 0
                    ? <span className="text-red-500 font-semibold flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Fix errors before saving</span>
                    : <span className="text-slate-400">All changes auto-validate before save</span>
                  }
                </div>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#2874f0] text-white rounded-xl text-sm font-bold hover:bg-[#1a5fd4] disabled:opacity-60 transition-all shadow-sm shadow-[#2874f0]/30"
                >
                  {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save Changes</>}
                </button>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
                  <Trash2 className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Delete Product?</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    <strong className="text-slate-700">"{product?.basicInfo.name}"</strong> will be permanently removed. This cannot be undone.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
                <p className="text-xs text-red-600 font-medium flex items-start gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  All associated data — images, reviews, rental history — will be permanently deleted.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors text-sm shadow-sm shadow-red-200"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}