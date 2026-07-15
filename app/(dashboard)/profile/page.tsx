'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Fraunces, Plus_Jakarta_Sans, IBM_Plex_Mono } from 'next/font/google'
import {
  User, Mail, Phone, MapPin, Calendar, Package, TrendingUp, Star,
  Settings, Shield, Bell, CreditCard, LogOut, Edit2, Camera,
  CheckCircle, Award, Zap, Clock, Truck, RotateCcw, Gift,
  Sparkles, Crown, Medal, Target, Rocket, Gem, Plus, Trash2,
  Loader2, AlertCircle, ChevronRight, Smartphone, Key, Save,
  ArrowUpRight, Activity, Fingerprint, BarChart3,
  ShoppingBag, Receipt, Eye, EyeOff, Lock,
  CheckCheck, Layers, Zap as ZapIcon, HeadphonesIcon,
  Users, ShieldCheck, MessageCircle, PhoneCall, Sparkle,
} from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Variants } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Fonts ──────────────────────────────────────────────────────────────────
const fraunces = Fraunces({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-display' })
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['500', '600'], variable: '--font-mono' })

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Shared premium button style — blue gradient, used everywhere instead of black
const PRIMARY_BTN =
  'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-sm shadow-blue-500/25'

// ─── Design tokens ──────────────────────────────────────────────────────────
// Light, colorful, Flipkart-style system: white/slate surfaces, blue as the
// single premium accent, saturated colors reserved for status + tier meaning.
const T = {
  page: 'bg-slate-50 text-slate-900',
  surface: 'bg-white border border-slate-200',
  surfaceHover: 'hover:bg-slate-50 hover:border-slate-300',
  textPrimary: 'text-slate-900',
  textSecondary: 'text-slate-500',
  textTertiary: 'text-slate-400',
  brass: '#2563EB',
  brassSoft: 'bg-blue-50 text-blue-700 border-blue-200',
  brassGrad: 'from-blue-600 to-indigo-600',
  mono: 'font-[family-name:var(--font-mono)] tabular-nums',
  display: 'font-[family-name:var(--font-display)]',
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Address {
  _id: string
  type: 'home' | 'work' | 'other'
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  landmark?: string
  phone?: string
  name?: string
}

interface UserProfile {
  _id: string
  email: string
  phone: string
  profile: {
    firstName: string
    lastName: string
    avatar?: string
    avatarPublicId?: string
    dateOfBirth?: string
    gender?: string
    bio?: string
  }
  stats: {
    totalRentals: number
    activeRentals: number
    completedRentals: number
    cancelledRentals: number
    totalSpent: number
    reviewsWritten: number
    memberSince: string
    lastActive: string
  }
  verification: {
    email: boolean
    phone: boolean
    kyc: { status: 'pending' | 'approved' | 'rejected' }
  }
  preferences: {
    language: string
    notifications: { email: boolean; sms: boolean; push: boolean }
  }
  role: string
  status: { isActive: boolean; isBlocked: boolean }
}

interface Activity {
  _id: string
  type: 'rental' | 'payment' | 'review' | 'login'
  action: string
  description: string
  timestamp: string
  metadata?: any
}

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)

const formatDate = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

const formatDateTime = (date: string | Date): string =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const getInitials = (f: string, l: string) => `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase()

const membershipLevel = (spent: number) => {
  if (spent >= 100000) return {
    level: 'Platinum', color: 'from-indigo-500 to-purple-600',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    next: null, nextAmount: 100000, discount: 15, icon: '✦',
  }
  if (spent >= 50000) return {
    level: 'Gold', color: 'from-amber-400 to-orange-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    next: 'Platinum', nextAmount: 100000, discount: 10, icon: '◆',
  }
  if (spent >= 25000) return {
    level: 'Silver', color: 'from-slate-400 to-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    next: 'Gold', nextAmount: 50000, discount: 5, icon: '◇',
  }
  return {
    level: 'Bronze', color: 'from-orange-400 to-amber-600',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    next: 'Silver', nextAmount: 25000, discount: 0, icon: '○',
  }
}

const tierPerks: Record<string, string[]> = {
  Bronze: ['Full catalog access', 'Standard delivery windows', 'Email support within 24h'],
  Silver: ['5% loyalty discount', 'Priority delivery slots', 'Live chat support'],
  Gold: ['10% loyalty discount', 'One free damage waiver monthly', 'Priority phone support', 'Early access to new arrivals'],
  Platinum: ['15% loyalty discount', 'Damage waiver on every rental', 'Dedicated concierge line', 'First access to limited inventory', 'Complimentary express delivery'],
}

// ─── Sub-components ────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' } }),
}

function StatCard({ label, value, sub, icon: Icon, accent, index }: {
  label: string; value: string | number; sub?: string; icon: any; accent: string; index: number
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="show">
      <div className={`group relative overflow-hidden rounded-2xl ${T.surface} p-5 transition-all duration-300 ${T.surfaceHover} hover:shadow-lg hover:-translate-y-0.5`}>
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${accent} blur-2xl`} />
        <div className="relative flex items-start justify-between">
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-widest ${T.textTertiary} mb-2`}>{label}</p>
            <p className={`text-3xl font-extrabold tracking-tight ${T.textPrimary} ${T.mono}`}>{value}</p>
            {sub && <p className={`text-xs ${T.textSecondary} mt-1`}>{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${accent} shadow-md`}>
            <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function AchievementBadge({ title, icon: Icon, gradient, earned, description }: {
  title: string; icon: any; gradient: string; earned: boolean; description?: string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all duration-200 border
              ${earned ? 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md' : 'border-slate-100 bg-slate-50 opacity-50 grayscale'}`}
          >
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-md`}>
              <Icon className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <p className={`text-[11px] font-semibold text-center leading-tight ${earned ? T.textSecondary : T.textTertiary}`}>{title}</p>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs bg-slate-900 border-slate-800 text-white">
          {description || (earned ? 'Achievement unlocked' : 'Keep going')}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const configs: Record<string, { icon: any; color: string; bg: string }> = {
    rental: { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    review: { icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
    payment: { icon: Receipt, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    login: { icon: Shield, color: 'text-violet-600', bg: 'bg-violet-50' },
  }
  const cfg = configs[activity.type] || { icon: Clock, color: T.textSecondary, bg: 'bg-slate-50' }
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-pointer"
    >
      <div className={`p-2.5 rounded-xl ${cfg.bg} flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${T.textPrimary} truncate`}>{activity.description}</p>
        <p className={`text-xs ${T.textTertiary} mt-0.5`}>{formatDateTime(activity.timestamp)}</p>
      </div>
      {activity.metadata?.status && (
        <Badge variant="outline" className={`text-[10px] font-semibold uppercase tracking-wide border-slate-200 ${T.textSecondary} flex-shrink-0`}>
          {activity.metadata.status}
        </Badge>
      )}
      <ChevronRight className={`h-4 w-4 ${T.textTertiary} group-hover:translate-x-0.5 transition-all flex-shrink-0`} />
    </motion.div>
  )
}

function AddressCard({ address, onEdit, onDelete, onSetDefault }: {
  address: Address; onEdit: () => void; onDelete: () => void; onSetDefault: () => void
}) {
  const typeIcons: Record<string, string> = { home: '🏠', work: '💼', other: '📍' }
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 group
        ${address.isDefault ? 'border-blue-200 bg-blue-50/40 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}`}
    >
      {address.isDefault && (
        <div className="absolute top-4 right-4">
          <Badge className={`text-[10px] ${T.brassSoft} font-bold uppercase tracking-wider`}>Default</Badge>
        </div>
      )}
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xl">{typeIcons[address.type]}</span>
        <div>
          <div className="flex items-center gap-2">
            <p className={`text-sm font-bold ${T.textPrimary} capitalize`}>{address.type}</p>
            {address.name && <span className={T.textTertiary}>·</span>}
            {address.name && <p className={`text-sm ${T.textSecondary}`}>{address.name}</p>}
          </div>
        </div>
      </div>
      <div className={`space-y-1 text-sm ${T.textSecondary} mb-5`}>
        <p className={`font-medium ${T.textPrimary}`}>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        {address.landmark && <p className="text-xs">Near: {address.landmark}</p>}
        <p>{address.city}, {address.state} – {address.pincode}</p>
        {address.phone && <p className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" />{address.phone}</p>}
      </div>
      <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
        {!address.isDefault && (
          <Button variant="ghost" size="sm" className="text-xs h-8 text-blue-700 hover:text-blue-800 hover:bg-blue-50 px-3" onClick={onSetDefault}>
            <CheckCheck className="h-3 w-3 mr-1" />Set default
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 text-slate-500 hover:text-slate-900" onClick={onEdit} aria-label="Edit address">
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50 text-slate-400 hover:text-rose-600" onClick={onDelete} aria-label="Delete address">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex gap-6 items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-56 rounded-xl" />
            <Skeleton className="h-4 w-80 rounded-xl" />
            <Skeleton className="h-4 w-48 rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', bio: '', dateOfBirth: '', gender: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [notifications, setNotifications] = useState({ email: true, sms: true, push: true })
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState<Partial<Address>>({ type: 'home', addressLine1: '', city: '', state: '', pincode: '', isDefault: false })
  const [isSavingAddress, setIsSavingAddress] = useState(false)

  const authHeader = () => ({ Authorization: `Bearer ${session?.user?.accessToken}` })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/profile')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') { fetchProfile(); fetchAddresses(); fetchActivities() }
  }, [status])

  const fetchProfile = async () => {
    try {
      const res = await axios.get<ApiResponse<{ user: UserProfile }>>(`${BASE_URL}/api/v1/users/profile`, { headers: authHeader() })
      if (res.data.success) {
        const u = res.data.data.user
        setProfile(u)
        setFormData({
          firstName: u.profile.firstName || '', lastName: u.profile.lastName || '',
          phone: u.phone || '', bio: u.profile.bio || '',
          dateOfBirth: u.profile.dateOfBirth?.split('T')[0] || '', gender: u.profile.gender || '',
        })
        setNotifications(u.preferences.notifications)
      }
    } catch { toast.error('Could not load your profile. Please try again.') }
    finally { setIsLoading(false) }
  }

  const fetchAddresses = async () => {
    try {
      const res = await axios.get<ApiResponse<{ addresses: Address[] }>>(`${BASE_URL}/api/v1/users/addresses`, { headers: authHeader() })
      if (res.data.success) setAddresses(res.data.data.addresses)
    } catch { toast.error('Could not load your addresses.') }
  }

  const fetchActivities = async (page = 1) => {
    try {
      const res = await axios.get<ApiResponse<{ activities: Activity[] }>>(`${BASE_URL}/api/v1/users/activity?page=${page}&limit=10`, { headers: authHeader() })
      if (res.data.success) setActivities(res.data.data.activities)
    } catch { /* silent */ }
  }

  const updateProfile = async () => {
    try {
      const res = await axios.put<ApiResponse<{ user: UserProfile }>>(
        `${BASE_URL}/api/v1/users/profile`,
        { profile: { firstName: formData.firstName, lastName: formData.lastName, bio: formData.bio, dateOfBirth: formData.dateOfBirth, gender: formData.gender }, phone: formData.phone },
        { headers: authHeader() },
      )
      if (res.data.success) { toast.success('Profile updated'); fetchProfile(); setIsEditing(false); await updateSession() }
    } catch (e: any) { toast.error(e.response?.data?.message || 'We couldn\u2019t save those changes. Please try again.') }
  }

  const uploadAvatar = async (file: File) => {
    const fd = new FormData(); fd.append('avatar', file)
    setIsUploading(true)
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/users/avatar`, fd, { headers: { ...authHeader(), 'Content-Type': 'multipart/form-data' } })
      if (res.data.success) { toast.success('Photo updated'); fetchProfile(); await updateSession() }
    } catch { toast.error('Upload failed. Try a smaller image.') } finally { setIsUploading(false) }
  }

  const deleteAvatar = async () => {
    setIsUploading(true)
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/users/avatar`, { headers: authHeader() })
      if (res.data.success) { toast.success('Photo removed'); fetchProfile(); await updateSession() }
    } catch { toast.error('Could not remove photo.') } finally { setIsUploading(false) }
  }

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('New password and confirmation don\u2019t match')
    if (passwordData.newPassword.length < 6) return toast.error('Password needs at least 6 characters')
    setIsChangingPassword(true)
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/auth/change-password`, { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }, { headers: authHeader() })
      if (res.data.success) { toast.success('Password changed'); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }) }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Could not change password.') } finally { setIsChangingPassword(false) }
  }

  const updateNotificationPreferences = async () => {
    setIsUpdatingNotifications(true)
    try {
      const res = await axios.put(`${BASE_URL}/api/v1/users/notifications`, notifications, { headers: authHeader() })
      if (res.data.success) toast.success('Preferences saved')
    } catch { toast.error('Could not save preferences.') } finally { setIsUpdatingNotifications(false) }
  }

  const saveAddress = async () => {
    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.pincode)
      return toast.error('Fill in address, city, state and pincode to continue')
    setIsSavingAddress(true)
    try {
      const url = editingAddress ? `${BASE_URL}/api/v1/users/addresses/${editingAddress._id}` : `${BASE_URL}/api/v1/users/addresses`
      const res = editingAddress
        ? await axios.put(url, addressForm, { headers: authHeader() })
        : await axios.post(url, addressForm, { headers: authHeader() })
      if (res.data.success) { toast.success(editingAddress ? 'Address updated' : 'Address added'); fetchAddresses(); setShowAddressDialog(false); resetAddressForm() }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Could not save address.') } finally { setIsSavingAddress(false) }
  }

  const deleteAddress = async (id: string) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/users/addresses/${id}`, { headers: authHeader() })
      if (res.data.success) { toast.success('Address removed'); fetchAddresses() }
    } catch { toast.error('Could not delete address.') }
  }

  const setDefaultAddress = async (id: string) => {
    try {
      const res = await axios.patch(`${BASE_URL}/api/v1/users/addresses/${id}/default`, {}, { headers: authHeader() })
      if (res.data.success) { toast.success('Default address updated'); fetchAddresses() }
    } catch { toast.error('Could not update default address.') }
  }

  const deactivateAccount = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/v1/users/deactivate`, { reason: 'User requested' }, { headers: authHeader() })
      if (res.data.success) { toast.success('Account deactivated'); setTimeout(() => router.push('/login'), 2000) }
    } catch (e: any) { toast.error(e.response?.data?.message || 'Could not deactivate account.') }
  }

  const deleteAccount = async () => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/v1/users/delete`, { headers: authHeader() })
      if (res.data.success) { toast.success('Account deleted'); setTimeout(() => router.push('/'), 2000) }
    } catch { toast.error('Could not delete account.') }
  }

  const resetAddressForm = () => {
    setAddressForm({ type: 'home', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', isDefault: false, landmark: '', phone: '', name: '' })
    setEditingAddress(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Photo must be under 5MB')
    if (!file.type.startsWith('image/')) return toast.error('Please choose an image file')
    uploadAvatar(file)
  }

  if (status === 'loading' || isLoading) return <ProfileSkeleton />
  if (!profile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-xs">
        <div className="h-16 w-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <div className="space-y-1.5">
          <p className={`text-base font-semibold ${T.textPrimary}`}>Your profile didn\u2019t load</p>
          <p className={`text-sm ${T.textSecondary}`}>Check your connection and try again.</p>
        </div>
        <Button onClick={fetchProfile} variant="outline" className="border-slate-200 text-slate-900 hover:bg-slate-50">Retry</Button>
      </div>
    </div>
  )

  const mem = membershipLevel(profile.stats.totalSpent || 0)
  const progressToNext = mem.next ? Math.min(((profile.stats.totalSpent || 0) / mem.nextAmount) * 100, 100) : 100
  const remaining = mem.next ? mem.nextAmount - (profile.stats.totalSpent || 0) : 0
  const perks = tierPerks[mem.level] || tierPerks.Bronze
  const maskedId = `\u2022\u2022\u2022\u2022 ${(profile._id || '0000').slice(-4).toUpperCase()}`

  const statsCards = [
    { label: 'Total rentals', value: profile.stats.totalRentals || 0, sub: 'All time', icon: ShoppingBag, accent: 'from-blue-500 to-cyan-500' },
    { label: 'Active now', value: profile.stats.activeRentals || 0, sub: 'In progress', icon: Activity, accent: 'from-emerald-500 to-green-500' },
    { label: 'Total spent', value: formatCurrency(profile.stats.totalSpent || 0), sub: 'Lifetime value', icon: TrendingUp, accent: 'from-indigo-500 to-purple-500' },
    { label: 'Reviews', value: profile.stats.reviewsWritten || 0, sub: 'Written', icon: Star, accent: 'from-amber-500 to-orange-500' },
  ]

  const achievements = [
    { title: 'First rental', icon: Rocket, gradient: 'from-blue-500 to-cyan-600', earned: profile.stats.totalRentals >= 1, description: 'Complete your first rental' },
    { title: 'Explorer', icon: Target, gradient: 'from-emerald-500 to-teal-600', earned: profile.stats.totalRentals >= 5, description: 'Complete 5 rentals' },
    { title: 'Veteran', icon: Crown, gradient: 'from-amber-500 to-orange-600', earned: profile.stats.totalRentals >= 10, description: 'Complete 10 rentals' },
    { title: 'Critic', icon: Star, gradient: 'from-violet-500 to-purple-600', earned: (profile.stats.reviewsWritten || 0) >= 5, description: 'Write 5 reviews' },
    { title: 'High roller', icon: Gem, gradient: 'from-rose-500 to-pink-600', earned: (profile.stats.totalSpent || 0) >= 50000, description: 'Spend \u20b950,000+' },
    { title: 'Loyal', icon: Medal, gradient: 'from-orange-500 to-red-500', earned: true, description: 'Member for 1 year' },
  ]

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
  ]

  return (
    <div className={`min-h-screen ${T.page} ${jakarta.variable} ${fraunces.variable} ${plexMono.variable}`} style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
      {/* Background ambient — soft colorful blurs on light bg */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[400px] rounded-full bg-indigo-200/25 blur-[100px]" />
        <div className="absolute -bottom-40 right-1/3 w-[400px] h-[400px] rounded-full bg-amber-100/40 blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── Hero: Membership card (Flipkart-style light) ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative">
          <div className={`p-[2px] rounded-3xl bg-gradient-to-br ${mem.color} shadow-xl shadow-slate-900/5`}>
            <div className="relative overflow-hidden rounded-[calc(1.5rem-2px)] bg-white p-6 sm:p-8">
              <div className={`absolute inset-x-0 top-0 h-[4px] bg-gradient-to-r ${mem.color}`} />

              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className={`p-1 rounded-full bg-gradient-to-br ${mem.color} shadow-lg`}>
                    <Avatar className="h-20 w-20 rounded-full ring-2 ring-white">
                      <AvatarImage src={profile.profile.avatar} className="object-cover" />
                      <AvatarFallback className={`bg-slate-100 text-slate-700 text-xl font-bold ${T.display}`}>
                        {getInitials(profile.profile.firstName, profile.profile.lastName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-full shadow-md flex items-center justify-center hover:scale-110 transition-transform bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                        aria-label="Change profile photo"
                      >
                        <Camera className="h-3.5 w-3.5 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-slate-200">
                      <DropdownMenuItem onSelect={() => document.getElementById('avatar-upload')?.click()} className="text-sm text-slate-900 focus:bg-slate-50">
                        <Camera className="h-4 w-4 mr-2" />Upload photo
                      </DropdownMenuItem>
                      {profile.profile.avatar && (
                        <DropdownMenuItem onSelect={deleteAvatar} className="text-sm text-rose-600 focus:text-rose-600 focus:bg-rose-50">
                          <Trash2 className="h-4 w-4 mr-2" />Remove photo
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={isUploading} />
                  {isUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className={`text-2xl sm:text-[1.75rem] font-bold tracking-tight ${T.textPrimary} ${T.display}`}>
                      {profile.profile.firstName} {profile.profile.lastName}
                    </h1>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${mem.badge} border`}>
                      <span>{mem.icon}</span>
                      {mem.level}
                      {mem.discount > 0 && <span className="opacity-70">\u00b7 {mem.discount}% off</span>}
                    </span>
                  </div>

                  <div className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm ${T.textSecondary} mb-4`}>
                    <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{profile.email}</span>
                    <span className="hidden sm:block text-slate-200">\u00b7</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{profile.phone}</span>
                    <span className="hidden sm:block text-slate-200">\u00b7</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Member since {formatDate(profile.stats.memberSince)}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border
                      ${profile.verification.email ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                      {profile.verification.email ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Email {profile.verification.email ? 'verified' : 'unverified'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border
                      ${profile.verification.phone ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                      {profile.verification.phone ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      Phone {profile.verification.phone ? 'verified' : 'unverified'}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border
                      ${profile.verification.kyc.status === 'approved' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}`}>
                      <Shield className="h-3 w-3" />
                      KYC {profile.verification.kyc.status}
                    </span>
                  </div>
                </div>

                {/* Actions + masked member number */}
                <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                  <Button onClick={() => setIsEditing(true)} className={`gap-2 rounded-xl h-10 ${PRIMARY_BTN}`}>
                    <Edit2 className="h-4 w-4" />Edit profile
                  </Button>
                  <span className={`text-xs ${T.textTertiary} ${T.mono} tracking-widest`}>{maskedId}</span>
                </div>
              </div>

              {/* Membership progress */}
              {mem.next && (
                <div className="mt-6 pt-6 border-t border-slate-100 relative">
                  <div className={`flex items-center justify-between text-xs ${T.textSecondary} mb-2`}>
                    <div className="flex items-center gap-1.5">
                      <Crown className="h-3.5 w-3.5 text-blue-600" />
                      <span className={`font-semibold ${T.textPrimary}`}>{mem.level}</span>
                      <span>\u2192 {mem.next}</span>
                    </div>
                    <span className={T.mono}>{formatCurrency(remaining)} to go</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressToNext}%` }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${mem.color}`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsCards.map((s, i) => <StatCard key={s.label} {...s} index={i} />)}
        </div>

        {/* ── Tabs (fixed for mobile: equal-width segmented control, no overlap) ── */}
        <div>
          <div className="flex w-full sm:w-fit gap-1 mb-6 p-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-1 sm:flex-none items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400
                  ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-sm' : `${T.textSecondary} hover:text-slate-900 hover:bg-slate-50`}`}
              >
                <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span className="hidden [@media(min-width:380px)]:inline sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Overview */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {profile.profile.bio && (
                  <div className={`p-6 rounded-2xl ${T.surface}`}>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${T.textTertiary} mb-3`}>About</h3>
                    <p className={`text-sm ${T.textSecondary} leading-relaxed`}>{profile.profile.bio}</p>
                  </div>
                )}

                {/* Membership perks */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>
                        <span className={T.display}>{mem.level} benefits</span>
                      </h3>
                      <p className={`text-xs ${T.textSecondary} mt-0.5`}>What your membership unlocks right now</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50">
                      <Sparkle className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                        <span className={T.textSecondary}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  {mem.next && (
                    <p className={`text-xs ${T.textTertiary} mt-4 pt-4 border-t border-slate-100`}>
                      Reach {mem.next} to unlock {(tierPerks[mem.next] || []).length} more benefits, including {(tierPerks[mem.next] || [])[0]?.toLowerCase()}.
                    </p>
                  )}
                </div>

                {/* Achievements */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Achievements</h3>
                      <p className={`text-xs ${T.textSecondary} mt-0.5`}>{achievements.filter(a => a.earned).length} of {achievements.length} unlocked</p>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Award className="h-4 w-4 text-amber-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {achievements.map((a, i) => <AchievementBadge key={i} {...a} />)}
                  </div>
                </div>

                {/* Activity */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Recent activity</h3>
                      <p className={`text-xs ${T.textSecondary} mt-0.5`}>Your latest actions</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-50 rounded-xl h-8" onClick={() => router.push('/profile/activity')}>
                      View all <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                  {activities.length > 0 ? (
                    <div className="space-y-1 -mx-2">
                      {activities.slice(0, 6).map((a, i) => <ActivityItem key={a._id || i} activity={a} index={i} />)}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                        <ZapIcon className={`h-6 w-6 ${T.textSecondary}`} />
                      </div>
                      <p className={`text-sm ${T.textSecondary} mb-3`}>Nothing here yet \u2014 your rentals and reviews will show up as you go.</p>
                      <Button variant="ghost" size="sm" onClick={() => router.push('/products')} className="text-blue-700 hover:text-blue-800">
                        Browse rentals \u2192
                      </Button>
                    </div>
                  )}
                </div>

                {/* Refer & earn */}
                <div className="p-6 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between">
                    <div className="flex items-start gap-3.5">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-white">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold ${T.textPrimary}`}>Refer a friend, both of you save</h3>
                        <p className={`text-xs ${T.textSecondary} mt-1 max-w-md`}>
                          Share your invite link. They get 10% off their first rental, you get \u20b9500 credit once it\u2019s delivered.
                        </p>
                      </div>
                    </div>
                    <Button className={`rounded-xl h-10 flex-shrink-0 ${PRIMARY_BTN}`}>Get my link</Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className={`text-sm font-bold ${T.textPrimary}`}>Saved addresses</h3>
                    <p className={`text-xs ${T.textSecondary} mt-0.5`}>{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
                  </div>
                  <Button onClick={() => { resetAddressForm(); setShowAddressDialog(true) }} className="gap-2 rounded-xl h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200" variant="ghost" size="sm">
                    <Plus className="h-4 w-4" />Add address
                  </Button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                      <MapPin className={`h-6 w-6 ${T.textSecondary}`} />
                    </div>
                    <p className={`text-sm ${T.textSecondary} mb-3`}>No addresses saved yet \u2014 add one to speed up checkout.</p>
                    <Button variant="ghost" size="sm" onClick={() => { resetAddressForm(); setShowAddressDialog(true) }} className="text-blue-700 hover:text-blue-800">
                      Add your first address \u2192
                    </Button>
                  </div>
                ) : (
                  <AnimatePresence>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <AddressCard
                          key={addr._id} address={addr}
                          onEdit={() => { setEditingAddress(addr); setAddressForm(addr); setShowAddressDialog(true) }}
                          onDelete={() => deleteAddress(addr._id)}
                          onSetDefault={() => setDefaultAddress(addr._id)}
                        />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </motion.div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                {/* Change password */}
                <div className={`p-6 rounded-2xl ${T.surface} space-y-5`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Key className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Change password</h3>
                      <p className={`text-xs ${T.textSecondary}`}>Keep your account secure</p>
                    </div>
                  </div>
                  {[
                    { label: 'Current password', key: 'currentPassword', show: showPw.current, toggle: () => setShowPw(p => ({ ...p, current: !p.current })) },
                    { label: 'New password', key: 'newPassword', show: showPw.new, toggle: () => setShowPw(p => ({ ...p, new: !p.new })) },
                    { label: 'Confirm new password', key: 'confirmPassword', show: showPw.confirm, toggle: () => setShowPw(p => ({ ...p, confirm: !p.confirm })) },
                  ].map(field => (
                    <div key={field.key} className="space-y-1.5">
                      <Label className={`text-sm font-medium ${T.textSecondary}`}>{field.label}</Label>
                      <div className="relative">
                        <Input
                          type={field.show ? 'text' : 'password'}
                          value={(passwordData as any)[field.key]}
                          onChange={e => setPasswordData({ ...passwordData, [field.key]: e.target.value })}
                          className="bg-slate-50 border-slate-200 rounded-xl pr-10 focus-visible:border-blue-400 focus-visible:ring-blue-100 h-11 text-slate-900"
                          placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                        />
                        <button type="button" onClick={field.toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors" aria-label={field.show ? 'Hide password' : 'Show password'}>
                          {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={changePassword}
                    disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                    className={`h-11 rounded-xl w-full sm:w-auto ${PRIMARY_BTN}`}
                  >
                    {isChangingPassword ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
                    Update password
                  </Button>
                </div>

                {/* 2FA */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
                        <Fingerprint className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <h3 className={`text-sm font-bold ${T.textPrimary}`}>Two-factor authentication</h3>
                        <p className={`text-xs ${T.textSecondary}`}>Extra layer of protection at login</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>

                {/* Active Sessions */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Active sessions</h3>
                      <p className={`text-xs ${T.textSecondary}`}>Devices currently signed in</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Smartphone className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${T.textPrimary}`}>This device</p>
                        <p className={`text-xs ${T.textSecondary}`}>Chrome on Windows</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">\u25cf Active</span>
                  </div>
                  <Button variant="ghost" className="w-full mt-4 text-rose-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl h-10 border border-transparent hover:border-rose-200">
                    <LogOut className="h-4 w-4 mr-2" />Sign out of all devices
                  </Button>
                </div>

                {/* Concierge support */}
                <div className={`p-6 rounded-2xl ${T.surface}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-blue-50">
                      <HeadphonesIcon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Need help with your account?</h3>
                      <p className={`text-xs ${T.textSecondary}`}>
                        {mem.level === 'Platinum' || mem.level === 'Gold' ? 'Priority support, typically under 10 minutes' : 'Our team replies within a few hours'}
                      </p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
                      <MessageCircle className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-medium ${T.textPrimary}`}>Chat with us</p>
                        <p className={`text-xs ${T.textTertiary}`}>Fastest way to get answers</p>
                      </div>
                    </button>
                    <button className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left">
                      <PhoneCall className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <div>
                        <p className={`text-sm font-medium ${T.textPrimary}`}>Request a callback</p>
                        <p className={`text-xs ${T.textTertiary}`}>We\u2019ll call within the hour</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/50">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-9 w-9 rounded-xl bg-rose-100 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-700">Danger zone</h3>
                      <p className={`text-xs ${T.textSecondary}`}>Irreversible actions</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-sm font-medium ${T.textPrimary}`}>Deactivate account</p>
                        <p className={`text-xs ${T.textSecondary}`}>Temporarily disable your account</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl flex-shrink-0" onClick={() => setShowDeactivateDialog(true)}>
                        Deactivate
                      </Button>
                    </div>
                    <Separator className="bg-rose-100" />
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-sm font-medium ${T.textPrimary}`}>Delete account</p>
                        <p className={`text-xs ${T.textSecondary}`}>Permanently erase all your data</p>
                      </div>
                      <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl flex-shrink-0" onClick={() => setShowDeleteDialog(true)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Preferences */}
            {activeTab === 'preferences' && (
              <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className={`p-6 rounded-2xl ${T.surface} space-y-6`}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Bell className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${T.textPrimary}`}>Notifications</h3>
                      <p className={`text-xs ${T.textSecondary}`}>Choose how you receive updates</p>
                    </div>
                  </div>
                  {[
                    { key: 'email', label: 'Email notifications', desc: 'Rental updates, receipts, and offers via email', icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { key: 'sms', label: 'SMS notifications', desc: 'Important alerts and OTPs on your phone', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { key: 'push', label: 'Push notifications', desc: 'Real-time updates on this device', icon: Bell, color: 'text-violet-600', bg: 'bg-violet-50' },
                  ].map((n, i) => (
                    <div key={n.key}>
                      {i > 0 && <Separator className="bg-slate-100" />}
                      <div className="flex items-center justify-between pt-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-lg ${n.bg} flex items-center justify-center`}>
                            <n.icon className={`h-4 w-4 ${n.color}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${T.textPrimary}`}>{n.label}</p>
                            <p className={`text-xs ${T.textSecondary}`}>{n.desc}</p>
                          </div>
                        </div>
                        <Switch checked={(notifications as any)[n.key]} onCheckedChange={checked => setNotifications({ ...notifications, [n.key]: checked })} />
                      </div>
                    </div>
                  ))}
                  <Button onClick={updateNotificationPreferences} disabled={isUpdatingNotifications} className={`h-11 rounded-xl w-full ${PRIMARY_BTN}`}>
                    {isUpdatingNotifications ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save preferences
                  </Button>
                </div>

                {/* Trust footer */}
                <div className="grid sm:grid-cols-3 gap-3">
                  {[
                    { icon: ShieldCheck, label: 'Buyer protection', desc: 'Every rental is covered' },
                    { icon: CreditCard, label: 'Secure payments', desc: 'PCI-DSS compliant checkout' },
                    { icon: Users, label: 'Verified renters', desc: 'KYC-checked community' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white">
                      <item.icon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className={`text-xs font-semibold ${T.textPrimary}`}>{item.label}</p>
                        <p className={`text-[11px] ${T.textTertiary}`}>{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl max-h-[88vh] overflow-y-auto m-1">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${T.textPrimary}`}>
              <Edit2 className="h-5 w-5 text-blue-600" />Edit profile
            </DialogTitle>
            <DialogDescription className={T.textSecondary}>Update your personal information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>First name</Label>
                <Input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" />
              </div>
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Last name</Label>
                <Input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={`text-sm font-medium ${T.textSecondary}`}>Phone</Label>
              <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" />
            </div>
            <div className="space-y-1.5">
              <Label className={`text-sm font-medium ${T.textSecondary}`}>Bio</Label>
              <Textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} className="bg-slate-50 border-slate-200 rounded-xl resize-none text-slate-900 focus-visible:border-blue-400" placeholder="Tell us about yourself..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Date of birth</Label>
                <Input type="date" value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" />
              </div>
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Gender</Label>
                <Select value={formData.gender} onValueChange={v => setFormData({ ...formData, gender: v })}>
                  <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2 sticky bottom-0 bg-white">
            <Button variant="ghost" onClick={() => setIsEditing(false)} className="rounded-xl text-slate-700 hover:bg-slate-50">Cancel</Button>
            <Button onClick={updateProfile} className={`rounded-xl ${PRIMARY_BTN}`}>
              <Save className="h-4 w-4 mr-2" />Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Address Dialog ── */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl max-h-[88vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className={T.textPrimary}>{editingAddress ? 'Edit address' : 'New address'}</DialogTitle>
            <DialogDescription className={T.textSecondary}>Fill in your address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 px-6 overflow-y-auto flex-1">
            <div className="space-y-1.5">
              <Label className={`text-sm font-medium ${T.textSecondary}`}>Type</Label>
              <Select value={addressForm.type} onValueChange={(v: any) => setAddressForm({ ...addressForm, type: v })}>
                <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  <SelectItem value="home">\ud83c\udfe0 Home</SelectItem>
                  <SelectItem value="work">\ud83d\udcbc Work</SelectItem>
                  <SelectItem value="other">\ud83d\udccd Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {[
              { label: 'Full name', key: 'name', placeholder: 'Recipient name', required: false },
              { label: 'Address line 1', key: 'addressLine1', placeholder: 'House / building', required: true },
              { label: 'Address line 2', key: 'addressLine2', placeholder: 'Street / area', required: false },
              { label: 'Landmark', key: 'landmark', placeholder: 'Nearby landmark', required: false },
            ].map(f => (
              <div key={f.key} className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>
                  {f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}
                </Label>
                <Input value={(addressForm as any)[f.key] || ''} onChange={e => setAddressForm({ ...addressForm, [f.key]: e.target.value })} placeholder={f.placeholder} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>City<span className="text-rose-500 ml-0.5">*</span></Label>
                <Input value={addressForm.city || ''} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>State<span className="text-rose-500 ml-0.5">*</span></Label>
                <Input value={addressForm.state || ''} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" placeholder="State" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Pincode<span className="text-rose-500 ml-0.5">*</span></Label>
                <Input value={addressForm.pincode || ''} onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })} maxLength={6} className={`bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400 ${T.mono}`} placeholder="6-digit code" />
              </div>
              <div className="space-y-1.5">
                <Label className={`text-sm font-medium ${T.textSecondary}`}>Phone</Label>
                <Input value={addressForm.phone || ''} onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })} className="bg-slate-50 border-slate-200 rounded-xl h-11 text-slate-900 focus-visible:border-blue-400" placeholder="Contact" />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200 mb-2">
              <div>
                <p className={`text-sm font-medium ${T.textPrimary}`}>Set as default</p>
                <p className={`text-xs ${T.textSecondary}`}>Use this address by default</p>
              </div>
              <Switch checked={addressForm.isDefault || false} onCheckedChange={checked => setAddressForm({ ...addressForm, isDefault: checked })} />
            </div>
          </div>
          <DialogFooter className="gap-2 p-6 pt-4 border-t border-slate-100">
            <Button variant="ghost" onClick={() => setShowAddressDialog(false)} className="rounded-xl text-slate-700 hover:bg-slate-50">Cancel</Button>
            <Button onClick={saveAddress} disabled={isSavingAddress} className={`rounded-xl ${PRIMARY_BTN}`}>
              {isSavingAddress && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAddress ? 'Update' : 'Save'} address
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate Alert ── */}
      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent className="bg-white border-slate-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className={T.textPrimary}>Deactivate your account?</AlertDialogTitle>
            <AlertDialogDescription className={T.textSecondary}>
              Your account will be temporarily disabled. You won't be able to access your rentals, and others won't be able to contact you. You can reactivate anytime by logging back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deactivateAccount} className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white">Deactivate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete Alert ── */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white border-rose-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-600">Delete account permanently?</AlertDialogTitle>
            <AlertDialogDescription className={T.textSecondary}>
              This cannot be undone. All your data \u2014 rental history, reviews, and personal information \u2014 will be permanently erased from our systems.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteAccount} className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white">Delete forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}