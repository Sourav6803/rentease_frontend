// // app/admin/delivery/personnel/create/page.tsx
// 'use client'

// import { useState } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { motion } from 'framer-motion'
// import {
//   ArrowLeft, UserPlus, Mail, Phone, User, MapPin, Navigation,
//   Truck, Calendar, Shield, CheckCircle, XCircle, Upload,
//   FileText, CreditCard, Banknote, Building2, Globe, Lock,
//   Eye, EyeOff, AlertCircle, Save, X, Plus, Trash2
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// const vehicleTypes = [
//   { value: 'bike', label: 'Bike', icon: '🏍️' },
//   { value: 'scooter', label: 'Scooter', icon: '🛵' },
//   { value: 'car', label: 'Car', icon: '🚗' },
//   { value: 'van', label: 'Van', icon: '🚐' },
//   { value: 'truck', label: 'Truck', icon: '🚚' },
// ]

// const zones = [
//   { value: 'North', label: 'North Zone', cities: ['Delhi NCR', 'Chandigarh', 'Jaipur'] },
//   { value: 'South', label: 'South Zone', cities: ['Bangalore', 'Chennai', 'Hyderabad'] },
//   { value: 'East', label: 'East Zone', cities: ['Kolkata', 'Bhubaneswar', 'Patna'] },
//   { value: 'West', label: 'West Zone', cities: ['Mumbai', 'Pune', 'Ahmedabad'] },
//   { value: 'Central', label: 'Central Zone', cities: ['Lucknow', 'Bhopal', 'Indore'] },
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

// export default function CreateDeliveryPersonPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const toast = useToast()

//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [showPassword, setShowPassword] = useState(false)
//   const [formData, setFormData] = useState({
//     // Personal Info
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     // Vehicle Info
//     vehicleType: 'bike',
//     vehicleNumber: '',
//     vehicleModel: '',
//     // Work Info
//     zone: 'North',
//     serviceablePincodes: [''],
//     // Bank Details
//     accountHolderName: '',
//     accountNumber: '',
//     ifscCode: '',
//     bankName: '',
//     upiId: '',
//   })

//   const [errors, setErrors] = useState<Record<string, string>>({})

//   const validateForm = () => {
//     const newErrors: Record<string, string> = {}

//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
//     if (!formData.email.trim()) newErrors.email = 'Email is required'
//     else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
//     else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number'
//     if (!formData.password) newErrors.password = 'Password is required'
//     else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
//     if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
//     if (!formData.vehicleNumber.trim()) newErrors.vehicleNumber = 'Vehicle number is required'
//     if (!formData.serviceablePincodes[0]?.trim()) newErrors.pincode = 'At least one serviceable pincode is required'

//     setErrors(newErrors)
//     return Object.keys(newErrors).length === 0
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!validateForm()) return

//     setIsSubmitting(true)
//     try {
//       // API call would go here
//       await new Promise(resolve => setTimeout(resolve, 1500))
//       toast.success('Delivery person created successfully!')
//       router.push('/admin/delivery/personnel')
//     } catch (error) {
//       toast.error('Failed to create delivery person')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const addPincode = () => {
//     setFormData({
//       ...formData,
//       serviceablePincodes: [...formData.serviceablePincodes, '']
//     })
//   }

//   const removePincode = (index: number) => {
//     setFormData({
//       ...formData,
//       serviceablePincodes: formData.serviceablePincodes.filter((_, i) => i !== index)
//     })
//   }

//   const updatePincode = (index: number, value: string) => {
//     const newPincodes = [...formData.serviceablePincodes]
//     newPincodes[index] = value
//     setFormData({ ...formData, serviceablePincodes: newPincodes })
//   }

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
//           <Link
//             href="/admin/delivery/personnel"
//             className="p-2 hover:bg-white rounded-xl transition-colors"
//           >
//             <ArrowLeft className="h-5 w-5 text-slate-600" />
//           </Link>
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Add Delivery Personnel</h1>
//             <p className="text-slate-500 mt-0.5">Create a new delivery person profile</p>
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Personal Information */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <User className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Personal Information</h2>
//               </div>
//               <p className="text-xs text-slate-500 mt-0.5">Basic contact and identification details</p>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     First Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.firstName}
//                     onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
//                     className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${
//                       errors.firstName ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                     }`}
//                     placeholder="Enter first name"
//                   />
//                   {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Last Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.lastName}
//                     onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="Enter last name"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Email Address <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                         errors.email ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                       }`}
//                       placeholder="john@example.com"
//                     />
//                   </div>
//                   {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Phone Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <input
//                       type="tel"
//                       value={formData.phone}
//                       onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                       className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                         errors.phone ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                       }`}
//                       placeholder="9876543210"
//                     />
//                   </div>
//                   {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <input
//                       type={showPassword ? 'text' : 'password'}
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className={`w-full pl-9 pr-10 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                         errors.password ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                       }`}
//                       placeholder="••••••••"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2"
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
//                     </button>
//                   </div>
//                   {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Confirm Password <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                     <input
//                       type="password"
//                       value={formData.confirmPassword}
//                       onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                       className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 ${
//                         errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-slate-200'
//                       }`}
//                       placeholder="••••••••"
//                     />
//                   </div>
//                   {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
//                 </div>
//               </div>
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
//                     Vehicle Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.vehicleType}
//                     onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                   >
//                     {vehicleTypes.map(v => (
//                       <option key={v.value} value={v.value}>{v.icon} {v.label}</option>
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
//                     placeholder="Honda Activa 6G"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Work Information */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <MapPin className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Work Information</h2>
//               </div>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Assigned Zone <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.zone}
//                     onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                   >
//                     {zones.map(z => (
//                       <option key={z.value} value={z.value}>{z.label}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Serviceable Pincodes <span className="text-red-500">*</span>
//                   </label>
//                   <div className="space-y-2">
//                     {formData.serviceablePincodes.map((pincode, idx) => (
//                       <div key={idx} className="flex gap-2">
//                         <input
//                           type="text"
//                           value={pincode}
//                           onChange={(e) => updatePincode(idx, e.target.value)}
//                           className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                           placeholder="110001"
//                           maxLength={6}
//                         />
//                         {idx > 0 && (
//                           <button
//                             type="button"
//                             onClick={() => removePincode(idx)}
//                             className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                     <button
//                       type="button"
//                       onClick={addPincode}
//                       className="text-sm text-primary hover:underline flex items-center gap-1 mt-2"
//                     >
//                       <Plus className="h-3.5 w-3.5" />
//                       Add another pincode
//                     </button>
//                   </div>
//                   {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Bank Details */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
//             <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
//               <div className="flex items-center gap-2">
//                 <Banknote className="h-5 w-5 text-primary" />
//                 <h2 className="font-semibold text-slate-800">Bank Details</h2>
//               </div>
//               <p className="text-xs text-slate-500 mt-0.5">For payout processing</p>
//             </div>
//             <div className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Account Holder Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.accountHolderName}
//                     onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="As per bank account"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Account Number
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.accountNumber}
//                     onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="XXXXXXXXXX1234"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     IFSC Code
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.ifscCode}
//                     onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="SBIN0001234"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     Bank Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.bankName}
//                     onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="State Bank of India"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-1.5">
//                     UPI ID
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.upiId}
//                     onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
//                     className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                     placeholder="username@okhdfcbank"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-4 justify-end pt-4">
//             <Link
//               href="/admin/delivery/personnel"
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
//                   <UserPlus className="h-4 w-4" />
//                   Create Delivery Person
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

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, UserPlus, Mail, Phone, User, MapPin,
  Truck, Banknote, Lock, Eye, EyeOff, Plus, Trash2,
  CheckCircle2, AlertCircle, ChevronDown, Search,
  Loader2, Building2, RefreshCw, Info, Star
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Static Data ────────────────────────────────────────────────────────────

const vehicleTypes = [
  { value: 'bike',    label: 'Bike',    icon: '🏍️', capacity: 'Up to 10 kg' },
  { value: 'scooter', label: 'Scooter', icon: '🛵', capacity: 'Up to 15 kg' },
  { value: 'car',     label: 'Car',     icon: '🚗', capacity: 'Up to 50 kg' },
  { value: 'van',     label: 'Van',     icon: '🚐', capacity: 'Up to 200 kg' },
  { value: 'truck',   label: 'Truck',   icon: '🚚', capacity: 'Up to 1000 kg' },
]

const zones = [
  { value: 'North',   label: 'North Zone',   cities: ['Delhi NCR', 'Chandigarh', 'Jaipur', 'Amritsar'] },
  { value: 'South',   label: 'South Zone',   cities: ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi'] },
  { value: 'East',    label: 'East Zone',    cities: ['Kolkata', 'Bhubaneswar', 'Patna', 'Guwahati'] },
  { value: 'West',    label: 'West Zone',    cities: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat'] },
  { value: 'Central', label: 'Central Zone', cities: ['Lucknow', 'Bhopal', 'Indore', 'Nagpur'] },
]

// Pincode → City/Area mapping (India)
const pincodeDatabase: Record<string, { city: string; state: string; area: string }> = {
  '110001': { city: 'New Delhi', state: 'Delhi', area: 'Connaught Place' },
  '110002': { city: 'New Delhi', state: 'Delhi', area: 'Darya Ganj' },
  '110003': { city: 'New Delhi', state: 'Delhi', area: 'Lodi Estate' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', area: 'Fort' },
  '400051': { city: 'Mumbai', state: 'Maharashtra', area: 'Bandra West' },
  '560001': { city: 'Bangalore', state: 'Karnataka', area: 'MG Road' },
  '560034': { city: 'Bangalore', state: 'Karnataka', area: 'Koramangala' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', area: 'George Town' },
  '700001': { city: 'Kolkata', state: 'West Bengal', area: 'BBD Bagh' },
  '721301': { city: 'Kharagpur', state: 'West Bengal', area: 'Kharagpur Town' },
  '500001': { city: 'Hyderabad', state: 'Telangana', area: 'Abids' },
  '411001': { city: 'Pune', state: 'Maharashtra', area: 'Shivajinagar' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', area: 'Relief Road' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', area: 'Bani Park' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', area: 'Hazratganj' },
}

const indianBanks = [
  { value: 'SBI',     label: 'State Bank of India',          ifscPrefix: 'SBIN', color: '#1a3a5c' },
  { value: 'HDFC',    label: 'HDFC Bank',                    ifscPrefix: 'HDFC', color: '#004C8F' },
  { value: 'ICICI',   label: 'ICICI Bank',                   ifscPrefix: 'ICIC', color: '#B02A30' },
  { value: 'AXIS',    label: 'Axis Bank',                    ifscPrefix: 'UTIB', color: '#97144D' },
  { value: 'KOTAK',   label: 'Kotak Mahindra Bank',          ifscPrefix: 'KKBK', color: '#EF4923' },
  { value: 'PNB',     label: 'Punjab National Bank',         ifscPrefix: 'PUNB', color: '#1A237E' },
  { value: 'BOB',     label: 'Bank of Baroda',               ifscPrefix: 'BARB', color: '#E65100' },
  { value: 'CANARA',  label: 'Canara Bank',                  ifscPrefix: 'CNRB', color: '#006400' },
  { value: 'UNION',   label: 'Union Bank of India',          ifscPrefix: 'UBIN', color: '#1B5E20' },
  { value: 'BOI',     label: 'Bank of India',                ifscPrefix: 'BKID', color: '#0D47A1' },
  { value: 'IDFC',    label: 'IDFC FIRST Bank',              ifscPrefix: 'IDFB', color: '#FF6D00' },
  { value: 'INDUSIND',label: 'IndusInd Bank',                ifscPrefix: 'INDB', color: '#01579B' },
  { value: 'YES',     label: 'Yes Bank',                     ifscPrefix: 'YESB', color: '#1565C0' },
  { value: 'FEDERAL', label: 'Federal Bank',                 ifscPrefix: 'FDRL', color: '#004D40' },
  { value: 'IOB',     label: 'Indian Overseas Bank',         ifscPrefix: 'IOBA', color: '#880E4F' },
  { value: 'UCO',     label: 'UCO Bank',                     ifscPrefix: 'UCBA', color: '#311B92' },
  { value: 'CENTRAL', label: 'Central Bank of India',        ifscPrefix: 'CBIN', color: '#BF360C' },
  { value: 'PAYTM',   label: 'Paytm Payments Bank',          ifscPrefix: 'PYTM', color: '#00B9F1' },
  { value: 'JUSPAY',  label: 'Jupiter (Fi Money)',           ifscPrefix: 'YESB', color: '#6C3082' },
  { value: 'AIRTEL',  label: 'Airtel Payments Bank',         ifscPrefix: 'AIRP', color: '#E40000' },
]

// ─── Axios instance ──────────────────────────────────────────────────────────

const api = axios.create({ baseURL: BASE_URL, withCredentials: true })
api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if ((session as any)?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${(session as any).user.accessToken}`
  }
  return config
})

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  step,
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  step: number
}) {
  return (
    <div className="flex items-start gap-4 px-7 py-5 border-b border-slate-100">
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
        <Icon className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-800 tracking-tight">{title}</h2>
          <span className="text-[11px] font-medium text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
            Step {step}
          </span>
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  )
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[13px] font-medium text-slate-600 mb-1.5 tracking-wide">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )
}

function InputWrapper({
  error,
  icon: Icon,
  children,
  suffix,
}: {
  error?: string
  icon?: React.ElementType
  children: React.ReactNode
  suffix?: React.ReactNode
}) {
  return (
    <div>
      <div className={`relative flex items-center rounded-xl border transition-all ${
        error
          ? 'border-rose-400 bg-rose-50/50 shadow-sm shadow-rose-100'
          : 'border-slate-200 bg-white hover:border-indigo-300 focus-within:border-indigo-400 focus-within:shadow-sm focus-within:shadow-indigo-100'
      }`}>
        {Icon && (
          <div className="pl-3.5 flex-shrink-0">
            <Icon className="h-4 w-4 text-slate-400" />
          </div>
        )}
        {children}
        {suffix && <div className="pr-3 flex-shrink-0">{suffix}</div>}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

const inputClass = (hasIcon?: boolean, hasSuffix?: boolean) =>
  `w-full ${hasIcon ? 'pl-2.5' : 'px-3.5'} ${hasSuffix ? 'pr-2' : 'pr-3.5'} py-2.5 bg-transparent text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none`

// ─── IFSC Lookup ─────────────────────────────────────────────────────────────

async function lookupIFSC(ifsc: string) {
  const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`)
  if (!res.ok) throw new Error('IFSC not found')
  return res.json() as Promise<{ BANK: string; BRANCH: string; CITY: string; STATE: string; ADDRESS: string }>
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CreateDeliveryPersonPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeSection, setActiveSection] = useState(0)

  // IFSC lookup state
  const [ifscLookupState, setIfscLookupState] = useState<
    'idle' | 'loading' | 'found' | 'error'
  >('idle')
  const [ifscDetails, setIfscDetails] = useState<{
    bank: string; branch: string; city: string; address: string
  } | null>(null)

  // Pincode metadata
  const [pincodeInfo, setPincodeInfo] = useState<Record<number, { city: string; area: string } | null>>({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    vehicleModel: '',
    licenseNumber: '',
    zone: 'North',
    serviceablePincodes: [''],
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    upiId: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // ── Pincode lookup ──────────────────────────────────────────────────────────
  const updatePincode = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 6)
    const newPincodes = [...formData.serviceablePincodes]
    newPincodes[index] = cleaned
    setFormData({ ...formData, serviceablePincodes: newPincodes })

    if (cleaned.length === 6) {
      const info = pincodeDatabase[cleaned]
      setPincodeInfo(prev => ({ ...prev, [index]: info ?? null }))
    } else {
      setPincodeInfo(prev => ({ ...prev, [index]: undefined as any }))
    }
  }

  const addPincode = () =>
    setFormData({ ...formData, serviceablePincodes: [...formData.serviceablePincodes, ''] })

  const removePincode = (index: number) => {
    setFormData({
      ...formData,
      serviceablePincodes: formData.serviceablePincodes.filter((_, i) => i !== index),
    })
    setPincodeInfo(prev => {
      const next = { ...prev }
      delete next[index]
      return next
    })
  }

  // ── IFSC lookup ─────────────────────────────────────────────────────────────
  const handleIfscLookup = async () => {
    const ifsc = formData.ifscCode.trim().toUpperCase()
    if (ifsc.length < 11) return
    setIfscLookupState('loading')
    setIfscDetails(null)
    try {
      const data = await lookupIFSC(ifsc)
      setIfscDetails({
        bank: data.BANK,
        branch: data.BRANCH,
        city: data.CITY,
        address: data.ADDRESS,
      })
      setFormData(prev => ({ ...prev, bankName: data.BANK }))
      setIfscLookupState('found')
    } catch {
      setIfscLookupState('error')
    }
  }

  useEffect(() => {
    const ifsc = formData.ifscCode.trim().toUpperCase()
    if (ifsc.length === 11) handleIfscLookup()
    else { setIfscLookupState('idle'); setIfscDetails(null) }
  }, [formData.ifscCode])

  // ── Validation ───────────────────────────────────────────────────────────────
  const validateForm = () => {
    const e: Record<string, string> = {}
    if (!formData.firstName.trim()) e.firstName = 'First name is required'
    if (!formData.lastName.trim()) e.lastName = 'Last name is required'
    if (!formData.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email = 'Invalid email format'
    if (!formData.phone.trim()) e.phone = 'Phone number is required'
    else if (!/^\d{10}$/.test(formData.phone)) e.phone = 'Must be 10 digits'
    if (!formData.password) e.password = 'Password is required'
    else if (formData.password.length < 8) e.password = 'Minimum 8 characters'
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!formData.vehicleNumber.trim()) e.vehicleNumber = 'Vehicle number is required'
    if (!formData.serviceablePincodes[0]?.trim()) e.pincode = 'At least one pincode required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!validateForm()) return
  //   setIsSubmitting(true)
  //   try {
  //     const payload = {
  //       // Personal
  //       firstName:    formData.firstName.trim(),
  //       lastName:     formData.lastName.trim(),
  //       email:        formData.email.trim().toLowerCase(),
  //       phone:        formData.phone.trim(),
  //       password:     formData.password,
  //       // Vehicle
  //       vehicleType:   formData.vehicleType,
  //       vehicleNumber: formData.vehicleNumber.trim(),
  //       vehicleModel:  formData.vehicleModel.trim() || undefined,
  //       licenseNumber: formData.licenseNumber.trim() || undefined,
  //       // Territory
  //       zone:                formData.zone,
  //       serviceablePincodes: formData.serviceablePincodes.filter(p => p.trim().length === 6),
  //       // Bank
  //       bankDetails: {
  //         bankName:           formData.bankName || undefined,
  //         accountHolderName:  formData.accountHolderName.trim() || undefined,
  //         accountNumber:      formData.accountNumber.trim() || undefined,
  //         ifscCode:           formData.ifscCode.trim().toUpperCase() || undefined,
  //         upiId:              formData.upiId.trim() || undefined,
  //       },
  //     }
 
  //     const res = await api.post(`${BASE_URL}/api/v1/delivery-personnel/persons`, payload, {withCredentials: true})

  //     if(res.status == 201 && res.data.success){
  //         toast.success('Delivery person created successfully!')
  //       router.push('/admin/delivery/personnel')
  //     }
 
      
  //   } catch (error: any) {
  //     // Surface backend validation messages when available
  //     const message =
  //       error?.response?.data?.message ||
  //       error?.response?.data?.error ||
  //       'Failed to create delivery person. Please try again.'
  //     toast.error(message)
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!validateForm()) return
  setIsSubmitting(true)
  try {
    // 🔥 FIXED: Match exactly what backend expects in createDeliveryPerson service
    const payload = {
      // Personal Info (matches User model)
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
      profile: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        avatar: null, // Optional - can be added later
      },
      // Vehicle Info (matches DeliveryPerson model)
      vehicle: {
        type: formData.vehicleType,
        number: formData.vehicleNumber.trim(),
        model: formData.vehicleModel.trim() || undefined,
        registrationNumber: formData.vehicleNumber.trim(), // Same as number typically
      },
      // Territory Info
      zone: formData.zone.toLowerCase(), // Backend expects lowercase: 'north', 'south', etc.
      serviceablePincodes: formData.serviceablePincodes.filter(p => p.trim().length === 6),
      // Bank Details
      bankDetails: {
        accountHolderName: formData.accountHolderName.trim() || undefined,
        accountNumber: formData.accountNumber.trim() || undefined,
        ifscCode: formData.ifscCode.trim().toUpperCase() || undefined,
        bankName: formData.bankName || undefined,
        upiId: formData.upiId.trim() || undefined,
      },
    }

    console.log('Sending payload:', payload)

    const res = await api.post('/api/v1/delivery-personnel/persons', payload)

    if (res.status === 201 && res.data.success) {
      toast.success('Delivery person created successfully!')
      router.push('/admin/delivery/personnel')
    }
  } catch (error: any) {
    console.error('API Error:', error.response?.data)
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Failed to create delivery person. Please try again.'
    toast.error(message)
  } finally {
    setIsSubmitting(false)
  }
}

  if (sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading workspace…</p>
        </div>
      </div>
    )
  }

  const selectedVehicle = vehicleTypes.find(v => v.value === formData.vehicleType)
  const selectedZone = zones.find(z => z.value === formData.zone)

  return (
    <div
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 40%, #faf5ff 100%)',
        fontFamily: "'DM Sans', 'Inter', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }}
        />
      </div>

      <div className="relative max-w-[860px] mx-auto px-4 py-10 space-y-6">

        {/* ── Breadcrumb + Header ───────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-5">
            <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
            <span>/</span>
            <Link href="/admin/delivery" className="hover:text-indigo-600 transition-colors">Delivery</Link>
            <span>/</span>
            <Link href="/admin/delivery/personnel" className="hover:text-indigo-600 transition-colors">Personnel</Link>
            <span>/</span>
            <span className="text-indigo-600 font-medium">Add New</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/delivery/personnel"
                className="flex-shrink-0 w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center hover:border-indigo-300 hover:shadow-md transition-all"
              >
                <ArrowLeft className="h-4 w-4 text-slate-600" />
              </Link>
              <div>
                <h1
                  className="text-2xl font-bold text-slate-900 tracking-tight"
                  style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                >
                  Add Delivery Personnel
                </h1>
                <p className="text-[13px] text-slate-400 mt-0.5">
                  Onboard a new delivery partner to your fleet
                </p>
              </div>
            </div>

            {/* Progress pills */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              {['Identity', 'Vehicle', 'Territory', 'Banking'].map((label, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                    i === activeSection
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Premium info banner ───────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3.5 bg-white/80 backdrop-blur-sm rounded-2xl border border-indigo-100 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
            <Star className="h-4 w-4 text-white fill-white" />
          </div>
          <p className="text-[12.5px] text-slate-600">
            <span className="font-semibold text-slate-800">Pro tip:</span> Enter the IFSC code to auto-fetch bank details. Pincode fields auto-resolve to city & area.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" onClick={() => {}}>

          {/* ── Section 1: Personal Information ─────────────────────────────── */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveSection(0)}
          >
            <SectionHeader icon={User} title="Personal Information" subtitle="Basic identity & login credentials" step={1} />
            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <FieldLabel required>First Name</FieldLabel>
                <InputWrapper error={errors.firstName}>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputClass() + ' rounded-xl'}
                    placeholder="Rajesh"
                  />
                </InputWrapper>
                {errors.firstName && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                    <AlertCircle className="h-3 w-3" />{errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Last Name</FieldLabel>
                <InputWrapper>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className={inputClass() + ' rounded-xl'}
                    placeholder="Kumar"
                  />
                </InputWrapper>
              </div>

              <div>
                <FieldLabel required>Email Address</FieldLabel>
                <InputWrapper error={errors.email} icon={Mail}>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={inputClass(true) + ' rounded-xl'}
                    placeholder="rajesh@example.com"
                  />
                </InputWrapper>
                {errors.email && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                    <AlertCircle className="h-3 w-3" />{errors.email}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Phone Number</FieldLabel>
                <InputWrapper error={errors.phone} icon={Phone}>
                  <span className="pl-2 text-[13px] text-slate-400 border-r border-slate-200 pr-2 mr-0">+91</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="flex-1 pl-2.5 pr-3.5 py-2.5 bg-transparent text-[13.5px] text-slate-800 placeholder:text-slate-300 focus:outline-none rounded-xl"
                    placeholder="9876543210"
                  />
                </InputWrapper>
                {errors.phone && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                    <AlertCircle className="h-3 w-3" />{errors.phone}
                  </p>
                )}
              </div>

              <div>
                <FieldLabel required>Password</FieldLabel>
                <InputWrapper error={errors.password} icon={Lock}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={inputClass(true, true) + ' rounded-xl flex-1'}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </InputWrapper>
                {errors.password && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                    <AlertCircle className="h-3 w-3" />{errors.password}
                  </p>
                )}
                {formData.password && (
                  <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all"
                        style={{
                          background: formData.password.length >= (i + 1) * 2
                            ? i < 2 ? '#f87171' : i < 3 ? '#fb923c' : '#34d399'
                            : '#e2e8f0'
                        }}
                      />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1 self-center">
                      {formData.password.length < 6 ? 'Weak' : formData.password.length < 10 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <FieldLabel required>Confirm Password</FieldLabel>
                <InputWrapper error={errors.confirmPassword} icon={Lock}>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={inputClass(true) + ' rounded-xl'}
                    placeholder="Re-enter password"
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2" />
                  )}
                </InputWrapper>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                    <AlertCircle className="h-3 w-3" />{errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Vehicle Information ──────────────────────────────── */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveSection(1)}
          >
            <SectionHeader icon={Truck} title="Vehicle Information" subtitle="Fleet details & registration" step={2} />
            <div className="p-7">

              {/* Vehicle type cards */}
              <div className="mb-5">
                <FieldLabel required>Vehicle Type</FieldLabel>
                <div className="flex gap-2.5 flex-wrap">
                  {vehicleTypes.map(v => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, vehicleType: v.value })}
                      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                        formData.vehicleType === v.value
                          ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{v.icon}</span>
                      <span className={`text-[11px] font-semibold ${
                        formData.vehicleType === v.value ? 'text-indigo-700' : 'text-slate-600'
                      }`}>{v.label}</span>
                      <span className="text-[10px] text-slate-400">{v.capacity}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <FieldLabel required>Vehicle Registration No.</FieldLabel>
                  <InputWrapper error={errors.vehicleNumber}>
                    <input
                      type="text"
                      value={formData.vehicleNumber}
                      onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                      className={inputClass() + ' rounded-xl font-mono tracking-widest'}
                      placeholder="DL 01 AB 1234"
                    />
                  </InputWrapper>
                  {errors.vehicleNumber && (
                    <p className="flex items-center gap-1 text-xs text-rose-500 mt-1.5">
                      <AlertCircle className="h-3 w-3" />{errors.vehicleNumber}
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel>Vehicle Model</FieldLabel>
                  <InputWrapper>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={e => setFormData({ ...formData, vehicleModel: e.target.value })}
                      className={inputClass() + ' rounded-xl'}
                      placeholder="Honda Activa 6G"
                    />
                  </InputWrapper>
                </div>

                <div>
                  <FieldLabel>Driving License Number</FieldLabel>
                  <InputWrapper>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={e => setFormData({ ...formData, licenseNumber: e.target.value.toUpperCase() })}
                      className={inputClass() + ' rounded-xl font-mono'}
                      placeholder="DL-0119850000001"
                    />
                  </InputWrapper>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Work Territory ────────────────────────────────────── */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveSection(2)}
          >
            <SectionHeader icon={MapPin} title="Work Territory" subtitle="Operational zone & delivery coverage" step={3} />
            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <FieldLabel required>Assigned Zone</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.zone}
                    onChange={e => setFormData({ ...formData, zone: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 focus:outline-none focus:border-indigo-400 focus:shadow-sm focus:shadow-indigo-100 transition-all hover:border-slate-300"
                  >
                    {zones.map(z => (
                      <option key={z.value} value={z.value}>{z.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
                {selectedZone && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedZone.cities.map(c => (
                      <span key={c} className="text-[11px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel required>Serviceable Pincodes</FieldLabel>
                  <span className="text-[11px] text-slate-400">{formData.serviceablePincodes.filter(Boolean).length} added</span>
                </div>
                <div className="space-y-2">
                  {formData.serviceablePincodes.map((pin, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex gap-2">
                        <div className={`flex-1 flex items-center rounded-xl border transition-all ${
                          pin.length === 6
                            ? pincodeInfo[idx]
                              ? 'border-emerald-300 bg-emerald-50/50'
                              : 'border-amber-300 bg-amber-50/50'
                            : 'border-slate-200 bg-white hover:border-indigo-300 focus-within:border-indigo-400'
                        }`}>
                          <input
                            type="text"
                            value={pin}
                            onChange={e => updatePincode(idx, e.target.value)}
                            className="flex-1 px-3.5 py-2.5 bg-transparent text-[13.5px] font-mono tracking-widest text-slate-800 placeholder:text-slate-300 focus:outline-none"
                            placeholder="110001"
                            maxLength={6}
                          />
                          {pin.length === 6 && pincodeInfo[idx] && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-3" />
                          )}
                        </div>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => removePincode(idx)}
                            className="w-9 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200 transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      {pin.length === 6 && pincodeInfo[idx] && (
                        <p className="text-[11px] text-emerald-600 flex items-center gap-1 pl-1">
                          <MapPin className="h-3 w-3" />
                          {pincodeInfo[idx]!.area}, {pincodeInfo[idx]!.city}
                        </p>
                      )}
                      {pin.length === 6 && pincodeInfo[idx] === null && (
                        <p className="text-[11px] text-amber-600 flex items-center gap-1 pl-1">
                          <Info className="h-3 w-3" />
                          Pincode not in database — will still be saved
                        </p>
                      )}
                    </div>
                  ))}
                  {errors.pincode && (
                    <p className="flex items-center gap-1 text-xs text-rose-500">
                      <AlertCircle className="h-3 w-3" />{errors.pincode}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={addPincode}
                    className="flex items-center gap-1.5 text-[12.5px] text-indigo-600 font-medium hover:text-indigo-700 transition-colors mt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add another pincode
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 4: Bank Details ──────────────────────────────────────── */}
          <div
            className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
            onClick={() => setActiveSection(3)}
          >
            <SectionHeader icon={Banknote} title="Bank & Payment Details" subtitle="Payout routing information — encrypted & secure" step={4} />
            <div className="p-7 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <FieldLabel required>Bank Name</FieldLabel>
                <div className="relative">
                  <select
                    value={formData.bankName}
                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-slate-200 bg-white text-[13.5px] text-slate-800 focus:outline-none focus:border-indigo-400 transition-all hover:border-slate-300"
                  >
                    <option value="">Select bank…</option>
                    {indianBanks.map(b => (
                      <option key={b.value} value={b.label}>{b.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <FieldLabel>Account Holder Name</FieldLabel>
                <InputWrapper>
                  <input
                    type="text"
                    value={formData.accountHolderName}
                    onChange={e => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className={inputClass() + ' rounded-xl'}
                    placeholder="As per bank records"
                  />
                </InputWrapper>
              </div>

              <div>
                <FieldLabel>Account Number</FieldLabel>
                <InputWrapper>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value.replace(/\D/g, '') })}
                    className={inputClass() + ' rounded-xl font-mono tracking-widest'}
                    placeholder="XXXXXXXXXXXXXXXX"
                  />
                </InputWrapper>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel>IFSC Code</FieldLabel>
                  {ifscLookupState === 'loading' && (
                    <span className="text-[11px] text-indigo-500 flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Fetching…
                    </span>
                  )}
                  {ifscLookupState === 'found' && (
                    <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                  {ifscLookupState === 'error' && (
                    <span className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Not found
                    </span>
                  )}
                </div>
                <InputWrapper>
                  <input
                    type="text"
                    value={formData.ifscCode}
                    onChange={e => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase().slice(0, 11) })}
                    className={inputClass() + ' rounded-xl font-mono tracking-widest'}
                    placeholder="SBIN0001234"
                    maxLength={11}
                  />
                  {ifscLookupState === 'idle' && formData.ifscCode.length === 11 && (
                    <button type="button" onClick={handleIfscLookup} className="pr-1">
                      <RefreshCw className="h-4 w-4 text-indigo-500 hover:text-indigo-700 transition-colors" />
                    </button>
                  )}
                </InputWrapper>

                {/* IFSC result card */}
                {ifscLookupState === 'found' && ifscDetails && (
                  <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-[12.5px] font-semibold text-emerald-800">{ifscDetails.bank}</span>
                    </div>
                    <p className="text-[11.5px] text-emerald-700">{ifscDetails.branch} Branch</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">{ifscDetails.city}</p>
                  </div>
                )}
              </div>

              <div>
                <FieldLabel>UPI ID</FieldLabel>
                <InputWrapper>
                  <input
                    type="text"
                    value={formData.upiId}
                    onChange={e => setFormData({ ...formData, upiId: e.target.value })}
                    className={inputClass() + ' rounded-xl'}
                    placeholder="username@okhdfcbank"
                  />
                </InputWrapper>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Used for instant payouts when bank transfer isn&apos;t available
                </p>
              </div>
            </div>

            {/* Security note */}
            <div className="mx-7 mb-7 flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <Lock className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Bank details are <strong className="text-slate-700">AES-256 encrypted</strong> and stored securely. They are only used for authorised payout processing and are never shared with third parties.
              </p>
            </div>
          </div>

          {/* ── Action Row ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between pt-2 pb-8">
            <Link
              href="/admin/delivery/personnel"
              className="px-5 py-2.5 rounded-xl text-[13.5px] font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="relative flex items-center gap-2.5 px-7 py-2.5 rounded-xl text-[13.5px] font-semibold text-white transition-all shadow-lg disabled:opacity-60 overflow-hidden"
              style={{
                background: isSubmitting
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                boxShadow: '0 8px 24px -4px rgba(99,102,241,0.5)',
              }}
            >
              {/* Shimmer effect */}
              {!isSubmitting && (
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
                    animation: 'shimmer 2.5s infinite',
                  }}
                />
              )}
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating profile…
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Delivery Person
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}