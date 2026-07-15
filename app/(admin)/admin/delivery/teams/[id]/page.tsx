// app/admin/delivery/teams/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Users, Truck, MapPin, Star, Phone, Mail,
  Calendar, Activity, TrendingUp, Award, CheckCircle,
  XCircle, Clock, Crown, Package, Wrench, Edit,
  MessageCircle, Headphones, Download, Eye, BarChart3,
  PieChart, Target, Rocket, Zap, Sparkles
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Mock team data
const mockTeam = {
  _id: 'team1',
  name: 'Alpha Squad',
  teamCode: 'TEAM001',
  teamLead: {
    _id: 'dlv1',
    employeeId: 'DLV001',
    user: {
      profile: { firstName: 'Rahul', lastName: 'Sharma' },
      phone: '+91 98765 43210',
      email: 'rahul.sharma@example.com'
    },
    performance: { averageRating: 4.9, completedDeliveries: 156, onTimeRate: 98 }
  },
  members: [
    {
      deliveryPerson: {
        _id: 'dlv2',
        employeeId: 'DLV002',
        user: { profile: { firstName: 'Priya', lastName: 'Singh' } },
        phone: '+91 98765 43211',
        performance: { averageRating: 4.8, completedDeliveries: 98 }
      },
      role: 'driver',
      joinedAt: '2024-01-15T00:00:00Z',
      isActive: true
    },
    {
      deliveryPerson: {
        _id: 'dlv3',
        employeeId: 'DLV003',
        user: { profile: { firstName: 'Amit', lastName: 'Kumar' } },
        phone: '+91 98765 43212',
        performance: { averageRating: 4.7, completedDeliveries: 87 }
      },
      role: 'helper',
      joinedAt: '2024-01-15T00:00:00Z',
      isActive: true
    }
  ],
  vehicle: {
    type: 'van',
    number: 'DL 10 XY 7890',
    model: 'Tata Winger',
    capacity: 500
  },
  zone: ['North', 'East'],
  serviceablePincodes: ['110001', '110002', '110030', '110031', '110032'],
  equipment: [
    { name: 'Hand Truck', quantity: 2, description: 'Heavy-duty hand truck' },
    { name: 'Straps', quantity: 4, description: 'Cargo securing straps' },
    { name: 'Dolly', quantity: 1, description: 'Moving dolly' }
  ],
  performance: {
    totalDeliveries: 245,
    completedDeliveries: 238,
    failedDeliveries: 7,
    averageRating: 4.8,
    onTimeRate: 97.1,
    totalDistance: 1890,
    totalEarnings: 32450,
    customerFeedback: 4.7
  },
  availability: { isAvailable: true, isOnDuty: true },
  currentDeliveries: [{ delivery: 'DLV001234', status: 'assigned', address: 'Sector 62, Noida' }],
  createdAt: '2024-01-15T00:00:00Z',
  updatedAt: '2024-05-15T10:30:00Z'
}

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

export default function DeliveryTeamDetailPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const toast = useToast()
  const [team, setTeam] = useState<any>(mockTeam)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'performance' | 'equipment'>('overview')

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [sessionStatus, router])

  const statusConfig = team.availability.isAvailable && team.availability.isOnDuty
    ? { label: 'Active', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' }
    : team.availability.isOnDuty
      ? { label: 'On Duty', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' }
      : { label: 'Off Duty', color: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-500' }

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading team details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/delivery/teams" className="p-2 hover:bg-white rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Delivery Team Details</h1>
            <p className="text-slate-500 mt-0.5">View and manage team information</p>
          </div>
        </div>

        {/* Team Header */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/5 px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {team.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap mb-2">
                  <h2 className="text-2xl font-bold text-slate-800">{team.name}</h2>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.color}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                    {statusConfig.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <span className="font-mono">{team.teamCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    <span>Lead: {team.teamLead.user.profile.firstName} {team.teamLead.user.profile.lastName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Users className="h-3.5 w-3.5" />
                    <span>{team.members.length + 1} members</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created {new Date(team.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/delivery/teams/${team._id}/edit`}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Team
                </Link>
                <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Lead
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Target },
                { id: 'members', label: 'Team Members', icon: Users },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'equipment', label: 'Equipment', icon: Wrench },
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-purple-500" />
                      Vehicle Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Type:</span><span className="capitalize font-medium">{team.vehicle.type}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Number:</span><span className="font-mono">{team.vehicle.number}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Model:</span><span>{team.vehicle.model}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Capacity:</span><span>{team.vehicle.capacity} kg</span></div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-5">
                    <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-500" />
                      Service Areas
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Zones:</span><span>{team.zone.join(', ')}</span></div>
                      <div><span className="text-slate-500">Pincodes:</span><div className="flex flex-wrap gap-1 mt-1">{team.serviceablePincodes.map((p: string) => <span key={p} className="px-2 py-0.5 bg-white rounded-full text-xs font-mono">{p}</span>)}</div></div>
                    </div>
                  </div>
                </div>
                {team.currentDeliveries.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Current Active Delivery
                    </h4>
                    <p className="text-sm text-blue-700">📍 {team.currentDeliveries[0].address}</p>
                    <p className="text-xs text-blue-600 mt-1">Status: {team.currentDeliveries[0].status}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6">
                {/* Team Lead */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-5 border border-amber-200">
                  <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Team Lead
                  </h3>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{team.teamLead.user.profile.firstName} {team.teamLead.user.profile.lastName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {team.teamLead.employeeId}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />{team.teamLead.performance.averageRating}</div>
                        <div className="flex items-center gap-1 text-sm"><CheckCircle className="h-3.5 w-3.5 text-green-500" />{team.teamLead.performance.completedDeliveries} deliveries</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{team.teamLead.user.phone}</p>
                      <p className="text-xs text-slate-500">{team.teamLead.user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Team Members</h3>
                  <div className="space-y-3">
                    {team.members.map((member: any, idx: number) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-slate-800">{member.deliveryPerson.user.profile.firstName} {member.deliveryPerson.user.profile.lastName}</p>
                            <p className="text-xs text-slate-500">ID: {member.deliveryPerson.employeeId}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full capitalize">{member.role}</span>
                              <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{member.deliveryPerson.performance.averageRating}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Joined {new Date(member.joinedAt).toLocaleDateString()}</p>
                            <button className="mt-2 text-xs text-primary hover:underline">View Profile</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-xl"><p className="text-2xl font-bold text-slate-800">{team.performance.totalDeliveries}</p><p className="text-xs text-slate-500">Total Deliveries</p></div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl"><p className="text-2xl font-bold text-green-600">{team.performance.completedDeliveries}</p><p className="text-xs text-slate-500">Completed</p></div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl"><p className="text-2xl font-bold text-green-600">{team.performance.onTimeRate}%</p><p className="text-xs text-slate-500">On-Time Rate</p></div>
                  <div className="text-center p-4 bg-slate-50 rounded-xl"><div className="flex items-center justify-center gap-0.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><p className="text-2xl font-bold text-slate-800">{team.performance.averageRating}</p></div><p className="text-xs text-slate-500">Avg Rating</p></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Total Distance</p><p className="text-xl font-bold text-slate-800">{team.performance.totalDistance} km</p></div>
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-sm text-slate-500">Total Earnings</p><p className="text-xl font-bold text-green-600">₹{team.performance.totalEarnings.toLocaleString()}</p></div>
                </div>
              </div>
            )}

            {activeTab === 'equipment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {team.equipment.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Package className="h-5 w-5 text-purple-600" /></div>
                    <div className="flex-1"><p className="font-medium text-slate-800">{item.name}</p><p className="text-xs text-slate-500">{item.description}</p></div>
                    <div className="text-right"><p className="text-sm font-semibold text-primary">Qty: {item.quantity}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <button className="px-4 py-2 border border-amber-200 text-amber-600 rounded-xl font-medium hover:bg-amber-50 transition-colors flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Set Off Duty
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  )
}