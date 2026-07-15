
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, MoreVertical, Edit, Trash2,
  Copy, Eye, EyeOff, Star, ChevronRight, ChevronDown,
  FolderTree, Layers, GitBranch, Tag,
  CheckCircle, RefreshCw,
  Grid3x3, List, Package, TrendingUp, Zap,
  AlertTriangle, X, Filter, ArrowRight
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

// ─── Types ───────────────────────────────────────────────────────────────────
interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  level: number
  parent: string | null
  icon?: string
  iconUrl?: string
  productCount: number
  isActive: boolean
  isFeatured: boolean
  displayOrder: number
  children?: Category[]
  createdAt: string
  updatedAt: string
}

// ─── Config ──────────────────────────────────────────────────────────────────
const FK_BLUE = '#2874F0'
const FK_ORANGE = '#FF9F00'
const FK_GREEN = '#26A541'
const FK_RED = '#FF6161'

const levelConfig: Record<number, { label: string; name: string; color: string; bg: string; text: string; icon: any }> = {
  0: { label: 'L1', name: 'Parent', color: FK_BLUE, bg: '#E8F0FE', text: FK_BLUE, icon: FolderTree },
  1: { label: 'L2', name: 'Subcategory', color: '#9C27B0', bg: '#F3E5F5', text: '#9C27B0', icon: Layers },
  2: { label: 'L3', name: 'Sub-sub', color: FK_ORANGE, bg: '#FFF3E0', text: '#E65100', icon: GitBranch },
  3: { label: 'L4', name: 'Leaf', color: FK_GREEN, bg: '#E8F5E9', text: '#1B5E20', icon: Tag },
}

// ─── Static data ─────────────────────────────────────────────────────────────
const QUICK_LINKS = [
  { label: 'Electronics', icon: '📱', count: 245 },
  { label: 'Fashion', icon: '👗', count: 412 },
  { label: 'Home & Kitchen', icon: '🏠', count: 189 },
  { label: 'Sports', icon: '⚽', count: 134 },
  { label: 'Books', icon: '📚', count: 89 },
  { label: 'Beauty', icon: '💄', count: 167 },
]

const RECENT_ACTIVITY = [
  { action: 'Category Created', name: 'Smartphones', time: '2 min ago', type: 'create' },
  { action: 'Category Updated', name: 'Men\'s Clothing', time: '14 min ago', type: 'edit' },
  { action: 'Category Deactivated', name: 'Vintage Toys', time: '1 hr ago', type: 'deactivate' },
  { action: 'Category Created', name: 'Power Tools', time: '3 hr ago', type: 'create' },
  { action: 'Category Deleted', name: 'Old Mobiles', time: '5 hr ago', type: 'delete' },
]

const SELLER_TIPS = [
  { icon: '🏷️', tip: 'Use L4 (Leaf) categories to list products — customers browse to the deepest level.' },
  { icon: '🔍', tip: 'Add accurate meta titles & keywords so your categories rank on Google.' },
  { icon: '⭐', tip: 'Mark high-traffic categories as Featured to show them on the homepage banner.' },
  { icon: '📦', tip: 'Keep product counts balanced — no single category should hold 80%+ of listings.' },
]

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Tiny helpers ─────────────────────────────────────────────────────────────
function FKBadge({ label, bg, text }: { label: string; bg: string; text: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, backgroundColor: bg, color: text, padding: '2px 8px', borderRadius: 20, letterSpacing: '0.03em' }}>
      {label}
    </span>
  )
}

function Divider() {
  return <div style={{ height: 1, backgroundColor: '#F0F0F0', margin: '0' }} />
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const router = useRouter()
  const toast = useToast()

  const [categories, setCategories] = useState<Category[]>([])
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree')
  const [stats, setStats] = useState({ total: 0, active: 0, products: 0, topLevel: 0 })
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => { fetchCategories() }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/categories/tree`)
      if (response.data.success) {
        const treeData = response.data.data?.categories || []
        setCategories(treeData)
        computeStats(treeData)
        // auto-expand L1
        setExpandedNodes(new Set(treeData.map((c: Category) => c._id)))
      }
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const computeStats = (data: Category[]) => {
    const walk = (items: Category[], acc: { total: number; active: number; products: number }) => {
      for (const c of items) {
        acc.total++; if (c.isActive) acc.active++; acc.products += c.productCount || 0
        if (c.children?.length) walk(c.children, acc)
      }
      return acc
    }
    const { total, active, products } = walk(data, { total: 0, active: 0, products: 0 })
    setStats({ total, active, products, topLevel: data.filter(c => c.level === 0).length })
  }

  // Filter
  useEffect(() => {
    const filter = (items: Category[]): Category[] =>
      items.filter(item => {
        if (selectedLevel !== null && item.level !== selectedLevel) return false
        if (!showInactive && !item.isActive) return false
        if (searchTerm) {
          const match = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase())
          if (!match) {
            const kids = filter(item.children || [])
            if (!kids.length) return false
            return true
          }
        }
        return true
      }).map(item => ({ ...item, children: filter(item.children || []) }))

    setFilteredCategories(filter([...categories]))
  }, [categories, searchTerm, selectedLevel, showInactive])

  const toggleExpand = (id: string) => {
    setExpandedNodes(prev => {
      const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
    })
  }

  const expandAll = () => {
    const ids = new Set<string>()
    const walk = (items: Category[]) => items.forEach(c => { ids.add(c._id); walk(c.children || []) })
    walk(filteredCategories)
    setExpandedNodes(ids)
  }

  const collapseAll = () => setExpandedNodes(new Set())

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await axios.delete(`${BASE_URL}/api/v1/admin/categories/${deleteTarget._id}`)
      toast.success('Category deleted')
      fetchCategories()
    } catch (e: any) {
      toast.error('Failed to delete', { description: e.response?.data?.message })
    } finally { setDeleteTarget(null) }
  }

  const toggleStatus = async (cat: Category) => {
    try {
      await axios.patch(`${BASE_URL}/api/v1/admin/categories/${cat._id}/toggle-status`, { isActive: !cat.isActive })
      toast.success(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`)
      fetchCategories()
    } catch { toast.error('Failed to update status') }
  }

  // ── Tree renderer ──────────────────────────────────────────────────────────
  const renderTree = (items: Category[], depth = 0): React.ReactNode =>
    items.map(cat => {
      const cfg = levelConfig[cat.level] || levelConfig[0]
      const Icon = cfg.icon
      const expanded = expandedNodes.has(cat._id)
      const hasKids = !!cat.children?.length
      const isMenuOpen = openMenu === cat._id

      return (
        <div key={cat._id}>
          {/* Row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 0,
              paddingLeft: depth * 28 + 12,
              paddingRight: 12, paddingTop: 10, paddingBottom: 10,
              backgroundColor: cat.isActive ? 'transparent' : '#FFF8F8',
              borderBottom: '1px solid #F5F5F5',
              transition: 'background 0.12s',
              position: 'relative'
            }}
            onMouseEnter={e => { if (cat.isActive) (e.currentTarget as HTMLDivElement).style.backgroundColor = '#F8FAFF' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.backgroundColor = cat.isActive ? 'transparent' : '#FFF8F8' }}
            className="group"
          >
            {/* Depth line */}
            {depth > 0 && (
              <div style={{ position: 'absolute', left: depth * 28 - 10, top: 0, bottom: 0, width: 1, backgroundColor: '#E8ECFF' }} />
            )}

            {/* Expand toggle */}
            <button
              onClick={() => hasKids && toggleExpand(cat._id)}
              style={{ width: 24, height: 24, border: 'none', background: 'none', cursor: hasKids ? 'pointer' : 'default', color: '#999', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}
            >
              {hasKids
                ? (expanded
                  ? <ChevronDown style={{ width: 14, height: 14, color: FK_BLUE }} />
                  : <ChevronRight style={{ width: 14, height: 14, color: '#888' }} />)
                : <span style={{ width: 14, height: 14, display: 'block', borderLeft: '2px solid #DDD', borderBottom: '2px solid #DDD', marginLeft: 8, marginTop: -6, borderRadius: '0 0 0 4px' }} />}
            </button>

            {/* Icon */}
            <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 8, marginRight: 12, overflow: 'hidden' }}>
              {cat.iconUrl
                ? <img src={cat.iconUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : cat.icon && cat.icon !== '📁'
                  ? <span style={{ fontSize: 20 }}>{cat.icon}</span>
                  : <Icon style={{ width: 16, height: 16, color: cfg.color }} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: cat.isActive ? '#212121' : '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>
                  {cat.name}
                </span>
                <FKBadge label={cfg.label} bg={cfg.bg} text={cfg.text} />
                {cat.isFeatured && (
                  <span style={{ fontSize: 10, backgroundColor: '#FFF8E1', color: '#E65100', padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star style={{ width: 9, height: 9, fill: FK_ORANGE, color: FK_ORANGE }} /> Featured
                  </span>
                )}
                {!cat.isActive && (
                  <span style={{ fontSize: 10, backgroundColor: '#FFEBEE', color: FK_RED, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    Inactive
                  </span>
                )}
              </div>
              {cat.description && (
                <p style={{ fontSize: 11, color: '#888', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>
                  {cat.description}
                </p>
              )}
            </div>

            {/* Product count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginRight: 16 }}>
              <Package style={{ width: 12, height: 12, color: '#bbb' }} />
              <span style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{cat.productCount || 0}</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>products</span>
            </div>

            {/* Children count */}
            {hasKids && (
              <span style={{ fontSize: 11, color: '#666', backgroundColor: '#F0F0F0', padding: '2px 8px', borderRadius: 20, marginRight: 12, whiteSpace: 'nowrap' }}>
                {cat.children!.length} sub
              </span>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="action-btns">
              {cat.level < 3 && (
                <ActionBtn
                  icon={<Plus style={{ width: 13, height: 13 }} />}
                  label="Add child"
                  color={FK_GREEN}
                  bg="#E8F5E9"
                  onClick={() => router.push(`/admin/categories/add?parent=${cat._id}&parentName=${encodeURIComponent(cat.name)}&level=${cat.level + 1}`)}
                />
              )}
              <ActionBtn
                icon={<Edit style={{ width: 13, height: 13 }} />}
                label="Edit"
                color={FK_BLUE}
                bg="#E8F0FE"
                onClick={() => router.push(`/admin/categories/edit/${cat._id}`)}
              />
              <ActionBtn
                icon={cat.isActive ? <EyeOff style={{ width: 13, height: 13 }} /> : <Eye style={{ width: 13, height: 13 }} />}
                label={cat.isActive ? 'Deactivate' : 'Activate'}
                color={FK_ORANGE}
                bg="#FFF3E0"
                onClick={() => toggleStatus(cat)}
              />

              {/* 3-dot menu */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={e => { e.stopPropagation(); setOpenMenu(isMenuOpen ? null : cat._id) }}
                  style={{ width: 28, height: 28, border: 'none', backgroundColor: '#F0F0F0', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}
                >
                  <MoreVertical style={{ width: 14, height: 14 }} />
                </button>
                {isMenuOpen && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{ position: 'absolute', right: 0, top: 32, backgroundColor: '#fff', border: '1px solid #E0E0E0', borderRadius: 4, zIndex: 99, width: 180, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', overflow: 'hidden' }}
                  >
                    <MenuItem icon={<Edit style={{ width: 13, height: 13 }} />} label="Edit Category" onClick={() => { router.push(`/admin/categories/edit/${cat._id}`); setOpenMenu(null) }} />
                    <MenuItem icon={<Copy style={{ width: 13, height: 13 }} />} label="Copy ID" onClick={() => { navigator.clipboard.writeText(cat._id); toast.success('ID copied'); setOpenMenu(null) }} />
                    <div style={{ height: 1, backgroundColor: '#F5F5F5' }} />
                    <MenuItem icon={<Trash2 style={{ width: 13, height: 13, color: FK_RED }} />} label="Delete" danger onClick={() => { setDeleteTarget(cat); setOpenMenu(null) }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Children */}
          {expanded && hasKids && renderTree(cat.children!, depth + 1)}
        </div>
      )
    })

  // ── Grid renderer ──────────────────────────────────────────────────────────
  const renderGrid = (items: Category[]) => {
    const flat: Category[] = []
    const walk = (arr: Category[]) => arr.forEach(c => { flat.push(c); walk(c.children || []) })
    walk(items)
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, padding: 16 }}>
        {flat.map(cat => {
          const cfg = levelConfig[cat.level] || levelConfig[0]
          const Icon = cfg.icon
          return (
            <motion.div
              key={cat._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, boxShadow: '0 6px 24px rgba(40,116,240,0.12)' }}
              style={{ backgroundColor: '#fff', border: `1.5px solid ${cat.isActive ? '#E8ECFF' : '#FFE0E0'}`, borderRadius: 6, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s' }}
              onClick={() => router.push(`/admin/categories/edit/${cat._id}`)}
            >
              <div style={{ height: 6, backgroundColor: cfg.color }} />
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {cat.iconUrl
                      ? <img src={cat.iconUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : cat.icon && cat.icon !== '📁' ? <span style={{ fontSize: 22 }}>{cat.icon}</span>
                        : <Icon style={{ width: 18, height: 18, color: cfg.color }} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <FKBadge label={cfg.label} bg={cfg.bg} text={cfg.text} />
                    {cat.isFeatured && <Star style={{ width: 12, height: 12, fill: FK_ORANGE, color: FK_ORANGE }} />}
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: cat.isActive ? '#212121' : '#aaa', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cat.name}
                </p>
                <p style={{ fontSize: 11, color: '#888', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cat.description || 'No description'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #F5F5F5' }}>
                  <span style={{ fontSize: 11, color: '#555', fontWeight: 600 }}>{cat.productCount || 0} products</span>
                  <span style={{ fontSize: 10, backgroundColor: cat.isActive ? '#E8F5E9' : '#FFEBEE', color: cat.isActive ? FK_GREEN : FK_RED, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  // ── Skeleton loader ────────────────────────────────────────────────────────
  const SkeletonRows = () => (
    <>
      {[...Array(7)].map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F5F5F5', paddingLeft: (i % 3) * 28 + 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#F0F0F0', flexShrink: 0 }} className="fk-skeleton" />
          <div style={{ flex: 1 }}>
            <div style={{ height: 12, backgroundColor: '#F0F0F0', borderRadius: 4, width: `${40 + (i % 4) * 15}%`, marginBottom: 6 }} className="fk-skeleton" />
            <div style={{ height: 10, backgroundColor: '#F5F5F5', borderRadius: 4, width: `${25 + (i % 3) * 10}%` }} className="fk-skeleton" />
          </div>
          <div style={{ height: 10, backgroundColor: '#F0F0F0', borderRadius: 4, width: 60 }} className="fk-skeleton" />
        </div>
      ))}
    </>
  )

  return (
    <>
      {/* Global keyframes for skeleton */}
      <style>{`
        @keyframes fk-shimmer { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
        .fk-skeleton { animation: fk-shimmer 1.4s ease-in-out infinite; }
        .action-btns { opacity: 0; }
        .group:hover .action-btns { opacity: 1; }
        @media (max-width: 768px) { .action-btns { opacity: 1; } }
      `}</style>

      <div style={{ backgroundColor: '#F1F3F6', minHeight: '100vh', fontFamily: "'Roboto', 'Segoe UI', sans-serif" }}>

        {/* ── Top nav bar ────────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: FK_BLUE, height: 56, display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16, position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(40,116,240,0.5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FolderTree style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, lineHeight: 1.2, letterSpacing: '-0.2px' }}>Category Management</div>
              <div style={{ color: '#A8C7FF', fontSize: 10 }}>Flipkart Seller Hub</div>
            </div>
          </div>

          {/* search in nav */}
          <div style={{ flex: 1, maxWidth: 440, position: 'relative', marginLeft: 16 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#888' }} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search categories…"
              style={{ width: '100%', height: 36, border: 'none', borderRadius: 4, paddingLeft: 34, paddingRight: 12, fontSize: 13, outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button
              onClick={fetchCategories}
              style={{ height: 36, padding: '0 14px', border: '1px solid rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw style={{ width: 13, height: 13 }} /> Refresh
            </button>
            <button
              onClick={() => router.push('/admin/categories/add')}
              style={{ height: 36, padding: '0 18px', border: 'none', backgroundColor: FK_ORANGE, color: '#fff', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 2px 8px rgba(255,159,0,0.5)' }}
            >
              <Plus style={{ width: 14, height: 14 }} /> Add Category
            </button>
          </div>
        </div>

        {/* ── Page body ──────────────────────────────────────────────────────── */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 14px 40px', display: 'grid', gridTemplateColumns: '1fr 280px', gap: 14, alignItems: 'start' }}>

          {/* ── LEFT MAIN ──────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {[
                { label: 'Total Categories', value: stats.total, icon: FolderTree, color: FK_BLUE, bg: '#E8F0FE' },
                { label: 'Active', value: stats.active, icon: CheckCircle, color: FK_GREEN, bg: '#E8F5E9' },
                { label: 'Products Linked', value: stats.products.toLocaleString(), icon: Package, color: '#9C27B0', bg: '#F3E5F5' },
                { label: 'Top-Level (L1)', value: stats.topLevel, icon: Star, color: FK_ORANGE, bg: '#FFF3E0' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E8ECEE', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon style={{ width: 18, height: 18, color: s.color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#212121', lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Promo banners */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {[
                { title: '🎉 Festival Sale Active', sub: 'Boost your categories during Big Billion Days', color: ['#E53935', '#FB8C00'] },
                { title: '🤖 AI Suggestions', sub: 'Auto-fill descriptions & keywords with one click', color: [FK_BLUE, '#7C4DFF'] },
                { title: '📈 Category Analytics', sub: 'Track CTR, conversions & search impressions', color: ['#00897B', '#26A541'] },
              ].map((b, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  style={{ background: `linear-gradient(135deg, ${b.color[0]}, ${b.color[1]})`, borderRadius: 4, padding: '14px 16px', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                >
                  <div style={{ position: 'absolute', right: -16, top: -16, width: 72, height: 72, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>{b.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.4 }}>{b.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Quick category links */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Categories</p>
                <span style={{ fontSize: 11, color: FK_BLUE, cursor: 'pointer', fontWeight: 600 }}>View All →</span>
              </div>
              <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '12px 16px', scrollbarWidth: 'none' }}>
                {QUICK_LINKS.map((q, i) => (
                  <div
                    key={i}
                    onClick={() => setSearchTerm(q.label)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80, cursor: 'pointer', padding: '8px 12px', borderRadius: 8, transition: 'background 0.12s', flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F8FAFF')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ fontSize: 28 }}>{q.icon}</div>
                    <p style={{ fontSize: 11, color: '#333', margin: 0, fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{q.label}</p>
                    <span style={{ fontSize: 10, color: '#888' }}>{q.count} items</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filter + view controls */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', padding: '10px 14px' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Filter style={{ width: 13, height: 13, color: '#888' }} />
                  <span style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>Filter:</span>
                </div>
                <select
                  value={selectedLevel ?? ''}
                  onChange={e => setSelectedLevel(e.target.value !== '' ? parseInt(e.target.value) : null)}
                  style={{ height: 32, border: '1px solid #E0E0E0', borderRadius: 4, fontSize: 12, padding: '0 10px', color: '#333', backgroundColor: '#FAFAFA', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="">All Levels</option>
                  <option value="0">L1 — Parent</option>
                  <option value="1">L2 — Subcategory</option>
                  <option value="2">L3 — Sub-sub</option>
                  <option value="3">L4 — Leaf</option>
                </select>

                <button
                  onClick={() => setShowInactive(v => !v)}
                  style={{ height: 32, padding: '0 12px', border: '1px solid #E0E0E0', borderRadius: 4, fontSize: 12, cursor: 'pointer', backgroundColor: showInactive ? '#E8F0FE' : '#FAFAFA', color: showInactive ? FK_BLUE : '#555', fontWeight: showInactive ? 700 : 400, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <EyeOff style={{ width: 12, height: 12 }} /> {showInactive ? 'Showing All' : 'Show Inactive'}
                </button>

                <div style={{ display: 'flex', border: '1px solid #E0E0E0', borderRadius: 4, overflow: 'hidden', height: 32 }}>
                  {(['tree', 'grid'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      style={{ padding: '0 12px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === mode ? FK_BLUE : '#FAFAFA', color: viewMode === mode ? '#fff' : '#555', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.12s' }}
                    >
                      {mode === 'tree' ? <List style={{ width: 13, height: 13 }} /> : <Grid3x3 style={{ width: 13, height: 13 }} />}
                      {mode === 'tree' ? 'Tree' : 'Grid'}
                    </button>
                  ))}
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <ToolbarBtn label="Expand All" onClick={expandAll} />
                  <ToolbarBtn label="Collapse" onClick={collapseAll} />
                </div>
              </div>
            </div>

            {/* Category list */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              {/* Table head */}
              {viewMode === 'tree' && (
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 14px 8px 64px', backgroundColor: '#FAFAFA', borderBottom: '1px solid #E8E8E8', gap: 0 }}>
                  <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 16 }}>Products</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: 12 }}>Children</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', width: 160, textAlign: 'center' }}>Actions</span>
                </div>
              )}

              {isLoading ? (
                <SkeletonRows />
              ) : filteredCategories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: '#333', margin: '0 0 6px' }}>No categories found</p>
                  <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>
                    {searchTerm ? `No results for "${searchTerm}"` : 'Start by creating your first category'}
                  </p>
                  <button
                    onClick={() => router.push('/admin/categories/add')}
                    style={{ backgroundColor: FK_BLUE, color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus style={{ width: 14, height: 14 }} /> Add First Category
                  </button>
                </div>
              ) : viewMode === 'tree' ? (
                <div>{renderTree(filteredCategories)}</div>
              ) : (
                renderGrid(filteredCategories)
              )}
            </div>

          </div>

          {/* ── RIGHT SIDEBAR ────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Quick add CTA */}
            <div style={{ background: `linear-gradient(135deg, ${FK_BLUE}, #1557B0)`, borderRadius: 4, padding: 16, color: '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>🚀 Create New Category</div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '0 0 12px', lineHeight: 1.5 }}>
                Add parent or leaf categories and link them to your products instantly.
              </p>
              <button
                onClick={() => router.push('/admin/categories/add')}
                style={{ width: '100%', backgroundColor: FK_ORANGE, color: '#fff', border: 'none', borderRadius: 4, padding: '9px 0', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              >
                <Plus style={{ width: 14, height: 14 }} /> Add Category
              </button>
            </div>

            {/* Level legend */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Level Guide</p>
              </div>
              {Object.entries(levelConfig).map(([lvl, cfg]) => {
                const Icon = cfg.icon
                return (
                  <div key={lvl} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid #F8F8F8', cursor: 'pointer' }}
                    onClick={() => setSelectedLevel(selectedLevel === Number(lvl) ? null : Number(lvl))}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 6, backgroundColor: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon style={{ width: 14, height: 14, color: cfg.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#333', margin: 0 }}>{cfg.label} — {cfg.name}</p>
                      <p style={{ fontSize: 10, color: '#888', margin: '1px 0 0' }}>
                        {lvl === '0' ? 'Top level, no parent' : lvl === '3' ? 'Final level, holds products' : 'Mid-level, has parent & children'}
                      </p>
                    </div>
                    {selectedLevel === Number(lvl) && <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: cfg.color }} />}
                  </div>
                )
              })}
            </div>

            {/* Recent activity */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Recent Activity</p>
              </div>
              {RECENT_ACTIVITY.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 14px', borderBottom: '1px solid #F8F8F8', alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 20, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: a.type === 'create' ? '#E8F5E9' : a.type === 'delete' ? '#FFEBEE' : a.type === 'deactivate' ? '#FFF3E0' : '#E8F0FE' }}>
                    {a.type === 'create' ? <Plus style={{ width: 12, height: 12, color: FK_GREEN }} />
                      : a.type === 'delete' ? <Trash2 style={{ width: 12, height: 12, color: FK_RED }} />
                        : a.type === 'deactivate' ? <EyeOff style={{ width: 12, height: 12, color: FK_ORANGE }} />
                          : <Edit style={{ width: 12, height: 12, color: FK_BLUE }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</p>
                    <p style={{ fontSize: 10, color: '#888', margin: '1px 0 0' }}>{a.action}</p>
                  </div>
                  <span style={{ fontSize: 10, color: '#bbb', whiteSpace: 'nowrap', flexShrink: 0 }}>{a.time}</span>
                </div>
              ))}
            </div>

            {/* Seller tips */}
            <div style={{ backgroundColor: '#FFF8E1', borderRadius: 4, border: '1px solid #FFD54F', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #FFE082' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#E65100', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap style={{ width: 12, height: 12 }} /> Seller Tips
                </p>
              </div>
              {SELLER_TIPS.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, padding: '9px 14px', borderBottom: i < SELLER_TIPS.length - 1 ? '1px solid #FFF3CD' : 'none' }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{t.icon}</span>
                  <p style={{ fontSize: 11, color: '#BF360C', margin: 0, lineHeight: 1.5 }}>{t.tip}</p>
                </div>
              ))}
            </div>

            {/* Performance stats (static) */}
            <div style={{ backgroundColor: '#fff', borderRadius: 4, border: '1px solid #E0E0E0', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp style={{ width: 13, height: 13, color: FK_GREEN }} />
                <p style={{ fontSize: 12, fontWeight: 700, color: '#212121', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Performance</p>
              </div>
              {[
                { label: 'Category CTR', value: '3.4%', change: '+0.4%', up: true },
                { label: 'Avg Products/Cat', value: '18.2', change: '+2.1', up: true },
                { label: 'Inactive Rate', value: '4.1%', change: '-0.3%', up: false },
                { label: 'Featured Rate', value: '3.4%', change: '+1%', up: true },
              ].map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid #F8F8F8' }}>
                  <span style={{ fontSize: 12, color: '#555' }}>{m.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#212121' }}>{m.value}</span>
                    <span style={{ fontSize: 10, color: m.up ? FK_GREEN : FK_RED, fontWeight: 600, backgroundColor: m.up ? '#E8F5E9' : '#FFEBEE', padding: '1px 6px', borderRadius: 20 }}>
                      {m.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Delete confirm dialog ──────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 200, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              style={{ backgroundColor: '#fff', borderRadius: 6, padding: 24, maxWidth: 420, width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, backgroundColor: '#FFEBEE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertTriangle style={{ width: 20, height: 20, color: FK_RED }} />
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#212121', margin: 0 }}>Delete Category?</p>
                  <p style={{ fontSize: 12, color: '#888', margin: '2px 0 0' }}>This action cannot be undone</p>
                </div>
              </div>
              <div style={{ backgroundColor: '#FFF8F8', border: '1px solid #FFCDD2', borderRadius: 4, padding: '10px 14px', marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: '#C62828', margin: 0, lineHeight: 1.5 }}>
                  You are about to permanently delete <strong>"{deleteTarget.name}"</strong> and all its subcategories. Products linked to this category may be affected.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{ padding: '9px 20px', border: '1px solid #E0E0E0', borderRadius: 4, backgroundColor: '#fff', fontSize: 13, cursor: 'pointer', color: '#333', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  style={{ padding: '9px 20px', border: 'none', borderRadius: 4, backgroundColor: FK_RED, color: '#fff', fontSize: 13, cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Trash2 style={{ width: 13, height: 13 }} /> Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Micro components ─────────────────────────────────────────────────────────
function ActionBtn({ icon, label, color, bg, onClick }: { icon: React.ReactNode; label: string; color: string; bg: string; onClick: () => void }) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{ width: 28, height: 28, border: 'none', backgroundColor: bg, borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color, transition: 'opacity 0.12s' }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      {icon}
    </button>
  )
}

function MenuItem({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: danger ? FK_RED : '#333', textAlign: 'left', transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = danger ? '#FFF5F5' : '#F8FAFF')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {icon} {label}
    </button>
  )
}

function ToolbarBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ height: 32, padding: '0 12px', border: '1px solid #E0E0E0', borderRadius: 4, backgroundColor: '#FAFAFA', fontSize: 12, color: '#555', cursor: 'pointer', whiteSpace: 'nowrap' }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F0F0F0')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#FAFAFA')}
    >
      {label}
    </button>
  )
}



// const FK_RED = '#FF6161'




