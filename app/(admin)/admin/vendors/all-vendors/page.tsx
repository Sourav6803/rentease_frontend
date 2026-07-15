
// // app/admin/vendors/page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import { motion, } from 'framer-motion'
// import {
//   Store, Search, Filter, ChevronLeft, ChevronRight, RefreshCw,
//   CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText,
//   DollarSign, Mail, Phone, MapPin, Calendar, Star, TrendingUp,
//    Shield, Ban,
//    Building2,  Loader2, 
 
//   Package
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'
// import Image from 'next/image'
// import Link from 'next/link'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// // Types
// interface Vendor {
//   _id: string
//   vendorId: string
//   user: {
//     _id: string
//     email: string
//     phone: string
//     profile: {
//       firstName: string
//       lastName: string
//       avatar?: string
//     }
//   }
//   business: {
//     name: string
//     description?: string
//     website?: string
//     logo?: string
//     gstin?: string
//     panNumber?: string
//     yearEstablished?: number
//     employeeCount?: number
//     businessType?: string
//   }
//   contact: {
//     primaryPhone: string
//     primaryEmail?: string
//     secondaryPhone?: string
//     supportEmail?: string
//     supportPhone?: string
//   }
//   addresses: {
//     registeredOffice?: {
//       _id: string
//       city: string
//       state: string
//       pincode: string
//       addressLine1: string
//       addressLine2?: string
//       country: string
//     }
//     registered?: {
//       city: string
//       state: string
//       pincode: string
//       addressLine1: string
//       addressLine2?: string
//       country: string
//     }
//     serviceableCities: Array<{ _id: string; city: string; state: string; isActive: boolean }>
//     serviceablePincodes: string[] | Array<{ _id: string; pincode: string; isActive: boolean }>
//     warehouse?: any[]
//   }
//   verification: {
//     status: 'pending' | 'verified' | 'rejected' | 'suspended'
//     documents: Array<{
//       type: string
//       url: string
//       status?: string
//       uploadedAt?: string
//       verifiedAt?: string
//       verifiedBy?: string
//       remarks?: string
//     }>
//     verifiedAt?: string
//     verifiedBy?: string
//     rejectionReason?: string
//   }
//   bankDetails?: {
//     accountHolderName: string
//     bankName: string
//     ifscCode: string
//     branchName: string
//     accountType: string
//     upiId?: string
//     verified: boolean
//   }
//   commission: {
//     rate: number
//     type: 'percentage' | 'fixed'
//     fixedAmount?: number
//     monthlyCap?: number
//     specialRates?: any[]
//   }
//   products?: {
//     total: number
//     active: number
//     rented: number
//     available: number
//   }
//   performance: {
//     rating: {
//       average: number
//       count: number
//     }
//     metrics: {
//       totalRentals: number
//       completedRentals: number
//       cancelledRentals: number
//       totalRevenue: number
//       averageRentalValue: number
//       customerSatisfaction: number
//       responseRate: number
//       fulfillmentRate: number
//       onTimeDelivery: number
//     }
//   }
//   subscription: {
//     plan: 'basic' | 'standard' | 'premium' | 'enterprise'
//     validUntil: string
//     autoRenew: boolean
//     limits: {
//       maxProducts: number
//       maxRentalsPerMonth: number
//     }
//   }
//   settings?: {
//     autoConfirmBookings: boolean
//     cancellationPolicy: string
//     advanceNotice: number
//   }
//   status: {
//     isActive: boolean
//     isBlocked: boolean
//     isOnboarded: boolean
//     onboardedAt?: string
//     blockReason?: string
//     blockedAt?: string
//     blockedBy?: string
//   }
//   createdAt: string
//   updatedAt: string
// }

// interface VendorStats {
//   total: number
//   pending: number
//   verified: number
//   rejected: number
//   suspended: number
//   byPlan?: Array<{ _id: string; count: number }>
// }

// interface VendorFilters {
//   status: string
//   isActive: string
//   plan: string
//   search: string
//   page: number
//   limit: number
// }

// // API Service
// const api = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
// })

// api.interceptors.request.use(async (config) => {
//   const { getSession } = await import('next-auth/react')
//   const session = await getSession()
//   if (session?.user?.accessToken) {
//     config.headers.Authorization = `Bearer ${session.user.accessToken}`
//   }
//   return config
// })

// // Helper function to get city string
// const getCityName = (city: any): string => {
//   if (!city) return 'N/A'
//   if (typeof city === 'string') return city
//   if (typeof city === 'object') return city.city || city.name || 'N/A'
//   return 'N/A'
// }

// // Helper function to get pincode string
// const getPincode = (pincode: any): string => {
//   if (!pincode) return 'N/A'
//   if (typeof pincode === 'string') return pincode
//   if (typeof pincode === 'object') return pincode.pincode || pincode.code || 'N/A'
//   return 'N/A'
// }

// // Component: Stats Card
// const StatsCard = ({ title, value, icon: Icon, color, trend, onClick }: any) => (
//   <div 
//     onClick={onClick} 
//     className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-all hover:border-primary/30"
//   >
//     <div className="flex items-center justify-between">
//       <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
//         <Icon className="h-5 w-5" style={{ color }} />
//       </div>
//       {trend && <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>{trend.isPositive ? '+' : ''}{trend.value}%</span>}
//     </div>
//     <p className="text-2xl font-bold text-slate-800 mt-3">{value.toLocaleString()}</p>
//     <p className="text-xs text-slate-500 mt-1">{title}</p>
//   </div>
// )

// // Component: Vendor Card
// const VendorCard = ({ vendor, onView, onApprove, onReject, onSuspend, onReinstate }: any) => {
//   const [isExpanded, setIsExpanded] = useState(false)
  
//   const getStatusBadge = () => {
//     if (vendor.verification.status === 'verified' && vendor.status.isActive && !vendor.status.isBlocked) {
//       return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle }
//     }
//     if (vendor.verification.status === 'pending') {
//       return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock }
//     }
//     if (vendor.verification.status === 'rejected') {
//       return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
//     }
//     if (vendor.status.isBlocked) {
//       return { label: 'Suspended', color: 'bg-orange-100 text-orange-700', icon: Ban }
//     }
//     return { label: 'Verified', color: 'bg-blue-100 text-blue-700', icon: Shield }
//   }
  
//   const statusConfig = getStatusBadge()
//   const StatusIcon = statusConfig.icon
//   const registeredAddress = vendor.addresses.registeredOffice || vendor.addresses.registered
//   const cityName = getCityName(registeredAddress?.city || vendor.addresses.serviceableCities?.[0])

//   return (
//     <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
//       <div className="p-5">
//         <div className="flex items-start justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#2874f0] to-[#00a0e3] flex items-center justify-center text-white font-bold text-lg">
//               {vendor.business.name?.charAt(0) || 'V'}
//             </div>
//             <div>
//               <div className="flex items-center gap-2 flex-wrap">
//                 <h3 className="font-semibold text-slate-800">{vendor.business.name}</h3>
//                 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.color}`}>
//                   <StatusIcon className="h-3 w-3" />
//                   {statusConfig.label}
//                 </span>
//               </div>
//               <p className="text-xs text-slate-500 mt-0.5">ID: {vendor.vendorId}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-1">
//             <button onClick={() => onView(vendor)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
//               <Eye className="h-4 w-4 text-slate-500" />
//             </button>
//           </div>
//         </div>
        
//         <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
//           <div className="flex items-center gap-2 text-slate-500">
//             <Mail className="h-3.5 w-3.5" />
//             <span className="text-xs truncate">{vendor.user?.email || vendor.contact?.primaryEmail || 'N/A'}</span>
//           </div>
//           <div className="flex items-center gap-2 text-slate-500">
//             <Phone className="h-3.5 w-3.5" />
//             <span className="text-xs">{vendor.contact?.primaryPhone || vendor.user?.phone || 'N/A'}</span>
//           </div>
//           <div className="flex items-center gap-2 text-slate-500">
//             <MapPin className="h-3.5 w-3.5" />
//             <span className="text-xs">{cityName || 'Location N/A'}</span>
//           </div>
//           <div className="flex items-center gap-2 text-slate-500">
//             <Calendar className="h-3.5 w-3.5" />
//             <span className="text-xs">Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
//           <div className="flex items-center gap-1">
//             <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
//             <span className="text-sm font-semibold">{vendor.performance?.rating?.average?.toFixed(1) || '0'}</span>
//             <span className="text-xs text-slate-400">({vendor.performance?.rating?.count || 0})</span>
//           </div>
//           <div className="w-px h-4 bg-slate-200" />
//           <div className="flex items-center gap-1">
//             <TrendingUp className="h-3.5 w-3.5 text-green-500" />
//             <span className="text-sm font-semibold">₹{((vendor.performance?.metrics?.totalRevenue || 0) / 1000).toFixed(1)}K</span>
//             <span className="text-xs text-slate-400">revenue</span>
//           </div>
//           <div className="w-px h-4 bg-slate-200" />
//           <div className="flex items-center gap-1">
//             <Package className="h-3.5 w-3.5 text-blue-500" />
//             <span className="text-sm font-semibold">{vendor.performance?.metrics?.totalRentals || 0}</span>
//             <span className="text-xs text-slate-400">rentals</span>
//           </div>
//         </div>
        
//         {/* Serviceable Cities Preview */}
//         {vendor.addresses.serviceableCities && vendor.addresses.serviceableCities.length > 0 && (
//           <div className="flex flex-wrap gap-1 mt-3 pt-2">
//             {vendor.addresses.serviceableCities.slice(0, 3).map((city: any) => (
//               <span key={city._id || getCityName(city)} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">
//                 {getCityName(city)}
//               </span>
//             ))}
//             {vendor.addresses.serviceableCities.length > 3 && (
//               <span className="px-1.5 py-0.5 text-[10px] text-primary">
//                 +{vendor.addresses.serviceableCities.length - 3} more
//               </span>
//             )}
//           </div>
//         )}
        
//         <div className="flex flex-wrap gap-2 mt-4">
//           {vendor.verification.status === 'pending' && (
//             <>
//               <button onClick={() => onApprove(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
//                 <CheckCircle className="h-3.5 w-3.5" /> Approve
//               </button>
//               <button onClick={() => onReject(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors">
//                 <XCircle className="h-3.5 w-3.5" /> Reject
//               </button>
//             </>
//           )}
//           {vendor.verification.status === 'verified' && !vendor.status.isBlocked && (
//             <button onClick={() => onSuspend(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors">
//               <Ban className="h-3.5 w-3.5" /> Suspend
//             </button>
//           )}
//           {vendor.status.isBlocked && (
//             <button onClick={() => onReinstate(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
//               <RefreshCw className="h-3.5 w-3.5" /> Reinstate
//             </button>
//           )}
//           <button onClick={() => onView(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors">
//             <Eye className="h-3.5 w-3.5" /> Details
//           </button>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// // Component: Vendor Details Modal (FIXED)
// const VendorDetailsModal = ({ vendor, onClose, onApprove, onReject, onSuspend, onReinstate, onUpdateCommission }: any) => {
//   const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'performance' | 'commission'>('overview')
//   const [commissionRate, setCommissionRate] = useState(vendor?.commission?.rate || 10)
//   const [isUpdatingCommission, setIsUpdatingCommission] = useState(false)

//   if (!vendor) return null

//   const registeredAddress = vendor.addresses.registeredOffice || vendor.addresses.registered

//   const handleUpdateCommission = async () => {
//     setIsUpdatingCommission(true)
//     await onUpdateCommission(vendor, commissionRate)
//     setIsUpdatingCommission(false)
//   }

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       {/* Backdrop - separate div for overlay */}
//       <div className="fixed inset-0 bg-black/50  transition-opacity" onClick={onClose} />
      
      
//       {/* Modal Container - centered */}
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-5 sticky top-0 z-10">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-white/70 text-xs">Vendor Details</p>
//                 <h3 className="text-xl font-bold text-white">{vendor.business.name}</h3>
//                 <p className="text-white/80 text-sm mt-1">ID: {vendor.vendorId}</p>
//               </div>
//               <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
//                 <XCircle className="h-6 w-6 text-white" />
//               </button>
//             </div>
//           </div>
          
//           {/* Tabs */}
//           <div className="border-b border-slate-200 px-6 bg-white">
//             <div className="flex gap-6 overflow-x-auto">
//               {[
//                 { id: 'overview', label: 'Overview', icon: Building2 },
//                 { id: 'documents', label: 'Documents', icon: FileText },
//                 { id: 'performance', label: 'Performance', icon: TrendingUp },
//                 { id: 'commission', label: 'Commission', icon: DollarSign }
//               ].map(tab => {
//                 const Icon = tab.icon
//                 return (
//                   <button
//                     key={tab.id}
//                     onClick={() => setActiveTab(tab.id as any)}
//                     className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
//                       activeTab === tab.id 
//                         ? 'border-[#2874f0] text-[#2874f0]' 
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
          
//           {/* Content - scrollable area */}
//           <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
//             {activeTab === 'overview' && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <h4 className="font-semibold text-slate-800 mb-3">Business Information</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">Business Type:</span>
//                         <span className="capitalize">{vendor.business.businessType || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">GSTIN:</span>
//                         <span>{vendor.business.gstin || 'Not provided'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">PAN:</span>
//                         <span>{vendor.business.panNumber ? `XXXXX${vendor.business.panNumber.slice(-4)}` : 'Not provided'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">Year Established:</span>
//                         <span>{vendor.business.yearEstablished || 'N/A'}</span>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center gap-2">
//                         <Mail className="h-4 w-4 text-slate-400" />
//                         <span>{vendor.user?.email || vendor.contact?.primaryEmail || 'N/A'}</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <Phone className="h-4 w-4 text-slate-400" />
//                         <span>{vendor.contact?.primaryPhone || vendor.user?.phone || 'N/A'}</span>
//                       </div>
//                       {vendor.contact?.supportEmail && (
//                         <div className="flex items-center gap-2">
//                           <Mail className="h-4 w-4 text-slate-400" />
//                           <span>{vendor.contact.supportEmail}</span>
//                         </div>
//                       )}
//                       {vendor.contact?.supportPhone && (
//                         <div className="flex items-center gap-2">
//                           <Phone className="h-4 w-4 text-slate-400" />
//                           <span>{vendor.contact.supportPhone}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
                
//                 {registeredAddress && (
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <h4 className="font-semibold text-slate-800 mb-3">Registered Address</h4>
//                     <p>{registeredAddress.addressLine1}</p>
//                     {registeredAddress.addressLine2 && <p>{registeredAddress.addressLine2}</p>}
//                     <p>{registeredAddress.city}, {registeredAddress.state} - {registeredAddress.pincode}</p>
//                     <p>{registeredAddress.country || 'India'}</p>
//                   </div>
//                 )}
                
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <h4 className="font-semibold text-slate-800 mb-3">Service Areas</h4>
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     <span className="text-sm font-medium text-slate-600">Cities:</span>
//                     {vendor.addresses.serviceableCities?.map((city: any) => (
//                       <span key={city._id || getCityName(city)} className="px-2 py-0.5 bg-white rounded-full text-xs">
//                         {getCityName(city)}
//                       </span>
//                     ))}
//                   </div>
//                   {vendor.addresses.serviceablePincodes && vendor.addresses.serviceablePincodes.length > 0 && (
//                     <div className="flex flex-wrap gap-2">
//                       <span className="text-sm font-medium text-slate-600">Pincodes:</span>
//                       {vendor.addresses.serviceablePincodes.slice(0, 10).map((pincode: any, idx: number) => (
//                         <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs">
//                           {getPincode(pincode)}
//                         </span>
//                       ))}
//                       {vendor.addresses.serviceablePincodes.length > 10 && (
//                         <span className="px-2 py-0.5 text-xs text-primary">
//                           +{vendor.addresses.serviceablePincodes.length - 10} more
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
                
//                 {vendor.bankDetails && (
//                   <div className="bg-slate-50 rounded-xl p-4">
//                     <h4 className="font-semibold text-slate-800 mb-3">Bank Details</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">Account Holder:</span>
//                         <span>{vendor.bankDetails.accountHolderName}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">Bank Name:</span>
//                         <span>{vendor.bankDetails.bankName}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">IFSC Code:</span>
//                         <span>{vendor.bankDetails.ifscCode}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">UPI ID:</span>
//                         <span>{vendor.bankDetails.upiId || 'N/A'}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-slate-500">Verification:</span>
//                         <span className={vendor.bankDetails.verified ? 'text-green-600' : 'text-yellow-600'}>
//                           {vendor.bankDetails.verified ? 'Verified' : 'Pending'}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {vendor.verification.rejectionReason && (
//                   <div className="bg-red-50 rounded-xl p-4 border border-red-200">
//                     <div className="flex items-start gap-2">
//                       <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
//                       <div>
//                         <p className="font-semibold text-red-800">Rejection Reason</p>
//                         <p className="text-sm text-red-700">{vendor.verification.rejectionReason}</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 {vendor.status.blockReason && (
//                   <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
//                     <div className="flex items-start gap-2">
//                       <Ban className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
//                       <div>
//                         <p className="font-semibold text-orange-800">Suspension Reason</p>
//                         <p className="text-sm text-orange-700">{vendor.status.blockReason}</p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
            
//             {activeTab === 'documents' && (
//               <div className="space-y-4">
//                 {vendor.verification.documents?.length > 0 ? (
//                   vendor.verification.documents.map((doc: any, idx: number) => (
//                     <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
//                       <div>
//                         <p className="font-medium text-slate-800 capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
//                         <p className="text-xs text-slate-500">
//                           Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
//                           doc.status === 'verified' ? 'bg-green-100 text-green-700' : 
//                           doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
//                         }`}>
//                           {doc.status || 'pending'}
//                         </span>
//                         {doc.url && (
//                           <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg">
//                             <Eye className="h-4 w-4" />
//                           </a>
//                         )}
//                       </div>
//                     </div>
//                   ))
//                 ) : (
//                   <div className="text-center py-8 text-slate-500">No documents uploaded</div>
//                 )}
//               </div>
//             )}
            
//             {activeTab === 'performance' && (
//               <div className="space-y-6">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-2xl font-bold text-slate-800">{vendor.performance?.metrics?.totalRentals || 0}</p>
//                     <p className="text-xs text-slate-500">Total Rentals</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-2xl font-bold text-green-600">{vendor.performance?.metrics?.completedRentals || 0}</p>
//                     <p className="text-xs text-slate-500">Completed</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-2xl font-bold text-red-600">{vendor.performance?.metrics?.cancelledRentals || 0}</p>
//                     <p className="text-xs text-slate-500">Cancelled</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-2xl font-bold text-blue-600">{vendor.performance?.metrics?.onTimeDelivery || 0}%</p>
//                     <p className="text-xs text-slate-500">On-Time Delivery</p>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-lg font-bold text-purple-600">₹{((vendor.performance?.metrics?.totalRevenue || 0) / 1000).toFixed(1)}K</p>
//                     <p className="text-xs text-slate-500">Total Revenue</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-lg font-bold text-amber-600">{vendor.performance?.metrics?.responseRate || 0}%</p>
//                     <p className="text-xs text-slate-500">Response Rate</p>
//                   </div>
//                   <div className="bg-slate-50 rounded-lg p-3 text-center">
//                     <p className="text-lg font-bold text-emerald-600">{vendor.performance?.metrics?.fulfillmentRate || 0}%</p>
//                     <p className="text-xs text-slate-500">Fulfillment Rate</p>
//                   </div>
//                 </div>
                
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <h4 className="font-semibold text-slate-800 mb-3">Rating Distribution</h4>
//                   {[5, 4, 3, 2, 1].map(star => {
//                     const count = vendor.performance?.rating?.distribution?.[star] || 0
//                     const total = vendor.performance?.rating?.count || 1
//                     const percentage = total ? (count / total) * 100 : 0
//                     return (
//                       <div key={star} className="flex items-center gap-2 mb-2">
//                         <div className="flex items-center gap-0.5 w-16">
//                           <span className="text-sm">{star}</span>
//                           <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
//                         </div>
//                         <div className="flex-1 bg-slate-200 rounded-full h-2">
//                           <div className="h-2 rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
//                         </div>
//                         <span className="text-xs text-slate-500 w-8">{count}</span>
//                       </div>
//                     )
//                   })}
//                 </div>
//               </div>
//             )}
            
//             {activeTab === 'commission' && (
//               <div className="space-y-6">
//                 <div className="bg-slate-50 rounded-xl p-4">
//                   <div className="flex items-center justify-between mb-4">
//                     <div>
//                       <h4 className="font-semibold text-slate-800">Commission Rate</h4>
//                       <p className="text-xs text-slate-500">Current commission for this vendor</p>
//                     </div>
//                     <div className="text-3xl font-bold text-[#2874f0]">{vendor.commission?.rate || 10}%</div>
//                   </div>
//                   <div className="space-y-3">
//                     <label className="block text-sm font-medium text-slate-700">Update Commission Rate</label>
//                     <div className="flex gap-3">
//                       <input
//                         type="number"
//                         value={commissionRate}
//                         onChange={(e) => setCommissionRate(Number(e.target.value))}
//                         className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//                         min="0"
//                         max="50"
//                         step="0.5"
//                       />
//                       <button
//                         onClick={handleUpdateCommission}
//                         disabled={isUpdatingCommission}
//                         className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-[#1a5fd4] transition-colors"
//                       >
//                         {isUpdatingCommission ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-blue-50 rounded-xl p-4">
//                   <div className="flex items-start gap-3">
//                     <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-blue-800">Commission Information</p>
//                       <p className="text-sm text-blue-700 mt-1">
//                         Commission is deducted from each successful rental. The standard rate is 10% for basic plan vendors.
//                         Enterprise partners may have custom rates.
//                       </p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="bg-amber-50 rounded-xl p-4">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
//                     <div>
//                       <p className="font-semibold text-amber-800">Subscription Details</p>
//                       <p className="text-sm text-amber-700 mt-1">
//                         Plan: <span className="font-semibold capitalize">{vendor.subscription?.plan || 'basic'}</span><br />
//                         Valid Until: {vendor.subscription?.validUntil ? new Date(vendor.subscription.validUntil).toLocaleDateString() : 'N/A'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
          
//           {/* Footer - Action Buttons */}
//           <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 sticky bottom-0">
//             <div className="flex gap-3 justify-end">
//               {vendor.verification.status === 'pending' && (
//                 <>
//                   <button 
//                     onClick={() => onApprove(vendor)} 
//                     className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
//                   >
//                     Approve Vendor
//                   </button>
//                   <button 
//                     onClick={() => onReject(vendor)} 
//                     className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
//                   >
//                     Reject Vendor
//                   </button>
//                 </>
//               )}
//               {vendor.verification.status === 'verified' && !vendor.status.isBlocked && (
//                 <button 
//                   onClick={() => onSuspend(vendor)} 
//                   className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
//                 >
//                   Suspend Vendor
//                 </button>
//               )}
//               {vendor.status.isBlocked && (
//                 <button 
//                   onClick={() => onReinstate(vendor)} 
//                   className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
//                 >
//                   Reinstate Vendor
//                 </button>
//               )}
//               <button 
//                 onClick={onClose} 
//                 className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Component: Reject Modal
// const RejectModal = ({ vendor, onConfirm, onClose }: any) => {
//   const [reason, setReason] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const handleSubmit = async () => {
//     if (!reason.trim()) return
//     setIsSubmitting(true)
//     await onConfirm(vendor, reason)
//     setIsSubmitting(false)
//   }

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-xl max-w-md w-full p-6">
//         <h3 className="text-lg font-bold text-slate-800 mb-2">Reject Vendor</h3>
//         <p className="text-sm text-slate-500 mb-4">
//           Please provide a reason for rejecting <span className="font-semibold">{vendor?.business.name}</span>
//         </p>
//         <textarea
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           rows={4}
//           className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30"
//           placeholder="Enter rejection reason..."
//         />
//         <div className="flex gap-3 mt-4">
//           <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting || !reason.trim()}
//             className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
//           >
//             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Rejection'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Component: Suspend Modal
// const SuspendModal = ({ vendor, onConfirm, onClose }: any) => {
//   const [reason, setReason] = useState('')
//   const [duration, setDuration] = useState('')
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const handleSubmit = async () => {
//     if (!reason.trim()) return
//     setIsSubmitting(true)
//     await onConfirm(vendor, reason, duration)
//     setIsSubmitting(false)
//   }

//   return (
//     <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
//       <div className="bg-white rounded-xl max-w-md w-full p-6">
//         <h3 className="text-lg font-bold text-slate-800 mb-2">Suspend Vendor</h3>
//         <p className="text-sm text-slate-500 mb-4">
//           Suspend <span className="font-semibold">{vendor?.business.name}</span> from the platform
//         </p>
//         <textarea
//           value={reason}
//           onChange={(e) => setReason(e.target.value)}
//           rows={3}
//           className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
//           placeholder="Enter suspension reason..."
//         />
//         <div className="mt-3">
//           <label className="block text-sm font-medium text-slate-700 mb-1">Suspension Duration (Optional)</label>
//           <select
//             value={duration}
//             onChange={(e) => setDuration(e.target.value)}
//             className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
//           >
//             <option value="">Indefinite</option>
//             <option value="7">7 days</option>
//             <option value="14">14 days</option>
//             <option value="30">30 days</option>
//           </select>
//         </div>
//         <div className="flex gap-3 mt-4">
//           <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={isSubmitting || !reason.trim()}
//             className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-orange-600 transition-colors"
//           >
//             {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Suspension'}
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Helper component for Info icon
// const Info = ({ className }: { className?: string }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <circle cx="12" cy="12" r="10" />
//     <line x1="12" y1="16" x2="12" y2="12" />
//     <line x1="12" y1="8" x2="12.01" y2="8" />
//   </svg>
// )

// // Main Component
// export default function AdminVendorsPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const toast = useToast()
  
//   const [vendors, setVendors] = useState<Vendor[]>([])
//   const [stats, setStats] = useState<VendorStats | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [filters, setFilters] = useState<VendorFilters>({ status: 'all', isActive: 'all', plan: 'all', search: '', page: 1, limit: 12 })
//   const [totalPages, setTotalPages] = useState(1)
//   const [totalVendors, setTotalVendors] = useState(0)
//   const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
//   const [showRejectModal, setShowRejectModal] = useState(false)
//   const [showSuspendModal, setShowSuspendModal] = useState(false)
//   const [vendorToAction, setVendorToAction] = useState<Vendor | null>(null)

//   console.log('selected Vendor:', selectedVendor)

//   const fetchVendors = useCallback(async () => {
//     if (sessionStatus !== 'authenticated') return
    
//     setIsLoading(true)
//     try {
//       const params = new URLSearchParams()
//       if (filters.status !== 'all') params.set('status', filters.status)
//       if (filters.isActive !== 'all') params.set('isActive', filters.isActive)
//       if (filters.plan !== 'all') params.set('plan', filters.plan)
//       if (filters.search) params.set('search', filters.search)
//       params.set('page', filters.page.toString())
//       params.set('limit', filters.limit.toString())
      
//       const [vendorsRes, statsRes] = await Promise.all([
//         api.get(`/api/v1/admin/vendors?${params.toString()}`),
//         api.get(`/api/v1/admin/vendors/stats`)
//       ])
      
//       if (vendorsRes.data.success) {
//         setVendors(vendorsRes.data.data.vendors || [])
//         setTotalPages(vendorsRes.data.data.pagination?.pages || 1)
//         setTotalVendors(vendorsRes.data.data.pagination?.total || 0)
//       }
//       if (statsRes.data.success) {
//         const statsData = statsRes.data.data
//         setStats({
//           total: statsData.total || 0,
//           pending: statsData.pending || 0,
//           verified: statsData.verified || 0,
//           rejected: statsData.rejected || 0,
//           suspended: statsData.suspended || 0
//         })
//       }
//     } catch (error: any) {
//       console.error('Failed to load vendors:', error)
//       toast.error(error.response?.data?.message || 'Failed to load vendors')
//     } finally {
//       setIsLoading(false)
//     }
//   }, [sessionStatus, filters, toast])

//   useEffect(() => {
//     if (sessionStatus === 'authenticated') {
//       fetchVendors()
//     } else if (sessionStatus === 'unauthenticated') {
//       router.push('/admin/login')
//     }
//   }, [fetchVendors, sessionStatus, router])

//   const handleApprove = async (vendor: Vendor) => {
//     try {
//       const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/approve`, { commissionRate: 10 })
//       if (res.data.success) {
//         toast.success(`${vendor.business.name} approved successfully`)
//         fetchVendors()
//         setSelectedVendor(null)
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to approve vendor')
//     }
//   }

//   const handleReject = async (vendor: Vendor, reason: string) => {
//     try {
//       const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/reject`, { reason })
//       if (res.data.success) {
//         toast.success(`${vendor.business.name} rejected`)
//         fetchVendors()
//         setShowRejectModal(false)
//         setSelectedVendor(null)
//         setVendorToAction(null)
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to reject vendor')
//     }
//   }

//   const handleSuspend = async (vendor: Vendor, reason: string, duration: string) => {
//     try {
//       const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/suspend`, { 
//         reason, 
//         duration: duration ? parseInt(duration) : undefined 
//       })
//       if (res.data.success) {
//         toast.success(`${vendor.business.name} suspended`)
//         fetchVendors()
//         setShowSuspendModal(false)
//         setSelectedVendor(null)
//         setVendorToAction(null)
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to suspend vendor')
//     }
//   }

//   const handleReinstate = async (vendor: Vendor) => {
//     try {
//       const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/reinstate`)
//       if (res.data.success) {
//         toast.success(`${vendor.business.name} reinstated`)
//         fetchVendors()
//         setSelectedVendor(null)
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to reinstate vendor')
//     }
//   }

//   const handleUpdateCommission = async (vendor: Vendor, rate: number) => {
//     try {
//       const res = await api.patch(`/admin/vendors/${vendor._id}/commission`, { rate })
//       if (res.data.success) {
//         toast.success(`Commission updated to ${rate}%`)
//         fetchVendors()
//       }
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to update commission')
//     }
//   }

//   const statCards = [
//     { title: 'Total Vendors', value: stats?.total || 0, icon: Store, color: '#2874f0', onClick: () => setFilters({ ...filters, status: 'all', page: 1 }) },
//     { title: 'Pending Approval', value: stats?.pending || 0, icon: Clock, color: '#f59e0b', onClick: () => setFilters({ ...filters, status: 'pending', page: 1 }) },
//     { title: 'Verified', value: stats?.verified || 0, icon: CheckCircle, color: '#21a056', onClick: () => setFilters({ ...filters, status: 'verified', page: 1 }) },
//     { title: 'Suspended', value: stats?.suspended || 0, icon: Ban, color: '#ef4444', onClick: () => setFilters({ ...filters, status: 'suspended', page: 1 }) }
//   ]

//   if (sessionStatus === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-10 w-10 animate-spin text-primary" />
//           <p className="text-sm text-slate-500">Loading vendors...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
//       <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
//             <p className="text-sm text-slate-500 mt-0.5">Manage and monitor all vendors on the platform</p>
//           </div>
//           <button onClick={() => fetchVendors()} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors">
//             <RefreshCw className="h-4 w-4" />
//             Refresh
//           </button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {statCards.map((card, i) => (
//             <StatsCard key={i} {...card} />
//           ))}
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-slate-200 p-4">
//           <div className="flex flex-col md:flex-row gap-3">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={filters.search}
//                 onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
//                 placeholder="Search by business name, email, or vendor ID..."
//                 className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//               />
//             </div>
//             <select
//               value={filters.status}
//               onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
//               className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
//             >
//               <option value="all">All Status</option>
//               <option value="pending">Pending Approval</option>
//               <option value="verified">Verified</option>
//               <option value="rejected">Rejected</option>
//               <option value="suspended">Suspended</option>
//             </select>
//             <select
//               value={filters.plan}
//               onChange={(e) => setFilters({ ...filters, plan: e.target.value, page: 1 })}
//               className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
//             >
//               <option value="all">All Plans</option>
//               <option value="basic">Basic</option>
//               <option value="standard">Standard</option>
//               <option value="premium">Premium</option>
//               <option value="enterprise">Enterprise</option>
//             </select>
//           </div>
//         </div>

//         {/* Vendors Grid */}
//         {vendors.length === 0 ? (
//           <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
//             <Store className="h-12 w-12 mx-auto text-slate-300 mb-4" />
//             <h3 className="text-lg font-semibold text-slate-800">No vendors found</h3>
//             <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//             {vendors.map((vendor) => (
//               <VendorCard
//                 key={vendor._id}
//                 vendor={vendor}
//                 onView={setSelectedVendor}
//                 onApprove={handleApprove}
//                 onReject={(v: Vendor) => { setVendorToAction(v); setShowRejectModal(true) }}
//                 onSuspend={(v: Vendor) => { setVendorToAction(v); setShowSuspendModal(true) }}
//                 onReinstate={handleReinstate}
//               />
//             ))}
//           </div>
//         )}

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
//             <p className="text-sm text-slate-500">
//               Page {filters.page} of {totalPages} ({totalVendors} vendors)
//             </p>
//             <div className="flex gap-1.5">
//               <button
//                 onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
//                 disabled={filters.page === 1}
//                 className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </button>
//               <button
//                 onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
//                 disabled={filters.page === totalPages}
//                 className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Modals */}
//       {selectedVendor && (
//         <VendorDetailsModal
//           vendor={selectedVendor}
//           onClose={() => setSelectedVendor(null)}
//           onApprove={handleApprove}
//           onReject={(v: Vendor) => { setSelectedVendor(null); setVendorToAction(v); setShowRejectModal(true) }}
//           onSuspend={(v: Vendor) => { setSelectedVendor(null); setVendorToAction(v); setShowSuspendModal(true) }}
//           onReinstate={handleReinstate}
//           onUpdateCommission={handleUpdateCommission}
//         />
//       )}
      
//       {showRejectModal && vendorToAction && (
//         <RejectModal
//           vendor={vendorToAction}
//           onConfirm={handleReject}
//           onClose={() => { setShowRejectModal(false); setVendorToAction(null) }}
//         />
//       )}
      
//       {showSuspendModal && vendorToAction && (
//         <SuspendModal
//           vendor={vendorToAction}
//           onConfirm={handleSuspend}
//           onClose={() => { setShowSuspendModal(false); setVendorToAction(null) }}
//         />
//       )}
//     </div>
//   )
// }



// app/admin/vendors/page.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Store, Search, ChevronLeft, ChevronRight, RefreshCw,
  CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText,
  DollarSign, Mail, Phone, MapPin, Calendar, Star, TrendingUp,
  Shield, Ban, Building2, Loader2, Package, Users, Award,
 Crown, Zap, Heart, Activity, BarChart3,
  PieChart, UserCheck, UserX, Wallet, CreditCard, Globe,
  Facebook, Twitter, Instagram, Linkedin, Youtube, Link as LinkIcon,
  Truck, Headphones, ThumbsUp, Sparkles, Target, Rocket
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Types
interface Vendor {
  _id: string
  vendorId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
    }
  }
  business: {
    name: string
    description?: string
    website?: string
    logo?: string
    gstin?: string
    panNumber?: string
    yearEstablished?: number
    employeeCount?: number
    businessType?: string
  }
  contact: {
    primaryPhone: string
    primaryEmail?: string
    secondaryPhone?: string
    supportEmail?: string
    supportPhone?: string
  }
  addresses: {
    registeredOffice?: {
      _id: string
      city: string
      state: string
      pincode: string
      addressLine1: string
      addressLine2?: string
      country: string
    }
    registered?: {
      city: string
      state: string
      pincode: string
      addressLine1: string
      addressLine2?: string
      country: string
    }
    serviceableCities: Array<{ _id: string; city: string; state: string; isActive: boolean }>
    serviceablePincodes: string[] | Array<{ _id: string; pincode: string; isActive: boolean }>
    warehouse?: any[]
  }
  verification: {
    status: 'pending' | 'verified' | 'rejected' | 'suspended'
    documents: Array<{
      type: string
      url: string
      status?: string
      uploadedAt?: string
      verifiedAt?: string
      verifiedBy?: string
      remarks?: string
    }>
    verifiedAt?: string
    verifiedBy?: string
    rejectionReason?: string
  }
  bankDetails?: {
    accountHolderName: string
    bankName: string
    ifscCode: string
    branchName: string
    accountType: string
    upiId?: string
    verified: boolean
  }
  commission: {
    rate: number
    type: 'percentage' | 'fixed'
    fixedAmount?: number
    monthlyCap?: number
    specialRates?: any[]
  }
  products?: {
    total: number
    active: number
    rented: number
    available: number
  }
  performance: {
    rating: {
      average: number
      count: number
    }
    metrics: {
      totalRentals: number
      completedRentals: number
      cancelledRentals: number
      totalRevenue: number
      averageRentalValue: number
      customerSatisfaction: number
      responseRate: number
      fulfillmentRate: number
      onTimeDelivery: number
    }
  }
  subscription: {
    plan: 'basic' | 'standard' | 'premium' | 'enterprise'
    validUntil: string
    autoRenew: boolean
    limits: {
      maxProducts: number
      maxRentalsPerMonth: number
    }
  }
  settings?: {
    autoConfirmBookings: boolean
    cancellationPolicy: string
    advanceNotice: number
  }
  status: {
    isActive: boolean
    isBlocked: boolean
    isOnboarded: boolean
    onboardedAt?: string
    blockReason?: string
    blockedAt?: string
    blockedBy?: string
  }
  createdAt: string
  updatedAt: string
}

interface VendorStats {
  overview: Array<{
    totalVendors: number
    activeVendors: number
    pendingApproval: number
    verified: number
    rejected: number
    suspended: number
  }>
  byPlan: Array<{ _id: string; count: number }>
  recentRegistrations: Array<{
    _id: string
    vendorId: string
    businessName: string
    email: string
    phone: string
    status: string
    createdAt: string
  }>
}

interface VendorFilters {
  status: string
  isActive: string
  plan: string
  search: string
  page: number
  limit: number
}

// API Service
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Helper functions
const getCityName = (city: any): string => {
  if (!city) return 'N/A'
  if (typeof city === 'string') return city
  if (typeof city === 'object') return city.city || city.name || 'N/A'
  return 'N/A'
}

const getPincode = (pincode: any): string => {
  if (!pincode) return 'N/A'
  if (typeof pincode === 'string') return pincode
  if (typeof pincode === 'object') return pincode.pincode || pincode.code || 'N/A'
  return 'N/A'
}

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

// Component: Stats Card
const StatsCard = ({ title, value, icon: Icon, color, trend, onClick, subtitle }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    onClick={onClick} 
    className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer hover:shadow-lg transition-all hover:border-primary/30"
  >
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}10` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      {trend && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
          {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trend.isPositive ? '+' : ''}{trend.value}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-800 mt-3">{value.toLocaleString()}</p>
    <p className="text-xs text-slate-500 mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
  </motion.div>
)

// Component: Vendor Card
const VendorCard = ({ vendor, onView, onApprove, onReject, onSuspend, onReinstate }: any) => {
  const getStatusBadge = () => {
    if (vendor.verification.status === 'verified' && vendor.status.isActive && !vendor.status.isBlocked) {
      return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle, border: 'border-green-200' }
    }
    if (vendor.verification.status === 'pending') {
      return { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock, border: 'border-yellow-200' }
    }
    if (vendor.verification.status === 'rejected') {
      return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle, border: 'border-red-200' }
    }
    if (vendor.status.isBlocked) {
      return { label: 'Suspended', color: 'bg-orange-100 text-orange-700', icon: Ban, border: 'border-orange-200' }
    }
    return { label: 'Verified', color: 'bg-blue-100 text-blue-700', icon: Shield, border: 'border-blue-200' }
  }
  
  const statusConfig = getStatusBadge()
  const StatusIcon = statusConfig.icon
  const registeredAddress = vendor.addresses.registeredOffice || vendor.addresses.registered
  const cityName = getCityName(registeredAddress?.city || vendor.addresses.serviceableCities?.[0])
  const totalRevenue = vendor.performance?.metrics?.totalRevenue || 0
  const totalRentals = vendor.performance?.metrics?.totalRentals || 0

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#2874f0] to-[#00a0e3] flex items-center justify-center text-white font-bold text-lg shadow-md">
              {vendor.business.name?.charAt(0) || 'V'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-slate-800">{vendor.business.name}</h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.color} border ${statusConfig.border}`}>
                  <StatusIcon className="h-2.5 w-2.5" />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">ID: {vendor.vendorId}</p>
            </div>
          </div>
          <button onClick={() => onView(vendor)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
            <Eye className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
          <div className="flex items-center gap-2 text-slate-500">
            <Mail className="h-3.5 w-3.5" />
            <span className="text-xs truncate">{vendor.user?.email || vendor.contact?.primaryEmail || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            <span className="text-xs">{vendor.contact?.primaryPhone || vendor.user?.phone || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <MapPin className="h-3.5 w-3.5" />
            <span className="text-xs">{cityName || 'Location N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Calendar className="h-3.5 w-3.5" />
            <span className="text-xs">Joined {new Date(vendor.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold">{vendor.performance?.rating?.average?.toFixed(1) || '0'}</span>
            <span className="text-xs text-slate-400">({vendor.performance?.rating?.count || 0})</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-sm font-semibold">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-sm font-semibold">{totalRentals}</span>
            <span className="text-xs text-slate-400">rentals</span>
          </div>
        </div>
        
        {/* Serviceable Cities Preview */}
        {vendor.addresses.serviceableCities && vendor.addresses.serviceableCities.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-2">
            {vendor.addresses.serviceableCities.slice(0, 3).map((city: any) => (
              <span key={city._id || getCityName(city)} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                {getCityName(city)}
              </span>
            ))}
            {vendor.addresses.serviceableCities.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-primary">
                +{vendor.addresses.serviceableCities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4">
          {vendor.verification.status === 'pending' && (
            <>
              <button onClick={() => onApprove(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all">
                <CheckCircle className="h-3.5 w-3.5" /> Approve
              </button>
              <button onClick={() => onReject(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-all">
                <XCircle className="h-3.5 w-3.5" /> Reject
              </button>
            </>
          )}
          {vendor.verification.status === 'verified' && !vendor.status.isBlocked && (
            <button onClick={() => onSuspend(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-all">
              <Ban className="h-3.5 w-3.5" /> Suspend
            </button>
          )}
          {vendor.status.isBlocked && (
            <button onClick={() => onReinstate(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Reinstate
            </button>
          )}
          <button onClick={() => onView(vendor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all">
            <Eye className="h-3.5 w-3.5" /> Details
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Component: Recent Registration Card
const RecentRegistrationCard = ({ registration }: { registration: any }) => {
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'verified': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-slate-100 text-slate-700'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2874f0]/10 to-[#00a0e3]/10 flex items-center justify-center">
          <Store className="h-4 w-4 text-[#2874f0]" />
        </div>
        <div>
          <p className="font-medium text-slate-800 text-sm">{registration.businessName}</p>
          <p className="text-xs text-slate-500">{registration.email} • {registration.phone}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">ID: {registration.vendorId}</p>
        </div>
      </div>
      <div className="text-right">
        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(registration.status)}`}>
          {registration.status}
        </span>
        <p className="text-[10px] text-slate-400 mt-1">
          {new Date(registration.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}

// Component: Plan Distribution Chart
const PlanDistribution = ({ data }: { data: Array<{ _id: string; count: number }> }) => {
  const planColors: Record<string, string> = {
    basic: '#64748b',
    standard: '#3b82f6',
    premium: '#8b5cf6',
    enterprise: '#f59e0b'
  }
  
  const total = data.reduce((sum, item) => sum + item.count, 0)
  
  return (
    <div className="space-y-3">
      {data.map((plan) => (
        <div key={plan._id}>
          <div className="flex justify-between text-xs mb-1">
            <span className="capitalize font-medium text-slate-700">{plan._id}</span>
            <span className="text-slate-500">{plan.count} vendors</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(plan.count / total) * 100}%`,
                backgroundColor: planColors[plan._id] || '#2874f0'
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// Main Component
export default function AdminVendorsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()
  
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<VendorFilters>({ status: 'all', isActive: 'all', plan: 'all', search: '', page: 1, limit: 12 })
  const [totalPages, setTotalPages] = useState(1)
  const [totalVendors, setTotalVendors] = useState(0)
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [vendorToAction, setVendorToAction] = useState<Vendor | null>(null)

  const fetchVendors = useCallback(async () => {
    if (sessionStatus !== 'authenticated') return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.set('status', filters.status)
      if (filters.isActive !== 'all') params.set('isActive', filters.isActive)
      if (filters.plan !== 'all') params.set('plan', filters.plan)
      if (filters.search) params.set('search', filters.search)
      params.set('page', filters.page.toString())
      params.set('limit', filters.limit.toString())
      
      const [vendorsRes, statsRes] = await Promise.all([
        api.get(`/api/v1/admin/vendors?${params.toString()}`),
        api.get(`/api/v1/admin/vendors/stats`)
      ])
      
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.data.vendors || [])
        setTotalPages(vendorsRes.data.data.pagination?.pages || 1)
        setTotalVendors(vendorsRes.data.data.pagination?.total || 0)
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      }
    } catch (error: any) {
      console.error('Failed to load vendors:', error)
      toast.error(error.response?.data?.message || 'Failed to load vendors')
    } finally {
      setIsLoading(false)
    }
  }, [sessionStatus, filters, toast])

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchVendors()
    } else if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [fetchVendors, sessionStatus, router])

  const overview = stats?.overview?.[0] || { totalVendors: 0, activeVendors: 0, pendingApproval: 0, verified: 0, rejected: 0, suspended: 0 }
  
  const statCards = [
    { title: 'Total Vendors', value: overview.totalVendors, icon: Store, color: '#2874f0', subtitle: 'Registered on platform', onClick: () => setFilters({ ...filters, status: 'all', page: 1 }) },
    { title: 'Active Vendors', value: overview.activeVendors, icon: UserCheck, color: '#21a056', trend: { value: 12, isPositive: true }, subtitle: 'Currently selling', onClick: () => setFilters({ ...filters, status: 'verified', isActive: 'active', page: 1 }) },
    { title: 'Pending Approval', value: overview.pendingApproval, icon: Clock, color: '#f59e0b', subtitle: 'Awaiting review', onClick: () => setFilters({ ...filters, status: 'pending', page: 1 }) },
    { title: 'Suspended', value: overview.suspended, icon: Ban, color: '#ef4444', subtitle: 'Temporarily blocked', onClick: () => setFilters({ ...filters, status: 'suspended', page: 1 }) }
  ]

  // Premium static insights
  const insights = [
    { icon: Award, title: 'Top Performing Plan', value: stats?.byPlan?.[0]?._id || 'Basic', subtitle: `${stats?.byPlan?.[0]?.count || 0} vendors`, color: '#fbbf24' },
    { icon: TrendingUp, title: 'Monthly Growth', value: '+15%', subtitle: 'vs last month', color: '#21a056' },
    { icon: ThumbsUp, title: 'Avg. Satisfaction', value: '4.8', subtitle: 'out of 5', color: '#8b5cf6' },
    { icon: Target, title: 'Conversion Rate', value: '68%', subtitle: 'of verified vendors', color: '#ef4444' }
  ]

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-slate-500">Loading vendor data...</p>
        </div>
      </div>
    )
  }

  const handleApprove = async (vendor: Vendor) => {
    try {
      const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/approve`, { commissionRate: 10 })
      if (res.data.success) {
        toast.success(`${vendor.business.name} approved successfully`)
        fetchVendors()
        setSelectedVendor(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve vendor')
    }
  }

  const handleReinstate = async (vendor: Vendor) => {
    try {
      const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/reinstate`)
      if (res.data.success) {
        toast.success(`${vendor.business.name} reinstated`)
        fetchVendors()
        setSelectedVendor(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reinstate vendor')
    }
  }

  const handleUpdateCommission = async (vendor: Vendor, rate: number) => {
    try {
      const res = await api.patch(`/admin/vendors/${vendor._id}/commission`, { rate })
      if (res.data.success) {
        toast.success(`Commission updated to ${rate}%`)
        fetchVendors()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update commission')
    }
  }

  const handleReject = async (vendor: Vendor, reason: string) => {
    try {
      const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/reject`, { reason })
      if (res.data.success) {
        toast.success(`${vendor.business.name} rejected`)
        fetchVendors()
        setShowRejectModal(false)
        setSelectedVendor(null)
        setVendorToAction(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject vendor')
    }
  }

  const handleSuspend = async (vendor: Vendor, reason: string, duration: string) => {
    try {
      const res = await api.post(`/api/v1/admin/vendors/${vendor._id}/suspend`, { 
        reason, 
        duration: duration ? parseInt(duration) : undefined 
      })
      if (res.data.success) {
        toast.success(`${vendor.business.name} suspended`)
        fetchVendors()
        setShowSuspendModal(false)
        setSelectedVendor(null)
        setVendorToAction(null)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to suspend vendor')
    }
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendor Management</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage, monitor, and analyze all vendors on your platform</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => fetchVendors()} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-all">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#2874f0] text-white rounded-lg text-sm hover:bg-[#1a5fd4] transition-all">
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <StatsCard key={i} {...card} />
          ))}
        </div>

        {/* Premium Insights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {insights.map((insight, i) => {
            const Icon = insight.icon
            return (
              <motion.div
                key={insight.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${insight.color}10` }}>
                    <Icon className="h-4 w-4" style={{ color: insight.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{insight.title}</p>
                    <p className="text-lg font-bold text-slate-800">{insight.value}</p>
                    <p className="text-[10px] text-slate-400">{insight.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                placeholder="Search by business name, email, vendor ID, or GSTIN..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Approval</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value, page: 1 })}
              className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="standard">Standard</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        {/* Two Column Layout with Vendors and Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vendors Grid - Main Content */}
          <div className="lg:col-span-2">
            {vendors.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
                <Store className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-slate-800">No vendors found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vendors.map((vendor) => (
                  <VendorCard
                    key={vendor._id}
                    vendor={vendor}
                    onView={setSelectedVendor}
                    onApprove={handleApprove}
                    onReject={(v: Vendor) => { setVendorToAction(v); setShowRejectModal(true) }}
                    onSuspend={(v: Vendor) => { setVendorToAction(v); setShowSuspendModal(true) }}
                    onReinstate={handleReinstate}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3 mt-4">
                <p className="text-sm text-slate-500">
                  Page {filters.page} of {totalPages} ({totalVendors} vendors)
                </p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                    disabled={filters.page === 1}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                    disabled={filters.page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Stats & Insights */}
          <div className="space-y-6">
            {/* Plan Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-[#2874f0]" />
                <h3 className="font-semibold text-slate-800">Plan Distribution</h3>
              </div>
              {stats?.byPlan && stats.byPlan.length > 0 ? (
                <PlanDistribution data={stats.byPlan} />
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">No plan data available</p>
              )}
            </div>

            {/* Recent Registrations */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#2874f0]" />
                <h3 className="font-semibold text-slate-800">Recent Registrations</h3>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {stats?.recentRegistrations?.map((reg) => (
                  <RecentRegistrationCard key={reg._id} registration={reg} />
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Quick Tip</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Verified vendors get 3x more visibility in search results. 
                    Encourage pending vendors to complete their KYC verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-[#2874f0]" />
                <h3 className="font-semibold text-slate-800">Performance Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Verification Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(overview.verified / (overview.totalVendors || 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {((overview.verified / (overview.totalVendors || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Active Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(overview.activeVendors / (overview.totalVendors || 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {((overview.activeVendors / (overview.totalVendors || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Approval Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-slate-100 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((overview.verified + overview.rejected) / (overview.totalVendors || 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                      {(((overview.verified + overview.rejected) / (overview.totalVendors || 1)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedVendor && (
        <VendorDetailsModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onApprove={handleApprove}
          onReject={(v: Vendor) => { setSelectedVendor(null); setVendorToAction(v); setShowRejectModal(true) }}
          onSuspend={(v: Vendor) => { setSelectedVendor(null); setVendorToAction(v); setShowSuspendModal(true) }}
          onReinstate={handleReinstate}
          onUpdateCommission={handleUpdateCommission}
        />
      )}
      
      {showRejectModal && vendorToAction && (
        <RejectModal
          vendor={vendorToAction}
          onConfirm={handleReject}
          onClose={() => { setShowRejectModal(false); setVendorToAction(null) }}
        />
      )}
      
      {showSuspendModal && vendorToAction && (
        <SuspendModal
          vendor={vendorToAction}
          onConfirm={handleSuspend}
          onClose={() => { setShowSuspendModal(false); setVendorToAction(null) }}
        />
      )}
    </div>
  )
}

// Helper components
const TrendingDown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
    <polyline points="17 18 23 18 23 12"></polyline>
  </svg>
)

const Download = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
)


// Component: Reject Modal
const RejectModal = ({ vendor, onConfirm, onClose }: any) => {
  const [reason, setReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setIsSubmitting(true)
    await onConfirm(vendor, reason)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Reject Vendor</h3>
        <p className="text-sm text-slate-500 mb-4">
          Please provide a reason for rejecting <span className="font-semibold">{vendor?.business.name}</span>
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/30"
          placeholder="Enter rejection reason..."
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-red-600 transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Component: Suspend Modal
const SuspendModal = ({ vendor, onConfirm, onClose }: any) => {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason.trim()) return
    setIsSubmitting(true)
    await onConfirm(vendor, reason, duration)
    setIsSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Suspend Vendor</h3>
        <p className="text-sm text-slate-500 mb-4">
          Suspend <span className="font-semibold">{vendor?.business.name}</span> from the platform
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30"
          placeholder="Enter suspension reason..."
        />
        <div className="mt-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">Suspension Duration (Optional)</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          >
            <option value="">Indefinite</option>
            <option value="7">7 days</option>
            <option value="14">14 days</option>
            <option value="30">30 days</option>
          </select>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-orange-600 transition-colors"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Confirm Suspension'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper component for Info icon
const Info = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)


// Component: Vendor Details Modal (FIXED)
const VendorDetailsModal = ({ vendor, onClose, onApprove, onReject, onSuspend, onReinstate, onUpdateCommission }: any) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'performance' | 'commission'>('overview')
  const [commissionRate, setCommissionRate] = useState(vendor?.commission?.rate || 10)
  const [isUpdatingCommission, setIsUpdatingCommission] = useState(false)

  if (!vendor) return null

  const registeredAddress = vendor.addresses.registeredOffice || vendor.addresses.registered

  const handleUpdateCommission = async () => {
    setIsUpdatingCommission(true)
    await onUpdateCommission(vendor, commissionRate)
    setIsUpdatingCommission(false)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop - separate div for overlay */}
      <div className="fixed inset-0 bg-black/50  transition-opacity" onClick={onClose} />
      
      
      {/* Modal Container - centered */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl transform transition-all">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-5 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-xs">Vendor Details</p>
                <h3 className="text-xl font-bold text-white">{vendor.business.name}</h3>
                <p className="text-white/80 text-sm mt-1">ID: {vendor.vendorId}</p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <XCircle className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-slate-200 px-6 bg-white">
            <div className="flex gap-6 overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview', icon: Building2 },
                { id: 'documents', label: 'Documents', icon: FileText },
                { id: 'performance', label: 'Performance', icon: TrendingUp },
                { id: 'commission', label: 'Commission', icon: DollarSign }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
                      activeTab === tab.id 
                        ? 'border-[#2874f0] text-[#2874f0]' 
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
          
          {/* Content - scrollable area */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Business Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Business Type:</span>
                        <span className="capitalize">{vendor.business.businessType || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">GSTIN:</span>
                        <span>{vendor.business.gstin || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">PAN:</span>
                        <span>{vendor.business.panNumber ? `XXXXX${vendor.business.panNumber.slice(-4)}` : 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Year Established:</span>
                        <span>{vendor.business.yearEstablished || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{vendor.user?.email || vendor.contact?.primaryEmail || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{vendor.contact?.primaryPhone || vendor.user?.phone || 'N/A'}</span>
                      </div>
                      {vendor.contact?.supportEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-400" />
                          <span>{vendor.contact.supportEmail}</span>
                        </div>
                      )}
                      {vendor.contact?.supportPhone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-400" />
                          <span>{vendor.contact.supportPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {registeredAddress && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Registered Address</h4>
                    <p>{registeredAddress.addressLine1}</p>
                    {registeredAddress.addressLine2 && <p>{registeredAddress.addressLine2}</p>}
                    <p>{registeredAddress.city}, {registeredAddress.state} - {registeredAddress.pincode}</p>
                    <p>{registeredAddress.country || 'India'}</p>
                  </div>
                )}
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Service Areas</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-sm font-medium text-slate-600">Cities:</span>
                    {vendor.addresses.serviceableCities?.map((city: any) => (
                      <span key={city._id || getCityName(city)} className="px-2 py-0.5 bg-white rounded-full text-xs">
                        {getCityName(city)}
                      </span>
                    ))}
                  </div>
                  {vendor.addresses.serviceablePincodes && vendor.addresses.serviceablePincodes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-slate-600">Pincodes:</span>
                      {vendor.addresses.serviceablePincodes.slice(0, 10).map((pincode: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-white rounded-full text-xs">
                          {getPincode(pincode)}
                        </span>
                      ))}
                      {vendor.addresses.serviceablePincodes.length > 10 && (
                        <span className="px-2 py-0.5 text-xs text-primary">
                          +{vendor.addresses.serviceablePincodes.length - 10} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {vendor.bankDetails && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3">Bank Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Account Holder:</span>
                        <span>{vendor.bankDetails.accountHolderName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Name:</span>
                        <span>{vendor.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IFSC Code:</span>
                        <span>{vendor.bankDetails.ifscCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">UPI ID:</span>
                        <span>{vendor.bankDetails.upiId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Verification:</span>
                        <span className={vendor.bankDetails.verified ? 'text-green-600' : 'text-yellow-600'}>
                          {vendor.bankDetails.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {vendor.verification.rejectionReason && (
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-800">Rejection Reason</p>
                        <p className="text-sm text-red-700">{vendor.verification.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {vendor.status.blockReason && (
                  <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                    <div className="flex items-start gap-2">
                      <Ban className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-orange-800">Suspension Reason</p>
                        <p className="text-sm text-orange-700">{vendor.status.blockReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div className="space-y-4">
                {vendor.verification.documents?.length > 0 ? (
                  vendor.verification.documents.map((doc: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800 capitalize">{doc.type?.replace(/_/g, ' ') || 'Document'}</p>
                        <p className="text-xs text-slate-500">
                          Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          doc.status === 'verified' ? 'bg-green-100 text-green-700' : 
                          doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                        {doc.url && (
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-slate-100 rounded-lg">
                            <Eye className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">No documents uploaded</div>
                )}
              </div>
            )}
            
            {activeTab === 'performance' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-800">{vendor.performance?.metrics?.totalRentals || 0}</p>
                    <p className="text-xs text-slate-500">Total Rentals</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{vendor.performance?.metrics?.completedRentals || 0}</p>
                    <p className="text-xs text-slate-500">Completed</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-600">{vendor.performance?.metrics?.cancelledRentals || 0}</p>
                    <p className="text-xs text-slate-500">Cancelled</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{vendor.performance?.metrics?.onTimeDelivery || 0}%</p>
                    <p className="text-xs text-slate-500">On-Time Delivery</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-purple-600">₹{((vendor.performance?.metrics?.totalRevenue || 0) / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-slate-500">Total Revenue</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-amber-600">{vendor.performance?.metrics?.responseRate || 0}%</p>
                    <p className="text-xs text-slate-500">Response Rate</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-lg font-bold text-emerald-600">{vendor.performance?.metrics?.fulfillmentRate || 0}%</p>
                    <p className="text-xs text-slate-500">Fulfillment Rate</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-xl p-4">
                  <h4 className="font-semibold text-slate-800 mb-3">Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = vendor.performance?.rating?.distribution?.[star] || 0
                    const total = vendor.performance?.rating?.count || 1
                    const percentage = total ? (count / total) * 100 : 0
                    return (
                      <div key={star} className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5 w-16">
                          <span className="text-sm">{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-amber-400" style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {activeTab === 'commission' && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-800">Commission Rate</h4>
                      <p className="text-xs text-slate-500">Current commission for this vendor</p>
                    </div>
                    <div className="text-3xl font-bold text-[#2874f0]">{vendor.commission?.rate || 10}%</div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Update Commission Rate</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(Number(e.target.value))}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
                        min="0"
                        max="50"
                        step="0.5"
                      />
                      <button
                        onClick={handleUpdateCommission}
                        disabled={isUpdatingCommission}
                        className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-[#1a5fd4] transition-colors"
                      >
                        {isUpdatingCommission ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-800">Commission Information</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Commission is deducted from each successful rental. The standard rate is 10% for basic plan vendors.
                        Enterprise partners may have custom rates.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">Subscription Details</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Plan: <span className="font-semibold capitalize">{vendor.subscription?.plan || 'basic'}</span><br />
                        Valid Until: {vendor.subscription?.validUntil ? new Date(vendor.subscription.validUntil).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer - Action Buttons */}
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 sticky bottom-0">
            <div className="flex gap-3 justify-end">
              {vendor.verification.status === 'pending' && (
                <>
                  <button 
                    onClick={() => onApprove(vendor)} 
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Approve Vendor
                  </button>
                  <button 
                    onClick={() => onReject(vendor)} 
                    className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Reject Vendor
                  </button>
                </>
              )}
              {vendor.verification.status === 'verified' && !vendor.status.isBlocked && (
                <button 
                  onClick={() => onSuspend(vendor)} 
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Suspend Vendor
                </button>
              )}
              {vendor.status.isBlocked && (
                <button 
                  onClick={() => onReinstate(vendor)} 
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  Reinstate Vendor
                </button>
              )}
              <button 
                onClick={onClose} 
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

