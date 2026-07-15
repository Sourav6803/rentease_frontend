// app/admin/delivery/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Truck, Users, MapPin, Clock, TrendingUp, TrendingDown,
  CheckCircle, XCircle, AlertCircle, Search, Filter, Download,
  RefreshCw, ChevronLeft, ChevronRight, Eye, Edit, Trash2,
  Plus, MoreVertical, Calendar, DollarSign, Star, Award,
  Zap, Shield, Phone, Mail, Navigation, BarChart3, PieChart,
  Activity, Target, Rocket, Crown, Sparkles, Heart, Bell,
  Settings, UserPlus, UserCheck, UserX, Ban, Flag, FileText,
  Image, Video, Headphones, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  PieChart as RePieChart, Pie, Cell, Legend
} from 'recharts'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface DeliveryPerson {
  _id: string
  employeeId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: { firstName: string; lastName: string; avatar?: string }
  }
  vehicle: {
    type: string
    number: string
    model: string
  }
  zone: string
  serviceablePincodes: string[]
  availability: {
    isAvailable: boolean
    isOnDuty: boolean
    currentLocation?: { coordinates: number[] }
  }
  performance: {
    totalDeliveries: number
    completedDeliveries: number
    failedDeliveries: number
    averageRating: number
    onTimeRate: number
    totalDistance: number
    totalEarnings: number
  }
  currentAssignments: Array<{ delivery: string; status: string }>
  status: {
    isActive: boolean
    verificationStatus: string
  }
  createdAt: string
}

interface DeliveryTeam {
  _id: string
  name: string
  teamCode: string
  teamLead: DeliveryPerson
  members: Array<{ deliveryPerson: DeliveryPerson; role: string }>
  vehicle: { type: string; number: string; capacity: number }
  zone: string[]
  serviceablePincodes: string[]
  performance: {
    totalDeliveries: number
    completedDeliveries: number
    averageRating: number
    onTimeRate: number
  }
  availability: { isAvailable: boolean; isOnDuty: boolean }
}

interface DeliveryStats {
  total: number
  pending: number
  assigned: number
  inTransit: number
  delivered: number
  failed: number
  onTimeRate: number
  avgDeliveryTime: number
}

// Mock Data (Fallback when API is not ready)
const mockDeliveryPersons: DeliveryPerson[] = [
  {
    _id: '1',
    employeeId: 'DLV001',
    user: {
      _id: 'u1',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      profile: { firstName: 'Rahul', lastName: 'Sharma' }
    },
    vehicle: { type: 'bike', number: 'DL 01 AB 1234', model: 'Honda Activa' },
    zone: 'North',
    serviceablePincodes: ['110001', '110002', '110003'],
    availability: { isAvailable: true, isOnDuty: true },
    performance: {
      totalDeliveries: 156,
      completedDeliveries: 152,
      failedDeliveries: 4,
      averageRating: 4.8,
      onTimeRate: 97.4,
      totalDistance: 1245,
      totalEarnings: 18750
    },
    currentAssignments: [{ delivery: 'd1', status: 'assigned' }],
    status: { isActive: true, verificationStatus: 'verified' },
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    _id: '2',
    employeeId: 'DLV002',
    user: {
      _id: 'u2',
      email: 'priya.singh@example.com',
      phone: '+91 98765 43211',
      profile: { firstName: 'Priya', lastName: 'Singh' }
    },
    vehicle: { type: 'car', number: 'DL 02 CD 5678', model: 'Maruti Suzuki' },
    zone: 'South',
    serviceablePincodes: ['110020', '110021', '110022'],
    availability: { isAvailable: true, isOnDuty: true },
    performance: {
      totalDeliveries: 98,
      completedDeliveries: 96,
      failedDeliveries: 2,
      averageRating: 4.9,
      onTimeRate: 98.5,
      totalDistance: 890,
      totalEarnings: 12450
    },
    currentAssignments: [],
    status: { isActive: true, verificationStatus: 'verified' },
    createdAt: '2024-02-10T00:00:00Z'
  },
  {
    _id: '3',
    employeeId: 'DLV003',
    user: {
      _id: 'u3',
      email: 'amit.kumar@example.com',
      phone: '+91 98765 43212',
      profile: { firstName: 'Amit', lastName: 'Kumar' }
    },
    vehicle: { type: 'bike', number: 'DL 03 EF 9012', model: 'TVS Apache' },
    zone: 'East',
    serviceablePincodes: ['110030', '110031', '110032'],
    availability: { isAvailable: false, isOnDuty: true },
    performance: {
      totalDeliveries: 87,
      completedDeliveries: 84,
      failedDeliveries: 3,
      averageRating: 4.7,
      onTimeRate: 96.6,
      totalDistance: 756,
      totalEarnings: 11200
    },
    currentAssignments: [{ delivery: 'd2', status: 'started' }],
    status: { isActive: true, verificationStatus: 'verified' },
    createdAt: '2024-03-05T00:00:00Z'
  }
]

const mockTeams: DeliveryTeam[] = [
  {
    _id: 'team1',
    name: 'Alpha Squad',
    teamCode: 'TEAM001',
    teamLead: mockDeliveryPersons[0],
    members: [
      { deliveryPerson: mockDeliveryPersons[1], role: 'helper' },
      { deliveryPerson: mockDeliveryPersons[2], role: 'driver' }
    ],
    vehicle: { type: 'van', number: 'DL 10 XY 7890', capacity: 500 },
    zone: ['North', 'East'],
    serviceablePincodes: ['110001', '110002', '110030', '110031'],
    performance: {
      totalDeliveries: 245,
      completedDeliveries: 238,
      averageRating: 4.8,
      onTimeRate: 97.1
    },
    availability: { isAvailable: true, isOnDuty: true }
  }
]

const deliveryStats: DeliveryStats = {
  total: 1245,
  pending: 23,
  assigned: 45,
  inTransit: 67,
  delivered: 1089,
  failed: 21,
  onTimeRate: 94.5,
  avgDeliveryTime: 38
}

const deliveryTrendData = [
  { month: 'Jan', deliveries: 145, onTime: 135, failed: 10 },
  { month: 'Feb', deliveries: 168, onTime: 158, failed: 10 },
  { month: 'Mar', deliveries: 189, onTime: 179, failed: 10 },
  { month: 'Apr', deliveries: 210, onTime: 200, failed: 10 },
  { month: 'May', deliveries: 234, onTime: 222, failed: 12 },
  { month: 'Jun', deliveries: 256, onTime: 244, failed: 12 },
]

const zoneDistribution = [
  { name: 'North', value: 35, color: '#2874f0' },
  { name: 'South', value: 28, color: '#21a056' },
  { name: 'East', value: 22, color: '#fb641b' },
  { name: 'West', value: 15, color: '#9c27b0' },
]

// API Service
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Components
const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle, onClick }: any) => (
  <motion.div whileHover={{ y: -2 }} onClick={onClick} className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-all">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mt-3">{value.toLocaleString()}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
  </motion.div>
)

const DeliveryPersonCard = ({ person, onView, onEdit, onAssign }: any) => {
  const statusColor = person.availability.isAvailable && person.availability.isOnDuty 
    ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Available' }
    : person.availability.isOnDuty 
      ? { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'On Duty' }
      : { bg: 'bg-red-100', text: 'text-red-700', label: 'Off Duty' }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg">
            {person.user.profile.firstName.charAt(0)}{person.user.profile.lastName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-800">
                {person.user.profile.firstName} {person.user.profile.lastName}
              </h3>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor.bg} ${statusColor.text}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${statusColor.text.replace('text', 'bg')}`} />
                {statusColor.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">{person.employeeId}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onView(person)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="View Details">
            <Eye className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={() => onEdit(person)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit">
            <Edit className="h-4 w-4 text-slate-500" />
          </button>
          <button onClick={() => onAssign(person)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Assign Delivery">
            <Truck className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <Phone className="h-3.5 w-3.5" />
          <span className="text-xs">{person.user.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Mail className="h-3.5 w-3.5" />
          <span className="text-xs truncate">{person.user.email}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <Navigation className="h-3.5 w-3.5" />
          <span className="text-xs capitalize">{person.vehicle.type}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          <span className="text-xs">{person.zone} Zone</span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Package className="h-3.5 w-3.5 text-primary" />
          <span className="text-sm font-semibold">{person.performance.completedDeliveries}</span>
          <span className="text-xs text-slate-400">deliveries</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold">{person.performance.averageRating}</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5 text-green-500" />
          <span className="text-sm font-semibold">{person.performance.onTimeRate}%</span>
        </div>
      </div>
      {person.currentAssignments.length > 0 && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700 flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Active: {person.currentAssignments.length} delivery
          </p>
        </div>
      )}
    </div>
  )
}

const TeamCard = ({ team, onView, onEdit }: any) => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
          {team.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-800">{team.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${team.availability.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${team.availability.isAvailable ? 'bg-green-600' : 'bg-red-600'}`} />
              {team.availability.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{team.teamCode}</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => onView(team)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="View Details">
          <Eye className="h-4 w-4 text-slate-500" />
        </button>
        <button onClick={() => onEdit(team)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Edit">
          <Edit className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Users className="h-3.5 w-3.5" />
        <span className="text-xs">{team.members.length + 1} members</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Truck className="h-3.5 w-3.5" />
        <span className="text-xs capitalize">{team.vehicle.type}</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        <span className="text-xs">{team.zone.join(', ')} Zones</span>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        <span className="text-xs">{team.performance.averageRating} ★</span>
      </div>
    </div>
    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
      <div className="flex-1">
        <p className="text-xs text-slate-500">Team Lead</p>
        <p className="text-sm font-medium">{team.teamLead.user.profile.firstName} {team.teamLead.user.profile.lastName}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">Total Deliveries</p>
        <p className="text-sm font-semibold">{team.performance.totalDeliveries}</p>
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">On-Time Rate</p>
        <p className="text-sm font-semibold text-green-600">{team.performance.onTimeRate}%</p>
      </div>
    </div>
  </div>
)

// Main Component
export default function AdminDeliveryPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [activeTab, setActiveTab] = useState<'overview' | 'personnel' | 'teams'>('overview')
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>(mockDeliveryPersons)
  const [teams, setTeams] = useState<DeliveryTeam[]>(mockTeams)
  const [stats, setStats] = useState<DeliveryStats>(deliveryStats)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterZone, setFilterZone] = useState('all')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
    // Fetch real data when API is ready
    // fetchDeliveryData()
  }, [sessionStatus, router])

  const filteredPersons = deliveryPersons.filter(person => {
    const matchesSearch = person.user.profile.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.user.profile.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesZone = filterZone === 'all' || person.zone === filterZone
    return matchesSearch && matchesZone
  })

  const statCards = [
    { title: 'Total Deliveries', value: stats.total, icon: Package, color: '#2874f0', trend: { value: 12, isPositive: true }, subtitle: 'Last 30 days' },
    { title: 'Active Deliveries', value: stats.assigned + stats.inTransit, icon: Truck, color: '#fb641b', trend: { value: 8, isPositive: true }, subtitle: 'In progress' },
    { title: 'Completed', value: stats.delivered, icon: CheckCircle, color: '#21a056', trend: { value: 15, isPositive: true }, subtitle: 'Success rate' },
    { title: 'Failed', value: stats.failed, icon: XCircle, color: '#ef4444', trend: { value: 5, isPositive: false }, subtitle: 'Need attention' },
    { title: 'On-Time Rate', value: `${stats.onTimeRate}%`, icon: Clock, color: '#8b5cf6', subtitle: 'Delivery performance' },
    { title: 'Avg Delivery Time', value: `${stats.avgDeliveryTime}min`, icon: Activity, color: '#06b6d4', subtitle: 'Per delivery' },
  ]

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading delivery dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Delivery Management</h1>
            <p className="text-slate-500 mt-1">Manage delivery personnel, track performance, and optimize operations</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
              <Download className="h-4 w-4" /> Export Report
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
              <UserPlus className="h-4 w-4" /> Add Delivery Person
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <StatsCard key={i} {...card} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Trends Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Delivery Trends</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly delivery performance</p>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deliveryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deliveries" fill="#2874f0" name="Total Deliveries" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="onTime" fill="#21a056" name="On-Time" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#ef4444" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Distribution Chart */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-slate-800">Zone Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Delivery personnel by zone</p>
              </div>
              <PieChart className="h-5 w-5 text-slate-400" />
            </div>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={zoneDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    // label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    label={({ name, percent }) =>
                    `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                    }
                  >
                    {zoneDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-1">
          <div className="flex gap-1">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'personnel', label: 'Delivery Personnel', icon: Users, count: deliveryPersons.length },
              { id: 'teams', label: 'Delivery Teams', icon: Users, count: teams.length },
            ].map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-slate-100'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">94.5%</p>
                      <p className="text-xs text-slate-500">Success Rate</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">↑ 2.3% from last month</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">38 min</p>
                      <p className="text-xs text-slate-500">Avg Delivery Time</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">↓ 5 min improvement</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Star className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">4.8 ★</p>
                      <p className="text-xs text-slate-500">Customer Rating</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Based on 1,234 reviews</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-800">45</p>
                      <p className="text-xs text-slate-500">Active Deliveries</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600">Currently in transit</p>
                </div>
              </div>

              {/* Top Performers */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">Top Performing Delivery Personnel</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Based on completion rate and customer ratings</p>
                  </div>
                  <Award className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {deliveryPersons.slice(0, 5).map((person, idx) => (
                    <div key={person._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {person.user.profile.firstName} {person.user.profile.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{person.performance.completedDeliveries} deliveries</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">{person.performance.averageRating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-sm font-semibold">{person.performance.onTimeRate}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Truck className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm font-semibold">{person.performance.completedDeliveries}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-5 text-white">
                  <Bell className="h-8 w-8 mb-3 opacity-80" />
                  <h4 className="font-semibold">Unassigned Deliveries</h4>
                  <p className="text-3xl font-bold mt-2">23</p>
                  <p className="text-sm opacity-80 mt-1">Need assignment</p>
                  <button className="mt-4 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    Assign Now →
                  </button>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-5 text-white">
                  <Users className="h-8 w-8 mb-3 opacity-80" />
                  <h4 className="font-semibold">Available Personnel</h4>
                  <p className="text-3xl font-bold mt-2">12</p>
                  <p className="text-sm opacity-80 mt-1">Ready for assignment</p>
                  <button className="mt-4 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    View Available →
                  </button>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-5 text-white">
                  <FileText className="h-8 w-8 mb-3 opacity-80" />
                  <h4 className="font-semibold">Pending Verifications</h4>
                  <p className="text-3xl font-bold mt-2">3</p>
                  <p className="text-sm opacity-80 mt-1">Documents awaiting review</p>
                  <button className="mt-4 px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    Verify Now →
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'personnel' && (
            <motion.div
              key="personnel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Filters */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name, employee ID, or phone..."
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <select
                    value={filterZone}
                    onChange={(e) => setFilterZone(e.target.value)}
                    className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
                  >
                    <option value="all">All Zones</option>
                    <option value="North">North Zone</option>
                    <option value="South">South Zone</option>
                    <option value="East">East Zone</option>
                    <option value="West">West Zone</option>
                  </select>
                  <button className="px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                    <Filter className="h-4 w-4 inline mr-2" />
                    Filter
                  </button>
                </div>
              </div>

              {/* Personnel Grid */}
              {filteredPersons.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800">No delivery personnel found</h3>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your search or add new personnel</p>
                  <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">
                    <UserPlus className="h-4 w-4 inline mr-2" />
                    Add Delivery Person
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPersons.map((person) => (
                    <DeliveryPersonCard
                      key={person._id}
                      person={person}
                      onView={(p:any) => console.log('View', p)}
                      onEdit={(p:any) => console.log('Edit', p)}
                      onAssign={(p:any) => console.log('Assign', p)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div
              key="teams"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
                  <Plus className="h-4 w-4" />
                  Create Team
                </button>
              </div>
              {teams.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                  <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-800">No delivery teams created</h3>
                  <p className="text-sm text-slate-500 mt-1">Create teams to manage group deliveries</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {teams.map((team) => (
                    <TeamCard
                      key={team._id}
                      team={team}
                      onView={(t:any) => console.log('View', t)}
                      onEdit={(t:any) => console.log('Edit', t)}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Headphones className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Need Help with Delivery Management?</h3>
                <p className="text-sm text-slate-500">Check documentation or contact support for assistance</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
                View Documentation
              </button>
              <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}