// // app/admin/delivery/teams/create/page.tsx
// 'use client'

// import { useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import {
//   ArrowLeft, Users, Truck, MapPin, Plus, Trash2,
//   UserPlus, Crown, Star, Phone, Mail, Calendar,
//   Package, Weight, Wrench, Save, X, AlertCircle,
//   CheckCircle, ChevronDown, ChevronUp
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// // Mock available delivery persons
// const availablePersons = [
//   { _id: 'dlv1', name: 'Rahul Sharma', employeeId: 'DLV001', role: 'Team Lead', rating: 4.9, deliveries: 156 },
//   { _id: 'dlv2', name: 'Priya Singh', employeeId: 'DLV002', role: 'Driver', rating: 4.8, deliveries: 98 },
//   { _id: 'dlv3', name: 'Amit Kumar', employeeId: 'DLV003', role: 'Helper', rating: 4.7, deliveries: 87 },
//   { _id: 'dlv4', name: 'Suresh Reddy', employeeId: 'DLV004', role: 'Driver', rating: 4.6, deliveries: 45 },
//   { _id: 'dlv5', name: 'Neha Gupta', employeeId: 'DLV005', role: 'Helper', rating: 4.5, deliveries: 34 }
// ]

// const vehicleTypes = [
//   { value: 'bike', label: 'Bike', icon: '🏍️', capacity: 50 },
//   { value: 'car', label: 'Car', icon: '🚗', capacity: 200 },
//   { value: 'van', label: 'Van', icon: '🚐', capacity: 500 },
//   { value: 'truck', label: 'Truck', icon: '🚚', capacity: 1000 },
//   { value: 'mini-truck', label: 'Mini Truck', icon: '🚛', capacity: 800 }
// ]

// const zones = [
//   { value: 'North', label: 'North Zone' },
//   { value: 'South', label: 'South Zone' },
//   { value: 'East', label: 'East Zone' },
//   { value: 'West', label: 'West Zone' },
//   { value: 'Central', label: 'Central Zone' }
// ]

// const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

// api.interceptors.request.use(async (config) => {
//   const { getSession } = await import('next-auth/react')
//   const session = await getSession()
//   if (session?.user?.accessToken) {
//     config.headers.Authorization = `Bearer ${session.user.accessToken}`
//   }
//   return config
// })

// export default function CreateDeliveryTeamPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const toast = useToast()

//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [formData, setFormData] = useState({
//     name: '',
//     teamLeadId: '',
//     memberIds: [] as string[],
//     vehicleType: 'van',
//     vehicleNumber: '',
//     vehicleModel: '',
//     zones: ['North'] as string[],
//     serviceablePincodes: [''] as string[],
//     equipment: [] as { name: string; quantity: number; description: string }[]
//   })

//   const [errors, setErrors] = useState<Record<string, string>>({})

//   const addMember = (personId: string) => {
//     if (!formData.memberIds.includes(personId)) {
//       setFormData({ ...formData, memberIds: [...formData.memberIds, personId] })
//     }
//   }

//   const removeMember = (personId: string) => {
//     setFormData({ ...formData, memberIds: formData.memberIds.filter(id => id !== personId) })
//   }

//   const addZone = (zone: string) => {
//     if (!formData.zones.includes(zone)) {
//       setFormData({ ...formData, zones: [...formData.zones, zone] })
//     }
//   }

//   const removeZone = (zone: string) => {
//     setFormData({ ...formData, zones: formData.zones.filter(z => z !== zone) })
//   }

//   const addPincode = () => {
//     setFormData({ ...formData, serviceablePincodes: [...formData.serviceablePincodes, ''] })
//   }

//   const updatePincode = (index: number, value: string) => {
//     const newPincodes = [...formData.serviceablePincodes]
//     newPincodes[index] = value
//     setFormData({ ...formData, serviceablePincodes: newPincodes })
//   }

//   const removePincode = (index: number) => {
//     setFormData({ ...formData, serviceablePincodes: formData.serviceablePincodes.filter((_, i) => i !== index) })
//   }

//   const addEquipment = () => {
//     setFormData({ ...formData, equipment: [...formData.equipment, { name: '', quantity: 1, description: '' }] })
//   }

//   const updateEquipment = (index: number, field: string, value: any) => {
//     const newEquipment = [...formData.equipment]
//     newEquipment[index] = { ...newEquipment[index], [field]: value }
//     setFormData({ ...formData, equipment: newEquipment })
//   }

//   const removeEquipment = (index: number) => {
//     setFormData({ ...formData, equipment: formData.equipment.filter((_, i) => i !== index) })
//   }

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {}
//     if (!formData.name.trim()) newErrors.name = 'Team name is required'
//     if (!formData.teamLeadId) newErrors.teamLeadId = 'Team lead is required'
//     if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required'
//     if (formData.zones.length === 0) newErrors.zones = 'At least one zone is required'
//     if (!formData.serviceablePincodes[0]?.trim()) newErrors.pincode = 'At least one serviceable pincode is required'

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setIsSubmitting(true)
//     try {
//       // await new Promise(resolve => setTimeout(resolve, 1500))
//       await api.post(`${BASE_URL}/api/v1/delivery-personnel/teams`, formData)
//       toast.success('Delivery team created successfully!')
//       router.push('/admin/delivery/teams')
//     } catch (error) {
//       toast.error('Failed to create team')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const selectedTeamLead = availablePersons.find(p => p._id === formData.teamLeadId)
//   const selectedMembers = availablePersons.filter(p => formData.memberIds.includes(p._id))

//   if (sessionStatus === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-500">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        
//         {/* Header */}
//         <div className="flex items-center gap-4">
//           <Link href="/admin/delivery/teams" className="p-2 hover:bg-white rounded-xl transition-colors">
//             <ArrowLeft className="h-5 w-5 text-slate-600" />
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Create Delivery Team</h1>
//             <p className="text-slate-500 mt-0.5">Build a team for group deliveries and bulk operations</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Basic Information */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <Users className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Basic Information</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Team Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                       errors.name ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                     }`}
//                     placeholder="e.g., Alpha Squad, Beta Force"
//                   />
//                   {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Team Members */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <UserPlus className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Team Members</h2>
//               </div>
//               <p className="text-xs text-slate-500 mt-0.5">Select team lead and members</p>
//             </div>
//             <div className="p-6 space-y-6">
//               {/* Team Lead Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Team Lead <span className="text-red-500">*</span> <span className="text-xs text-slate-400">(Primary contact)</span>
//                 </label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {availablePersons.map(person => (
//                     <button
//                       key={person._id}
//                       type="button"
//                       onClick={() => setFormData({ ...formData, teamLeadId: person._id })}
//                       className={`p-3 rounded-xl border-2 transition-all text-left ${
//                         formData.teamLeadId === person._id
//                           ? 'border-primary bg-primary/5'
//                           : 'border-slate-200 hover:border-primary/50'
//                       }`}
//                     >
//                       <div className="flex items-center gap-2 mb-1">
//                         <Crown className={`h-4 w-4 ${formData.teamLeadId === person._id ? 'text-amber-500' : 'text-slate-400'}`} />
//                         <span className="font-medium text-slate-800">{person.name}</span>
//                       </div>
//                       <p className="text-xs text-slate-500">ID: {person.employeeId}</p>
//                       <div className="flex items-center gap-2 mt-1 text-xs">
//                         <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
//                         <span>{person.rating}</span>
//                         <span className="text-slate-400">• {person.deliveries} deliveries</span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//                 {errors.teamLeadId && <p className="text-xs text-red-500 mt-2">{errors.teamLeadId}</p>}
//               </div>

//               {/* Team Members Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                   {availablePersons.filter(p => p._id !== formData.teamLeadId).map(person => (
//                     <button
//                       key={person._id}
//                       type="button"
//                       onClick={() => addMember(person._id)}
//                       className={`p-3 rounded-xl border-2 transition-all text-left ${
//                         formData.memberIds.includes(person._id)
//                           ? 'border-green-500 bg-green-50'
//                           : 'border-slate-200 hover:border-primary/50'
//                       }`}
//                     >
//                       <div className="flex items-center gap-2 mb-1">
//                         <Users className="h-4 w-4 text-slate-400" />
//                         <span className="font-medium text-slate-800">{person.name}</span>
//                       </div>
//                       <p className="text-xs text-slate-500">ID: {person.employeeId}</p>
//                       <div className="flex items-center gap-2 mt-1 text-xs">
//                         <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
//                         <span>{person.rating}</span>
//                         <span className="text-slate-400">• {person.deliveries} deliveries</span>
//                       </div>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Selected Members */}
//               {(selectedTeamLead || selectedMembers.length > 0) && (
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <h4 className="text-sm font-semibold text-slate-700 mb-3">Selected Team</h4>
//                   <div className="space-y-2">
//                     {selectedTeamLead && (
//                       <div className="flex items-center justify-between p-2 bg-white rounded-lg">
//                         <div className="flex items-center gap-2">
//                           <Crown className="h-4 w-4 text-amber-500" />
//                           <span className="text-sm font-medium">{selectedTeamLead.name}</span>
//                           <span className="text-xs text-slate-400">(Team Lead)</span>
//                         </div>
//                       </div>
//                     )}
//                     {selectedMembers.map(member => (
//                       <div key={member._id} className="flex items-center justify-between p-2 bg-white rounded-lg">
//                         <span className="text-sm">{member.name}</span>
//                         <button
//                           type="button"
//                           onClick={() => removeMember(member._id)}
//                           className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
//                         >
//                           <Trash2 className="h-3.5 w-3.5" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Vehicle Information */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <Truck className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Vehicle Information</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Vehicle Type
//                   </label>
//                   <select
//                     value={formData.vehicleType}
//                     onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                   >
//                     {vehicleTypes.map(v => (
//                       <option key={v.value} value={v.value}>{v.icon} {v.label} (Capacity: {v.capacity}kg)</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Vehicle Number <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.vehicleNumber}
//                     onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
//                     className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                       errors.vehicleNumber ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                     }`}
//                     placeholder="DL 01 AB 1234"
//                   />
//                   {errors.vehicleNumber && <p className="text-xs text-red-500 mt-1">{errors.vehicleNumber}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Vehicle Model
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.vehicleModel}
//                     onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="e.g., Tata Winger, Mahindra Bolero"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Service Areas */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Service Areas</h2>
//               </div>
//             </div>
//             <div className="p-6 space-y-6">
//               {/* Zones */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Service Zones</label>
//                 <div className="flex flex-wrap gap-2">
//                   {zones.map(zone => (
//                     <button
//                       key={zone.value}
//                       type="button"
//                       onClick={() => formData.zones.includes(zone.value) ? removeZone(zone.value) : addZone(zone.value)}
//                       className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
//                         formData.zones.includes(zone.value)
//                           ? 'bg-primary text-white'
//                           : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//                       }`}
//                     >
//                       {zone.label}
//                     </button>
//                   ))}
//                 </div>
//                 {errors.zones && <p className="text-xs text-red-500 mt-2">{errors.zones}</p>}
//               </div>

//               {/* Pincodes */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Serviceable Pincodes <span className="text-red-500">*</span>
//                 </label>
//                 <div className="space-y-2">
//                   {formData.serviceablePincodes.map((pincode, idx) => (
//                     <div key={idx} className="flex gap-2">
//                       <input
//                         type="text"
//                         value={pincode}
//                         onChange={(e) => updatePincode(idx, e.target.value)}
//                         className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                         placeholder="110001"
//                         maxLength={6}
//                       />
//                       {idx > 0 && (
//                         <button
//                           type="button"
//                           onClick={() => removePincode(idx)}
//                           className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       )}
//                     </div>
//                   ))}
//                   <button
//                     type="button"
//                     onClick={addPincode}
//                     className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
//                   >
//                     <Plus className="h-3.5 w-3.5" />
//                     Add pincode
//                   </button>
//                 </div>
//                 {errors.pincode && <p className="text-xs text-red-500 mt-2">{errors.pincode}</p>}
//               </div>
//             </div>
//           </div>

//           {/* Equipment */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <Wrench className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Equipment & Tools</h2>
//               </div>
//               <p className="text-xs text-slate-500 mt-0.5">Optional equipment assigned to this team</p>
//             </div>
//             <div className="p-6">
//               <div className="space-y-3">
//                 {formData.equipment.map((item, idx) => (
//                   <div key={idx} className="flex gap-3 items-start">
//                     <input
//                       type="text"
//                       placeholder="Equipment name"
//                       value={item.name}
//                       onChange={(e) => updateEquipment(idx, 'name', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     />
//                     <input
//                       type="number"
//                       placeholder="Qty"
//                       value={item.quantity}
//                       onChange={(e) => updateEquipment(idx, 'quantity', parseInt(e.target.value) || 0)}
//                       className="w-20 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     />
//                     <input
//                       type="text"
//                       placeholder="Description"
//                       value={item.description}
//                       onChange={(e) => updateEquipment(idx, 'description', e.target.value)}
//                       className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeEquipment(idx)}
//                       className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addEquipment}
//                   className="text-sm text-primary hover:underline flex items-center gap-1"
//                 >
//                   <Plus className="h-3.5 w-3.5" />
//                   Add equipment
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4 justify-end pt-4">
//             <Link
//               href="/admin/delivery/teams"
//               className="px-6 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
//             >
//               Cancel
//             </Link>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4" />
//                   Create Team
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }


'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Users, Truck, MapPin, Plus, Trash2,
  UserPlus, Crown, Star, Phone, Search,
  Wrench, X, AlertCircle, CheckCircle2,
  ChevronDown, Loader2, Info, Zap, Target,
  Shield, Package, ChevronRight, Hash
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

// ─── Config ──────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if ((session as any)?.user?.accessToken)
    config.headers.Authorization = `Bearer ${(session as any).user.accessToken}`
  return config
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface DeliveryPerson {
  _id: string
  employeeId: string
  user: {
    profile: { firstName: string; lastName: string }
    phone: string
    email: string
  }
  vehicle: { type: string; model: string }
  zone: string
  performance: { averageRating: number; completedDeliveries: number; onTimeRate: number }
  availability: { isAvailable: boolean; isOnDuty: boolean }
  status: { verificationStatus: string }
}

// member role as per schema enum
type MemberRole = 'driver' | 'helper' | 'technician' | 'installer' | 'supervisor'

interface SelectedMember {
  deliveryPerson: string   // ObjectId
  role: MemberRole
}

interface Equipment {
  name: string
  quantity: number
  description: string
}

// ─── Static options ───────────────────────────────────────────────────────────

const VEHICLE_TYPES = [
  { value: 'bike',       label: 'Bike',       icon: '🏍️', capacity: 50  },
  { value: 'car',        label: 'Car',         icon: '🚗', capacity: 200 },
  { value: 'van',        label: 'Van',         icon: '🚐', capacity: 500 },
  { value: 'truck',      label: 'Truck',       icon: '🚚', capacity: 1000 },
  { value: 'mini-truck', label: 'Mini Truck',  icon: '🚛', capacity: 800 },
  { value: 'tempo',      label: 'Tempo',       icon: '🚌', capacity: 600 },
]

const ZONES = [
  { value: 'north',   label: 'North',   color: 'bg-sky-100 text-sky-700 border-sky-200',       active: 'bg-sky-600 text-white border-sky-600'       },
  { value: 'south',   label: 'South',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', active: 'bg-emerald-600 text-white border-emerald-600' },
  { value: 'east',    label: 'East',    color: 'bg-violet-100 text-violet-700 border-violet-200',    active: 'bg-violet-600 text-white border-violet-600'   },
  { value: 'west',    label: 'West',    color: 'bg-rose-100 text-rose-700 border-rose-200',         active: 'bg-rose-600 text-white border-rose-600'       },
  { value: 'central', label: 'Central', color: 'bg-amber-100 text-amber-700 border-amber-200',      active: 'bg-amber-600 text-white border-amber-600'     },
]

const MEMBER_ROLES: { value: MemberRole; label: string; icon: string }[] = [
  { value: 'driver',      label: 'Driver',      icon: '🚗' },
  { value: 'helper',      label: 'Helper',      icon: '🤝' },
  { value: 'technician',  label: 'Technician',  icon: '🔧' },
  { value: 'installer',   label: 'Installer',   icon: '🔩' },
  { value: 'supervisor',  label: 'Supervisor',  icon: '📋' },
]

const PINCODE_DB: Record<string, { area: string; city: string }> = {
  '110001': { area: 'Connaught Place',  city: 'New Delhi' },
  '110002': { area: 'Darya Ganj',       city: 'New Delhi' },
  '400001': { area: 'Fort',             city: 'Mumbai'    },
  '400051': { area: 'Bandra West',      city: 'Mumbai'    },
  '560001': { area: 'MG Road',          city: 'Bangalore' },
  '560034': { area: 'Koramangala',      city: 'Bangalore' },
  '700001': { area: 'BBD Bagh',         city: 'Kolkata'   },
  '500001': { area: 'Abids',            city: 'Hyderabad' },
  '600001': { area: 'George Town',      city: 'Chennai'   },
  '411001': { area: 'Shivajinagar',     city: 'Pune'      },
  '226001': { area: 'Hazratganj',       city: 'Lucknow'   },
  '302001': { area: 'Bani Park',        city: 'Jaipur'    },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const personName = (p: DeliveryPerson) =>
  `${p.user.profile.firstName} ${p.user.profile.lastName}`

const avatarGradients = [
  'from-indigo-500 to-violet-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-sky-500 to-blue-600',
]
const personGrad = (id: string) =>
  avatarGradients[id.charCodeAt(id.length - 1) % avatarGradients.length]

// ─── Person Picker Modal ──────────────────────────────────────────────────────

function PersonPickerModal({
  persons,
  selectedId,
  isTeamLead,
  disabledIds,
  onSelect,
  onClose,
}: {
  persons: DeliveryPerson[]
  selectedId?: string
  isTeamLead: boolean
  disabledIds: string[]
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtered = persons.filter(p => {
    const name = personName(p).toLowerCase()
    const s = search.toLowerCase()
    return name.includes(s) || p.employeeId.toLowerCase().includes(s) || p.user.phone.includes(s)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(6px)' }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 32px 64px -12px rgba(15,23,42,0.4)' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-slate-900"
                style={{ fontFamily: "'Playfair Display', serif" }}>
                {isTeamLead ? '👑 Select Team Lead' : '👤 Add Team Member'}
              </h3>
              <p className="text-[12px] text-slate-400 mt-0.5">
                {isTeamLead ? 'This person will be the primary contact for the team' : 'Select a delivery person to add to the team'}
              </p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID or phone…"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] focus:outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto max-h-80 p-3 space-y-1.5">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-[13px] text-slate-400">No personnel found</div>
          )}
          {filtered.map(p => {
            const disabled = disabledIds.includes(p._id)
            const selected = selectedId === p._id
            const grad = personGrad(p._id)
            return (
              <button
                key={p._id}
                type="button"
                disabled={disabled}
                onClick={() => { onSelect(p._id); onClose() }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  disabled ? 'opacity-40 cursor-not-allowed' :
                  selected ? 'bg-indigo-50 border-2 border-indigo-400' :
                  'border-2 border-transparent hover:bg-slate-50 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0`}>
                  {p.user.profile.firstName[0]}{p.user.profile.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[13.5px] font-semibold text-slate-800 truncate">{personName(p)}</p>
                    {selected && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    <code className="font-mono">{p.employeeId}</code> · {p.user.phone}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-0.5 justify-end">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-[12px] font-semibold text-slate-700">
                      {p.performance.averageRating > 0 ? p.performance.averageRating.toFixed(1) : '—'}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{p.performance.completedDeliveries} done</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <p className="text-[11.5px] text-slate-400">{filtered.length} available</p>
          <button onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-slate-600 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, step, color = 'from-indigo-500 to-violet-600' }: {
  icon: React.ElementType; title: string; subtitle?: string; step: number; color?: string
}) {
  return (
    <div className="flex items-start gap-4 px-7 py-5 border-b border-slate-100">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md flex-shrink-0`}
        style={{ boxShadow: '0 4px 12px -2px rgba(99,102,241,0.3)' }}>
        <Icon className="text-white" style={{ width: 17, height: 17 }} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[14.5px] font-semibold text-slate-800 tracking-tight">{title}</h2>
          <span className="text-[10.5px] font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">Step {step}</span>
        </div>
        {subtitle && <p className="text-[11.5px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

const inputCls = (err?: string) =>
  `w-full px-3.5 py-2.5 rounded-xl border text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none transition-all ${
    err
      ? 'border-rose-400 bg-rose-50/60 focus:border-rose-500'
      : 'border-slate-200 bg-white hover:border-indigo-300 focus:border-indigo-400 focus:shadow-sm focus:shadow-indigo-100'
  }`

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12.5px] font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-rose-500 ml-0.5 normal-case">*</span>}
    </label>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-[11.5px] text-rose-500 mt-1.5">
      <AlertCircle className="h-3 w-3" />{msg}
    </p>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreateDeliveryTeamPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()

  // Available persons from API
  const [persons, setPersons] = useState<DeliveryPerson[]>([])
  const [isLoadingPersons, setIsLoadingPersons] = useState(true)

  // Modal state
  const [modal, setModal] = useState<'lead' | 'member' | null>(null)

  // Active step highlight
  const [activeStep, setActiveStep] = useState(0)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Form state — shaped exactly to match the Mongoose schema ──────────────
  const [form, setForm] = useState({
    name: '',
    teamLeadId: '',         // maps to teamLead (ObjectId)
    members: [] as SelectedMember[],  // { deliveryPerson: ObjectId, role }
    vehicle: {
      type: 'van',
      number: '',
      model: '',
      capacity: 500,
      registrationNumber: '',
    },
    zone: ['north'] as string[],   // lowercase array — matches schema enum
    serviceablePincodes: [''],
    equipment: [] as Equipment[],
    maxConcurrentDeliveries: 10,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pincodeInfo, setPincodeInfo] = useState<Record<number, { area: string; city: string } | null>>({})

  // ── Fetch personnel ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/v1/delivery-personnel/persons', { params: { limit: 100 } })
        setPersons(res.data.data.persons ?? [])
      } catch {
        toast.error('Could not load delivery personnel')
      } finally {
        setIsLoadingPersons(false)
      }
    }
    load()
  }, [])

  // ── Vehicle capacity auto-sync ─────────────────────────────────────────────
  const setVehicleType = (type: string) => {
    const cap = VEHICLE_TYPES.find(v => v.value === type)?.capacity ?? 500
    setForm(f => ({ ...f, vehicle: { ...f.vehicle, type, capacity: cap } }))
  }

  // ── Zones ──────────────────────────────────────────────────────────────────
  const toggleZone = (z: string) =>
    setForm(f => ({
      ...f,
      zone: f.zone.includes(z) ? f.zone.filter(x => x !== z) : [...f.zone, z]
    }))

  // ── Pincodes ───────────────────────────────────────────────────────────────
  const updatePincode = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6)
    const arr = [...form.serviceablePincodes]; arr[idx] = clean
    setForm(f => ({ ...f, serviceablePincodes: arr }))
    if (clean.length === 6) setPincodeInfo(p => ({ ...p, [idx]: PINCODE_DB[clean] ?? null }))
    else setPincodeInfo(p => { const n = { ...p }; delete n[idx]; return n })
  }

  // ── Members ────────────────────────────────────────────────────────────────
  const addMember = (personId: string) => {
    if (!form.members.find(m => m.deliveryPerson === personId))
      setForm(f => ({ ...f, members: [...f.members, { deliveryPerson: personId, role: 'helper' }] }))
  }

  const updateMemberRole = (personId: string, role: MemberRole) =>
    setForm(f => ({
      ...f,
      members: f.members.map(m => m.deliveryPerson === personId ? { ...m, role } : m)
    }))

  const removeMember = (personId: string) =>
    setForm(f => ({ ...f, members: f.members.filter(m => m.deliveryPerson !== personId) }))

  // ── Equipment ──────────────────────────────────────────────────────────────
  const addEquipment = () =>
    setForm(f => ({ ...f, equipment: [...f.equipment, { name: '', quantity: 1, description: '' }] }))

  const updateEquipment = (idx: number, field: keyof Equipment, val: any) => {
    const arr = [...form.equipment]; arr[idx] = { ...arr[idx], [field]: val }
    setForm(f => ({ ...f, equipment: arr }))
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Team name is required'
    if (!form.teamLeadId) e.teamLeadId = 'Please select a team lead'
    if (!form.vehicle.number.trim()) e.vehicleNumber = 'Vehicle number is required'
    if (form.zone.length === 0) e.zones = 'Select at least one zone'
    if (!form.serviceablePincodes[0]?.trim()) e.pincode = 'At least one pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit — send payload that matches schema ──────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    try {
      const payload = {
        name:           form.name.trim(),
        teamLeadId:     form.teamLeadId,               // backend maps to teamLead ObjectId
        members:        form.members,                  // [{ deliveryPerson, role }]
        vehicle:        {
          type:               form.vehicle.type,
          number:             form.vehicle.number.trim(),
          model:              form.vehicle.model.trim() || undefined,
          capacity:           form.vehicle.capacity,
          registrationNumber: form.vehicle.registrationNumber.trim() || undefined,
        },
        zone:                form.zone,                // lowercase array
        serviceablePincodes: form.serviceablePincodes.filter(p => p.trim().length === 6),
        equipment:           form.equipment.filter(eq => eq.name.trim()),
        maxConcurrentDeliveries: form.maxConcurrentDeliveries,
      }
      await api.post('/api/v1/delivery-personnel/teams', payload)
      toast.success('Delivery team created successfully!')
      router.push('/admin/delivery/teams')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to create team'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const leadPerson = persons.find(p => p._id === form.teamLeadId)
  const memberPersons = persons.filter(p => form.members.find(m => m.deliveryPerson === p._id))
  // IDs already used (lead + members) — disable in picker
  const usedIds = [form.teamLeadId, ...form.members.map(m => m.deliveryPerson)].filter(Boolean)

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)' }}>
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f8faff 0%, #eef2ff 50%, #faf5ff 100%)',
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}>
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
      </div>

      {/* Modal */}
      {modal && (
        <PersonPickerModal
          persons={persons}
          isTeamLead={modal === 'lead'}
          selectedId={modal === 'lead' ? form.teamLeadId : undefined}
          disabledIds={modal === 'lead' ? form.members.map(m => m.deliveryPerson) : [form.teamLeadId]}
          onSelect={id => {
            if (modal === 'lead') setForm(f => ({ ...f, teamLeadId: id }))
            else addMember(id)
          }}
          onClose={() => setModal(null)}
        />
      )}

      <div className="relative max-w-[880px] mx-auto px-4 py-10 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-4">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/delivery" className="hover:text-indigo-600 transition-colors">Delivery</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/admin/delivery/teams" className="hover:text-indigo-600 transition-colors">Teams</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-indigo-600 font-medium">Create</span>
          </div>

          <div className="flex items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <Link href="/admin/delivery/teams"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex-shrink-0">
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-[26px] font-bold text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Create Delivery Team
                </h1>
                <p className="text-[13px] text-slate-400 mt-0.5">
                  Build a coordinated team for group & bulk deliveries
                </p>
              </div>
            </div>

            {/* Step pills */}
            <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
              {['Team', 'Vehicle', 'Territory', 'Equipment'].map((s, i) => (
                <button key={s} type="button" onClick={() => setActiveStep(i)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    activeStep === i
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Info banner ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <p className="text-[12.5px] text-slate-600">
            <span className="font-semibold text-slate-800">Team capacity note:</span>{' '}
            Vehicle capacity auto-sets based on type. All zones are lowercase per system convention.
            Members can have individual roles assigned.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Step 1: Basic Info + Team Members ───────────────────────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveStep(0)}>
            <SectionHeader icon={Users} title="Team Identity & Members" subtitle="Name your team and assign personnel" step={1} />
            <div className="p-7 space-y-6">

              {/* Team name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Team Name</FieldLabel>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inputCls(errors.name)}
                    placeholder="e.g., Alpha Squad, Phoenix Force"
                  />
                  <FieldError msg={errors.name} />
                </div>
                <div>
                  <FieldLabel>Max Concurrent Deliveries</FieldLabel>
                  <input
                    type="number"
                    value={form.maxConcurrentDeliveries}
                    onChange={e => setForm(f => ({ ...f, maxConcurrentDeliveries: Number(e.target.value) || 10 }))}
                    className={inputCls()}
                    min={1} max={50}
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <Info className="h-3 w-3" />Default is 10. Max allowed per schema: 50
                  </p>
                </div>
              </div>

              {/* Team Lead picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel required>Team Lead</FieldLabel>
                  <span className="text-[11px] text-slate-400">Primary contact & supervisor</span>
                </div>

                {leadPerson ? (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${personGrad(leadPerson._id)} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                      {leadPerson.user.profile.firstName[0]}{leadPerson.user.profile.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-amber-500" />
                        <p className="text-[14px] font-semibold text-slate-900">{personName(leadPerson)}</p>
                      </div>
                      <p className="text-[11.5px] text-slate-500 mt-0.5">
                        <code className="font-mono">{leadPerson.employeeId}</code> · ⭐ {leadPerson.performance.averageRating.toFixed(1)} · {leadPerson.performance.completedDeliveries} deliveries
                      </p>
                    </div>
                    <button type="button" onClick={() => setModal('lead')}
                      className="px-3 py-1.5 text-[12px] font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors">
                      Change
                    </button>
                    <button type="button" onClick={() => setForm(f => ({ ...f, teamLeadId: '' }))}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setModal('lead')}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed transition-all hover:border-indigo-400 hover:bg-indigo-50/50 ${
                      errors.teamLeadId ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-[13.5px] font-medium text-slate-600">Choose Team Lead</p>
                      <p className="text-[11.5px] text-slate-400">Click to browse and select</p>
                    </div>
                    {isLoadingPersons && <Loader2 className="h-4 w-4 text-slate-400 animate-spin ml-auto" />}
                  </button>
                )}
                <FieldError msg={errors.teamLeadId} />
              </div>

              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel>Team Members</FieldLabel>
                  <button type="button" onClick={() => setModal('member')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    <Plus className="h-3.5 w-3.5" /> Add Member
                  </button>
                </div>

                {form.members.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                    <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[13px] text-slate-400 font-medium">No members yet</p>
                    <p className="text-[11.5px] text-slate-300 mt-0.5">Team lead + members form the complete team</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {memberPersons.map(p => {
                      const memberData = form.members.find(m => m.deliveryPerson === p._id)!
                      const grad = personGrad(p._id)
                      return (
                        <div key={p._id} className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0`}>
                            {p.user.profile.firstName[0]}{p.user.profile.lastName[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800">{personName(p)}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{p.employeeId}</p>
                          </div>
                          {/* Role selector */}
                          <div className="relative">
                            <select
                              value={memberData.role}
                              onChange={e => updateMemberRole(p._id, e.target.value as MemberRole)}
                              className="appearance-none pl-2.5 pr-7 py-1.5 text-[12px] font-medium bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 text-slate-700 cursor-pointer"
                            >
                              {MEMBER_ROLES.map(r => (
                                <option key={r.value} value={r.value}>{r.icon} {r.label}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
                          </div>
                          <button type="button" onClick={() => removeMember(p._id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Team summary */}
              {(leadPerson || form.members.length > 0) && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
                  <Shield className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                  <p className="text-[12.5px] text-indigo-700">
                    Team size: <strong>{(leadPerson ? 1 : 0) + form.members.length}</strong> · 
                    Roles: {[...new Set(form.members.map(m => m.role))].join(', ') || 'none assigned'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Step 2: Vehicle Information ──────────────────────────────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveStep(1)}>
            <SectionHeader icon={Truck} title="Vehicle Information" color="from-emerald-500 to-teal-600" subtitle="Fleet details for this team" step={2} />
            <div className="p-7">
              {/* Vehicle type cards */}
              <div className="mb-5">
                <FieldLabel required>Vehicle Type</FieldLabel>
                <div className="flex gap-2.5 flex-wrap">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v.value} type="button"
                      onClick={() => setVehicleType(v.value)}
                      className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all ${
                        form.vehicle.type === v.value
                          ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}>
                      <span className="text-xl">{v.icon}</span>
                      <span className={`text-[11px] font-semibold ${form.vehicle.type === v.value ? 'text-emerald-700' : 'text-slate-600'}`}>{v.label}</span>
                      <span className="text-[10px] text-slate-400">{v.capacity}kg</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Registration Number</FieldLabel>
                  <input type="text" value={form.vehicle.number}
                    onChange={e => setForm(f => ({ ...f, vehicle: { ...f.vehicle, number: e.target.value.toUpperCase() } }))}
                    className={`${inputCls(errors.vehicleNumber)} font-mono tracking-widest`}
                    placeholder="DL 01 AB 1234" />
                  <FieldError msg={errors.vehicleNumber} />
                </div>
                <div>
                  <FieldLabel>Vehicle Model</FieldLabel>
                  <input type="text" value={form.vehicle.model}
                    onChange={e => setForm(f => ({ ...f, vehicle: { ...f.vehicle, model: e.target.value } }))}
                    className={inputCls()}
                    placeholder="Tata Winger, Mahindra Bolero…" />
                </div>
                <div>
                  <FieldLabel>RC / Registration Certificate No.</FieldLabel>
                  <input type="text" value={form.vehicle.registrationNumber}
                    onChange={e => setForm(f => ({ ...f, vehicle: { ...f.vehicle, registrationNumber: e.target.value.toUpperCase() } }))}
                    className={`${inputCls()} font-mono`}
                    placeholder="Auto-filled or manual entry" />
                </div>
                <div>
                  <FieldLabel>Capacity (kg)</FieldLabel>
                  <input type="number" value={form.vehicle.capacity}
                    onChange={e => setForm(f => ({ ...f, vehicle: { ...f.vehicle, capacity: Number(e.target.value) } }))}
                    className={inputCls()} min={1} />
                  <p className="text-[11px] text-slate-400 mt-1.5">Auto-set from vehicle type; override if needed</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 3: Service Territory ────────────────────────────────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveStep(2)}>
            <SectionHeader icon={MapPin} title="Service Territory" color="from-rose-500 to-pink-600" subtitle="Operational zones and pincode coverage" step={3} />
            <div className="p-7 space-y-5">

              {/* Zones */}
              <div>
                <FieldLabel required>Service Zones</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {ZONES.map(z => {
                    const active = form.zone.includes(z.value)
                    return (
                      <button key={z.value} type="button" onClick={() => toggleZone(z.value)}
                        className={`px-4 py-2 rounded-xl border-2 text-[13px] font-semibold transition-all ${active ? z.active : z.color}`}>
                        {z.label} Zone
                        {active && <span className="ml-1.5">✓</span>}
                      </button>
                    )
                  })}
                </div>
                <FieldError msg={errors.zones} />
                {form.zone.length > 0 && (
                  <p className="text-[11.5px] text-slate-400 mt-2 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Zones sent as lowercase: [{form.zone.join(', ')}]
                  </p>
                )}
              </div>

              {/* Pincodes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FieldLabel required>Serviceable Pincodes</FieldLabel>
                  <span className="text-[11px] text-slate-400">{form.serviceablePincodes.filter(p => p.trim().length === 6).length} valid</span>
                </div>
                <div className="space-y-2">
                  {form.serviceablePincodes.map((pin, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex gap-2">
                        <div className={`flex-1 flex items-center rounded-xl border transition-all ${
                          pin.length === 6
                            ? pincodeInfo[idx] ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/50'
                            : 'border-slate-200 bg-white hover:border-indigo-300 focus-within:border-indigo-400'
                        }`}>
                          <input type="text" value={pin}
                            onChange={e => updatePincode(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-transparent text-[13.5px] font-mono tracking-widest text-slate-800 placeholder:text-slate-300 focus:outline-none"
                            placeholder="110001" maxLength={6} />
                          {pin.length === 6 && pincodeInfo[idx] && <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3" />}
                        </div>
                        {idx > 0 && (
                          <button type="button"
                            onClick={() => setForm(f => ({ ...f, serviceablePincodes: f.serviceablePincodes.filter((_, i) => i !== idx) }))}
                            className="w-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {pin.length === 6 && pincodeInfo[idx] && (
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 pl-1">
                          <MapPin className="h-3 w-3" />{pincodeInfo[idx]!.area}, {pincodeInfo[idx]!.city}
                        </p>
                      )}
                    </div>
                  ))}
                  <FieldError msg={errors.pincode} />
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, serviceablePincodes: [...f.serviceablePincodes, ''] }))}
                    className="flex items-center gap-1.5 text-[12.5px] text-indigo-600 font-medium hover:text-indigo-700 transition-colors mt-1">
                    <Plus className="h-3.5 w-3.5" /> Add another pincode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Step 4: Equipment ────────────────────────────────────────── */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveStep(3)}>
            <SectionHeader icon={Wrench} title="Equipment & Tools" color="from-amber-500 to-orange-500" subtitle="Optional equipment assigned to this team" step={4} />
            <div className="p-7">
              {form.equipment.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-2xl mb-4">
                  <Wrench className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[13px] text-slate-400 font-medium">No equipment added</p>
                  <p className="text-[11.5px] text-slate-300 mt-0.5">Add tools, devices, or supplies for this team</p>
                </div>
              ) : (
                <div className="space-y-3 mb-4">
                  {/* Header row */}
                  <div className="grid grid-cols-12 gap-3 px-1">
                    <span className="col-span-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Item Name</span>
                    <span className="col-span-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Qty</span>
                    <span className="col-span-5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Description</span>
                  </div>
                  {form.equipment.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 items-start">
                      <input type="text" value={item.name} placeholder="e.g., Scanner"
                        onChange={e => updateEquipment(idx, 'name', e.target.value)}
                        className={`col-span-4 ${inputCls()}`} />
                      <input type="number" value={item.quantity} min={1}
                        onChange={e => updateEquipment(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className={`col-span-2 ${inputCls()}`} />
                      <input type="text" value={item.description} placeholder="Brief note"
                        onChange={e => updateEquipment(idx, 'description', e.target.value)}
                        className={`col-span-5 ${inputCls()}`} />
                      <button type="button" onClick={() => setForm(f => ({ ...f, equipment: f.equipment.filter((_, i) => i !== idx) }))}
                        className="col-span-1 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors border border-slate-200">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={addEquipment}
                className="flex items-center gap-1.5 text-[12.5px] text-amber-600 font-medium hover:text-amber-700 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Add equipment item
              </button>
            </div>
          </div>

          {/* ── Preview card ──────────────────────────────────────────────── */}
          {(form.name || leadPerson) && (
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200">
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-5 w-5 text-indigo-200" />
                <p className="text-[13px] font-semibold text-indigo-100 uppercase tracking-wide">Team Preview</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-[10.5px] text-indigo-300 uppercase tracking-wide">Name</p>
                  <p className="text-[14px] font-bold mt-0.5">{form.name || '—'}</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-indigo-300 uppercase tracking-wide">Team Size</p>
                  <p className="text-[14px] font-bold mt-0.5">{(leadPerson ? 1 : 0) + form.members.length} people</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-indigo-300 uppercase tracking-wide">Vehicle</p>
                  <p className="text-[14px] font-bold mt-0.5 capitalize">{form.vehicle.type} · {form.vehicle.capacity}kg</p>
                </div>
                <div>
                  <p className="text-[10.5px] text-indigo-300 uppercase tracking-wide">Zones</p>
                  <p className="text-[14px] font-bold mt-0.5 capitalize">{form.zone.join(', ') || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Action Row ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link href="/admin/delivery/teams"
              className="px-5 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting}
              className="relative flex items-center gap-2.5 px-7 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all shadow-lg disabled:opacity-60 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 8px 24px -4px rgba(99,102,241,0.5)',
              }}>
              {!isSubmitting && (
                <div className="absolute inset-0 opacity-20"
                  style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)', animation: 'shimmer 2.5s infinite' }} />
              )}
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Creating Team…</>
              ) : (
                <><Users className="h-4 w-4" />Create Team</>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
      `}</style>
    </div>
  )
}
