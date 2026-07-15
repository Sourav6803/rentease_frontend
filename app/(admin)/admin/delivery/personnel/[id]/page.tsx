// // app/admin/delivery/personnel/[id]/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter, useParams } from 'next/navigation'
// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import {
//   ArrowLeft, User, Mail, Phone, MapPin, Navigation, Truck,
//   Calendar, Star, Package, Clock, CheckCircle, XCircle,
//   Shield, Award, TrendingUp, Activity, DollarSign,
//   FileText, Image, Video, Download, Eye, Edit,
//   MoreVertical, MessageCircle, Headphones, ThumbsUp
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// // Mock data for single person
// const mockPerson = {
//   _id: '1',
//   employeeId: 'DLV001',
//   user: {
//     _id: 'u1',
//     email: 'rahul.sharma@example.com',
//     phone: '+91 98765 43210',
//     profile: { firstName: 'Rahul', lastName: 'Sharma', avatar: null }
//   },
//   vehicle: { type: 'bike', number: 'DL 01 AB 1234', model: 'Honda Activa 6G' },
//   zone: 'North',
//   serviceablePincodes: ['110001', '110002', '110003', '110004', '110005'],
//   availability: { isAvailable: true, isOnDuty: true },
//   performance: {
//     totalDeliveries: 156,
//     completedDeliveries: 152,
//     failedDeliveries: 4,
//     averageRating: 4.8,
//     onTimeRate: 97.4,
//     totalDistance: 1245,
//     totalEarnings: 18750
//   },
//   currentAssignments: [
//     { delivery: 'DLV001234', status: 'assigned', address: 'Sector 62, Noida' }
//   ],
//   status: { isActive: true, verificationStatus: 'verified' },
//   documents: [
//     { type: 'license', verified: true, url: '#', uploadedAt: '2024-01-15' },
//     { type: 'aadhar', verified: true, url: '#', uploadedAt: '2024-01-15' },
//     { type: 'pan', verified: true, url: '#', uploadedAt: '2024-01-16' },
//     { type: 'vehicle_rc', verified: true, url: '#', uploadedAt: '2024-01-16' },
//     { type: 'insurance', verified: false, url: '#', uploadedAt: '2024-02-10' }
//   ],
//   bankDetails: {
//     accountHolderName: 'Rahul Sharma',
//     accountNumber: 'XXXX1234',
//     ifscCode: 'SBIN0001234',
//     bankName: 'State Bank of India',
//     upiId: 'rahul@okhdfcbank'
//   },
//   joinedAt: '2024-01-15T00:00:00Z',
//   lastActive: '2024-05-15T10:30:00Z'
// }

// const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

// api.interceptors.request.use(async (config) => {
//   const { getSession } = await import('next-auth/react')
//   const session = await getSession()
//   if (session?.user?.accessToken) {
//     config.headers.Authorization = `Bearer ${session.user.accessToken}`
//   }
//   return config
// })

// export default function DeliveryPersonDetailPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const params = useParams()
//   const toast = useToast()
//   const [person, setPerson] = useState<any>(mockPerson)
//   const [isLoading, setIsLoading] = useState(false)
//   const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'documents' | 'banking'>('overview')

//   useEffect(()=>{
//     const fetchPerson = async () => {
//       if (!params.id) return
//       setIsLoading(true)
//       try {
//         const response = await api.get(`${BASE_URL}/api/v1/delivery-personnel/persons/${params.id}`)
//         setPerson(response.data.data.person)
//       } catch (error) {
//         console.error('Error fetching person details:', error)
//         toast.error('Failed to fetch person details')
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchPerson()
//   }, [params])

//   useEffect(() => {
//     if (sessionStatus === 'unauthenticated') {
//       router.push('/admin/login')
//     }
//   }, [sessionStatus, router])

//   const statusConfig = {
//     verified: { label: 'Verified', color: 'bg-green-100 text-green-700', icon: CheckCircle },
//     pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
//     rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
//   }
// //   const verificationStatus = statusConfig[person.status.verificationStatus] || statusConfig.pending
//   const verificationKey =
//     (person.status.verificationStatus as keyof typeof statusConfig) || 'pending'

//   const verificationStatus =
//     statusConfig[verificationKey]

//   const availabilityConfig = person.availability.isAvailable && person.availability.isOnDuty
//     ? { label: 'Available', color: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-500' }
//     : person.availability.isOnDuty
//       ? { label: 'On Duty', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' }
//       : { label: 'Off Duty', color: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-500' }

//   if (sessionStatus === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-500">Loading profile...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <Link
//             href="/admin/delivery/personnel"
//             className="p-2 hover:bg-white rounded-xl transition-colors"
//           >
//             <ArrowLeft className="h-5 w-5 text-slate-600" />
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Delivery Personnel Profile</h1>
//             <p className="text-slate-500 mt-0.5">View and manage delivery person details</p>
//           </div>
//         </div>

//         {/* Profile Header */}
//         <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//           <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-6">
//             <div className="flex flex-col md:flex-row md:items-center gap-6">
//               <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
//                 {person.user.profile.firstName.charAt(0)}{person.user.profile.lastName.charAt(0)}
//               </div>
//               <div className="flex-1">
//                 <div className="flex items-center gap-3 flex-wrap mb-2">
//                   <h2 className="text-2xl font-bold text-slate-800">
//                     {person.user.profile.firstName} {person.user.profile.lastName}
//                   </h2>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${verificationStatus.color}`}>
//                     <verificationStatus.icon className="h-3 w-3" />
//                     {verificationStatus.label}
//                   </span>
//                   <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${availabilityConfig.color}`}>
//                     <div className={`w-1.5 h-1.5 rounded-full ${availabilityConfig.dotColor}`} />
//                     {availabilityConfig.label}
//                   </span>
//                 </div>
//                 <div className="flex flex-wrap gap-4 text-sm">
//                   <div className="flex items-center gap-1.5 text-slate-500">
//                     <Mail className="h-3.5 w-3.5" />
//                     <span>{person.user.email}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-slate-500">
//                     <Phone className="h-3.5 w-3.5" />
//                     <span>{person.user.phone}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-slate-500">
//                     <Calendar className="h-3.5 w-3.5" />
//                     <span>Joined {new Date(person.joinedAt).toLocaleDateString()}</span>
//                   </div>
//                   <div className="flex items-center gap-1.5 text-slate-500">
//                     <Clock className="h-3.5 w-3.5" />
//                     <span>Last active {new Date(person.lastActive).toLocaleDateString()}</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <Link
//                   href={`/admin/delivery/personnel/${person._id}/edit`}
//                   className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
//                 >
//                   <Edit className="h-4 w-4" />
//                   Edit Profile
//                 </Link>
//                 <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
//                   <MessageCircle className="h-4 w-4" />
//                   Send Message
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Tabs */}
//           <div className="border-b border-slate-200 px-6">
//             <div className="flex gap-6 overflow-x-auto">
//               {[
//                 { id: 'overview', label: 'Overview', icon: User },
//                 { id: 'performance', label: 'Performance', icon: TrendingUp },
//                 { id: 'documents', label: 'Documents', icon: FileText },
//                 { id: 'banking', label: 'Banking Details', icon: DollarSign },
//               ].map(tab => {
//                 const Icon = tab.icon
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id as any)}
//                     className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
//                       activeTab === tab.id
//                         ? 'border-primary text-primary'
//                         : 'border-transparent text-slate-500 hover:text-slate-700'
//                     }`}
//                   >
//                     <Icon className="h-4 w-4" />
//                     <span className="text-sm font-medium">{tab.label}</span>
//                   </button>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="p-6">
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="bg-slate-50 rounded-xl p-5">
//                     <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                       <Navigation className="h-4 w-4 text-primary" />
//                       Vehicle Information
//                     </h3>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="capitalize font-medium">{person.vehicle.type}</span></div>
//                       <div className="flex justify-between"><span className="text-slate-500">Number:</span><span className="font-mono">{person.vehicle.number}</span></div>
//                       <div className="flex justify-between"><span className="text-slate-500">Model:</span><span>{person.vehicle.model}</span></div>
//                     </div>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-5">
//                     <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//                       <MapPin className="h-4 w-4 text-primary" />
//                       Work Details
//                     </h3>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between"><span className="text-slate-500">Zone:</span><span>{person.zone} Zone</span></div>
//                       <div className="flex justify-between"><span className="text-slate-500">Pincodes:</span><span>{person.serviceablePincodes.length} serviceable</span></div>
//                       {person.currentAssignments.length > 0 && (
//                         <div className="mt-3 pt-3 border-t border-slate-200">
//                           <p className="text-amber-600 text-xs flex items-center gap-1">
//                             <Activity className="h-3 w-3" />
//                             Active: {person.currentAssignments[0].address}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'performance' && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="text-center p-4 bg-slate-50 rounded-xl">
//                     <p className="text-2xl font-bold text-slate-800">{person.performance.completedDeliveries}</p>
//                     <p className="text-xs text-slate-500">Completed</p>
//                   </div>
//                   <div className="text-center p-4 bg-slate-50 rounded-xl">
//                     <p className="text-2xl font-bold text-red-600">{person.performance.failedDeliveries}</p>
//                     <p className="text-xs text-slate-500">Failed</p>
//                   </div>
//                   <div className="text-center p-4 bg-slate-50 rounded-xl">
//                     <div className="flex items-center justify-center gap-0.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><p className="text-2xl font-bold text-slate-800">{person.performance.averageRating}</p></div>
//                     <p className="text-xs text-slate-500">Avg Rating</p>
//                   </div>
//                   <div className="text-center p-4 bg-slate-50 rounded-xl">
//                     <p className="text-2xl font-bold text-green-600">{person.performance.onTimeRate}%</p>
//                     <p className="text-xs text-slate-500">On-Time Rate</p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-sm text-slate-500">Total Distance</p>
//                     <p className="text-xl font-bold text-slate-800">{person.performance.totalDistance} km</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <p className="text-sm text-slate-500">Total Earnings</p>
//                     <p className="text-xl font-bold text-green-600">₹{person.performance.totalEarnings.toLocaleString()}</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {activeTab === 'documents' && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {person.documents.map((doc: any, idx: number) => (
//                   <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all">
//                     <div className="flex items-center gap-3">
//                       <div className={`p-2 rounded-lg ${doc.verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
//                         <FileText className={`h-5 w-5 ${doc.verified ? 'text-green-600' : 'text-yellow-600'}`} />
//                       </div>
//                       <div>
//                         <p className="font-medium capitalize text-slate-800">{doc.type.replace('_', ' ')}</p>
//                         <p className="text-xs text-slate-500">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       {doc.verified ? (
//                         <span className="inline-flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3 w-3" /> Verified</span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 text-xs text-yellow-600"><Clock className="h-3 w-3" /> Pending</span>
//                       )}
//                       <button className="p-1.5 hover:bg-slate-100 rounded-lg"><Eye className="h-4 w-4 text-slate-500" /></button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {activeTab === 'banking' && (
//               <div className="max-w-md mx-auto space-y-4">
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5">
//                   <h3 className="font-semibold text-slate-800 mb-3">Bank Account Details</h3>
//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between"><span className="text-slate-500">Account Holder:</span><span className="font-medium">{person.bankDetails.accountHolderName}</span></div>
//                     <div className="flex justify-between"><span className="text-slate-500">Account Number:</span><span className="font-mono">{person.bankDetails.accountNumber}</span></div>
//                     <div className="flex justify-between"><span className="text-slate-500">IFSC Code:</span><span className="font-mono">{person.bankDetails.ifscCode}</span></div>
//                     <div className="flex justify-between"><span className="text-slate-500">Bank Name:</span><span>{person.bankDetails.bankName}</span></div>
//                     {person.bankDetails.upiId && <div className="flex justify-between"><span className="text-slate-500">UPI ID:</span><span>{person.bankDetails.upiId}</span></div>}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="flex gap-4 justify-end">
//           <button className="px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center gap-2">
//             <XCircle className="h-4 w-4" />
//             Suspend Account
//           </button>
//           <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
//             <Headphones className="h-4 w-4" />
//             Contact Support
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Mail, Phone, MapPin, Truck, Calendar,
  Star, Package, Clock, CheckCircle, XCircle, Shield,
  TrendingUp, Activity, FileText, Eye, Edit,
  MessageCircle, Headphones, User, Banknote, Navigation,
  Loader2, AlertCircle, BadgeCheck, Zap, BarChart3,
  Info, Building2, CreditCard, Hash, Bike, Target,
  ThumbsUp, Award
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if ((session as any)?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).user.accessToken}`
  }
  return config
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryPerson {
  _id: string
  employeeId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: { firstName: string; lastName: string; avatar?: string | null }
  }
  vehicle: { type: string; number: string; model: string; registrationNumber?: string }
  zone: string
  serviceablePincodes: string[]
  availability: {
    isAvailable: boolean
    isOnDuty: boolean
    currentLocation?: { coordinates: number[] }
    shifts?: { start: string; end: string; workingDays: string[] }
  }
  performance: {
    totalDeliveries: number
    completedDeliveries: number
    failedDeliveries: number
    cancelledDeliveries?: number
    averageRating: number
    onTimeRate: number
    totalDistance: number
    totalEarnings: number
  }
  bankDetails?: {
    accountHolderName?: string
    accountNumber?: string
    ifscCode?: string
    bankName?: string
    upiId?: string
  }
  maxConcurrentDeliveries?: number
  status: { isActive: boolean; isVerified?: boolean; verificationStatus: string }
  documents: Array<{ type: string; verified: boolean; url?: string; uploadedAt?: string }>
  currentAssignments: Array<{ delivery: string; status: string; address?: string }>
  metadata?: { createdBy?: string | null; hiredAt?: string }
  createdAt: string
  updatedAt?: string
  joinedAt?: string
  lastActive?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const vehicleEmoji: Record<string, string> = {
  bike: '🏍️', scooter: '🛵', car: '🚗', van: '🚐', truck: '🚚'
}

const avatarGradients = [
  'from-indigo-500 via-violet-500 to-purple-600',
  'from-rose-500 via-pink-500 to-fuchsia-600',
  'from-emerald-500 via-teal-500 to-cyan-600',
  'from-amber-500 via-orange-500 to-red-500',
  'from-sky-500 via-blue-500 to-indigo-600',
]

const getGradient = (id: string) =>
  avatarGradients[id.charCodeAt(id.length - 1) % avatarGradients.length]

const initials = (p: DeliveryPerson) =>
  `${p.user.profile.firstName[0]}${p.user.profile.lastName[0]}`.toUpperCase()

const zoneColors: Record<string, { pill: string; glow: string; accent: string }> = {
  north:   { pill: 'bg-sky-100 text-sky-700 ring-1 ring-sky-200',       glow: '#0ea5e9', accent: 'from-sky-500 to-blue-600' },
  south:   { pill: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200', glow: '#10b981', accent: 'from-emerald-500 to-teal-600' },
  east:    { pill: 'bg-violet-100 text-violet-700 ring-1 ring-violet-200',    glow: '#8b5cf6', accent: 'from-violet-500 to-purple-600' },
  west:    { pill: 'bg-rose-100 text-rose-700 ring-1 ring-rose-200',         glow: '#f43f5e', accent: 'from-rose-500 to-pink-600' },
  central: { pill: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',      glow: '#f59e0b', accent: 'from-amber-500 to-orange-600' },
}

const getZone = (zone: string) =>
  zoneColors[zone.toLowerCase()] ?? { pill: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200', glow: '#64748b', accent: 'from-slate-500 to-slate-600' }

const fmt = (n: number) => n.toLocaleString('en-IN')
const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const maskAccount = (acc?: string) => acc ? `${'•'.repeat(Math.max(0, acc.length - 4))}${acc.slice(-4)}` : '—'

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-[12px] text-slate-400 font-medium flex-shrink-0">{label}</span>
      <span className={`text-[13px] text-slate-800 font-medium text-right ${mono ? 'font-mono tracking-wider' : ''}`}>{value}</span>
    </div>
  )
}

function MetricCard({
  label, value, sub, icon: Icon, color, size = 'normal',
}: {
  label: string; value: React.ReactNode; sub?: string
  icon: React.ElementType; color: string; size?: 'normal' | 'large'
}) {
  return (
    <div className={`relative bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ${size === 'large' ? 'p-6' : 'p-4'}`}>
      <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-5" style={{ background: color }} />
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}18` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <p className={`font-bold text-slate-900 tracking-tight ${size === 'large' ? 'text-3xl' : 'text-2xl'}`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {value}
      </p>
      <p className="text-[11px] text-slate-500 font-medium mt-0.5 uppercase tracking-wide">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

function DocumentCard({ doc }: { doc: { type: string; verified: boolean; url?: string; uploadedAt?: string } }) {
  const docLabels: Record<string, { label: string; icon: string }> = {
    license:    { label: "Driving License",      icon: '🪪' },
    aadhar:     { label: "Aadhaar Card",          icon: '🆔' },
    pan:        { label: "PAN Card",              icon: '💳' },
    vehicle_rc: { label: "Vehicle RC",            icon: '📄' },
    insurance:  { label: "Insurance Certificate", icon: '🛡️' },
    photo:      { label: "Passport Photo",        icon: '🖼️' },
  }
  const meta = docLabels[doc.type] ?? { label: doc.type.replace(/_/g, ' '), icon: '📁' }

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all hover:shadow-md ${
      doc.verified ? 'border-emerald-100 bg-emerald-50/30' : 'border-amber-100 bg-amber-50/30'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
          doc.verified ? 'bg-emerald-100' : 'bg-amber-100'
        }`}>
          {meta.icon}
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-slate-800 capitalize">{meta.label}</p>
          {doc.uploadedAt && (
            <p className="text-[11px] text-slate-400 mt-0.5">Uploaded {fmtDate(doc.uploadedAt)}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {doc.verified ? (
          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" /> Verified
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11.5px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" /> Pending
          </span>
        )}
        {doc.url && doc.url !== '#' && (
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

function RatingRing({ value, max = 5 }: { value: number; max?: number }) {
  const pct = max > 0 ? value / max : 0
  const r = 28, c = 2 * Math.PI * r
  const dash = pct * c
  const color = value >= 4.5 ? '#10b981' : value >= 3.5 ? '#f59e0b' : '#f87171'
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[15px] font-bold text-slate-900">{value > 0 ? value.toFixed(1) : '—'}</span>
        <span className="text-[9px] text-slate-400 font-medium">/ 5.0</span>
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'performance' | 'documents' | 'banking'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',     label: 'Overview',    icon: User },
  { id: 'performance',  label: 'Performance', icon: BarChart3 },
  { id: 'documents',    label: 'Documents',   icon: FileText },
  { id: 'banking',      label: 'Banking',     icon: Banknote },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DeliveryPersonDetailPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const toast = useToast()

  const [person, setPerson] = useState<DeliveryPerson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [isSuspending, setIsSuspending] = useState(false)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') router.push('/admin/login')
  }, [sessionStatus, router])

  useEffect(() => {
    const fetchPerson = async () => {
      if (!params.id) return
      setIsLoading(true)
      try {
        const res = await api.get(`/api/v1/delivery-personnel/persons/${params.id}`)
        setPerson(res.data.data.person)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load delivery person')
      } finally {
        setIsLoading(false)
      }
    }
    fetchPerson()
  }, [params.id])

  const handleSuspend = async () => {
    if (!person) return
    if (!confirm(`Suspend ${person.user.profile.firstName}'s account? They won't be able to accept deliveries.`)) return
    setIsSuspending(true)
    try {
      await api.patch(`/api/v1/delivery-personnel/persons/${person._id}/suspend`)
      toast.success('Account suspended successfully')
      router.push('/admin/delivery/personnel')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to suspend account')
    } finally {
      setIsSuspending(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-[13px] text-slate-400 font-medium">Loading profile…</p>
        </div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)' }}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-[17px] font-bold text-slate-800">Personnel Not Found</h2>
          <p className="text-[13px] text-slate-400 mt-1">This record may have been removed.</p>
          <Link href="/admin/delivery/personnel"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <ArrowLeft className="h-4 w-4" /> Back to Personnel
          </Link>
        </div>
      </div>
    )
  }

  const grad = getGradient(person._id)
  const zc   = getZone(person.zone)

  const verStatus: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    verified: { label: 'KYC Verified',  cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', icon: BadgeCheck },
    pending:  { label: 'Pending KYC',   cls: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',       icon: Clock },
    rejected: { label: 'KYC Rejected',  cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',          icon: XCircle },
  }
  const vs = verStatus[person.status.verificationStatus] ?? verStatus.pending
  const VIcon = vs.icon

  const isAvailableNow = person.availability.isAvailable && person.availability.isOnDuty

  const verifiedDocs = person.documents.filter(d => d.verified).length
  const completionRate = person.performance.totalDeliveries > 0
    ? Math.round((person.performance.completedDeliveries / person.performance.totalDeliveries) * 100)
    : 0

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 50%, #faf5ff 100%)',
      fontFamily: "'DM Sans', 'Inter', sans-serif",
    }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(circle, ${zc.glow}, transparent 70%)` }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-6">

        {/* ── Breadcrumb + back ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-3">
              <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
              <span>/</span>
              <Link href="/admin/delivery" className="hover:text-indigo-600 transition-colors">Delivery</Link>
              <span>/</span>
              <Link href="/admin/delivery/personnel" className="hover:text-indigo-600 transition-colors">Personnel</Link>
              <span>/</span>
              <span className="text-indigo-600 font-medium">{person.employeeId}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/delivery/personnel"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-[22px] font-bold text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Personnel Profile
                </h1>
                <p className="text-[12.5px] text-slate-400 mt-0.5">
                  Full profile · performance · documents · banking
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <Link href={`/admin/delivery/personnel/${person._id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:bg-slate-50 transition-all">
              <Edit className="h-3.5 w-3.5" /> Edit Profile
            </Link>
            <button
              onClick={handleSuspend}
              disabled={isSuspending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all disabled:opacity-50">
              {isSuspending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Suspend
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 6px 20px -4px rgba(99,102,241,0.4)' }}>
              <MessageCircle className="h-3.5 w-3.5" /> Send Message
            </button>
          </div>
        </div>

        {/* ── Hero Profile Card ─────────────────────────────────────────── */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className={`h-28 bg-gradient-to-r ${grad} relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
            <div className="absolute bottom-0 left-0 right-0 h-12"
              style={{ background: 'linear-gradient(to top, white, transparent)' }} />
          </div>

          <div className="px-7 pb-7 -mt-10 relative">
            <div className="flex flex-col md:flex-row md:items-end gap-5">
              {/* Avatar */}
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-white text-2xl font-bold shadow-2xl ring-4 ring-white flex-shrink-0`}>
                {initials(person)}
              </div>

              <div className="flex-1 md:mb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h2 className="text-[22px] font-bold text-slate-900 tracking-tight"
                    style={{ fontFamily: "'Playfair Display', serif" }}>
                    {person.user.profile.firstName} {person.user.profile.lastName}
                  </h2>
                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${vs.cls}`}>
                    <VIcon className="h-3 w-3" />{vs.label}
                  </span>
                  {isAvailableNow && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                      Live & Available
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Hash className="h-3 w-3" />
                    <code className="font-mono">{person.employeeId}</code>
                  </span>
                  <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Mail className="h-3 w-3" />{person.user.email}
                  </span>
                  <span className="flex items-center gap-1.5 text-[12.5px] text-slate-500">
                    <Phone className="h-3 w-3" />+91 {person.user.phone}
                  </span>
                  <span className={`flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full ${zc.pill}`}>
                    <MapPin className="h-3 w-3" />
                    {person.zone.charAt(0).toUpperCase() + person.zone.slice(1)} Zone
                  </span>
                </div>
              </div>

              {/* Quick stats strip */}
              <div className="flex gap-4 md:gap-6 flex-shrink-0 md:mb-1">
                <div className="text-center">
                  <p className="text-[20px] font-bold text-slate-900">{person.performance.completedDeliveries}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Deliveries</p>
                </div>
                <div className="w-px bg-slate-100" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <p className="text-[20px] font-bold text-slate-900">
                      {person.performance.averageRating > 0 ? person.performance.averageRating.toFixed(1) : '—'}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Rating</p>
                </div>
                <div className="w-px bg-slate-100" />
                <div className="text-center">
                  <p className="text-[20px] font-bold text-emerald-600">
                    {person.performance.onTimeRate > 0 ? `${person.performance.onTimeRate.toFixed(0)}%` : '—'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">On-time</p>
                </div>
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-4 pt-4 border-t border-slate-50">
              <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                <Calendar className="h-3 w-3" />
                Joined {fmtDate(person.metadata?.hiredAt ?? person.createdAt)}
              </span>
              {person.lastActive && (
                <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                  <Activity className="h-3 w-3" />
                  Last active {fmtDate(person.lastActive)}
                </span>
              )}
              {person.availability.shifts && (
                <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                  <Clock className="h-3 w-3" />
                  Shift {person.availability.shifts.start}–{person.availability.shifts.end}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                <FileText className="h-3 w-3" />
                {verifiedDocs}/{person.documents.length} docs verified
              </span>
              {person.maxConcurrentDeliveries && (
                <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                  <Target className="h-3 w-3" />
                  Max {person.maxConcurrentDeliveries} concurrent
                </span>
              )}
            </div>
          </div>

          {/* ── Tabs ──────────────────────────────────────────────────────── */}
          <div className="px-7 border-t border-slate-100">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium border-b-2 whitespace-nowrap transition-all ${
                      active
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Tab Content ───────────────────────────────────────────────── */}
          <div className="p-7">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {/* Vehicle */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-100">
                      <Truck className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-slate-800">Vehicle Information</h3>
                      <p className="text-[11px] text-slate-400">Registered fleet details</p>
                    </div>
                  </div>
                  <InfoRow label="Type"        value={<span className="capitalize">{vehicleEmoji[person.vehicle.type] ?? '🚗'} {person.vehicle.type}</span>} />
                  <InfoRow label="Model"       value={person.vehicle.model || '—'} />
                  <InfoRow label="Reg. Number" value={person.vehicle.number} mono />
                  {person.vehicle.registrationNumber && person.vehicle.registrationNumber !== person.vehicle.number && (
                    <InfoRow label="RC Number" value={person.vehicle.registrationNumber} mono />
                  )}
                </div>

                {/* Territory */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-100">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-slate-800">Service Territory</h3>
                      <p className="text-[11px] text-slate-400">Coverage & operational zone</p>
                    </div>
                  </div>
                  <InfoRow label="Zone" value={
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${zc.pill}`}>
                      {person.zone.charAt(0).toUpperCase() + person.zone.slice(1)} Zone
                    </span>
                  } />
                  <div className="py-2.5 border-b border-slate-50">
                    <span className="text-[12px] text-slate-400 font-medium">Serviceable Pincodes</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {person.serviceablePincodes.map(pin => (
                        <span key={pin} className="text-[11.5px] font-mono px-2 py-0.5 bg-white rounded-lg border border-slate-200 text-slate-700">
                          {pin}
                        </span>
                      ))}
                    </div>
                  </div>
                  {person.availability.shifts && (
                    <>
                      <InfoRow label="Shift Hours" value={`${person.availability.shifts.start} – ${person.availability.shifts.end}`} mono />
                      <div className="py-2.5">
                        <span className="text-[12px] text-slate-400 font-medium">Working Days</span>
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {['mon','tue','wed','thu','fri','sat','sun'].map(d => {
                            const active = person.availability.shifts!.workingDays.some(w => w.toLowerCase().startsWith(d))
                            return (
                              <span key={d} className={`text-[10px] font-semibold px-2 py-1 rounded-lg uppercase ${
                                active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>{d}</span>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Active Assignment */}
                {person.currentAssignments.length > 0 && (
                  <div className="lg:col-span-2 p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <h3 className="text-[13.5px] font-semibold text-indigo-800">Active Assignments</h3>
                    </div>
                    <div className="grid gap-2">
                      {person.currentAssignments.map((a, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-indigo-100">
                          <span className="text-[12.5px] font-mono text-indigo-700 font-medium">{a.delivery}</span>
                          {a.address && <span className="text-[12px] text-slate-500">{a.address}</span>}
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 capitalize">{a.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status / Compliance */}
                <div className="lg:col-span-2 bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md shadow-amber-100">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-[13.5px] font-semibold text-slate-800">Compliance & Status</h3>
                      <p className="text-[11px] text-slate-400">Account standing & verification</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Account Active',    value: person.status.isActive,                  yes: 'Active',   no: 'Inactive' },
                      { label: 'KYC Status',        value: person.status.verificationStatus === 'verified', yes: 'Verified', no: person.status.verificationStatus },
                      { label: 'Currently On Duty', value: person.availability.isOnDuty,            yes: 'On Duty',  no: 'Off Duty' },
                      { label: 'Available Now',     value: person.availability.isAvailable,          yes: 'Yes',      no: 'No' },
                    ].map(({ label, value, yes, no }) => (
                      <div key={label} className={`p-3 rounded-xl border ${value ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100 bg-white'}`}>
                        <p className="text-[10.5px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {value
                            ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                            : <XCircle className="h-3.5 w-3.5 text-slate-400" />}
                          <span className={`text-[13px] font-semibold ${value ? 'text-emerald-700' : 'text-slate-500'}`}>
                            {value ? yes : no}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PERFORMANCE */}
            {activeTab === 'performance' && (
              <div className="space-y-5">
                {/* Key metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <MetricCard label="Completed"  value={person.performance.completedDeliveries} icon={Package}    color="#6366f1" />
                  <MetricCard label="Failed"     value={person.performance.failedDeliveries}    icon={XCircle}   color="#f43f5e" />
                  <MetricCard label="Cancelled"  value={person.performance.cancelledDeliveries ?? 0} icon={AlertCircle} color="#f59e0b" />
                  <MetricCard label="Total"      value={person.performance.totalDeliveries}     icon={BarChart3} color="#0ea5e9" />
                </div>

                {/* Rating + Key stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rating ring */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center gap-3 shadow-sm">
                    <RatingRing value={person.performance.averageRating} />
                    <div className="text-center">
                      <p className="text-[13.5px] font-semibold text-slate-800">Customer Rating</p>
                      <p className="text-[11.5px] text-slate-400 mt-0.5">
                        Based on {person.performance.completedDeliveries} deliveries
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`h-4 w-4 ${i <= Math.round(person.performance.averageRating)
                          ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`} />
                      ))}
                    </div>
                  </div>

                  {/* On-time + completion */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[12.5px] font-medium text-slate-700">On-Time Rate</span>
                        <span className="text-[12.5px] font-bold text-emerald-600">
                          {person.performance.onTimeRate > 0 ? `${person.performance.onTimeRate.toFixed(1)}%` : '—'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                          style={{ width: `${person.performance.onTimeRate}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[12.5px] font-medium text-slate-700">Completion Rate</span>
                        <span className="text-[12.5px] font-bold text-indigo-600">{completionRate}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
                          style={{ width: `${completionRate}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-[12.5px] font-medium text-slate-700">Failure Rate</span>
                        <span className="text-[12.5px] font-bold text-rose-500">
                          {person.performance.totalDeliveries > 0
                            ? `${((person.performance.failedDeliveries / person.performance.totalDeliveries) * 100).toFixed(1)}%`
                            : '—'}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-rose-500 to-pink-400 rounded-full"
                          style={{ width: `${person.performance.totalDeliveries > 0
                            ? (person.performance.failedDeliveries / person.performance.totalDeliveries) * 100 : 0}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Earnings + Distance */}
                  <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                      <p className="text-[11px] text-emerald-600 font-medium uppercase tracking-wide">Total Earned</p>
                      <p className="text-[26px] font-bold text-emerald-700 mt-1">
                        ₹{fmt(person.performance.totalEarnings)}
                      </p>
                      <p className="text-[11px] text-emerald-500 mt-0.5">Lifetime payout</p>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100">
                      <p className="text-[11px] text-sky-600 font-medium uppercase tracking-wide">Total Distance</p>
                      <p className="text-[26px] font-bold text-sky-700 mt-1">
                        {fmt(person.performance.totalDistance)} <span className="text-[14px] font-normal">km</span>
                      </p>
                      <p className="text-[11px] text-sky-500 mt-0.5">Kilometres covered</p>
                    </div>
                  </div>
                </div>

                {/* Insight banner */}
                <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-100">
                    <Award className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-indigo-800">Performance Insight</p>
                    <p className="text-[12px] text-indigo-600 mt-0.5 leading-relaxed">
                      {completionRate >= 95
                        ? `Excellent performer with ${completionRate}% completion rate. Eligible for priority assignments and top-tier delivery bonuses.`
                        : completionRate >= 80
                        ? `Good performance at ${completionRate}% completion. Focus on reducing cancellations to unlock premium delivery zones.`
                        : `Completion rate at ${completionRate}%. Consider reviewing route assignments and providing additional training support.`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] text-slate-500">
                    <span className="font-semibold text-slate-800">{verifiedDocs}</span> of{' '}
                    <span className="font-semibold text-slate-800">{person.documents.length}</span> documents verified
                  </p>
                  <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${person.documents.length > 0 ? (verifiedDocs / person.documents.length) * 100 : 0}%` }} />
                  </div>
                </div>

                {person.documents.length === 0 ? (
                  <div className="py-14 text-center">
                    <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-slate-600">No documents uploaded yet</p>
                    <p className="text-[12.5px] text-slate-400 mt-1">Documents will appear here once the rider uploads them.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {person.documents.map((doc, i) => (
                      <DocumentCard key={i} doc={doc} />
                    ))}
                  </div>
                )}

                {/* Required docs checklist */}
                <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[12.5px] font-semibold text-slate-700 mb-3">Required Documents Checklist</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['license', 'aadhar', 'pan', 'vehicle_rc', 'insurance', 'photo'].map(type => {
                      const uploaded = person.documents.find(d => d.type === type)
                      const labels: Record<string, string> = {
                        license: 'Driving License', aadhar: 'Aadhaar Card', pan: 'PAN Card',
                        vehicle_rc: 'Vehicle RC', insurance: 'Insurance', photo: 'Passport Photo'
                      }
                      return (
                        <div key={type} className="flex items-center gap-2 text-[12px]">
                          {uploaded?.verified
                            ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                            : uploaded
                            ? <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            : <XCircle className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />}
                          <span className={uploaded?.verified ? 'text-slate-700' : uploaded ? 'text-amber-700' : 'text-slate-400'}>
                            {labels[type]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* BANKING */}
            {activeTab === 'banking' && (
              <div className="max-w-2xl space-y-4">
                {!person.bankDetails ? (
                  <div className="py-14 text-center">
                    <Banknote className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-[14px] font-medium text-slate-600">No banking details added</p>
                    <p className="text-[12.5px] text-slate-400 mt-1">Bank information will appear here once set up.</p>
                  </div>
                ) : (
                  <>
                    {/* Bank card visual */}
                    <div className="relative rounded-2xl overflow-hidden p-6 text-white"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a8e 50%, #1a3a5c 100%)' }}>
                      <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                      <div className="absolute top-4 right-5 text-4xl opacity-30">🏦</div>
                      <p className="text-[11px] font-medium text-blue-200 uppercase tracking-widest mb-4">Bank Account</p>
                      <p className="text-[22px] font-bold tracking-widest mb-1 font-mono">
                        {maskAccount(person.bankDetails.accountNumber)}
                      </p>
                      <p className="text-[13px] text-blue-200">{person.bankDetails.accountHolderName ?? '—'}</p>
                      <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-blue-300 uppercase tracking-wide">Bank</p>
                          <p className="text-[13px] font-semibold mt-0.5">{person.bankDetails.bankName ?? '—'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-300 uppercase tracking-wide">IFSC</p>
                          <p className="text-[13px] font-mono font-semibold mt-0.5">{person.bankDetails.ifscCode ?? '—'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-white/70" />
                        </div>
                      </div>
                    </div>

                    {/* Details table */}
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-5">
                      <InfoRow label="Account Holder"  value={person.bankDetails.accountHolderName ?? '—'} />
                      <InfoRow label="Account Number"  value={maskAccount(person.bankDetails.accountNumber)} mono />
                      <InfoRow label="IFSC Code"       value={person.bankDetails.ifscCode ?? '—'} mono />
                      <InfoRow label="Bank Name"       value={person.bankDetails.bankName ?? '—'} />
                      {person.bankDetails.upiId && (
                        <InfoRow label="UPI ID" value={person.bankDetails.upiId} mono />
                      )}
                    </div>

                    {/* Security note */}
                    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-slate-100">
                      <Shield className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-[11.5px] text-slate-500 leading-relaxed">
                        Banking details are <strong className="text-slate-700">AES-256 encrypted</strong> at rest. Account numbers are masked for display. Only authorised payout requests can access full details.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom action bar ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
          <p className="text-[12px] text-slate-400">
            Last updated {fmtDate(person.updatedAt ?? person.createdAt)} · ID{' '}
            <code className="font-mono text-slate-600">{person._id}</code>
          </p>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSuspend}
              disabled={isSuspending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium text-rose-600 border border-rose-200 bg-rose-50 hover:bg-rose-100 transition-all disabled:opacity-50">
              {isSuspending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Suspend Account
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', boxShadow: '0 4px 14px -4px rgba(99,102,241,0.4)' }}>
              <Headphones className="h-3.5 w-3.5" /> Contact Support
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}