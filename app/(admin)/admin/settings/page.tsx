
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ───────────────────────────────────────────────────────────────────

interface SystemHealth {
  status: string
  uptime: number
  memory: { total: number; used: number; free: number }
  cpu: { usage: number; cores: number }
  database: { status: string; latency: number; connections: number }
  redis: { status: string; latency: number; keys: number }
}

interface BackupInfo {
  id: string
  name: string
  size: string
  createdAt: string
  type: 'full' | 'incremental' | 'schema'
  status: 'completed' | 'in_progress' | 'failed'
}

interface AdminUser {
  _id: string
  email: string
  profile: { firstName: string; lastName: string; department: string; designation: string }
  role: string
  status: { isActive: boolean }
  lastLogin?: string
}

interface SystemSetting {
  _id: string
  key: string
  value: any
  group: string
  description: string
  updatedAt: string
}

// ─── API Client ───────────────────────────────────────────────────────────────

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// ─── Settings Config ──────────────────────────────────────────────────────────

const SETTING_GROUPS = [
  {
    label: 'Platform',
    items: [
      { id: 'general', title: 'General', desc: 'Branding, locale, SEO metadata', icon: '🌐', href: '/admin/settings/general', status: 'configured', accent: '#6366f1' },
      { id: 'appearance', title: 'Appearance', desc: 'Themes, layout, UI customization', icon: '🎨', href: '/admin/settings/appearance', status: 'pending', accent: '#ec4899', badge: 'New' },
      { id: 'system', title: 'System', desc: 'Cache, infra, performance tuning', icon: '⚙️', href: '/admin/settings/system', status: 'configured', accent: '#64748b' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { id: 'email', title: 'Email Service', desc: 'SMTP config, templates, delivery', icon: '✉️', href: '/admin/settings/email', status: 'warning', accent: '#10b981' },
      { id: 'sms', title: 'SMS Gateway', desc: 'Twilio, Vonage, message templates', icon: '📱', href: '/admin/settings/sms', status: 'pending', accent: '#8b5cf6' },
      { id: 'notifications', title: 'Notifications', desc: 'Push, in-app, digest rules', icon: '🔔', href: '/admin/settings/notifications', status: 'configured', accent: '#f59e0b' },
    ],
  },
  {
    label: 'Security & Access',
    items: [
      { id: 'security', title: 'Security', desc: '2FA, GDPR, audit policies', icon: '🛡️', href: '/admin/settings/security', status: 'configured', accent: '#ef4444' },
      { id: 'authentication', title: 'Authentication', desc: 'SSO, OAuth, password rules', icon: '🔑', href: '/admin/settings/auth', status: 'configured', accent: '#3b82f6' },
      { id: 'roles', title: 'Roles & RBAC', desc: 'Permissions, access control', icon: '🏷️', href: '/admin/settings/roles', status: 'configured', accent: '#06b6d4' },
      { id: 'admins', title: 'Admin Users', desc: 'Manage admin accounts & roles', icon: '👤', href: '/admin/settings/admins', status: 'configured', accent: '#14b8a6' },
    ],
  },
  {
    label: 'Extensions',
    items: [
      { id: 'payments', title: 'Payments', desc: 'Razorpay, Stripe, PayPal', icon: '💳', href: '/admin/settings/payments-gateway', status: 'pending', accent: '#f97316' },
      { id: 'integrations', title: 'Integrations', desc: 'Third-party APIs and webhooks', icon: '🔌', href: '/admin/settings/integrations', status: 'active', accent: '#a855f7', badge: '4 Active' },
      { id: 'api', title: 'API Management', desc: 'Keys, rate limits, analytics', icon: '</>', href: '/admin/settings/api-keys', status: 'configured', accent: '#1e293b' },
      { id: 'backup', title: 'Backup & DR', desc: 'Automated backups, recovery', icon: '🗄️', href: '/admin/settings/backup', status: 'configured', accent: '#0ea5e9' },
    ],
  },
]

const STATUS_META: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  configured: { label: 'Configured', dot: '#22c55e', text: '#15803d', bg: '#f0fdf4' },
  pending:    { label: 'Pending',    dot: '#f59e0b', text: '#b45309', bg: '#fffbeb' },
  active:     { label: 'Active',     dot: '#6366f1', text: '#4338ca', bg: '#eef2ff' },
  warning:    { label: 'Attention',  dot: '#f97316', text: '#c2410c', bg: '#fff7ed' },
  error:      { label: 'Error',      dot: '#ef4444', text: '#b91c1c', bg: '#fef2f2' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const m = STATUS_META[status] || STATUS_META.configured
  return (
    <span style={{ background: m.bg, color: m.text, fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', padding: '3px 8px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {m.label}
    </span>
  )
}

function Avatar({ name, color = '#6366f1' }: { name: string; color?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', background: color + '22', border: `1.5px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
      {initials}
    </div>
  )
}

function MetricTile({ icon, label, value, unit, status }: { icon: string; label: string; value: string | number; unit: string; status: 'ok' | 'warn' | 'err' }) {
  const color = status === 'ok' ? '#22c55e' : status === 'warn' ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}30` }} />
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', fontFamily: "'Sora', sans-serif", lineHeight: 1 }}>{value}<span style={{ fontSize: 14, fontWeight: 500, color: '#94a3b8', marginLeft: 2 }}>{unit}</span></div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

function BackupRow({ b }: { b: BackupInfo }) {
  const statusColors = { completed: { bg: '#f0fdf4', text: '#15803d' }, in_progress: { bg: '#eff6ff', text: '#1d4ed8' }, failed: { bg: '#fef2f2', text: '#b91c1c' } }
  const c = statusColors[b.status]
  const typeColors: Record<string, string> = { full: '#6366f1', incremental: '#0ea5e9', schema: '#10b981' }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid #f8fafc' }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${typeColors[b.type] || '#6366f1'}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🗄️</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
        <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>{b.size} · {new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
        <span style={{ background: `${typeColors[b.type] || '#6366f1'}15`, color: typeColors[b.type] || '#6366f1', fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{b.type}</span>
        <span style={{ background: c.bg, color: c.text, fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 8 }}>{b.status.replace('_', ' ')}</span>
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', width: '100%', maxWidth: 460, boxShadow: '0 32px 80px -12px rgba(15,23,42,0.3)' }}
          onClick={e => e.stopPropagation()}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h3>
            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, color: '#64748b' }}>×</button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function ModalActions({ onCancel, onConfirm, confirmLabel, loading }: { onCancel: () => void; onConfirm: () => void; confirmLabel: string; loading?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
      <button onClick={onCancel} style={secondaryBtn}>Cancel</button>
      <button onClick={onConfirm} disabled={loading} style={{ ...primaryBtn, flex: 1, opacity: loading ? 0.7 : 1 }}>
        {loading ? '…' : confirmLabel}
      </button>
    </div>
  )
}

// ─── Button styles ────────────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
  color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex',
  alignItems: 'center', gap: 6, justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
}

const secondaryBtn: React.CSSProperties = {
  background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
  borderRadius: 10, padding: '10px 18px', fontSize: 14, fontWeight: 500,
  cursor: 'pointer', flex: 1,
}

const ghostBtn: React.CSSProperties = {
  background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0',
  borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 500,
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [settings, setSettings] = useState<SystemSetting[]>([])

  const [backupModal, setBackupModal] = useState(false)
  const [exportModal, setExportModal] = useState(false)
  const [backupType, setBackupType] = useState('full')
  const [backupLocation, setBackupLocation] = useState('s3')
  const [backupLoading, setBackupLoading] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const toast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text })
    setTimeout(() => setToastMsg(null), 3500)
  }

  const fetchData = useCallback(async () => {
    try {
      const [h, s, a, b] = await Promise.allSettled([
        api.get('/api/v1/admin/system/health'),
        api.get('/api/v1/admin/system/settings'),
        api.get('/api/v1/admin/admins'),
        api.get('/api/v1/admin/backups'),
      ])
      if (h.status === 'fulfilled' && h.value.data.success) setHealth(h.value.data.data)
      if (s.status === 'fulfilled' && s.value.data.success) setSettings(s.value.data.data)
      if (a.status === 'fulfilled' && a.value.data.success) setAdmins(a.value.data.admins)
      if (b.status === 'fulfilled' && b.value.data.success) setBackups(b.value.data.data)
    } catch (e) {
      toast('error', 'Could not load settings data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/admin/login')
    if (sessionStatus === 'authenticated') fetchData()
  }, [sessionStatus, fetchData])

  const handleRefresh = async () => {
    setLoading(true)
    await fetchData()
    toast('success', 'Settings refreshed')
  }

  const handleCreateBackup = async () => {
    setBackupLoading(true)
    try {
      const res = await api.post('/api/v1/admin/backups/create', { type: backupType, location: backupLocation })
      if (res.data.success) {
        toast('success', 'Backup created successfully')
        const b = await api.get('/api/v1/admin/backups')
        if (b.data.success) setBackups(b.data.data)
      }
    } catch { toast('error', 'Failed to create backup') }
    finally { setBackupLoading(false); setBackupModal(false) }
  }

  const handleExport = async () => {
    try {
      const res = await api.get('/api/v1/admin/export/settings', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `settings-${new Date().toISOString().split('T')[0]}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast('success', 'Settings exported')
    } catch { toast('error', 'Export failed') }
    finally { setExportModal(false) }
  }

  // Filter items
  const q = search.toLowerCase()
  const filteredGroups = SETTING_GROUPS.map(g => ({
    ...g,
    items: g.items.filter(i => !q || i.title.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)),
  })).filter(g => g.items.length > 0)

  const metrics = [
    { icon: '🖥️', label: 'CPU Usage', value: health?.cpu?.usage ?? 42, unit: '%', status: (health?.cpu?.usage ?? 0) < 80 ? 'ok' : 'warn' },
    { icon: '💾', label: 'Memory Used', value: health?.memory?.used ? (health.memory.used / 1073741824).toFixed(1) : '3.8', unit: 'GB', status: 'ok' },
    { icon: '🗃️', label: 'DB Latency', value: health?.database?.latency ?? 45, unit: 'ms', status: health?.database?.status === 'connected' ? 'ok' : 'err' },
    { icon: '⚡', label: 'Redis Latency', value: health?.redis?.latency ?? 12, unit: 'ms', status: health?.redis?.status === 'connected' ? 'ok' : 'warn' },
  ] as const

  const isHealthy = health?.status === 'healthy'
  const uptimeDays = Math.floor((health?.uptime ?? 0))

  if (sessionStatus === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
        <div style={{ width: 44, height: 44, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#94a3b8', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>Loading settings hub…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'DM Sans', 'Inter', sans-serif", paddingBottom: 60 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #cbd5e1; }
        select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 32px !important; }
        .setting-card:hover { transform: translateY(-2px); box-shadow: 0 8px 30px -6px rgba(99,102,241,0.15) !important; border-color: #c7d2fe !important; }
        .setting-card { transition: all 0.2s ease; }
        .admin-row:hover { background: #f8fafc; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Toast ── */}
        <AnimatePresence>
          {toastMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: '-50%' }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              style={{ position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', background: toastMsg.type === 'success' ? '#0f172a' : '#fef2f2', color: toastMsg.type === 'success' ? '#f0fdf4' : '#b91c1c', padding: '10px 20px', borderRadius: 12, fontSize: 13.5, fontWeight: 500, zIndex: 99999, boxShadow: '0 8px 30px rgba(0,0,0,0.18)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}
            >
              <span>{toastMsg.type === 'success' ? '✓' : '⚠'}</span> {toastMsg.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Dashboard</span>
              <span style={{ color: '#cbd5e1', fontSize: 12 }}>›</span>
              <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>Settings</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Sora', sans-serif", letterSpacing: '-0.5px' }}>Settings Hub</h1>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: '4px 0 0', fontWeight: 400 }}>Centralized configuration center for your platform</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={handleRefresh} style={ghostBtn}>
              <span>↺</span> Refresh
            </button>
            <button onClick={() => setExportModal(true)} style={ghostBtn}>
              <span>↓</span> Export
            </button>
            <button onClick={() => setBackupModal(true)} style={primaryBtn}>
              <span>🗄️</span> Create Backup
            </button>
          </div>
        </div>

        {/* ── Health Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{
            borderRadius: 20, padding: '20px 28px', marginBottom: 32,
            background: isHealthy
              ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #d1fae5 100%)'
              : 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            border: `1px solid ${isHealthy ? '#bbf7d0' : '#fed7aa'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: isHealthy ? '#22c55e22' : '#f97316 22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {isHealthy ? '✅' : '⚠️'}
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: isHealthy ? '#14532d' : '#7c2d12', fontFamily: "'Sora', sans-serif" }}>
                System Status: {isHealthy ? 'All Systems Operational' : 'Degraded Performance'}
              </div>
              <div style={{ fontSize: 13, color: isHealthy ? '#166534' : '#9a3412', marginTop: 2 }}>
                Uptime {uptimeDays} days · {admins?.length} admin{admins?.length !== 1 ? 's' : ''} · {settings?.length} settings configured
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { label: 'Database', val: health?.database?.status === 'connected' ? 'Connected' : 'Disconnected', ok: health?.database?.status === 'connected' },
              { label: 'Cache (Redis)', val: health?.redis?.status === 'connected' ? 'Connected' : 'Disconnected', ok: health?.redis?.status === 'connected' },
              { label: 'Backups', val: backups.filter(b => b.status === 'completed').length + ' recent', ok: true },
            ].map(({ label, val, ok }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: isHealthy ? '#166534' : '#9a3412', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: ok ? (isHealthy ? '#15803d' : '#9a3412') : '#dc2626' }}>{val}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Metrics ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 36 }}>
          {metrics.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <MetricTile {...m} status={m.status as 'ok' | 'warn' | 'err'} />
            </motion.div>
          ))}
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search settings by name or description…"
            style={{ width: '100%', height: 46, paddingLeft: 44, paddingRight: 16, fontSize: 14, color: '#1e293b', border: '1.5px solid #e2e8f0', borderRadius: 12, outline: 'none', background: '#fff', fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onFocus={e => { e.target.style.borderColor = '#a5b4fc' }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0' }}
          />
        </div>

        {/* ── Setting Groups ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {filteredGroups.map((group, gi) => (
            <motion.section key={group.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.05 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>{group.label}</span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
                <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 500 }}>{group.items.length} items</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {group.items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    className="setting-card"
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    onClick={() => router.push(item.href)}
                    style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 16, padding: '18px 20px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: item.accent + '12', border: `1.5px solid ${item.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {item.icon}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <StatusPill status={item.status} />
                        {item.badge && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: item.accent, background: item.accent + '15', padding: '2px 7px', borderRadius: 8, letterSpacing: '0.04em' }}>{item.badge}</span>
                        )}
                      </div>
                    </div>
                    <h3 style={{ fontSize: 14.5, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', fontFamily: "'Sora', sans-serif" }}>{item.title}</h3>
                    <p style={{ fontSize: 12.5, color: '#94a3b8', margin: '0 0 14px', lineHeight: 1.5 }}>{item.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, color: item.accent }}>
                      Configure <span style={{ fontSize: 15 }}>→</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* ── Bottom grid: Admins + Backups ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginTop: 36 }}>

          {/* Admin Users */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Sora', sans-serif" }}>Admin Users</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{admins?.length} total accounts</p>
              </div>
              <button onClick={() => router.push('/admin/settings/admins')} style={{ fontSize: 12.5, fontWeight: 600, color: '#6366f1', background: '#eef2ff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                Manage →
              </button>
            </div>
            <div>
              {admins?.length === 0 ? (
                <div style={{ padding: '32px 22px', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>No admins found</div>
              ) : admins?.slice(0, 5).map((a, i) => (
                <div key={a._id} className="admin-row" style={{ padding: '13px 22px', borderBottom: i < Math.min(admins.length, 5) - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', gap: 12, transition: 'background 0.15s', cursor: 'pointer' }}>
                  <Avatar name={`${a.profile.firstName} ${a.profile.lastName}`} color={['#6366f1','#10b981','#f59e0b','#ef4444','#0ea5e9'][i % 5]} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.profile.firstName} {a.profile.lastName}</div>
                    <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.email} · {a.role}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 8, background: a.status.isActive ? '#f0fdf4' : '#fef2f2', color: a.status.isActive ? '#15803d' : '#b91c1c', flexShrink: 0 }}>
                    {a.status.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Backup History */}
          <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 12px rgba(15,23,42,0.04)' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0, fontFamily: "'Sora', sans-serif" }}>Backup History</h3>
                <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{backups.filter(b => b.status === 'completed').length} completed backups</p>
              </div>
              <button onClick={() => setBackupModal(true)} style={{ fontSize: 12.5, fontWeight: 600, color: '#6366f1', background: '#eef2ff', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                + New
              </button>
            </div>
            <div style={{ padding: '0 22px' }}>
              {backups.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>No backups yet</div>
              ) : backups.slice(0, 5).map(b => <BackupRow key={b.id} b={b} />)}
            </div>
          </div>
        </div>

        {/* ── Help Banner ── */}
        <div style={{ marginTop: 28, borderRadius: 20, background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', border: '1px solid #c7d2fe', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#6366f122', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>❓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#312e81', fontFamily: "'Sora', sans-serif" }}>Need Assistance?</div>
              <div style={{ fontSize: 13, color: '#4338ca', marginTop: 2 }}>Browse documentation or reach out to our support team</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ ...ghostBtn, background: '#fff', borderColor: '#c7d2fe', color: '#4338ca' }}>Support Center</button>
            <button style={{ ...primaryBtn, boxShadow: '0 4px 12px rgba(99,102,241,0.25)' }}>Documentation</button>
          </div>
        </div>
      </div>

      {/* ── Backup Modal ── */}
      <Modal open={backupModal} onClose={() => setBackupModal(false)} title="Create System Backup">
        <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 18 }}>Choose backup type and destination. This may take a few minutes.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Backup Type</label>
            <select value={backupType} onChange={e => setBackupType(e.target.value)} style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, color: '#0f172a', padding: '0 12px', background: '#f8fafc', fontFamily: 'inherit', outline: 'none' }}>
              <option value="full">Full Backup — Complete system state</option>
              <option value="incremental">Incremental — Changes since last backup</option>
              <option value="schema">Schema Only — Database structure</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>Storage Destination</label>
            <select value={backupLocation} onChange={e => setBackupLocation(e.target.value)} style={{ width: '100%', height: 40, border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13.5, color: '#0f172a', padding: '0 12px', background: '#f8fafc', fontFamily: 'inherit', outline: 'none' }}>
              <option value="s3">AWS S3 (Primary)</option>
              <option value="local">Local Storage</option>
              <option value="gcs">Google Cloud Storage</option>
            </select>
          </div>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 12.5, color: '#92400e' }}>
            ⚠️ Full backups can take 5–15 minutes depending on data size.
          </div>
        </div>
        <ModalActions onCancel={() => setBackupModal(false)} onConfirm={handleCreateBackup} confirmLabel="Start Backup" loading={backupLoading} />
      </Modal>

      {/* ── Export Modal ── */}
      <Modal open={exportModal} onClose={() => setExportModal(false)} title="Export Settings">
        <p style={{ fontSize: 13.5, color: '#64748b', marginBottom: 18 }}>Download all platform configurations as a JSON file.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { id: 'api-keys', label: 'Include API keys & secrets', note: 'Encrypted with AES-256', defaultChecked: false },
            { id: 'audit-logs', label: 'Include audit log history', note: 'Last 90 days', defaultChecked: true },
            { id: 'user-prefs', label: 'Include user preferences', note: 'Admin customizations', defaultChecked: true },
          ].map(opt => (
            <label key={opt.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 14px', border: '1px solid #f1f5f9', borderRadius: 10, background: '#f8fafc' }}>
              <input type="checkbox" defaultChecked={opt.defaultChecked} style={{ marginTop: 2, accentColor: '#6366f1' }} />
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: '#0f172a' }}>{opt.label}</div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 1 }}>{opt.note}</div>
              </div>
            </label>
          ))}
        </div>
        <ModalActions onCancel={() => setExportModal(false)} onConfirm={handleExport} confirmLabel="Export JSON" />
      </Modal>
    </div>
  )
}