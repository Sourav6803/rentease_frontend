

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, X, Plus, Trash2, Sparkles, Loader2,
  FolderTree, Tag, FileText, Eye, EyeOff,
  AlertCircle, CheckCircle, Info, Layers, GitBranch,
  Image as ImageIcon, Star, Zap, Globe, ChevronRight
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import { useSession } from 'next-auth/react'

const categorySchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name cannot exceed 50 characters'),
  description: z.string().max(500).optional().default(''),
  parent: z.string().optional().default(''),
  level: z.number().int().min(0).max(3).default(0),
  icon: z.string().optional().default('📁'),
  iconUrl: z.string().optional().default(''),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  metaTitle: z.string().max(60).optional().default(''),
  metaDescription: z.string().max(160).optional().default(''),
  metaKeywords: z.string().optional().default(''),
  attributes: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    type: z.enum(['text', 'number', 'boolean', 'select', 'multiselect']),
    required: z.boolean(),
    filterable: z.boolean(),
    options: z.array(z.string()).optional().default([]),
    unit: z.string().optional().default('')
  })).default([])
})

type CategoryFormValues = {
  name: string
  description: string
  parent: string
  level: number
  icon: string
  iconUrl: string
  displayOrder: number
  isActive: boolean
  isFeatured: boolean
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  attributes: Array<{
    id?: string
    name: string
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect'
    required: boolean
    filterable: boolean
    options: string[]
    unit: string
  }>
}

interface Category {
  _id: string
  name: string
  slug: string
  level?: number
  children?: Category[]
}

interface IconVariation {
  url: string
  thumbnail: string
  metadata: { category: string; generatedBy: string; timestamp: string }
}

const levelOptions = [
  {
    value: 0,
    label: 'L1',
    name: 'Parent Category',
    description: 'Top-level, can have children',
    icon: FolderTree,
    color: '#2874F0',
    bg: '#E8F0FE',
    example: 'e.g. Electronics'
  },
  {
    value: 1,
    label: 'L2',
    name: 'Subcategory',
    description: 'Second-level with parent',
    icon: Layers,
    color: '#FF6161',
    bg: '#FFF0F0',
    example: 'e.g. Mobiles'
  },
  {
    value: 2,
    label: 'L3',
    name: 'Sub-subcategory',
    description: 'Third-level category',
    icon: GitBranch,
    color: '#FF9F00',
    bg: '#FFF5E5',
    example: 'e.g. Smartphones'
  },
  {
    value: 3,
    label: 'L4',
    name: 'Leaf Category',
    description: 'Final level, holds products',
    icon: Tag,
    color: '#26A541',
    bg: '#E8F5EB',
    example: 'e.g. Android Phones'
  }
]

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Flipkart-style breadcrumb ──────────────────────────────────────────────
function Breadcrumb({ activeTab }: { activeTab: string }) {
  const steps = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'seo', label: 'SEO' },
    { id: 'attributes', label: 'Attributes' }
  ]
  return (
    <div className="flex items-center gap-1 text-xs text-[#878787]">
      <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">Categories</span>
      <ChevronRight className="h-3 w-3" />
      <span className="text-[#2874F0] font-medium cursor-pointer hover:underline">Add New</span>
      <ChevronRight className="h-3 w-3" />
      <span className="font-semibold text-[#212121]">
        {steps.find(s => s.id === activeTab)?.label}
      </span>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AddCategoryPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [isGeneratingIcon, setIsGeneratingIcon] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [iconVariations, setIconVariations] = useState<IconVariation[]>([])
  const [showVariationModal, setShowVariationModal] = useState(false)
  const [isLoadingTree, setIsLoadingTree] = useState(true)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiProgress, setAiProgress] = useState(0)
  const [activeTab, setActiveTab] = useState('basic')
  const toast = useToast()

  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors }
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      parent: '',
      level: 0,
      icon: '📁',
      iconUrl: '',
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
  const isActive = watch('isActive')
  const isFeatured = watch('isFeatured')
  const currentIcon = watch('icon')
  const currentIconUrl = watch('iconUrl')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
        if (response.data.success) {
          setCategories(Array.isArray(response.data?.data?.categories) ? response.data.data.categories : [])
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setIsLoadingTree(false)
      }
    }
    fetchCategories()
  }, [toast])

  const getParentOptions = useCallback(() => {
    console.log("selected level:", selectedLevel)
    if (selectedLevel === 0) return []
    const getParents = (items: Category[], targetLevel: number, currentLevel: number = 0): Category[] => {
      let results: Category[] = []
      for (const item of items) {
        if (currentLevel === targetLevel - 1) results.push(item)
        if (item.children?.length) results = [...results, ...getParents(item.children, targetLevel, currentLevel + 1)]
      }
      return results
    }
    return getParents(categories, selectedLevel)
  }, [categories, selectedLevel])

  // const generateAISuggestions = async () => {
  //   const name = getValues('name')
  //   if (!name?.trim()) { toast.error('Please enter a category name first'); return }
  //   setIsGeneratingAI(true); setShowAIPanel(true); setAiProgress(10)
  //   try {
  //     setAiProgress(30)
  //     const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/generate`, {
  //       categoryName: name,
  //       parentCategory: selectedParent ? categories.find(c => c._id === selectedParent)?.name : null
  //     })
  //     setAiProgress(80)
  //     if (response.data.success && response.data.data) {
  //       const aiData = response.data.data.data
  //       if (aiData.mainCategory) {
  //         if (aiData.mainCategory.description) setValue('description', aiData.mainCategory.description)
  //         if (aiData.mainCategory.iconSuggestion) setValue('icon', aiData.mainCategory.iconSuggestion)
  //         if (aiData.mainCategory.keywords?.length) setValue('metaKeywords', aiData.mainCategory.keywords.join(', '))
  //       }
  //       if (aiData.suggestedAttributes?.length && selectedLevel > 0 && selectedLevel < 2) {
  //         setValue('attributes', aiData.suggestedAttributes.map((attr: any, i: number) => ({
  //           id: String(Date.now() + i), name: attr.name, type: attr.type || 'text',
  //           required: attr.required || false, filterable: attr.filterable || false,
  //           options: attr.options || [], unit: attr.unit || ''
  //         })))
  //       }
  //       setAiProgress(100)
  //       toast.success('AI suggestions generated!')
  //     }
  //   } catch (error: any) {
  //     toast.error('Failed to generate AI suggestions', { description: error.response?.data?.message || 'Please try again' })
  //   } finally {
  //     setIsGeneratingAI(false)
  //     setTimeout(() => setAiProgress(0), 2000)
  //   }
  // }

  const generateAISuggestions = async () => {
    const name = getValues("name");
    const currentLevel = getValues("level"); // Get current level
    const parentId = getValues("parent");

    if (!name?.trim()) {
      toast.error("Please enter a category name first");
      return;
    }

    setIsGeneratingAI(true);
    setShowAIPanel(true);
    setAiProgress(10);

    try {
      setAiProgress(30);

      // Get parent category name if parent is selected
      let parentCategoryName = null;
      if (parentId && parentId !== "none") {
        const parentCategory = categories.find((c) => c._id === parentId);
        parentCategoryName = parentCategory?.name;
      }

      // Pass level to the API
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/ai-category/generate`,
        {
          categoryName: name,
          parentCategory: parentCategoryName,
          level: currentLevel, // ← ADD THIS LINE
        },
      );

      setAiProgress(80);

      if (response.data.success && response.data.data) {
        const aiData = response.data.data.data;
        if (aiData.mainCategory) {
          if (aiData.mainCategory.description)
            setValue("description", aiData.mainCategory.description);
          if (aiData.mainCategory.iconSuggestion)
            setValue("icon", aiData.mainCategory.iconSuggestion);
          if (aiData.mainCategory.keywords?.length)
            setValue("metaKeywords", aiData.mainCategory.keywords.join(", "));
        }

        // Only add attributes for non-leaf levels (L2 or L3)
        if (
          currentLevel >= 1 &&
          currentLevel <= 2 &&
          aiData.suggestedAttributes?.length
        ) {
          setValue(
            "attributes",
            aiData.suggestedAttributes.map((attr: any, i: number) => ({
              id: String(Date.now() + i),
              name: attr.name,
              type: attr.type || "text",
              required: attr.required || false,
              filterable: attr.filterable || false,
              options: attr.options || [],
              unit: attr.unit || "",
            })),
          );
        }

        setAiProgress(100);
        toast.success("AI suggestions generated!");
      }
    } catch (error: any) {
      toast.error("Failed to generate AI suggestions", {
        description: error.response?.data?.message || "Please try again",
      });
    } finally {
      setIsGeneratingAI(false);
      setTimeout(() => setAiProgress(0), 2000);
    }
  };

  const generateIconVariations = async () => {
    const name = getValues('name')
    if (!name?.trim()) { toast.error('Please enter a category name first'); return }
    setIsGeneratingIcon(true)
    try {
      const response = await axios.post(`${BASE_URL}/api/v1/admin/ai-category/generate-icon-variations`, {
        categoryName: name, description: getValues('description') || '', count: 4
      })
      if (response.data.success && response.data.variations) {
        setIconVariations(response.data.variations)
        setShowVariationModal(true)
        toast.success(`${response.data.variations.length} icons generated!`)
      } else toast.error('Failed to generate icons')
    } catch (error: any) {
      toast.error('Failed to generate icons', { description: error.response?.data?.message || 'Please try again' })
    } finally {
      setIsGeneratingIcon(false)
    }
  }

  const selectVariation = (url: string) => { setValue('iconUrl', url); setShowVariationModal(false); toast.success('Icon selected!') }

  const onSubmit: SubmitHandler<any> = async (data: any) => {
    setIsLoading(true)
    try {
      const payload = {
        name: data.name, description: data.description,
        parent: data.parent === 'none' || !data.parent ? null : data.parent,
        level: data.level, icon: data.icon, iconUrl: data.iconUrl,
        displayOrder: data.displayOrder, isActive: data.isActive, isFeatured: data.isFeatured,
        meta: {
          title: data.metaTitle, description: data.metaDescription,
          keywords: data.metaKeywords?.split(',').map((k: any) => k.trim()).filter(Boolean)
        },
        attributes: data.level < 2 ? data.attributes : []
      }
      const response = await axios.post(`${BASE_URL}/api/v1/categories`, payload ,  {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (response.data.success) {
        toast.success('Category created successfully!')
        router.push('/admin/categories'); router.refresh()
      }
    } catch (error: any) {
      toast.error('Failed to create category', { description: error.response?.data?.message || 'Please try again' })
    } finally {
      setIsLoading(false)
    }
  }

  const levelInfo = levelOptions.find(l => l.value === selectedLevel) || levelOptions[0]

  return (
    /* 
      KEY FIX: Remove min-h-screen overflow issues.
      Use a plain div wrapper — no overflow hidden, no nested scroll areas.
      The page itself scrolls naturally via the browser.
    */
    <div style={{ backgroundColor: '#F1F3F6', minHeight: '100vh', fontFamily: "'Roboto', sans-serif" }}>

      {/* ── Top header bar (Flipkart blue) ─────────────────────────────────── */}
      <div style={{ backgroundColor: '#2874F0',  padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',  boxShadow: '0 2px 8px rgba(40,116,240,0.4)' }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FolderTree className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">Add New Category</div>
            <div className="text-blue-200 text-xs">Flipkart Seller Hub</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.back()}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 4, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            style={{ backgroundColor: '#FF9F00', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 6px rgba(255,159,0,0.5)' }}
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Category
          </button>
        </div>
      </div>

      {/* ── Content wrapper ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px 40px' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: 12 }}>
          <Breadcrumb activeTab={activeTab} />
        </div>

        {/* AI banner */}
        <AnimatePresence>
          {showAIPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E7FF', marginBottom: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <Sparkles className="h-4 w-4 text-[#2874F0] shrink-0" />
              <div className="flex-1">
                {aiProgress > 0 && aiProgress < 100 ? (
                  <div>
                    <div className="flex justify-between text-xs text-[#666] mb-1">
                      <span>Generating AI suggestions…</span>
                      <span className="text-[#2874F0] font-semibold">{aiProgress}%</span>
                    </div>
                    <Progress value={aiProgress} className="h-1.5" />
                  </div>
                ) : aiProgress === 100 ? (
                  <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                    <CheckCircle className="h-3.5 w-3.5" /> AI suggestions applied to the form!
                  </div>
                ) : <span className="text-xs text-[#666]">AI Assistant is ready</span>}
              </div>
              <button onClick={() => setShowAIPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}>
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main 2-col grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}>

          {/* ── LEFT column ─────────────────────────────────────────────────── */}
          <div>
            {/* Tab nav */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, marginBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                {[
                  { id: 'basic', label: 'Basic Details', icon: FileText },
                  { id: 'seo', label: 'SEO & Meta', icon: Globe },
                  { id: 'attributes', label: 'Attributes', icon: Tag }
                ].map(tab => {
                  const Icon = tab.icon
                  const active = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      style={{
                        padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
                        fontSize: 13, fontWeight: active ? 700 : 500,
                        color: active ? '#2874F0' : '#666',
                        borderBottom: active ? '2px solid #2874F0' : '2px solid transparent',
                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
                      }}
                    >
                      <Icon className="h-3.5 w-3.5" /> {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── BASIC TAB ────────────────────────────────────────────────── */}
            {activeTab === 'basic' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

                {/* Card: Category Level — FIXED layout */}
                <FKCard title="Category Hierarchy" subtitle="Define the level and parent of this category">
                  <FKLabel required>Select Level</FKLabel>
                  {/* Grid for level cards — NO overflow, fixed height */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
                    {levelOptions.map(level => {
                      const Icon = level.icon
                      const isSelected = selectedLevel === level.value
                      return (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => {
                            setValue('level', level.value)
                            // Reset parent when level changes
                            setValue('parent', '')
                            if (level.value === 0 || level.value >= 3) {
                              setValue('attributes', [])
                            }
                          }}
                          style={{
                            padding: '12px 8px',
                            borderRadius: 4,
                            border: `2px solid ${isSelected ? level.color : '#E0E0E0'}`,
                            backgroundColor: isSelected ? level.bg : '#FAFAFA',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            minWidth: 0 // prevent overflow
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Icon style={{ width: 16, height: 16, color: isSelected ? level.color : '#888', flexShrink: 0 }} />
                            <span style={{ fontSize: 10, fontWeight: 700, color: isSelected ? level.color : '#bbb', backgroundColor: isSelected ? level.bg : '#F0F0F0', padding: '1px 6px', borderRadius: 20 }}>
                              {level.label}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: isSelected ? level.color : '#333', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {level.name}
                          </p>
                          <p style={{ fontSize: 10, color: '#888', margin: 0, lineHeight: 1.3 }}>
                            {level.description}
                          </p>
                          <p style={{ fontSize: 10, color: '#aaa', margin: 0, fontStyle: 'italic' }}>
                            {level.example}
                          </p>
                        </button>
                      )
                    })}
                  </div>

                  {/* Parent picker — only show when level > 0 */}
                  {selectedLevel > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <FKLabel required>Parent Category</FKLabel>
                      <select
                        value={selectedParent || ''}
                        onChange={e => setValue('parent', e.target.value)}
                        style={{ ...inputStyle, marginTop: 6 }}
                      >
                        <option value="">Select parent category</option>
                        <option value="none">None (Root Level)</option>
                        {!isLoadingTree && getParentOptions().map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Leaf notice */}
                  {selectedLevel >= 2 && (
                    <div style={{ marginTop: 14, backgroundColor: '#FFF8E1', border: '1px solid #FFD54F', borderRadius: 4, padding: '10px 14px', display: 'flex', gap: 10 }}>
                      <Info style={{ width: 14, height: 14, color: '#FF9F00', flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#E65100', margin: 0 }}>Leaf Category</p>
                        <p style={{ fontSize: 11, color: '#BF360C', margin: '2px 0 0', lineHeight: 1.4 }}>
                          Products are assigned directly to leaf categories. No further subcategories can be created here.
                        </p>
                      </div>
                    </div>
                  )}
                </FKCard>

                {/* Card: Basic Info */}
                <FKCard title="Basic Information" subtitle="Core details for the category">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <FKLabel required>Category Name</FKLabel>
                      <div style={{ position: 'relative', marginTop: 6 }}>
                        <input
                          placeholder="e.g. Electronics, Furniture"
                          {...register('name')}
                          style={inputStyle}
                        />
                        <button
                          type="button"
                          onClick={generateAISuggestions}
                          disabled={isGeneratingAI}
                          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: '#EEF3FF', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 11, color: '#2874F0', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {isGeneratingAI ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
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
                      <FKLabel>Display Order</FKLabel>
                      <input
                        type="number"
                        {...register('displayOrder', { valueAsNumber: true })}
                        style={{ ...inputStyle, marginTop: 6 }}
                      />
                      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Lower numbers appear first</p>
                    </div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <FKLabel>Description</FKLabel>
                    <textarea
                      placeholder="Describe what products belong in this category…"
                      rows={3}
                      {...register('description')}
                      style={{ ...inputStyle, marginTop: 6, height: 'auto', resize: 'vertical', paddingTop: 10, paddingBottom: 10, lineHeight: 1.5 }}
                    />
                    <div style={{ textAlign: 'right', fontSize: 11, color: '#888', marginTop: 2 }}>
                      {formValues.description?.length || 0}/500
                    </div>
                  </div>
                </FKCard>

                

                {/* Card: Icon */}
                <FKCard title="Category Icon" subtitle="Pick an emoji or generate a professional icon with AI">
                  <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    {/* Icon preview */}
                    <div style={{ width: 80, height: 80, borderRadius: 8, border: '2px dashed #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', backgroundColor: '#FAFAFA' }}>
                      {currentIconUrl
                        ? <img src={currentIconUrl} alt="icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 36 }}>{currentIcon || '📁'}</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <FKLabel>Emoji Icon</FKLabel>
                      <input
                        placeholder="Paste emoji e.g. 📱 🛋️ 🔌"
                        {...register('icon')}
                        style={{ ...inputStyle, marginTop: 6 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                        <button
                          type="button"
                          onClick={generateIconVariations}
                          disabled={isGeneratingIcon}
                          style={{ flex: 1, backgroundColor: isGeneratingIcon ? '#E0E0E0' : '#2874F0', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 0', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          {isGeneratingIcon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                          Generate AI Icon
                        </button>
                        {currentIconUrl && (
                          <button
                            type="button"
                            onClick={() => setValue('iconUrl', '')}
                            style={{ backgroundColor: '#FFF0F0', color: '#FF6161', border: '1px solid #FFCDD2', borderRadius: 4, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </FKCard>

              </div>
            )}

            {/* ── SEO TAB ──────────────────────────────────────────────────── */}
            {activeTab === 'seo' && (
              <FKCard title="SEO & Metadata" subtitle="Help search engines understand your category better">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <FKLabel>Meta Title</FKLabel>
                    <input placeholder="SEO title (max 60 chars)" {...register('metaTitle')} style={{ ...inputStyle, marginTop: 6 }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>Include your primary keyword</span>
                      <span style={{ fontSize: 11, color: (formValues.metaTitle?.length || 0) > 55 ? '#FF6161' : '#888' }}>
                        {formValues.metaTitle?.length || 0}/60
                      </span>
                    </div>
                  </div>
                  <div>
                    <FKLabel>Meta Description</FKLabel>
                    <textarea
                      placeholder="Compelling description for search results (max 160 chars)"
                      rows={3}
                      {...register('metaDescription')}
                      style={{ ...inputStyle, marginTop: 6, height: 'auto', resize: 'vertical', paddingTop: 10, paddingBottom: 10, lineHeight: 1.5 }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: '#888' }}>Be specific and persuasive</span>
                      <span style={{ fontSize: 11, color: (formValues.metaDescription?.length || 0) > 150 ? '#FF6161' : '#888' }}>
                        {formValues.metaDescription?.length || 0}/160
                      </span>
                    </div>
                  </div>
                  <div>
                    <FKLabel>Meta Keywords</FKLabel>
                    <input placeholder="electronics, gadgets, devices (comma-separated)" {...register('metaKeywords')} style={{ ...inputStyle, marginTop: 6 }} />
                    <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Separate keywords with commas</p>
                  </div>

                  {/* SERP preview */}
                  <div style={{ backgroundColor: '#F8F9FA', borderRadius: 4, border: '1px solid #E0E0E0', padding: 16, marginTop: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Google Preview</p>
                    <p style={{ fontSize: 15, color: '#1558D6', margin: '0 0 2px', fontWeight: 400 }}>
                      {formValues.metaTitle || formValues.name || 'Category Title'}
                    </p>
                    <p style={{ fontSize: 12, color: '#006621', margin: '0 0 4px' }}>https://yourstore.com/category/{(formValues.name || 'category').toLowerCase().replace(/\s+/g, '-')}</p>
                    <p style={{ fontSize: 13, color: '#545454', margin: 0, lineHeight: 1.5 }}>
                      {formValues.metaDescription || 'Add a meta description to see how your category will appear in search results.'}
                    </p>
                  </div>
                </div>
              </FKCard>
            )}

            {/* ── ATTRIBUTES TAB ───────────────────────────────────────────── */}
            {activeTab === 'attributes' && (
              <AttributesSection
                attributes={formValues.attributes}
                setValue={setValue}
                disabled={selectedLevel === 0 || selectedLevel >= 2}
                selectedLevel={selectedLevel}
              />
            )}
          </div>

          {/* ── RIGHT SIDEBAR ───────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Live Preview */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#2874F0', padding: '10px 14px' }}>
                <p style={{ color: '#fff', fontSize: 12, fontWeight: 700, margin: 0 }}>Live Preview</p>
                <p style={{ color: '#A8C7FF', fontSize: 11, margin: '2px 0 0' }}>How it appears on Flipkart</p>
              </div>
              <div style={{ padding: 14 }}>
                {/* Flipkart-style category card */}
                <div style={{ backgroundColor: '#F8F9FA', borderRadius: 4, padding: 12, border: '1px solid #E0E0E0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 4, backgroundColor: levelInfo.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: `1px solid ${levelInfo.color}20`, overflow: 'hidden' }}>
                      {currentIconUrl
                        ? <img src={currentIconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : currentIcon || '📁'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#212121', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formValues.name || 'Category Name'}
                        </p>
                        {isFeatured && <Star style={{ width: 12, height: 12, color: '#FF9F00', fill: '#FF9F00', flexShrink: 0 }} />}
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, backgroundColor: levelInfo.bg, color: levelInfo.color, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          {levelInfo.label} • {levelInfo.name}
                        </span>
                        <span style={{ fontSize: 10, backgroundColor: isActive ? '#E8F5E9' : '#FFEBEE', color: isActive ? '#26A541' : '#FF6161', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                          {isActive ? '● Active' : '● Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: '#666', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {formValues.description || 'No description provided.'}
                  </p>
                  {formValues.attributes.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {formValues.attributes.slice(0, 3).map((a, i) => (
                        <span key={i} style={{ fontSize: 10, backgroundColor: '#EEF3FF', color: '#2874F0', padding: '2px 8px', borderRadius: 20 }}>{a.name}</span>
                      ))}
                      {formValues.attributes.length > 3 && (
                        <span style={{ fontSize: 10, backgroundColor: '#EEF3FF', color: '#2874F0', padding: '2px 8px', borderRadius: 20 }}>+{formValues.attributes.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Flipkart-style breadcrumb path */}
                <div style={{ marginTop: 10, backgroundColor: '#fff', border: '1px solid #E0E0E0', borderRadius: 4, padding: '8px 10px' }}>
                  <p style={{ fontSize: 10, color: '#888', margin: '0 0 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category Path</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#2874F0' }}>Home</span>
                    {selectedParent && categories.find(c => c._id === selectedParent) && (
                      <>
                        <ChevronRight style={{ width: 10, height: 10, color: '#bbb' }} />
                        <span style={{ fontSize: 11, color: '#2874F0' }}>{categories.find(c => c._id === selectedParent)?.name}</span>
                      </>
                    )}
                    <ChevronRight style={{ width: 10, height: 10, color: '#bbb' }} />
                    <span style={{ fontSize: 11, color: '#212121', fontWeight: 600 }}>{formValues.name || '…'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0' }}>
              <div style={{ borderBottom: '1px solid #F0F0F0', padding: '10px 14px' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0 }}>Visibility Settings</p>
              </div>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isActive
                      ? <Eye style={{ width: 15, height: 15, color: '#26A541' }} />
                      : <EyeOff style={{ width: 15, height: 15, color: '#FF6161' }} />}
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: '#212121' }}>Active</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{isActive ? 'Visible to customers' : 'Hidden from store'}</p>
                    </div>
                  </div>
                  <Switch checked={isActive} onCheckedChange={v => setValue('isActive', v)} />
                </div>
                <div style={{ height: 1, backgroundColor: '#F0F0F0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Star style={{ width: 15, height: 15, color: '#FF9F00', fill: isFeatured ? '#FF9F00' : 'none' }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, margin: 0, color: '#212121' }}>Featured</p>
                      <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Show on homepage</p>
                    </div>
                  </div>
                  <Switch checked={isFeatured} onCheckedChange={v => setValue('isFeatured', v)} />
                </div>
              </div>
            </div>

            {/* Tips */}
            <div style={{ backgroundColor: '#FFF8E1', borderRadius: 4, border: '1px solid #FFD54F', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Zap style={{ width: 14, height: 14, color: '#FF9F00' }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#E65100', margin: 0 }}>Quick Tips</p>
              </div>
              {[
                'Use specific names for better SEO ranking',
                'L2–L3 categories can have filter attributes',
                'Products attach only to leaf (L4) categories',
                'Featured categories appear on the homepage',
                'AI Fill auto-fills description, icon & keywords'
              ].map((tip, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: '#FF9F00', flexShrink: 0, marginTop: 1 }}>•</span>
                  <p style={{ fontSize: 11, color: '#BF360C', margin: 0, lineHeight: 1.4 }}>{tip}</p>
                </div>
              ))}
            </div>

            {/* Flipkart-style category stats (static) */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', padding: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: '0 0 10px' }}>Category Stats</p>
              {[
                { label: 'Total Categories', value: '1,248', color: '#2874F0' },
                { label: 'Active', value: '1,190', color: '#26A541' },
                { label: 'Featured', value: '42', color: '#FF9F00' },
                { label: 'With Products', value: '938', color: '#9C27B0' }
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, color: '#666', margin: 0 }}>{s.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Icon Variation Modal ─────────────────────────────────────────────── */}
      {showVariationModal && iconVariations.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ backgroundColor: '#fff', borderRadius: 4, padding: 24, maxWidth: 560, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#212121' }}>Choose Your Icon</p>
                <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>Select the best AI-generated icon for this category</p>
              </div>
              <button onClick={() => setShowVariationModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {iconVariations.map((icon, idx) => (
                <button
                  key={idx}
                  onClick={() => selectVariation(icon.url)}
                  style={{ padding: 8, borderRadius: 4, border: '2px solid #E0E0E0', background: '#FAFAFA', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseOver={e => (e.currentTarget.style.borderColor = '#2874F0')}
                  onMouseOut={e => (e.currentTarget.style.borderColor = '#E0E0E0')}
                >
                  <img src={icon.url} alt={`Icon ${idx + 1}`} style={{ width: '100%', height: 100, objectFit: 'contain', borderRadius: 4 }} />
                  <p style={{ fontSize: 11, color: '#888', margin: '6px 0 0', textAlign: 'center' }}>Variant {idx + 1}</p>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowVariationModal(false)}
                style={{ backgroundColor: '#F0F0F0', color: '#333', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 13, cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ─── Shared helpers ──────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 40,
  border: '1px solid #E0E0E0',
  borderRadius: 4,
  padding: '0 12px',
  fontSize: 13,
  color: '#212121',
  backgroundColor: '#fff',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s'
}

function FKLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ fontSize: 12, fontWeight: 600, color: '#333', display: 'block' }}>
      {children}
      {required && <span style={{ color: '#FF6161', marginLeft: 2 }}>*</span>}
    </label>
  )
}

function FKCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #F0F0F0' }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: '#212121', margin: 0 }}>{title}</p>
        {subtitle && <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

// ─── Attributes Section ──────────────────────────────────────────────────────
function AttributesSection({ attributes, setValue, disabled, selectedLevel }: {
  attributes: any[]
  setValue: any
  disabled?: boolean
  selectedLevel: number
}) {
  const [localAttributes, setLocalAttributes] = useState<any[]>(attributes || [])

  const sync = (updated: any[]) => { setLocalAttributes(updated); setValue('attributes', updated) }
  const addAttribute = () => sync([...localAttributes, { id: Date.now().toString(), name: '', type: 'text', required: false, filterable: false, options: [], unit: '' }])
  const removeAttribute = (i: number) => sync(localAttributes.filter((_, idx) => idx !== i))
  const updateAttribute = (i: number, field: string, value: any) => { const u = [...localAttributes]; u[i] = { ...u[i], [field]: value }; sync(u) }
  const addOption = (ai: number) => { const u = [...localAttributes]; if (!u[ai].options) u[ai].options = []; u[ai].options.push(''); sync(u) }
  const updateOption = (ai: number, oi: number, val: string) => { const u = [...localAttributes]; u[ai].options[oi] = val; sync(u) }
  const removeOption = (ai: number, oi: number) => { const u = [...localAttributes]; u[ai].options.splice(oi, 1); sync(u) }

  if (disabled) {
    return (
      <FKCard title="Category Attributes" subtitle="Attributes are available for L2 and L3 categories only">
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#bbb' }}>
          <Tag style={{ width: 32, height: 32, margin: '0 auto 8px', display: 'block' }} />
          <p style={{ fontSize: 13, margin: 0 }}>
            {selectedLevel === 0
              ? 'Parent categories (L1) cannot have attributes. Select L2 or L3.'
              : 'Leaf categories (L4) cannot have attributes.'}
          </p>
        </div>
      </FKCard>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Info banner */}
      <div style={{ backgroundColor: '#E3F2FD', border: '1px solid #90CAF9', borderRadius: 4, padding: '10px 14px', display: 'flex', gap: 10 }}>
        <Info style={{ width: 14, height: 14, color: '#2874F0', flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: '#0D47A1', margin: 0, lineHeight: 1.5 }}>
          Attributes let customers filter products (e.g. Brand, Size, Color, RAM). Add attributes that are relevant to products in this category.
        </p>
      </div>

      <FKCard
        title={`Category Attributes (${localAttributes.length})`}
        subtitle="Define filterable specs for products in this category"
      >
        {localAttributes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', border: '2px dashed #E0E0E0', borderRadius: 4 }}>
            <Tag style={{ width: 28, height: 28, color: '#ccc', margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>No attributes yet</p>
            <button
              type="button"
              onClick={addAttribute}
              style={{ backgroundColor: '#2874F0', color: '#fff', border: 'none', borderRadius: 4, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + Add First Attribute
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {localAttributes.map((attr, idx) => (
                <div key={attr.id} style={{ border: '1px solid #E0E0E0', borderRadius: 4, padding: 14, backgroundColor: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag style={{ width: 14, height: 14, color: '#2874F0' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>Attribute {idx + 1}</span>
                      {attr.name && <span style={{ fontSize: 11, color: '#888' }}>— {attr.name}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(idx)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6161', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <FKLabel>Attribute Name</FKLabel>
                      <input
                        placeholder="e.g. Brand, Size, Color"
                        value={attr.name}
                        onChange={e => updateAttribute(idx, 'name', e.target.value)}
                        style={{ ...inputStyle, marginTop: 6 }}
                      />
                    </div>
                    <div>
                      <FKLabel>Type</FKLabel>
                      <select
                        value={attr.type}
                        onChange={e => updateAttribute(idx, 'type', e.target.value)}
                        style={{ ...inputStyle, marginTop: 6 }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean (Yes/No)</option>
                        <option value="select">Single Select</option>
                        <option value="multiselect">Multi Select</option>
                      </select>
                    </div>
                  </div>

                  {(attr.type === 'select' || attr.type === 'multiselect') && (
                    <div style={{ marginTop: 12 }}>
                      <FKLabel>Options</FKLabel>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6 }}>
                        {attr.options?.map((opt: string, oi: number) => (
                          <div key={oi} style={{ display: 'flex', gap: 8 }}>
                            <input
                              placeholder={`Option ${oi + 1}`}
                              value={opt}
                              onChange={e => updateOption(idx, oi, e.target.value)}
                              style={{ ...inputStyle, flex: 1 }}
                            />
                            <button type="button" onClick={() => removeOption(idx, oi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF6161' }}>
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(idx)} style={{ alignSelf: 'flex-start', background: 'none', border: '1px dashed #2874F0', color: '#2874F0', borderRadius: 4, padding: '4px 12px', fontSize: 12, cursor: 'pointer' }}>
                          + Add Option
                        </button>
                      </div>
                    </div>
                  )}

                  {attr.type === 'number' && (
                    <div style={{ marginTop: 12 }}>
                      <FKLabel>Unit (optional)</FKLabel>
                      <input placeholder="e.g. cm, kg, inches" value={attr.unit} onChange={e => updateAttribute(idx, 'unit', e.target.value)} style={{ ...inputStyle, marginTop: 6 }} />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#333' }}>
                      <input type="checkbox" checked={attr.required} onChange={e => updateAttribute(idx, 'required', e.target.checked)} />
                      Required
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 12, color: '#333' }}>
                      <input type="checkbox" checked={attr.filterable} onChange={e => updateAttribute(idx, 'filterable', e.target.checked)} />
                      Filterable
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttribute}
              style={{ marginTop: 12, width: '100%', backgroundColor: '#EEF3FF', color: '#2874F0', border: '1px dashed #2874F0', borderRadius: 4, padding: '10px 0', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Plus className="h-4 w-4" /> Add Another Attribute
            </button>
          </>
        )}
      </FKCard>
    </div>
  )
}