// app/admin/categories/[id]/edit/page.tsx
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, X, Plus, Trash2, Sparkles, Loader2,
  FolderTree, Tag, FileText, Eye, EyeOff,
  AlertCircle, CheckCircle, Info, Layers, GitBranch,
  Star, Zap, Globe, ChevronRight, Upload, RefreshCw,
  ArrowLeft, Edit3, ImagePlus, History, Clock,
  AlertTriangle, Copy, ExternalLink, BarChart3,
  TrendingUp, Package, Users, DollarSign
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import { useSession } from 'next-auth/react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryData {
  _id: string
  name: string
  slug: string
  description: string
  parent: string | { _id: string; name: string; slug: string } | null
  level: number
  icon: string
  image: { url: string; thumbnail: string }
  displayOrder: number
  isActive: boolean
  isFeatured: boolean
  meta: {
    title: string
    description: string
    keywords: string[]
  }
  attributes: Attribute[]
  productCount: number
  children: any[]
  ancestors: any[]
  breadcrumbs?: any[]
  createdAt: string
  updatedAt: string
  metadata: {
    createdBy?: string
    updatedBy?: string
    aiGenerated?: boolean
    generatedAt?: string
  }
}

interface Attribute {
  id?: string
  name: string
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
  required: boolean
  filterable: boolean
  options: string[]
  unit?: string
}

interface CategoryTreeOption {
  value: string
  label: string
  level: number
}

interface IconVariation {
  url: string
  thumbnail: string
  color: string
  success: boolean
}

interface UploadedImageData {
  url: string
  thumbnail: string
  publicId?: string
}

interface CategoryStats {
  totalProducts: number
  rentedProducts: number
  rentRate: string | number
  level: number
  isLeaf: boolean
}

// ─── Schema ──────────────────────────────────────────────────────────────────
const editCategorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name cannot exceed 50 characters'),
  description: z.string().max(500).optional(),
  parent: z.string().optional(),
  level: z.number().int().min(0).max(3),
  icon: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().optional(),
  attributes: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Attribute name is required'),
    type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect']),
    required: z.boolean(),
    filterable: z.boolean(),
    options: z.array(z.string()),
    unit: z.string().optional()
  }))
})

type EditCategoryFormValues = z.infer<typeof editCategorySchema>

// ─── Constants ───────────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const levelOptions = [
  {
    value: 0, label: 'L1', name: 'Parent Category',
    description: 'Top-level, can have children',
    icon: FolderTree, color: '#2874F0', bg: '#E8F0FE',
    example: 'Electronics, Furniture'
  },
  {
    value: 1, label: 'L2', name: 'Subcategory',
    description: 'Second-level with parent',
    icon: Layers, color: '#FF6161', bg: '#FFF0F0',
    example: 'Mobiles, Sofas'
  },
  {
    value: 2, label: 'L3', name: 'Sub-subcategory',
    description: 'Third-level category',
    icon: GitBranch, color: '#FF9F00', bg: '#FFF5E5',
    example: 'Smartphones, L-Shape Sofas'
  },
  {
    value: 3, label: 'L4', name: 'Leaf Category',
    description: 'Final level, holds products',
    icon: Tag, color: '#26A541', bg: '#E8F5EB',
    example: 'Android Phones, 3-Seater Sofas'
  }
]

const QUICK_EMOJIS = ['📱', '💻', '🖥️', '🛋️', '🪑', '🛏️', '🔌', '📺', '🎮', '📚', '👕', '👟', '🏋️', '🎸', '🚗', '🧸', '🍳', '🌱', '💍', '📦']

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  input: {
    width: '100%',
    height: 42,
    border: '1px solid #E0E0E0',
    borderRadius: 4,
    padding: '0 14px',
    fontSize: 13,
    color: '#212121',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'Inter', 'Roboto', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s'
  },
  textarea: {
    width: '100%',
    border: '1px solid #E0E0E0',
    borderRadius: 4,
    padding: '10px 14px',
    fontSize: 13,
    color: '#212121',
    backgroundColor: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
    fontFamily: "'Inter', 'Roboto', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    resize: 'vertical' as const,
    lineHeight: 1.6
  },
  select: {
    width: '100%',
    height: 42,
    border: '1px solid #E0E0E0',
    borderRadius: 4,
    padding: '0 14px',
    fontSize: 13,
    color: '#212121',
    backgroundColor: '#fff',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: "'Inter', 'Roboto', sans-serif"
  },
  primaryBtn: {
    backgroundColor: '#2874F0',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    transition: 'all 0.2s',
    fontFamily: "'Inter', 'Roboto', sans-serif"
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    color: '#2874F0',
    border: '1px solid #2874F0',
    borderRadius: 4,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Inter', 'Roboto', sans-serif"
  },
  dangerBtn: {
    backgroundColor: '#fff',
    color: '#FF6161',
    border: '1px solid #FFCDD2',
    borderRadius: 4,
    padding: '10px 24px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: "'Inter', 'Roboto', sans-serif"
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 4,
    border: '1px solid #E0E0E0',
    overflow: 'hidden'
  },
  cardHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #F0F0F0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardBody: {
    padding: 20
  },
  badge: {
    fontSize: 11,
    padding: '2px 10px',
    borderRadius: 20,
    fontWeight: 600,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4
  }
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Breadcrumb
function Breadcrumb({ categoryName }: { categoryName: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#878787]">
      <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">Categories</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">All Categories</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#212121]">Edit: {categoryName}</span>
    </div>
  )
}

// Label Component
function Label({ children, required, className }: { children: React.ReactNode; required?: boolean; className?: string }) {
  return (
    <label style={{ 
      fontSize: 12, 
      fontWeight: 600, 
      color: '#333', 
      display: 'block',
      marginBottom: 6
    }} className={className}>
      {children}
      {required && <span style={{ color: '#FF6161', marginLeft: 2 }}>*</span>}
    </label>
  )
}

// Card Component
function Card({ title, subtitle, action, children, className }: { 
  title: string; 
  subtitle?: string; 
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div style={styles.card} className={className}>
      <div style={styles.cardHeader}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#212121', margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: '#888', margin: '3px 0 0' }}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, bg, trend }: {
  icon: any
  label: string
  value: string | number
  color: string
  bg: string
  trend?: string
}) {
  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: 4, 
      border: '1px solid #E0E0E0', 
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon style={{ width: 20, height: 20, color }} />
      </div>
      <div>
        <p style={{ fontSize: 11, color: '#888', margin: 0, fontWeight: 500 }}>{label}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#212121', margin: '2px 0 0' }}>{value}</p>
          {trend && (
            <span style={{ 
              fontSize: 11, 
              color: trend.startsWith('+') ? '#26A541' : '#FF6161',
              fontWeight: 600
            }}>{trend}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Attributes Section Component
function AttributesSection({ attributes, onChange, disabled, selectedLevel }: {
  attributes: Attribute[]
  onChange: (attrs: Attribute[]) => void
  disabled?: boolean
  selectedLevel: number
}) {
  const [localAttributes, setLocalAttributes] = useState<Attribute[]>(attributes || [])

  useEffect(() => {
    setLocalAttributes(attributes || [])
  }, [attributes])

  const sync = (updated: Attribute[]) => {
    setLocalAttributes(updated)
    onChange(updated)
  }

  const addAttribute = () => {
    sync([...localAttributes, {
      id: Date.now().toString(),
      name: '',
      type: 'text',
      required: false,
      filterable: false,
      options: [],
      unit: ''
    }])
  }

  const removeAttribute = (index: number) => {
    sync(localAttributes.filter((_, i) => i !== index))
  }

  const updateAttribute = (index: number, field: string, value: any) => {
    const updated = [...localAttributes]
    updated[index] = { ...updated[index], [field]: value }
    sync(updated)
  }

  const addOption = (attrIndex: number) => {
    const updated = [...localAttributes]
    if (!updated[attrIndex].options) updated[attrIndex].options = []
    updated[attrIndex].options.push('')
    sync(updated)
  }

  const updateOption = (attrIndex: number, optionIndex: number, value: string) => {
    const updated = [...localAttributes]
    updated[attrIndex].options[optionIndex] = value
    sync(updated)
  }

  const removeOption = (attrIndex: number, optionIndex: number) => {
    const updated = [...localAttributes]
    updated[attrIndex].options.splice(optionIndex, 1)
    sync(updated)
  }

  if (disabled) {
    return (
      <Card title="Category Attributes" subtitle="Attributes are available for L2 and L3 categories">
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#bbb' }}>
          <Tag style={{ width: 40, height: 40, margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
          <p style={{ fontSize: 14, margin: 0, fontWeight: 500 }}>
            {selectedLevel === 0
              ? 'Parent categories (L1) cannot have filtering attributes'
              : 'Leaf categories (L4) do not need attributes'}
          </p>
          <p style={{ fontSize: 12, color: '#bbb', margin: '4px 0 0' }}>
            {selectedLevel === 0 
              ? 'Select L2 or L3 level to add attributes' 
              : 'Products at this level use parent category attributes'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      title={`Category Attributes (${localAttributes.length})`}
      subtitle="Define filterable specifications for products in this category"
      action={
        <button
          type="button"
          onClick={addAttribute}
          style={{
            ...styles.primaryBtn,
            padding: '8px 16px',
            fontSize: 12,
            backgroundColor: '#2874F0'
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Add Attribute
        </button>
      }
    >
      {localAttributes.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 0', 
          border: '2px dashed #E0E0E0', 
          borderRadius: 4,
          backgroundColor: '#FAFAFA'
        }}>
          <Tag style={{ width: 32, height: 32, color: '#ccc', margin: '0 auto 10px', display: 'block' }} />
          <p style={{ fontSize: 14, color: '#888', margin: '0 0 14px', fontWeight: 500 }}>No attributes defined yet</p>
          <button
            type="button"
            onClick={addAttribute}
            style={{ ...styles.primaryBtn, margin: '0 auto' }}
          >
            <Plus className="h-4 w-4" /> Add First Attribute
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {localAttributes.map((attr, idx) => (
            <div 
              key={attr.id || idx} 
              style={{ 
                border: '1px solid #E8E8E8', 
                borderRadius: 6, 
                padding: 18,
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s'
              }}
            >
              {/* Attribute Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 14 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    backgroundColor: '#EEF3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Tag style={{ width: 14, height: 14, color: '#2874F0' }} />
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>
                      {attr.name || `Attribute ${idx + 1}`}
                    </span>
                    <span style={{ 
                      fontSize: 10, 
                      marginLeft: 8,
                      padding: '2px 8px',
                      borderRadius: 12,
                      backgroundColor: '#E8F5E9',
                      color: '#26A541',
                      fontWeight: 600
                    }}>
                      {attr.type}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttribute(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#FF6161',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 4,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFF0F0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </div>

              {/* Attribute Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <Label required>Attribute Name</Label>
                  <input
                    placeholder="e.g. Brand, Size, Color"
                    value={attr.name}
                    onChange={e => updateAttribute(idx, 'name', e.target.value)}
                    style={styles.input}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2874F0'
                      e.target.style.boxShadow = '0 0 0 3px rgba(40,116,240,0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#E0E0E0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <select
                    value={attr.type}
                    onChange={e => updateAttribute(idx, 'type', e.target.value)}
                    style={styles.select}
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean (Yes/No)</option>
                    <option value="select">Single Select</option>
                    <option value="multiselect">Multi Select</option>
                  </select>
                </div>
              </div>

              {/* Options for Select/Multiselect */}
              {(attr.type === 'select' || attr.type === 'multiselect') && (
                <div style={{ marginTop: 14 }}>
                  <Label>Options</Label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {attr.options?.map((opt, oi) => (
                      <div key={oi} style={{ display: 'flex', gap: 8 }}>
                        <input
                          placeholder={`Option ${oi + 1}`}
                          value={opt}
                          onChange={e => updateOption(idx, oi, e.target.value)}
                          style={{ ...styles.input, flex: 1, height: 38 }}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(idx, oi)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#FF6161',
                            padding: '0 8px'
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOption(idx)}
                      style={{
                        alignSelf: 'flex-start',
                        background: 'none',
                        border: '1px dashed #2874F0',
                        color: '#2874F0',
                        borderRadius: 4,
                        padding: '6px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Option
                    </button>
                  </div>
                </div>
              )}

              {/* Unit for Number type */}
              {attr.type === 'number' && (
                <div style={{ marginTop: 14, maxWidth: 300 }}>
                  <Label>Unit (optional)</Label>
                  <input
                    placeholder="e.g. cm, kg, inches, GB"
                    value={attr.unit}
                    onChange={e => updateAttribute(idx, 'unit', e.target.value)}
                    style={styles.input}
                  />
                </div>
              )}

              {/* Toggles */}
              <div style={{ 
                display: 'flex', 
                gap: 24, 
                marginTop: 14,
                padding: '10px 14px',
                backgroundColor: '#fff',
                borderRadius: 4,
                border: '1px solid #F0F0F0'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  cursor: 'pointer', 
                  fontSize: 12, 
                  color: '#333',
                  fontWeight: 500
                }}>
                  <input 
                    type="checkbox" 
                    checked={attr.required} 
                    onChange={e => updateAttribute(idx, 'required', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2874F0' }}
                  />
                  Required Field
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  cursor: 'pointer', 
                  fontSize: 12, 
                  color: '#333',
                  fontWeight: 500
                }}>
                  <input 
                    type="checkbox" 
                    checked={attr.filterable} 
                    onChange={e => updateAttribute(idx, 'filterable', e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#2874F0' }}
                  />
                  Show in Filters
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Main Edit Category Page ─────────────────────────────────────────────────
export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [categoryTree, setCategoryTree] = useState<CategoryTreeOption[]>([])
  const [iconVariations, setIconVariations] = useState<IconVariation[]>([])
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null)
  const [uploadedImage, setUploadedImage] = useState<UploadedImageData | null>(null)
  const [originalSlug, setOriginalSlug] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    reset,
    formState: { errors, isDirty }
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent: '',
      level: 0,
      icon: '📁',
      displayOrder: 0,
      isActive: true,
      isFeatured: false,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      attributes: []
    }
  })

  const formValues = watch()
  const selectedLevel = watch('level')
  const selectedParent = watch('parent')

  // ─── Fetch Category Data ─────────────────────────────────────────────────
  useEffect(() => {
    fetchCategoryData()
    fetchCategoryTree()
    fetchCategoryStats()
  }, [categoryId])

  // Track changes
  useEffect(() => {
    setHasChanges(isDirty || uploadedImage !== null)
  }, [isDirty, uploadedImage])

  const fetchCategoryData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${BASE_URL}/api/v1/categories/admin/${categoryId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      })

      if (response.data.success) {
        const category = response.data.data.category || response.data.data
        console.log('Category data:', category)
        
        // Populate form
        reset({
          name: category.name || '',
          description: category.description || '',
          parent: category.parent?._id || category.parent || '',
          level: category.level || 0,
          icon: category.icon || '📁',
          displayOrder: category.displayOrder || 0,
          isActive: category.isActive !== undefined ? category.isActive : true,
          isFeatured: category.isFeatured || false,
          metaTitle: category.meta?.title || '',
          metaDescription: category.meta?.description || '',
          metaKeywords: category.meta?.keywords?.join(', ') || '',
          attributes: category.attributes || []
        })

        setOriginalSlug(category.slug)
        
        if (category.image?.url) {
          setUploadedImage({
            url: category.image.url,
            thumbnail: category.image.thumbnail || category.image.url
          })
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch category:', error)
      toast.error('Failed to load category data', {
        description: error.response?.data?.message || 'Category not found'
      })
      router.push('/admin/categories')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategoryTree = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/categories/admin/tree-select?excludeId=${categoryId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      if (response.data.success) {
        setCategoryTree(response.data.data?.tree || [])
      }
    } catch (error) {
      console.error('Failed to fetch category tree:', error)
    }
  }

  const fetchCategoryStats = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/admin/ai-category/track/${categoryId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )
      if (response.data.success) {
        setCategoryStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  // ─── Image Upload ───────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, WebP, or SVG.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setIsUploadingImage(true)

    try {
      const base64 = await fileToBase64(file)

      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/upload/image`,
        { image: base64, folder: 'categories' },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data.success) {
        setUploadedImage({
          url: response.data.data.url,
          thumbnail: response.data.data.thumbnail,
          publicId: response.data.data.publicId
        })
        setHasChanges(true)
        toast.success('Image uploaded successfully!')
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = () => {
    setUploadedImage(null)
    setHasChanges(true)
    toast.success('Image removed')
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  // ─── AI Suggestions ────────────────────────────────────────────────────
  const generateAISuggestions = async () => {
    const name = getValues("name")
    if (!name?.trim()) {
      toast.error("Please enter a category name first")
      return
    }

    setIsGeneratingAI(true)

    try {
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/ai-category/generate`,
        {
          categoryName: name,
          parentCategory: selectedParent ? categoryTree.find(c => c.value === selectedParent)?.label : null,
          level: selectedLevel,
        },
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )

      if (response.data.success) {
        const aiData = response.data.data.data || response.data.data

        if (aiData.mainCategory) {
          if (aiData.mainCategory.description) setValue("description", aiData.mainCategory.description)
          if (aiData.mainCategory.iconSuggestion) setValue("icon", aiData.mainCategory.iconSuggestion)
          if (aiData.mainCategory.keywords?.length) setValue("metaKeywords", aiData.mainCategory.keywords.join(", "))
        }

        if (selectedLevel >= 1 && selectedLevel <= 2 && aiData.attributes?.length) {
          setValue("attributes", aiData.attributes.map((attr: any, i: number) => ({
            id: String(Date.now() + i),
            name: attr.name || '',
            type: attr.type || "text",
            required: attr.required || false,
            filterable: attr.filterable !== false,
            options: attr.options || [],
            unit: attr.unit || "",
          })))
        }

        setHasChanges(true)
        toast.success("AI suggestions applied!")
      }
    } catch (error: any) {
      toast.error("Failed to generate AI suggestions")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // ─── Generate Icon Variations ──────────────────────────────────────────
//   const generateIconVariations = async () => {
//     const name = getValues('name')
//     if (!name?.trim()) {
//       toast.error('Please enter a category name first')
//       return
//     }
    
//     setIsGeneratingIcon(true)
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/api/v1/admin/ai-category/generate-icon-variations`,
//         { categoryName: name, description: getValues('description') || '', count: 4 },
//         { headers: { 'Authorization': `Bearer ${accessToken}` } }
//       )
      
//       if (response.data.success && response.data.variations) {
//         setIconVariations(response.data.variations)
//         setShowVariationModal(true)
//         toast.success(`${response.data.variations.length} icons generated!`)
//       }
//     } catch (error: any) {
//       toast.error('Failed to generate icons')
//     } finally {
//       setIsGeneratingIcon(false)
//     }
//   }

  const generateIconVariations = async () => {
  const name = getValues('name')
  if (!name?.trim()) {
    toast.error('Please enter a category name first')
    return
  }
  
  setIsGeneratingIcon(true)
  try {
    const response = await axios.post(
      `${BASE_URL}/api/v1/admin/ai-category/generate-icon-variations`,
      { categoryName: name, description: getValues('description') || '', count: 4 },
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    )
    
    // variations live at response.data.data.variations, not response.data.variations
    const variations = response.data?.data?.variations

    if (response.data.success && variations?.length) {
      setIconVariations(variations)
      setShowVariationModal(true)
      toast.success(`${variations.length} icons generated!`)
    } else {
      toast.error('No icon variations returned')
    }
  } catch (error: any) {
    toast.error('Failed to generate icons')
  } finally {
    setIsGeneratingIcon(false)
  }
}

//   const selectIconVariation = (url: string) => {
//     setUploadedImage({ url, thumbnail: url })
//     setShowVariationModal(false)
//     setHasChanges(true)
//     toast.success('Icon applied!')
//   }

  // ─── Submit ────────────────────────────────────────────────────────────
  
  const selectIconVariation = (url: string) => {
    setValue('icon', url)      // write to the icon field, not uploadedImage
    setHasChanges(true)
    setShowVariationModal(false)
    toast.success('Icon applied!')
    }
  
  const onSubmit: SubmitHandler<EditCategoryFormValues> = async (data) => {
    if (!hasChanges) {
      toast.info('No changes to save')
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        name: data.name.trim(),
        description: data.description || '',
        parent: data.parent === 'none' || !data.parent ? null : data.parent,
        level: data.level,
        icon: data.icon || '📁',
        image: uploadedImage || undefined,
        displayOrder: data.displayOrder || 0,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        meta: {
          title: data.metaTitle || data.name.trim(),
          description: data.metaDescription || data.description || '',
          keywords: data.metaKeywords?.split(',').map(k => k.trim()).filter(Boolean) || []
        },
        attributes: (data.level >= 1 && data.level <= 2) ? data.attributes : []
      }

      console.log('Updating category:', payload)

      const response = await axios.put(
        `${BASE_URL}/api/v1/categories/${categoryId}`,
        payload,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )

      if (response.data.success) {
        toast.success('Category updated successfully!')
        setHasChanges(false)
        fetchCategoryData() // Refresh data
        fetchCategoryStats() // Refresh stats
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error('Failed to update category', {
        description: error.response?.data?.message || 'Please try again'
      })
    } finally {
      setIsSaving(false)
    }
  }

  // ─── Delete Category ───────────────────────────────────────────────────
  const handleDeleteCategory = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/v1/categories/${categoryId}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      )

      if (response.data.success) {
        toast.success('Category deleted successfully!')
        router.push('/admin/categories')
        router.refresh()
      }
    } catch (error: any) {
      toast.error('Failed to delete category', {
        description: error.response?.data?.message || 'Cannot delete this category'
      })
      setShowDeleteConfirm(false)
    }
  }

  const levelInfo = levelOptions.find(l => l.value === selectedLevel) || levelOptions[0]

  // ─── Loading State ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: '#F1F3F6', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: "'Inter', 'Roboto', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="h-10 w-10 animate-spin text-[#2874F0] mx-auto" />
          <p style={{ marginTop: 16, fontSize: 14, color: '#888', fontWeight: 500 }}>Loading category data...</p>
        </div>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ 
      backgroundColor: '#F1F3F6', 
      minHeight: '100vh', 
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ 
        backgroundColor: '#fff', 
        borderBottom: '1px solid #E0E0E0',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => router.push('/admin/categories')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              padding: 8,
              borderRadius: 4,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F5'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 16, fontWeight: 700, color: '#212121', margin: 0 }}>
                Edit Category
              </h1>
              <span style={{ 
                fontSize: 11,
                padding: '2px 10px',
                borderRadius: 12,
                backgroundColor: formValues.isActive ? '#E8F5E9' : '#FFEBEE',
                color: formValues.isActive ? '#26A541' : '#FF6161',
                fontWeight: 600
              }}>
                {formValues.isActive ? '● Active' : '● Inactive'}
              </span>
              {hasChanges && (
                <span style={{ 
                  fontSize: 11,
                  padding: '2px 10px',
                  borderRadius: 12,
                  backgroundColor: '#FFF3E0',
                  color: '#E65100',
                  fontWeight: 600
                }}>
                  Unsaved Changes
                </span>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>
              {formValues.name || 'Loading...'} • {originalSlug}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => router.push('/admin/categories')}
            style={styles.secondaryBtn}
          >
            <X className="h-4 w-4" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || !hasChanges}
            style={{
              ...styles.primaryBtn,
              backgroundColor: (isSaving || !hasChanges) ? '#B0C4DE' : '#FF9F00',
              boxShadow: (isSaving || !hasChanges) ? 'none' : '0 2px 8px rgba(255,159,0,0.4)'
            }}
          >
            {isSaving ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="h-4 w-4" /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 40px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: 16 }}>
          <Breadcrumb categoryName={formValues.name || 'Loading...'} />
        </div>

        {/* Stats Row */}
        {categoryStats && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: 14, 
            marginBottom: 20 
          }}>
            <StatCard
              icon={Package}
              label="Total Products"
              value={categoryStats.totalProducts}
              color="#2874F0"
              bg="#EEF3FF"
            />
            <StatCard
              icon={TrendingUp}
              label="Rented Products"
              value={categoryStats.rentedProducts}
              color="#26A541"
              bg="#E8F5E9"
            />
            <StatCard
              icon={BarChart3}
              label="Rent Rate"
              value={`${categoryStats.rentRate}%`}
              color="#FF9F00"
              bg="#FFF8E1"
              trend={Number(categoryStats.rentRate) > 50 ? '+High' : undefined}
            />
            <StatCard
              icon={Layers}
              label="Level"
              value={levelInfo.label}
              color="#9C27B0"
              bg="#F3E5F5"
            />
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: 4, 
          marginBottom: 16,
          border: '1px solid #E0E0E0',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex' }}>
            {[
              { id: 'basic', label: 'Basic Information', icon: FileText },
              { id: 'seo', label: 'SEO & Meta', icon: Globe },
              { id: 'attributes', label: 'Attributes', icon: Tag },
              { id: 'media', label: 'Image & Icon', icon: ImagePlus }
            ].map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '14px 24px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? '#2874F0' : '#666',
                    borderBottom: active ? '2px solid #2874F0' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                    fontFamily: "'Inter', 'Roboto', sans-serif"
                  }}
                >
                  <Icon className="h-4 w-4" /> {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab Content ───────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>
          
          {/* Left Column - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* BASIC INFO TAB */}
            {activeTab === 'basic' && (
              <>
                {/* Category Name & Details */}
                <Card title="Category Details" subtitle="Core information about this category">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                    <div>
                      <Label required>Category Name</Label>
                      <div style={{ position: 'relative' }}>
                        <input
                          placeholder="e.g. Smartphones, Sofas"
                          {...register('name')}
                          style={styles.input}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#2874F0'
                            e.target.style.boxShadow = '0 0 0 3px rgba(40,116,240,0.1)'
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#E0E0E0'
                            e.target.style.boxShadow = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={generateAISuggestions}
                          disabled={isGeneratingAI}
                          style={{
                            position: 'absolute',
                            right: 6,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                            border: 'none',
                            borderRadius: 4,
                            padding: '5px 12px',
                            fontSize: 11,
                            color: '#fff',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            transition: 'all 0.2s'
                          }}
                        >
                          {isGeneratingAI ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          AI Fill
                        </button>
                      </div>
                      {errors.name && (
                        <p style={{ color: '#FF6161', fontSize: 11, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <AlertCircle className="h-3 w-3" /> {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <input
                        value={originalSlug}
                        disabled
                        style={{ ...styles.input, backgroundColor: '#F5F5F5', color: '#888' }}
                      />
                      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Auto-generated from name</p>
                    </div>
                    <div>
                      <Label>Display Order</Label>
                      <input
                        type="number"
                        {...register('displayOrder', { valueAsNumber: true })}
                        style={styles.input}
                      />
                      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Lower numbers appear first</p>
                    </div>
                    <div>
                      <Label required>Level</Label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {levelOptions.map(level => {
                          const Icon = level.icon
                          const selected = selectedLevel === level.value
                          return (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => {
                                setValue('level', level.value)
                                setValue('parent', '')
                                if (level.value === 0 || level.value >= 3) {
                                  setValue('attributes', [])
                                }
                                setHasChanges(true)
                              }}
                              style={{
                                flex: 1,
                                padding: '8px 6px',
                                borderRadius: 4,
                                border: `2px solid ${selected ? level.color : '#E0E0E0'}`,
                                backgroundColor: selected ? level.bg : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.15s'
                              }}
                            >
                              <Icon style={{ 
                                width: 14, 
                                height: 14, 
                                color: selected ? level.color : '#888',
                                display: 'block',
                                margin: '0 auto 4px'
                              }} />
                              <p style={{ 
                                fontSize: 10, 
                                fontWeight: 700, 
                                color: selected ? level.color : '#666',
                                margin: 0,
                                textAlign: 'center'
                              }}>
                                {level.label}
                              </p>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: 18 }}>
                    <Label>Parent Category</Label>
                    <select
                      value={selectedParent || ''}
                      onChange={e => {
                        setValue('parent', e.target.value)
                        setHasChanges(true)
                      }}
                      style={styles.select}
                    >
                      <option value="">None (Root Level)</option>
                      <option value="none">Remove Parent</option>
                      {categoryTree.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <Label>Description</Label>
                    <textarea
                      placeholder="Describe what products belong in this category..."
                      rows={4}
                      {...register('description')}
                      style={styles.textarea}
                    />
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#888', marginTop: 4 }}>
                      {formValues.description?.length || 0}/500
                    </div>
                  </div>
                </Card>

                {/* Visibility Settings */}
                <Card title="Visibility & Status">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#FAFAFA',
                      borderRadius: 6,
                      border: '1px solid #F0F0F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {formValues.isActive ? (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            backgroundColor: '#E8F5E9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Eye style={{ width: 20, height: 20, color: '#26A541' }} />
                          </div>
                        ) : (
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            backgroundColor: '#FFEBEE',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <EyeOff style={{ width: 20, height: 20, color: '#FF6161' }} />
                          </div>
                        )}
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#212121' }}>Active Status</p>
                          <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>
                            {formValues.isActive ? 'Visible to customers' : 'Hidden from store'}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={formValues.isActive} 
                        onCheckedChange={v => { setValue('isActive', v); setHasChanges(true) }} 
                      />
                    </div>

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      backgroundColor: '#FAFAFA',
                      borderRadius: 6,
                      border: '1px solid #F0F0F0'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: formValues.isFeatured ? '#FFF8E1' : '#F5F5F5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Star style={{ 
                            width: 20, 
                            height: 20, 
                            color: formValues.isFeatured ? '#FF9F00' : '#ccc',
                            fill: formValues.isFeatured ? '#FF9F00' : 'none'
                          }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, margin: 0, color: '#212121' }}>Featured Category</p>
                          <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>
                            {formValues.isFeatured ? 'Shown on homepage' : 'Not featured'}
                          </p>
                        </div>
                      </div>
                      <Switch 
                        checked={formValues.isFeatured} 
                        onCheckedChange={v => { setValue('isFeatured', v); setHasChanges(true) }} 
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* SEO TAB */}
            {activeTab === 'seo' && (
              <Card title="SEO & Metadata" subtitle="Optimize for search engines">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <Label>Meta Title</Label>
                    <input
                      placeholder="SEO title (max 60 chars)"
                      {...register('metaTitle')}
                      style={styles.input}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>Include primary keyword</span>
                      <span style={{ 
                        fontSize: 11, 
                        color: (formValues.metaTitle?.length || 0) > 55 ? '#FF6161' : '#888',
                        fontWeight: (formValues.metaTitle?.length || 0) > 55 ? 600 : 400
                      }}>
                        {formValues.metaTitle?.length || 0}/60
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <textarea
                      placeholder="Compelling description for search results (max 160 chars)"
                      rows={3}
                      {...register('metaDescription')}
                      style={styles.textarea}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>Be specific and persuasive</span>
                      <span style={{ 
                        fontSize: 11,
                        color: (formValues.metaDescription?.length || 0) > 150 ? '#FF6161' : '#888',
                        fontWeight: (formValues.metaDescription?.length || 0) > 150 ? 600 : 400
                      }}>
                        {formValues.metaDescription?.length || 0}/160
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Meta Keywords</Label>
                    <input
                      placeholder="smartphones, mobiles, android, apple (comma-separated)"
                      {...register('metaKeywords')}
                      style={styles.input}
                    />
                    <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Separate keywords with commas</p>
                  </div>

                  {/* Google Preview */}
                  <div style={{ 
                    backgroundColor: '#fff', 
                    borderRadius: 6, 
                    border: '1px solid #E0E0E0', 
                    padding: 18,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
                  }}>
                    <p style={{ 
                      fontSize: 10, 
                      fontWeight: 700, 
                      color: '#666', 
                      marginBottom: 12, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em' 
                    }}>
                      Google Search Preview
                    </p>
                    <p style={{ 
                      fontSize: 16, 
                      color: '#1A0DAB', 
                      margin: '0 0 3px', 
                      fontWeight: 400,
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {formValues.metaTitle || formValues.name || 'Category Title'}
                    </p>
                    <p style={{ 
                      fontSize: 13, 
                      color: '#006621', 
                      margin: '0 0 4px',
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      https://yourstore.com/category/{originalSlug || 'category'}
                    </p>
                    <p style={{ 
                      fontSize: 14, 
                      color: '#545454', 
                      margin: 0, 
                      lineHeight: 1.5,
                      fontFamily: 'Arial, sans-serif'
                    }}>
                      {formValues.metaDescription || 'Add a meta description to preview how your category will appear in search results.'}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* ATTRIBUTES TAB */}
            {activeTab === 'attributes' && (
              <AttributesSection
                attributes={formValues.attributes || []}
                onChange={(attrs) => {
                  setValue('attributes', attrs as any)
                  setHasChanges(true)
                }}
                disabled={selectedLevel === 0 || selectedLevel >= 3}
                selectedLevel={selectedLevel}
              />
            )}

            {/* MEDIA TAB */}
            {activeTab === 'media' && (
              <>
                <Card title="Category Image" subtitle="Upload a representative image">
                  <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                    <div
                      onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                      style={{
                        width: 200,
                        height: 200,
                        borderRadius: 8,
                        border: '2px dashed #E0E0E0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        backgroundColor: '#FAFAFA',
                        cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isUploadingImage) {
                          e.currentTarget.style.borderColor = '#2874F0'
                          e.currentTarget.style.backgroundColor = '#F0F7FF'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E0E0E0'
                        e.currentTarget.style.backgroundColor = '#FAFAFA'
                      }}
                    >
                      {isUploadingImage ? (
                        <div style={{ textAlign: 'center' }}>
                          <Loader2 className="h-8 w-8 animate-spin text-[#2874F0] mx-auto" />
                          <p style={{ fontSize: 11, color: '#888', marginTop: 8 }}>Uploading...</p>
                        </div>
                      ) : uploadedImage?.url ? (
                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                          <img 
                            src={uploadedImage.url} 
                            alt="Category" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleRemoveImage() }}
                            style={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              backgroundColor: 'rgba(255,255,255,0.95)',
                              border: 'none',
                              borderRadius: 4,
                              padding: 5,
                              cursor: 'pointer',
                              display: 'flex',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-[#FF6161]" />
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                          <Upload className="h-10 w-10 text-[#ccc] mx-auto mb-2" />
                          <p style={{ fontSize: 13, color: '#888', margin: 0, fontWeight: 500 }}>Click to upload</p>
                          <p style={{ fontSize: 11, color: '#bbb', margin: '4px 0 0' }}>JPG, PNG, WebP or SVG</p>
                          <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>Max 5MB</p>
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Label>Upload Category Image</Label>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        style={{
                          ...styles.primaryBtn,
                          width: '100%',
                          justifyContent: 'center',
                          marginTop: 6,
                          backgroundColor: isUploadingImage ? '#B0C4DE' : '#2874F0'
                        }}
                      >
                        {isUploadingImage ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="h-4 w-4" /> Choose Image</>
                        )}
                      </button>
                      <div style={{ 
                        backgroundColor: '#F0F7FF', 
                        border: '1px solid #B3D4FF', 
                        borderRadius: 6, 
                        padding: '12px 14px',
                        marginTop: 12
                      }}>
                        <p style={{ fontSize: 11, color: '#0D47A1', margin: 0, fontWeight: 600 }}>
                          💡 Image Guidelines
                        </p>
                        <ul style={{ margin: '6px 0 0', paddingLeft: 16, fontSize: 11, color: '#1565C0' }}>
                          <li>Square format (1:1 ratio) recommended</li>
                          <li>Minimum 200×200 pixels</li>
                          <li>Clear, professional product imagery</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Category Icon" subtitle="Emoji icon for navigation">
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* <div style={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: 8, 
                      border: '2px dashed #E0E0E0', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      flexShrink: 0, 
                      overflow: 'hidden', 
                      backgroundColor: '#FAFAFA',
                      fontSize: 36
                    }}>
                      {formValues.icon || '📁'}
                    </div> */}

                    <div style={{ 
                        width: 80, height: 80, borderRadius: 8, 
                        border: '2px dashed #E0E0E0', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', 
                        flexShrink: 0, overflow: 'hidden', backgroundColor: '#FAFAFA',
                        fontSize: 36
                      }}>
                        {formValues.icon?.startsWith('data:') || formValues.icon?.startsWith('http') ? (
                          <img 
                            src={formValues.icon} 
                            alt="Category icon" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          formValues.icon || '📁'
                        )}
                      </div>
                    <div style={{ flex: 1 }}>
                      <Label>Emoji Icon</Label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          placeholder="e.g. 📱 🛋️ 🔌"
                          {...register('icon')}
                          style={{ ...styles.input, flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const randomEmoji = QUICK_EMOJIS[Math.floor(Math.random() * QUICK_EMOJIS.length)]
                            setValue('icon', randomEmoji)
                            setHasChanges(true)
                          }}
                          style={{
                            backgroundColor: '#EEF3FF',
                            color: '#2874F0',
                            border: '1px solid #B3D4FF',
                            borderRadius: 4,
                            padding: '8px 12px',
                            fontSize: 18,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Random emoji"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={generateIconVariations}
                          disabled={isGeneratingIcon}
                          style={{
                            ...styles.primaryBtn,
                            flex: 1,
                            justifyContent: 'center',
                            backgroundColor: isGeneratingIcon ? '#B0C4DE' : '#2874F0'
                          }}
                        >
                          {isGeneratingIcon ? (
                            <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating...</>
                          ) : (
                            <><Sparkles className="h-3.5 w-3.5" /> Generate AI Icon</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {/* Danger Zone */}
            <Card title="Danger Zone" subtitle="Irreversible actions">
              <div style={{ 
                padding: '16px 20px',
                backgroundColor: '#FFF5F5',
                borderRadius: 6,
                border: '1px solid #FFCDD2'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <AlertTriangle style={{ width: 20, height: 20, color: '#FF6161', flexShrink: 0, marginTop: 1 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#C62828', margin: 0 }}>Delete this category</p>
                    <p style={{ fontSize: 12, color: '#D32F2F', margin: '4px 0 12px', lineHeight: 1.5 }}>
                      This action cannot be undone. All subcategories and associated data will be affected.
                      {categoryStats && categoryStats.totalProducts > 0 && (
                        <span style={{ display: 'block', marginTop: 4, fontWeight: 600 }}>
                          ⚠️ This category contains {categoryStats.totalProducts} products!
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      style={styles.dangerBtn}
                    >
                      <Trash2 className="h-4 w-4" /> Delete Category
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            
            {/* Category Info */}
            <div style={{ ...styles.card }}>
              <div style={{ 
                backgroundColor: '#2874F0', 
                padding: '14px 18px',
                color: '#fff'
              }}>
                <p style={{ fontSize: 12, fontWeight: 700, margin: 0, opacity: 0.9 }}>Category Info</p>
              </div>
              <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>ID</span>
                    <span style={{ color: '#212121', fontWeight: 500, fontFamily: 'monospace' }}>
                      {categoryId?.slice(-8)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Slug</span>
                    <span style={{ color: '#2874F0', fontWeight: 500 }}>{originalSlug}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Level</span>
                    <span style={{
                      padding: '2px 10px',
                      borderRadius: 12,
                      backgroundColor: levelInfo.bg,
                      color: levelInfo.color,
                      fontWeight: 600,
                      fontSize: 11
                    }}>
                      {levelInfo.label} - {levelInfo.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Products</span>
                    <span style={{ color: '#212121', fontWeight: 600 }}>
                      {categoryStats?.totalProducts || 0}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#888' }}>Rent Rate</span>
                    <span style={{ 
                      color: Number(categoryStats?.rentRate) > 50 ? '#26A541' : '#FF9F00',
                      fontWeight: 600
                    }}>
                      {categoryStats?.rentRate || 0}%
                    </span>
                  </div>
                  {categoryStats?.isLeaf && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#FFF8E1',
                      borderRadius: 4,
                      border: '1px solid #FFD54F'
                    }}>
                      <p style={{ fontSize: 11, color: '#E65100', margin: 0, fontWeight: 600 }}>
                        🍃 This is a leaf category
                      </p>
                      <p style={{ fontSize: 10, color: '#BF360C', margin: '2px 0 0' }}>
                        Products are directly assigned here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ ...styles.card }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0 }}>Quick Actions</p>
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => window.open(`/category/${originalSlug}`, '_blank')}
                    style={{
                      ...styles.secondaryBtn,
                      width: '100%',
                      justifyContent: 'center',
                      padding: '8px 0',
                      fontSize: 12
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View on Store
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(originalSlug)}
                    style={{
                      ...styles.secondaryBtn,
                      width: '100%',
                      justifyContent: 'center',
                      padding: '8px 0',
                      fontSize: 12
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy Slug
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/categories/${categoryId}`)}
                    style={{
                      ...styles.secondaryBtn,
                      width: '100%',
                      justifyContent: 'center',
                      padding: '8px 0',
                      fontSize: 12
                    }}
                  >
                    <BarChart3 className="h-3.5 w-3.5" /> View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ 
              backgroundColor: '#FFF8E1', 
              borderRadius: 4, 
              border: '1px solid #FFD54F', 
              padding: 14 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Zap style={{ width: 14, height: 14, color: '#FF9F00' }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#E65100', margin: 0 }}>Editing Tips</p>
              </div>
              {[
                'Changing the name regenerates the slug',
                'L2-L3 categories support filter attributes',
                'Leaf categories (L4) cannot have attributes',
                'Save changes before navigating away'
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#FF9F00', flexShrink: 0 }}>•</span>
                  <p style={{ fontSize: 11, color: '#BF360C', margin: 0, lineHeight: 1.4 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Delete Confirmation Modal ───────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 200, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 16 
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                backgroundColor: '#fff', 
                borderRadius: 8, 
                padding: 28, 
                maxWidth: 440, 
                width: '100%', 
                boxShadow: '0 8px 40px rgba(0,0,0,0.2)' 
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#FFEBEE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <AlertTriangle style={{ width: 28, height: 28, color: '#FF6161' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#212121', margin: '0 0 8px' }}>
                  Delete Category?
                </h3>
                <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.5 }}>
                  Are you sure you want to delete <strong>"{formValues.name}"</strong>? 
                  This action cannot be undone and may affect subcategories and products.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{ ...styles.secondaryBtn, flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  style={{
                    ...styles.dangerBtn,
                    flex: 1,
                    justifyContent: 'center',
                    backgroundColor: '#FF6161',
                    color: '#fff',
                    border: 'none'
                  }}
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Icon Variation Modal ────────────────────────── */}
      <AnimatePresence>
        {/* {showVariationModal && iconVariations.length > 0 && (
          <div style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 200, 
            backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: 16 
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ 
                backgroundColor: '#fff', 
                borderRadius: 8, 
                padding: 24, 
                maxWidth: 520, 
                width: '100%', 
                boxShadow: '0 8px 40px rgba(0,0,0,0.2)' 
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#212121' }}>Choose an Icon</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Select the best icon for this category</p>
                </div>
                <button onClick={() => setShowVariationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {iconVariations.map((icon, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectIconVariation(icon.url)}
                    style={{
                      padding: 8,
                      borderRadius: 6,
                      border: '2px solid #E0E0E0',
                      background: '#FAFAFA',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2874F0')}
                    onMouseOut={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                  >
                    <img src={icon.url} alt={`Icon ${idx + 1}`} style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 4 }} />
                    <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0', textAlign: 'center' }}>Variant {idx + 1}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )} */}

        {showVariationModal && iconVariations.length > 0 && (
  <div style={{ 
    position: 'fixed', 
    inset: 0, 
    zIndex: 200, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 16 
  }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ 
        backgroundColor: '#fff', 
        borderRadius: 8, 
        padding: 24, 
        maxWidth: 520, 
        width: '100%', 
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#212121' }}>Choose an Icon</p>
          <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Select the best icon for this category</p>
        </div>
        <button
          type="button"
          onClick={() => setShowVariationModal(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {iconVariations
          .filter(icon => icon.success && icon.url)
          .map((icon, idx) => (
            <button
              key={icon.color || idx}
              type="button"
              onClick={() => selectIconVariation(icon.url)}
              style={{
                padding: 8,
                borderRadius: 6,
                border: '2px solid #E0E0E0',
                background: '#FAFAFA',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#2874F0')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
            >
              <div style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 4,
                overflow: 'hidden',
                backgroundColor: icon.color || '#F5F5F5'
              }}>
                <img
                  src={icon.thumbnail || icon.url}
                  alt={`Icon variant ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0', textAlign: 'center' }}>
                Variant {idx + 1}
              </p>
            </button>
          ))}
      </div>
    </motion.div>
  </div>
)}
      </AnimatePresence>
    </div>
  )
}