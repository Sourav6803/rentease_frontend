// // app/admin/delivery/assignments/page.tsx
// 'use client'

// import { useState, useEffect } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Truck, Users, MapPin, Clock, Calendar, Search, Filter,
//   Plus, Eye, Edit, CheckCircle, XCircle, AlertCircle,
//   Phone, Mail, Navigation, Star, Activity, Download,
//   RefreshCw, ChevronLeft, ChevronRight, UserPlus,
//   Send, MessageCircle, Bell, Zap, Target, Award,
//   Package
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// // Types
// interface PendingDelivery {
//   _id: string
//   deliveryNumber: string
//   type: string
//   scheduledDate: string
//   scheduledSlot: string
//   address: {
//     addressLine1: string
//     city: string
//     state: string
//     pincode: string
//     contactName: string
//     contactPhone: string
//   }
//   items: Array<{ name: string; quantity: number }>
//   priority: 'high' | 'medium' | 'low'
//   distance: number
// }

// interface AvailablePersonnel {
//   _id: string
//   employeeId: string
//   name: string
//   phone: string
//   vehicleType: string
//   zone: string
//   rating: number
//   currentLoad: number
//   maxCapacity: number
//   eta: number
// }

// // Mock Data
// const pendingDeliveries: PendingDelivery[] = [
//   {
//     _id: 'del1',
//     deliveryNumber: 'DLV001234',
//     type: 'delivery',
//     scheduledDate: '2024-05-16',
//     scheduledSlot: 'Morning (9 AM - 12 PM)',
//     address: {
//       addressLine1: 'Sector 62, Noida',
//       city: 'Noida',
//       state: 'UP',
//       pincode: '201301',
//       contactName: 'Rahul Sharma',
//       contactPhone: '+91 98765 43210'
//     },
//     items: [{ name: 'Sony Headphones', quantity: 1 }],
//     priority: 'high',
//     distance: 3.2
//   },
//   {
//     _id: 'del2',
//     deliveryNumber: 'DLV001235',
//     type: 'pickup',
//     scheduledDate: '2024-05-16',
//     scheduledSlot: 'Afternoon (12 PM - 3 PM)',
//     address: {
//       addressLine1: 'Cyber City, Gurgaon',
//       city: 'Gurgaon',
//       state: 'HR',
//       pincode: '122002',
//       contactName: 'Priya Singh',
//       contactPhone: '+91 98765 43211'
//     },
//     items: [{ name: 'MacBook Pro', quantity: 1 }],
//     priority: 'medium',
//     distance: 5.1
//   },
//   {
//     _id: 'del3',
//     deliveryNumber: 'DLV001236',
//     type: 'delivery',
//     scheduledDate: '2024-05-16',
//     scheduledSlot: 'Evening (3 PM - 6 PM)',
//     address: {
//       addressLine1: 'Golf Course Road',
//       city: 'Gurgaon',
//       state: 'HR',
//       pincode: '122009',
//       contactName: 'Amit Kumar',
//       contactPhone: '+91 98765 43212'
//     },
//     items: [{ name: 'Samsung TV', quantity: 1 }, { name: 'Soundbar', quantity: 1 }],
//     priority: 'high',
//     distance: 4.5
//   }
// ]

// const availablePersonnel: AvailablePersonnel[] = [
//   {
//     _id: 'p1',
//     employeeId: 'DLV001',
//     name: 'Rahul Sharma',
//     phone: '+91 98765 43210',
//     vehicleType: 'bike',
//     zone: 'North',
//     rating: 4.9,
//     currentLoad: 2,
//     maxCapacity: 5,
//     eta: 15
//   },
//   {
//     _id: 'p2',
//     employeeId: 'DLV002',
//     name: 'Priya Singh',
//     phone: '+91 98765 43211',
//     vehicleType: 'car',
//     zone: 'South',
//     rating: 4.8,
//     currentLoad: 1,
//     maxCapacity: 8,
//     eta: 25
//   },
//   {
//     _id: 'p3',
//     employeeId: 'DLV003',
//     name: 'Amit Kumar',
//     phone: '+91 98765 43212',
//     vehicleType: 'bike',
//     zone: 'East',
//     rating: 4.7,
//     currentLoad: 3,
//     maxCapacity: 5,
//     eta: 20
//   },
//   {
//     _id: 'p4',
//     employeeId: 'DLV004',
//     name: 'Suresh Reddy',
//     phone: '+91 98765 43213',
//     vehicleType: 'van',
//     zone: 'West',
//     rating: 4.6,
//     currentLoad: 0,
//     maxCapacity: 12,
//     eta: 30
//   }
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

// // Components
// const DeliveryCard = ({ delivery, onAssign }: { delivery: PendingDelivery; onAssign: (delivery: PendingDelivery) => void }) => {
//   const priorityColor = {
//     high: 'bg-red-100 text-red-700 border-red-200',
//     medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//     low: 'bg-green-100 text-green-700 border-green-200'
//   }

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all">
//       <div className="flex items-start justify-between">
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <p className="text-xs font-mono text-slate-400">{delivery.deliveryNumber}</p>
//             <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColor[delivery.priority]}`}>
//               {delivery.priority.toUpperCase()}
//             </span>
//           </div>
//           <div className="flex items-center gap-2 text-sm mb-2">
//             <Calendar className="h-3.5 w-3.5 text-slate-400" />
//             <span className="text-slate-600">{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
//             <Clock className="h-3.5 w-3.5 text-slate-400 ml-2" />
//             <span className="text-slate-600">{delivery.scheduledSlot}</span>
//           </div>
//           <h3 className="font-semibold text-slate-800 mb-1">{delivery.address.contactName}</h3>
//           <p className="text-sm text-slate-500">{delivery.address.addressLine1}, {delivery.address.city}</p>
//           <div className="flex items-center gap-2 mt-2">
//             <Phone className="h-3 w-3 text-slate-400" />
//             <span className="text-xs text-slate-500">{delivery.address.contactPhone}</span>
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
//             <Navigation className="h-3.5 w-3.5" />
//             <span>{delivery.distance} km away</span>
//           </div>
//           <p className="text-xs text-slate-500">{delivery.items.length} item(s)</p>
//           <button
//             onClick={() => onAssign(delivery)}
//             className="mt-3 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1"
//           >
//             <UserPlus className="h-3 w-3" />
//             Assign
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// const PersonnelCard = ({ person, onAssign, selectedDelivery }: { person: AvailablePersonnel; onAssign: (personId: string) => void; selectedDelivery: PendingDelivery | null }) => {
//   const loadPercentage = (person.currentLoad / person.maxCapacity) * 100

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
//       <div className="flex items-start gap-3">
//         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
//           {person.name.charAt(0)}
//         </div>
//         <div className="flex-1">
//           <div className="flex items-center justify-between">
//             <div>
//               <h4 className="font-semibold text-slate-800">{person.name}</h4>
//               <p className="text-xs text-slate-500 font-mono">{person.employeeId}</p>
//             </div>
//             <div className="flex items-center gap-1">
//               <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
//               <span className="text-sm font-semibold">{person.rating}</span>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-3 mt-2 text-xs">
//             <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{person.vehicleType}</span>
//             <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{person.zone} Zone</span>
//             <span className="flex items-center gap-1"><Clock className="h-3 w-3" />ETA: {person.eta} min</span>
//           </div>
//           <div className="mt-2">
//             <div className="flex justify-between text-[10px] text-slate-500 mb-1">
//               <span>Current Load</span>
//               <span>{person.currentLoad}/{person.maxCapacity} deliveries</span>
//             </div>
//             <div className="w-full bg-slate-100 rounded-full h-1.5">
//               <div className="h-1.5 rounded-full bg-primary" style={{ width: `${loadPercentage}%` }} />
//             </div>
//           </div>
//           {selectedDelivery && (
//             <button
//               onClick={() => onAssign(person._id)}
//               className="mt-3 w-full py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
//             >
//               Assign to {person.name}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// const AssignmentModal = ({ delivery, onClose, onAssign }: { delivery: PendingDelivery | null; onClose: () => void; onAssign: (personId: string) => void }) => {
//   const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

//   if (!delivery) return null

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="fixed inset-0 bg-black/50" onClick={onClose} />
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
//           <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
//             <h3 className="text-lg font-bold text-white">Assign Delivery</h3>
//             <p className="text-white/80 text-sm mt-1">Select a delivery person for #{delivery.deliveryNumber}</p>
//             <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
//               <XCircle className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="p-6 overflow-y-auto max-h-[60vh]">
//             <div className="mb-4 p-3 bg-slate-50 rounded-lg">
//               <p className="text-sm font-medium text-slate-700">Delivery Details</p>
//               <p className="text-xs text-slate-500 mt-1">{delivery.address.addressLine1}, {delivery.address.city}</p>
//               <div className="flex items-center gap-3 mt-2 text-xs">
//                 <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
//                 <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{delivery.scheduledSlot}</span>
//               </div>
//             </div>
//             <div className="space-y-3">
//               {availablePersonnel.map(person => (
//                 <div
//                   key={person._id}
//                   onClick={() => setSelectedPersonId(person._id)}
//                   className={`cursor-pointer transition-all ${selectedPersonId === person._id ? 'ring-2 ring-primary rounded-xl' : ''}`}
//                 >
//                   <PersonnelCard person={person} onAssign={() => {}} selectedDelivery={null} />
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="border-t border-slate-200 px-6 py-4 flex gap-3 justify-end">
//             <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700">Cancel</button>
//             <button onClick={() => selectedPersonId && onAssign(selectedPersonId)} disabled={!selectedPersonId} className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50">
//               Confirm Assignment
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Main Component
// export default function DeliveryAssignmentsPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const toast = useToast()

//   const [deliveries, setDeliveries] = useState<PendingDelivery[]>([])
//   const [personnel, setPersonnel] = useState<AvailablePersonnel[]>(availablePersonnel)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterPriority, setFilterPriority] = useState('all')
//   const [selectedDelivery, setSelectedDelivery] = useState<PendingDelivery | null>(null)
//   const [showAssignModal, setShowAssignModal] = useState(false)

//   useEffect(() => {
//     if (sessionStatus === 'unauthenticated') {
//       router.push('/admin/login')
//     }
//   }, [sessionStatus, router])

//   useEffect(() => {
//     // In a real app, fetch deliveries and personnel from API
//     const fetchData = async () => {
//       try {
//         const deliveriesResponse = await api.get(`${BASE_URL}/api/v1/deliveries/admin/deliveries/scheduled`)
//         // console.log("Deliveries:", deliveriesResponse.data?.data?.deliveries ?? [])
//         setDeliveries(deliveriesResponse.data?.data?.deliveries ?? [])
//         const personnelResponse = await api.get(`${BASE_URL}/api/v1/deliveries/personnel/admin/available`)
//         console.log("Personnel:", personnelResponse.data?.data ?? [])
//         // setPersonnel(personnelResponse.data)
//       } 
//       catch (error) {}
//     }
//     fetchData()
//   }, [])

//   const filteredDeliveries = deliveries.filter(delivery => {
//     const matchesSearch = delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          delivery.address.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          delivery.address.city.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesPriority = filterPriority === 'all' || delivery.priority === filterPriority
//     return matchesSearch && matchesPriority
//   })

//   const handleAssign = (delivery: PendingDelivery) => {
//     setSelectedDelivery(delivery)
//     setShowAssignModal(true)
//   }

//   const handleConfirmAssign = (personId: string) => {
//     toast.success(`Delivery assigned successfully`)
//     setDeliveries(deliveries.filter(d => d._id !== selectedDelivery?._id))
//     setShowAssignModal(false)
//     setSelectedDelivery(null)
//   }

//   const stats = {
//     pending: deliveries.length,
//     highPriority: deliveries.filter(d => d.priority === 'high').length,
//     availablePersonnel: personnel.filter(p => p.currentLoad < p.maxCapacity).length,
//     avgETA: (personnel.reduce((sum, p) => sum + p.eta, 0) / personnel.length).toFixed(0)
//   }

//   if (sessionStatus === 'loading') {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
//           <p className="text-sm text-slate-500">Loading assignments...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
//         {/* Header */}
//         <div>
//           <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
//             <Link href="/admin/delivery" className="hover:text-primary transition-colors">Delivery Management</Link>
//             <span>/</span>
//             <span className="text-slate-800 font-medium">Assignments</span>
//           </div>
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900">Delivery Assignments</h1>
//               <p className="text-slate-500 mt-1">Assign pending deliveries to available personnel</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
//                 <Download className="h-4 w-4" /> Export
//               </button>
//               <button className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90">
//                 <RefreshCw className="h-4 w-4" /> Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
//             <p className="text-xs text-slate-500">Pending Deliveries</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
//             <p className="text-xs text-slate-500">High Priority</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-green-600">{stats.availablePersonnel}</p>
//             <p className="text-xs text-slate-500">Available Personnel</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-primary">{stats.avgETA} min</p>
//             <p className="text-xs text-slate-500">Avg ETA</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-slate-200 p-4">
//           <div className="flex flex-col md:flex-row gap-3">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search by delivery number, customer name, or city..."
//                 className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//               />
//             </div>
//             <select
//               value={filterPriority}
//               onChange={(e) => setFilterPriority(e.target.value)}
//               className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
//             >
//               <option value="all">All Priorities</option>
//               <option value="high">High Priority</option>
//               <option value="medium">Medium Priority</option>
//               <option value="low">Low Priority</option>
//             </select>
//             <button 
//               onClick={() => { setSearchTerm(''); setFilterPriority('all') }}
//               className="px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Pending Deliveries */}
//           <div>
//             <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <Package className="h-4 w-4 text-primary" />
//               Pending Deliveries ({filteredDeliveries.length})
//             </h2>
//             <div className="space-y-3">
//               {filteredDeliveries.length === 0 ? (
//                 <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
//                   <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
//                   <p className="text-slate-500">No pending deliveries</p>
//                   <p className="text-xs text-slate-400 mt-1">All deliveries have been assigned</p>
//                 </div>
//               ) : (
//                 filteredDeliveries.map(delivery => (
//                   <DeliveryCard key={delivery._id} delivery={delivery} onAssign={handleAssign} />
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Available Personnel */}
//           <div>
//             <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <Users className="h-4 w-4 text-primary" />
//               Available Personnel ({personnel.filter(p => p.currentLoad < p.maxCapacity).length})
//             </h2>
//             <div className="space-y-3">
//               {personnel.filter(p => p.currentLoad < p.maxCapacity).map(person => (
//                 <PersonnelCard key={person._id} person={person} onAssign={() => {}} selectedDelivery={null} />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Smart Assignment Suggestion */}
//         <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
//           <div className="flex items-start gap-3">
//             <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
//               <Zap className="h-5 w-5 text-amber-600" />
//             </div>
//             <div>
//               <h4 className="font-semibold text-amber-800">Smart Assignment Suggestion</h4>
//               <p className="text-sm text-amber-700 mt-1">
//                 Based on current load and proximity, <strong>Rahul Sharma</strong> is the best match for 
//                 <strong> DLV001234</strong> (3.2 km away, 15 min ETA). Assign now for fastest delivery.
//               </p>
//               <button className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
//                 Auto-Assign Optimal Route
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Assignment Modal */}
//       {showAssignModal && (
//         <AssignmentModal
//           delivery={selectedDelivery}
//           onClose={() => { setShowAssignModal(false); setSelectedDelivery(null) }}
//           onAssign={handleConfirmAssign}
//         />
//       )}
//     </div>
//   )
// }





// // app/admin/delivery/assignments/page.tsx
// 'use client'

// import { useState, useEffect, useCallback } from 'react'
// import { useSession } from 'next-auth/react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//   Truck, Users, MapPin, Clock, Calendar, Search, Filter,
//   Plus, Eye, Edit, CheckCircle, XCircle, AlertCircle,
//   Phone, Mail, Navigation, Star, Activity, Download,
//   RefreshCw, ChevronLeft, ChevronRight, UserPlus,
//   Send, MessageCircle, Bell, Zap, Target, Award,
//   Package, Loader2
// } from 'lucide-react'
// import { useToast } from '@/hooks/useToast'
// import axios from 'axios'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// // Types
// interface PendingDelivery {
//   _id: string
//   deliveryNumber: string
//   type: string
//   scheduledDate: string
//   scheduledSlot: string
//   address: {
//     addressLine1: string
//     city: string
//     state: string
//     pincode: string
//     contactName: string
//     contactPhone: string
//   }
//   items: Array<{ name: string; quantity: number }>
//   priority: 'high' | 'medium' | 'low'
//   distance: number
//   status: string
// }

// interface AvailablePersonnel {
//   _id: string
//   employeeId: string
//   user: {
//     profile: {
//       firstName: string
//       lastName: string
//     }
//     phone: string
//   }
//   vehicle: {
//     type: string
//     number: string
//   }
//   zone: string
//   performance: {
//     averageRating: number
//   }
//   currentAssignments: Array<{ status: string }>
//   maxConcurrentDeliveries: number
//   availability: {
//     isAvailable: boolean
//     isOnDuty: boolean
//   }
// }

// interface AssignmentStats {
//   pending: number
//   highPriority: number
//   availablePersonnel: number
//   avgETA: number
// }

// // API Service
// const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

// api.interceptors.request.use(async (config) => {
//   const { getSession } = await import('next-auth/react')
//   const session = await getSession()
//   if (session?.user?.accessToken) {
//     config.headers.Authorization = `Bearer ${session.user.accessToken}`
//   }
//   return config
// })

// // Components
// const DeliveryCard = ({ delivery, onAssign, isAssigning }: { delivery: PendingDelivery; onAssign: (delivery: PendingDelivery) => void; isAssigning: boolean }) => {
//   const priorityColor = {
//     high: 'bg-red-100 text-red-700 border-red-200',
//     medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
//     low: 'bg-green-100 text-green-700 border-green-200'
//   }

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-all">
//       <div className="flex items-start justify-between">
//         <div>
//           <div className="flex items-center gap-2 mb-2">
//             <p className="text-xs font-mono text-slate-400">{delivery.deliveryNumber}</p>
//             <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priorityColor[delivery.priority]}`}>
//               {delivery.priority.toUpperCase()}
//             </span>
//           </div>
//           <div className="flex items-center gap-2 text-sm mb-2">
//             <Calendar className="h-3.5 w-3.5 text-slate-400" />
//             <span className="text-slate-600">{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
//             <Clock className="h-3.5 w-3.5 text-slate-400 ml-2" />
//             <span className="text-slate-600">{delivery.scheduledSlot}</span>
//           </div>
//           <h3 className="font-semibold text-slate-800 mb-1">{delivery.address.contactName}</h3>
//           <p className="text-sm text-slate-500">{delivery.address.addressLine1}, {delivery.address.city}</p>
//           <div className="flex items-center gap-2 mt-2">
//             <Phone className="h-3 w-3 text-slate-400" />
//             <span className="text-xs text-slate-500">{delivery.address.contactPhone}</span>
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
//             <Navigation className="h-3.5 w-3.5" />
//             <span>{delivery.distance} km away</span>
//           </div>
//           <p className="text-xs text-slate-500">{delivery.items.length} item(s)</p>
//           <button
//             onClick={() => onAssign(delivery)}
//             disabled={isAssigning}
//             className="mt-3 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50"
//           >
//             {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
//             Assign
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// const PersonnelCard = ({ person, onAssign, selectedDelivery, isAssigning }: { person: AvailablePersonnel; onAssign: (personId: string) => void; selectedDelivery: PendingDelivery | null; isAssigning: boolean }) => {
//   const currentLoad = person.currentAssignments?.length || 0
//   const maxCapacity = person.maxConcurrentDeliveries || 5
//   const loadPercentage = (currentLoad / maxCapacity) * 100
//   const fullName = `${person.user?.profile?.firstName || ''} ${person.user?.profile?.lastName || ''}`.trim() || 'Unknown'

//   return (
//     <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all">
//       <div className="flex items-start gap-3">
//         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
//           {fullName.charAt(0)}
//         </div>
//         <div className="flex-1">
//           <div className="flex items-center justify-between">
//             <div>
//               <h4 className="font-semibold text-slate-800">{fullName}</h4>
//               <p className="text-xs text-slate-500 font-mono">{person.employeeId}</p>
//             </div>
//             <div className="flex items-center gap-1">
//               <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
//               <span className="text-sm font-semibold">{person.performance?.averageRating?.toFixed(1) || '4.5'}</span>
//             </div>
//           </div>
//           <div className="flex flex-wrap gap-3 mt-2 text-xs">
//             <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{person.vehicle?.type || 'bike'}</span>
//             <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{person.zone} Zone</span>
//             <span className={`flex items-center gap-1 ${person.availability?.isOnDuty ? 'text-green-600' : 'text-red-500'}`}>
//               <div className={`w-1.5 h-1.5 rounded-full ${person.availability?.isOnDuty ? 'bg-green-500' : 'bg-red-500'}`} />
//               {person.availability?.isOnDuty ? 'On Duty' : 'Off Duty'}
//             </span>
//           </div>
//           <div className="mt-2">
//             <div className="flex justify-between text-[10px] text-slate-500 mb-1">
//               <span>Current Load</span>
//               <span>{currentLoad}/{maxCapacity} deliveries</span>
//             </div>
//             <div className="w-full bg-slate-100 rounded-full h-1.5">
//               <div className="h-1.5 rounded-full bg-primary" style={{ width: `${loadPercentage}%` }} />
//             </div>
//           </div>
//           {selectedDelivery && person.availability?.isOnDuty && (
//             <button
//               onClick={() => onAssign(person._id)}
//               disabled={isAssigning}
//               className="mt-3 w-full py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
//             >
//               {isAssigning ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
//               Assign to {fullName.split(' ')[0]}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }

// const AssignmentModal = ({ delivery, onClose, onAssign, personnel, isAssigning }: { 
//   delivery: PendingDelivery | null; 
//   onClose: () => void; 
//   onAssign: (personId: string) => void;
//   personnel: AvailablePersonnel[];
//   isAssigning: boolean;
// }) => {
//   const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)

//   if (!delivery) return null

//   const availablePersonnel = personnel.filter(p => p.availability?.isOnDuty)

//   return (
//     <div className="fixed inset-0 z-50 overflow-y-auto">
//       <div className="fixed inset-0 bg-black/50" onClick={onClose} />
//       <div className="flex min-h-full items-center justify-center p-4">
//         <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
//           <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 sticky top-0">
//             <h3 className="text-lg font-bold text-white">Assign Delivery</h3>
//             <p className="text-white/80 text-sm mt-1">Select a delivery person for #{delivery.deliveryNumber}</p>
//             <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
//               <XCircle className="h-5 w-5" />
//             </button>
//           </div>
//           <div className="p-6 overflow-y-auto max-h-[60vh]">
//             <div className="mb-4 p-3 bg-slate-50 rounded-lg">
//               <p className="text-sm font-medium text-slate-700">Delivery Details</p>
//               <p className="text-xs text-slate-500 mt-1">{delivery.address.addressLine1}, {delivery.address.city}</p>
//               <div className="flex items-center gap-3 mt-2 text-xs">
//                 <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(delivery.scheduledDate).toLocaleDateString()}</span>
//                 <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{delivery.scheduledSlot}</span>
//               </div>
//             </div>
//             <div className="space-y-3">
//               {availablePersonnel.length === 0 ? (
//                 <div className="text-center py-8 text-slate-500">
//                   <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
//                   <p>No available delivery personnel</p>
//                   <p className="text-xs mt-1">Please check back later</p>
//                 </div>
//               ) : (
//                 availablePersonnel.map(person => (
//                   <div
//                     key={person._id}
//                     onClick={() => setSelectedPersonId(person._id)}
//                     className={`cursor-pointer transition-all ${selectedPersonId === person._id ? 'ring-2 ring-primary rounded-xl' : ''}`}
//                   >
//                     <PersonnelCard person={person} onAssign={() => {}} selectedDelivery={null} isAssigning={false} />
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//           <div className="border-t border-slate-200 px-6 py-4 bg-white flex gap-3 justify-end sticky bottom-0">
//             <button onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
//               Cancel
//             </button>
//             <button 
//               onClick={() => selectedPersonId && onAssign(selectedPersonId)} 
//               disabled={!selectedPersonId || isAssigning} 
//               className="px-4 py-2 bg-primary text-white rounded-lg font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center gap-2"
//             >
//               {isAssigning && <Loader2 className="h-4 w-4 animate-spin" />}
//               Confirm Assignment
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// // Main Component
// export default function DeliveryAssignmentsPage() {
//   const { data: session, status: sessionStatus } = useSession()
//   const router = useRouter()
//   const toast = useToast()

//   const [deliveries, setDeliveries] = useState<PendingDelivery[]>([])
//   const [personnel, setPersonnel] = useState<AvailablePersonnel[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [isAssigning, setIsAssigning] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [filterPriority, setFilterPriority] = useState('all')
//   const [selectedDelivery, setSelectedDelivery] = useState<PendingDelivery | null>(null)
//   const [showAssignModal, setShowAssignModal] = useState(false)
//   const [stats, setStats] = useState<AssignmentStats>({
//     pending: 0,
//     highPriority: 0,
//     availablePersonnel: 0,
//     avgETA: 0
//   })

//   useEffect(() => {
//     if (sessionStatus === 'unauthenticated') {
//       router.push('/admin/login')
//     }
//     if (sessionStatus === 'authenticated') {
//       fetchData()
//     }
//   }, [sessionStatus, router])

//   const fetchData = async () => {
//     setIsLoading(true)
//     try {
//       // Fetch pending deliveries
//       const deliveriesRes = await api.get(`${BASE_URL}/api/v1/deliveries/admin/deliveries/scheduled`)
      
//       // Fetch available personnel
//       const personnelRes = await api.get(`${BASE_URL}/api/v1/delivery-personnel/persons`, {
//         params: { limit: 50 }
//       })

//       if (deliveriesRes.data.success) {
//         const deliveriesData = deliveriesRes.data.data?.deliveries || deliveriesRes.data.deliveries || []
//         console.log("Fetched Deliveries:", deliveriesData)
//         setDeliveries(deliveriesData)
        
//         // Calculate stats
//         const pendingCount = deliveriesData.length
//         const highPriorityCount = deliveriesData.filter((d: PendingDelivery) => d.priority === 'high').length
        
//         setStats(prev => ({
//           ...prev,
//           pending: pendingCount,
//           highPriority: highPriorityCount
//         }))
//       }

//       if (personnelRes.data.success) {
//         const personnelData = personnelRes.data.data?.persons || personnelRes.data.persons || []
//         setPersonnel(personnelData)
        
//         const availableCount = personnelData.filter((p: AvailablePersonnel) => p.availability?.isOnDuty).length
        
//         setStats(prev => ({
//           ...prev,
//           availablePersonnel: availableCount,
//           avgETA: 25 // You can calculate this from distance data
//         }))
//       }
//     } catch (error: any) {
//       console.error('Error fetching data:', error)
//       toast.error(error.response?.data?.message || 'Failed to load data')
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleAssign = (delivery: PendingDelivery) => {
//     setSelectedDelivery(delivery)
//     setShowAssignModal(true)
//   }

//   const handleConfirmAssign = async (personId: string) => {
//     if (!selectedDelivery) return
    
//     setIsAssigning(true)
//     try {
//       const response = await api.post(`${BASE_URL}/api/v1/delivery-personnel/assignments/${selectedDelivery._id}/assign`, {
//         type: 'person',
//         personId: personId,
//         notes: 'Assigned by admin'
//       })
      
//       if (response.data.success) {
//         toast.success(`Delivery assigned successfully`)
//         // Remove assigned delivery from list
//         setDeliveries(prev => prev.filter(d => d._id !== selectedDelivery._id))
//         setStats(prev => ({
//           ...prev,
//           pending: prev.pending - 1,
//           highPriority: selectedDelivery.priority === 'high' ? prev.highPriority - 1 : prev.highPriority
//         }))
//         setShowAssignModal(false)
//         setSelectedDelivery(null)
        
//         // Refresh personnel list to update their load
//         const personnelRes = await api.get(`${BASE_URL}/api/v1/delivery-personnel/assignments/available`, { params: { limit: 50 } })
//         if (personnelRes.data.success) {
//           const personnelData = personnelRes.data.data?.personnel || personnelRes.data.personnel || []
//           setPersonnel(personnelData)
//         }
//       } else {
//         toast.error(response.data.message || 'Assignment failed')
//       }
//     } catch (error: any) {
//       console.error('Error assigning delivery:', error)
//       toast.error(error.response?.data?.message || 'Failed to assign delivery')
//     } finally {
//       setIsAssigning(false)
//     }
//   }

//   const handleRefresh = () => {
//     fetchData()
//   }

//   const filteredDeliveries = deliveries.filter(delivery => {
//     const matchesSearch = delivery.deliveryNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          delivery.address?.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          delivery.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
//     const matchesPriority = filterPriority === 'all' || delivery.priority === filterPriority
//     return matchesSearch && matchesPriority
//   })

//   const availablePersonnel = personnel.filter(p => p.availability?.isOnDuty)

//   if (sessionStatus === 'loading' || isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
//         <div className="flex flex-col items-center gap-3">
//           <Loader2 className="h-10 w-10 animate-spin text-primary" />
//           <p className="text-sm text-slate-500">Loading assignments...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//       <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        
//         {/* Header */}
//         <div>
//           <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
//             <Link href="/admin/delivery" className="hover:text-primary transition-colors">Delivery Management</Link>
//             <span>/</span>
//             <span className="text-slate-800 font-medium">Assignments</span>
//           </div>
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900">Delivery Assignments</h1>
//               <p className="text-slate-500 mt-1">Assign pending deliveries to available personnel</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button 
//                 onClick={handleRefresh}
//                 className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 transition-colors"
//               >
//                 <RefreshCw className="h-4 w-4" /> Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
//             <p className="text-xs text-slate-500">Pending Deliveries</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
//             <p className="text-xs text-slate-500">High Priority</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-green-600">{stats.availablePersonnel}</p>
//             <p className="text-xs text-slate-500">Available Personnel</p>
//           </div>
//           <div className="bg-white rounded-xl border border-slate-200 p-4">
//             <p className="text-2xl font-bold text-primary">{stats.avgETA} min</p>
//             <p className="text-xs text-slate-500">Avg ETA</p>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-xl border border-slate-200 p-4">
//           <div className="flex flex-col md:flex-row gap-3">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 placeholder="Search by delivery number, customer name, or city..."
//                 className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
//               />
//             </div>
//             <select
//               value={filterPriority}
//               onChange={(e) => setFilterPriority(e.target.value)}
//               className="px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-white"
//             >
//               <option value="all">All Priorities</option>
//               <option value="high">High Priority</option>
//               <option value="medium">Medium Priority</option>
//               <option value="low">Low Priority</option>
//             </select>
//             <button 
//               onClick={() => { setSearchTerm(''); setFilterPriority('all') }}
//               className="px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
//             >
//               Clear Filters
//             </button>
//           </div>
//         </div>

//         {/* Two Column Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Pending Deliveries */}
//           <div>
//             <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <Package className="h-4 w-4 text-primary" />
//               Pending Deliveries ({filteredDeliveries.length})
//             </h2>
//             <div className="space-y-3">
//               {filteredDeliveries.length === 0 ? (
//                 <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
//                   <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
//                   <p className="text-slate-500">No pending deliveries</p>
//                   <p className="text-xs text-slate-400 mt-1">All deliveries have been assigned</p>
//                 </div>
//               ) : (
//                 filteredDeliveries.map(delivery => (
//                   <DeliveryCard 
//                     key={delivery._id} 
//                     delivery={delivery} 
//                     onAssign={handleAssign}
//                     isAssigning={isAssigning}
//                   />
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Available Personnel */}
//           <div>
//             <h2 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
//               <Users className="h-4 w-4 text-primary" />
//               Available Personnel ({availablePersonnel.length})
//             </h2>
//             <div className="space-y-3">
//               {availablePersonnel.length === 0 ? (
//                 <div className="bg-white rounded-xl border border-slate-200 py-12 text-center">
//                   <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
//                   <p className="text-slate-500">No available personnel</p>
//                   <p className="text-xs text-slate-400 mt-1">All personnel are currently on delivery</p>
//                 </div>
//               ) : (
//                 availablePersonnel.map(person => (
//                   <PersonnelCard 
//                     key={person._id} 
//                     person={person} 
//                     onAssign={() => {}} 
//                     selectedDelivery={null}
//                     isAssigning={false}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Smart Assignment Suggestion */}
//         {filteredDeliveries.length > 0 && availablePersonnel.length > 0 && (
//           <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
//             <div className="flex items-start gap-3">
//               <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
//                 <Zap className="h-5 w-5 text-amber-600" />
//               </div>
//               <div>
//                 <h4 className="font-semibold text-amber-800">Smart Assignment Suggestion</h4>
//                 <p className="text-sm text-amber-700 mt-1">
//                   Based on current load and proximity, <strong>{availablePersonnel[0]?.user?.profile?.firstName} {availablePersonnel[0]?.user?.profile?.lastName}</strong> is the best match for 
//                   <strong> {filteredDeliveries[0]?.deliveryNumber}</strong>. Assign now for fastest delivery.
//                 </p>
//                 <button 
//                   onClick={() => handleAssign(filteredDeliveries[0])}
//                   className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
//                 >
//                   <Zap className="h-3.5 w-3.5" />
//                   Auto-Assign Optimal Route
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Assignment Modal */}
//       {showAssignModal && (
//         <AssignmentModal
//           delivery={selectedDelivery}
//           onClose={() => { setShowAssignModal(false); setSelectedDelivery(null) }}
//           onAssign={handleConfirmAssign}
//           personnel={personnel}
//           isAssigning={isAssigning}
//         />
//       )}
//     </div>
//   )
// }



'use client'

import { useState, useEffect, useRef, useCallback } from "react"
import {
  Package, Users, MapPin, Clock, Calendar, Search,
  CheckCircle, AlertCircle,
  Phone, Star, Download,
  RefreshCw, UserPlus,
  Zap, Target, Loader2, X,
  ArrowUpRight, Truck, Bike, Car, Bus, BadgeCheck,
  TrendingUp, ArrowRight,
} from "lucide-react"
import axios from "axios"
import { useSession } from "next-auth/react"
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/navigation'

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const api = axios.create({ baseURL: BASE_URL, withCredentials: true })

api.interceptors.request.use(async (config) => {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`
  }
  return config
})

// Types
interface PendingDelivery {
  _id: string
  deliveryNumber: string
  type: string
  scheduledDate: string
  scheduledSlot: string
  address: {
    addressLine1: string
    city: string
    state: string
    pincode: string
    contactName: string
    contactPhone: string
  }
  items: Array<{ name: string; quantity: number }>
  priority: 'high' | 'medium' | 'low' | 'urgent'
  distance: number
  status: string
  contact?: {
    name: string
    phone: string
  }
  addressSummary?: string
  pincode?: string
  schedule?: {
    scheduledDate: string
  }
  scheduledSlotLabel?: string
  itemCount?: number
  rental?: {
    rentalNumber: string
  }
  availablePersonnelInPincode?: number
}

interface AvailablePersonnel {
  _id: string
  employeeId: string
  user: {
    profile: {
      firstName: string
      lastName: string
    }
    phone: string
  }
  vehicle: {
    type: string
    number: string
    model?: string
  }
  zone: string
  performance: {
    averageRating: number
    completedDeliveries?: number
    onTimeRate?: number
  }
  currentAssignments: Array<{ status: string }>
  maxConcurrentDeliveries: number
  availability: {
    isAvailable: boolean
    isOnDuty: boolean
  }
  status?: {
    isVerified: boolean
  }
  serviceablePincodes?: string[]
}

interface AssignmentStats {
  pending: number
  highPriority: number
  availablePersonnel: number
  avgETA: number
}

// Priority configuration
const PRIORITY_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  high:   { label: "High",   bg: "bg-red-50", text: "text-red-600", border: "border-red-200", dot: "bg-red-500" },
  medium: { label: "Medium", bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", dot: "bg-amber-500" },
  low:    { label: "Low",    bg: "bg-green-50", text: "text-green-600", border: "border-green-200", dot: "bg-green-500" },
  urgent: { label: "Urgent", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", dot: "bg-purple-500" }
}

const TYPE_CONFIG: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  delivery:    { label: "Delivery",    bg: "bg-blue-50", text: "text-blue-600", icon: "📦" },
  pickup:      { label: "Pickup",      bg: "bg-green-50", text: "text-green-600", icon: "🏷️" },
  exchange:    { label: "Exchange",    bg: "bg-orange-50", text: "text-orange-600", icon: "🔄" },
  return:      { label: "Return",      bg: "bg-purple-50", text: "text-purple-600", icon: "↩️" },
  maintenance: { label: "Maintenance", bg: "bg-slate-50", text: "text-slate-600", icon: "🔧" }
}

const ZONE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  north: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  south: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  east:  { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  west:  { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
}

// Helper Components
const StarRating = ({ value }: { value: number }) => {
  if (!value) return <span className="text-xs text-slate-400">No rating</span>
  return (
    <div className="flex items-center gap-1">
      <div className="flex text-amber-400 text-xs">
        {"★".repeat(Math.floor(value))}{"☆".repeat(5 - Math.floor(value))}
      </div>
      <span className="text-xs font-semibold text-slate-500">{value.toFixed(1)}</span>
    </div>
  )
}

const getVehicleIcon = (type: string) => {
  const className = "w-3 h-3"
  switch (type?.toLowerCase()) {
    case "bike": 
    case "scooter": 
      return <Bike className={className} />
    case "car": 
      return <Car className={className} />
    case "van": 
    case "truck": 
      return <Bus className={className} />
    default: 
      return <Truck className={className} />
  }
}

// Stat Card Component
const StatCard = ({ label, value, sub, icon: Icon, color, trend }: any) => (
  <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
    <CardContent className="p-5">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
        {trend != null && (
          <div className={`text-xs font-bold flex items-center gap-0.5 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <ArrowUpRight className="w-3 h-3" /> {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-xs font-medium text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-300 mt-0.5">{sub}</div>}
      </div>
    </CardContent>
  </Card>
)

// Delivery Card Component
const DeliveryCard = ({ delivery, selected, onSelect, onAssign }: any) => {
  const pc = PRIORITY_CONFIG[delivery.priority] || PRIORITY_CONFIG.medium
  const tc = TYPE_CONFIG[delivery.type] || TYPE_CONFIG.delivery
  const isSelected = selected?._id === delivery._id
  const hasPersonnel = delivery.availablePersonnelInPincode > 0
  console.log('hasPersonel-->', hasPersonnel, delivery)

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-indigo-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect(delivery)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-semibold text-slate-400">
                #{delivery.deliveryNumber?.slice(-8)}
              </span>
              <Badge className={`${pc.bg} ${pc.text} border-0`}>
                {pc.label}
              </Badge>
              <Badge variant="outline" className={`${tc.bg} ${tc.text} border-0`}>
                {tc.icon} {tc.label}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {hasPersonnel ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-[10px] font-semibold text-green-600">
                    {delivery.availablePersonnelInPincode} nearby
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[10px] font-semibold text-red-500">
                    0 nearby
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact & Address */}
          <div>
            <div className="font-semibold text-slate-900 text-sm mb-0.5">
              {delivery.contact?.name || delivery.address?.contactName}
            </div>
            <div className="flex items-start gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="leading-relaxed">{delivery.addressSummary || delivery.address?.addressLine1}</span>
            </div>
          </div>

          {/* Meta Row */}
          <div className="flex gap-4 flex-wrap text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(delivery.schedule?.scheduledDate || delivery.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {delivery.scheduledSlotLabel || delivery.scheduledSlot}
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="w-3 h-3" />
              {delivery.itemCount || delivery.items?.length || 0} item{delivery.itemCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3" />
              {delivery.contact?.phone || delivery.address?.contactPhone}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center pt-1">
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                📍 {delivery.pincode || delivery.address?.pincode}
              </Badge>
              <Badge variant="outline" className="font-mono text-xs text-slate-400">
                {delivery.rental?.rentalNumber?.slice(-10)}
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); onAssign(delivery) }}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Assign
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Personnel Card Component
const PersonnelCard = ({ person, selectedDelivery, onQuickAssign, highlightPincode, isAssigning }: any) => {
  const fullName = `${person.user?.profile?.firstName || ""} ${person.user?.profile?.lastName || ""}`.trim()
  const isOnDuty = person.availability?.isOnDuty
  const isAvailable = person.availability?.isAvailable
  const currentLoad = person.currentAssignments?.length || 0
  const maxLoad = person.maxConcurrentDeliveries || 5
  const loadPercentage = (currentLoad / maxLoad) * 100
  const isFull = currentLoad >= maxLoad
  const isVerified = person.status?.isVerified
  const zoneKey = person.zone?.toLowerCase() || 'north'
  const zc = ZONE_COLORS[zoneKey] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }
  const pincodeMatch = highlightPincode && person.serviceablePincodes?.includes(highlightPincode)
  const canAssign = isOnDuty && isAvailable && !isFull && selectedDelivery

  const getAvatarFallback = () => {
    const initials = fullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()
    return initials || "??"
  }

  return (
    <Card className={`transition-all duration-200 ${pincodeMatch ? 'ring-2 ring-green-500 shadow-md' : 'hover:shadow-md'} ${(!isOnDuty || !isAvailable) ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
              isOnDuty && isAvailable ? 'bg-green-500' : isOnDuty ? 'bg-amber-500' : 'bg-slate-400'
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-semibold text-slate-900 text-sm">{fullName}</span>
              {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-green-500" />}
              {pincodeMatch && (
                <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                  ZONE MATCH
                </Badge>
              )}
            </div>
            
            <div className="text-xs font-mono text-slate-400 mb-2">{person.employeeId}</div>

            <div className="flex gap-2 flex-wrap mb-3">
              <Badge className={`${zc.bg} ${zc.text} border-0 text-[10px]`}>
                {person.zone?.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-[10px] flex items-center gap-1">
                {getVehicleIcon(person.vehicle?.type)} {person.vehicle?.model || person.vehicle?.type}
              </Badge>
              <Badge variant="outline" className="text-[10px] font-mono">
                {person.vehicle?.number}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <div className="text-sm font-bold text-slate-900">{person.performance?.completedDeliveries || 0}</div>
                <div className="text-[10px] text-slate-400">Completed</div>
              </div>
              <div>
                <div className="text-sm font-bold text-indigo-600">{person.performance?.onTimeRate || 0}%</div>
                <div className="text-[10px] text-slate-400">On-Time</div>
              </div>
              <div>
                <StarRating value={person.performance?.averageRating || 0} />
                <div className="text-[10px] text-slate-400">Rating</div>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Capacity</span>
                <span>{currentLoad}/{maxLoad}</span>
              </div>
              <Progress value={loadPercentage} className="h-1.5" />
            </div>

            {selectedDelivery && (
              <Button
                size="sm"
                onClick={() => canAssign && onQuickAssign(person._id)}
                disabled={!canAssign || isAssigning}
                className="w-full text-xs"
                variant={canAssign ? "default" : "secondary"}
              >
                {!isOnDuty ? "Off Duty" : !isAvailable ? "Unavailable" : isFull ? "At Capacity" : (
                  <>
                    <ArrowRight className="w-3 h-3 mr-1.5" />
                    Assign to {fullName.split(" ")[0]}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Assignment Modal Component
const AssignModal = ({ delivery, persons, onClose, onConfirm, assigning }: any) => {
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  
  const pc = PRIORITY_CONFIG[delivery?.priority] || PRIORITY_CONFIG.medium
  const tc = TYPE_CONFIG[delivery?.type] || TYPE_CONFIG.delivery

  const availablePersons = persons.filter((p: AvailablePersonnel) => {
    const fullName = `${p.user?.profile?.firstName} ${p.user?.profile?.lastName}`.toLowerCase()
    const matchesSearch = fullName.includes(search.toLowerCase()) || p.employeeId?.toLowerCase().includes(search.toLowerCase())
    return p.availability?.isOnDuty && matchesSearch
  })

  const selectedPerson = persons.find((p: AvailablePersonnel) => p._id === selectedPersonId)

  if (!delivery) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0 overflow-y-auto">
        {/* Header */}
        <div className="p-6 bg-linear-to-r from-slate-900 to-slate-800 text-white rounded-t-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-slate-300">#{delivery.deliveryNumber?.slice(-8)}</span>
              <Badge className={`${pc.bg} ${pc.text} border-0 text-[10px]`}>{pc.label}</Badge>
              <Badge className={`${tc.bg} ${tc.text} border-0 text-[10px]`}>{tc.icon} {tc.label}</Badge>
            </div>
            <DialogTitle className="text-white text-xl">Assign Delivery</DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              {delivery.contact?.name || delivery.address?.contactName} · {delivery.addressSummary?.split(",").slice(-3).join(",").trim() || delivery.address?.addressLine1}
            </DialogDescription>
          </DialogHeader>

          {/* Delivery Info */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3 h-3" />
              {new Date(delivery.schedule?.scheduledDate || delivery.scheduledDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3 h-3" />
              {delivery.scheduledSlotLabel || delivery.scheduledSlot}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Package className="w-3 h-3" />
              {delivery.itemCount || delivery.items?.length || 0} item{delivery.itemCount !== 1 ? "s" : ""}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <MapPin className="w-3 h-3" />
              {delivery.pincode || delivery.address?.pincode}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search personnel by name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {availablePersons.length} available personnel
          </p>
        </div>

        {/* Personnel List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {availablePersons.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No available personnel found</p>
              </div>
            ) : (
              availablePersons.map((person: AvailablePersonnel) => {
                const fullName = `${person.user?.profile?.firstName} ${person.user?.profile?.lastName}`.trim()
                const currentLoad = person.currentAssignments?.length || 0
                const maxLoad = person.maxConcurrentDeliveries || 5
                const isSelected = selectedPersonId === person._id
                const pincodeMatch = person.serviceablePincodes?.includes(delivery.pincode || delivery.address?.pincode)
                const zoneKey = person.zone?.toLowerCase() || 'north'
                const zc = ZONE_COLORS[zoneKey] || { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }

                const getAvatarFallback = () => {
                  const initials = fullName.split(" ").filter(Boolean).map(n => n[0]).join("").slice(0, 2).toUpperCase()
                  return initials || "??"
                }

                return (
                  <div
                    key={person._id}
                    onClick={() => setSelectedPersonId(person._id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100' 
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-bold">
                          {getAvatarFallback()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 text-sm">{fullName}</span>
                          {pincodeMatch && (
                            <Badge className="bg-green-100 text-green-700 border-0 text-[9px]">
                              PINCODE MATCH
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-3 text-xs flex-wrap">
                          <span className="font-mono text-slate-400">{person.employeeId}</span>
                          <Badge className={`${zc.bg} ${zc.text} border-0 text-[9px]`}>{person.zone}</Badge>
                          <div className="flex items-center gap-1 text-slate-500">
                            {getVehicleIcon(person.vehicle?.type)} {person.vehicle?.model || person.vehicle?.type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <StarRating value={person.performance?.averageRating || 0} />
                        <div className="text-[10px] text-slate-400 mt-1">{currentLoad}/{maxLoad} assigned</div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 border-t gap-2 sm:gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedPersonId && onConfirm(selectedPersonId)}
            disabled={!selectedPersonId || assigning}
            className="bg-gradient-to-r from-indigo-500 to-purple-500"
          >
            {assigning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Assignment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Smart Suggestion Banner
const SmartSuggestion = ({ delivery, person, onAssign }: any) => {
  if (!delivery || !person) return null
  const fullName = `${person.user?.profile?.firstName} ${person.user?.profile?.lastName}`.trim()
  
  return (
    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 mb-4">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-amber-800 text-sm mb-1">AI Smart Suggestion</div>
            <p className="text-xs text-amber-700 mb-3 leading-relaxed">
              <strong>{fullName}</strong> is the optimal match for <strong>#{delivery.deliveryNumber?.slice(-8)}</strong> based on zone, current load ({person.currentAssignments?.length || 0}/{person.maxConcurrentDeliveries}), and on-time rate ({person.performance?.onTimeRate}%).
            </p>
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={() => onAssign(delivery)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Zap className="w-3.5 h-3.5 mr-1.5" />
                Auto-Assign
              </Button>
              <Button size="sm" variant="outline" className="border-amber-200 text-amber-700">
                View Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Page Component
export default function DeliveryAssignmentsPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const toast = useToast()
  
  const [deliveries, setDeliveries] = useState<PendingDelivery[]>([])
  const [persons, setPersons] = useState<AvailablePersonnel[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<PendingDelivery | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalDelivery, setModalDelivery] = useState<PendingDelivery | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [filterPriority, setFilterPriority] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [personSearch, setPersonSearch] = useState("")
  const [sortBy, setSortBy] = useState("priority")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<AssignmentStats>({
    pending: 0,
    highPriority: 0,
    availablePersonnel: 0,
    avgETA: 0
  })

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/admin/login')
    }
    if (sessionStatus === 'authenticated') {
      fetchData()
    }
  }, [sessionStatus, router])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const deliveriesRes = await api.get(`${BASE_URL}/api/v1/deliveries/admin/deliveries/scheduled`, { withCredentials: true })
      const personnelRes = await api.get(`${BASE_URL}/api/v1/delivery-personnel/persons`, {
        params: { limit: 50 },
        withCredentials: true
      })

      if (deliveriesRes.data.success) {
        const deliveriesData = deliveriesRes.data.data?.deliveries || deliveriesRes.data.deliveries || []
        console.log("Fetched Deliveries:", deliveriesData)
        setDeliveries(deliveriesData)
        
        const pendingCount = deliveriesData.length
        const highPriorityCount = deliveriesData.filter((d: PendingDelivery) => d.priority === 'high').length
        
        setStats(prev => ({
          ...prev,
          pending: pendingCount,
          highPriority: highPriorityCount
        }))
      }

      if (personnelRes.data.success) {
        const personnelData = personnelRes.data.data?.persons || personnelRes.data.persons || []
        setPersons(personnelData)
        
        const availableCount = personnelData.filter((p: AvailablePersonnel) => p.availability?.isOnDuty).length
        
        setStats(prev => ({
          ...prev,
          availablePersonnel: availableCount,
          avgETA: 25
        }))
      }
    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error(error.response?.data?.message || 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  const handleAssign = (delivery: PendingDelivery) => {
    setModalDelivery(delivery)
    setShowModal(true)
  }

  const handleConfirmAssign = async (personId: string) => {
    if (!modalDelivery) return
    
    setAssigning(true)
    try {
      const response = await api.post(`${BASE_URL}/api/v1/delivery-personnel/assignments/${modalDelivery._id}`, {
        type: 'person',
        personId: personId,
        notes: 'Assigned by admin'
      }, { withCredentials: true })
      
      if (response.data.success) {
        toast.success(`Delivery ${modalDelivery.deliveryNumber?.slice(-8)} assigned successfully`)
        
        // Remove assigned delivery from list
        setDeliveries(prev => prev.filter(d => d._id !== modalDelivery._id))
        setAssignedIds(prev => new Set([...prev, modalDelivery._id]))
        
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          highPriority: modalDelivery.priority === 'high' ? prev.highPriority - 1 : prev.highPriority
        }))
        
        // Update personnel list
        const personnelRes = await api.get(`${BASE_URL}/api/v1/delivery-personnel/persons`, {
          params: { limit: 50 },
          withCredentials: true
        })
        if (personnelRes.data.success) {
          const personnelData = personnelRes.data.data?.persons || personnelRes.data.persons || []
          setPersons(personnelData)
        }
        
        // Clear selected delivery if it was assigned
        if (selectedDelivery?._id === modalDelivery._id) {
          setSelectedDelivery(null)
        }
        
        setShowModal(false)
        setModalDelivery(null)
      } else {
        toast.error(response.data.message || 'Assignment failed')
      }
    } catch (error: any) {
      console.error('Error assigning delivery:', error)
      toast.error(error.response?.data?.message || 'Failed to assign delivery')
    } finally {
      setAssigning(false)
    }
  }

  const handleQuickAssign = async (personId: string) => {
    if (!selectedDelivery) return
    
    setAssigning(true)
    try {
      const response = await api.post(`${BASE_URL}/api/v1/delivery-personnel/assignments/${selectedDelivery._id}`, {
        type: 'person',
        personId: personId,
        notes: 'Quick assigned by admin'
      }, { withCredentials: true })
      
      if (response.data.success) {
        toast.success(`Delivery ${selectedDelivery.deliveryNumber?.slice(-8)} assigned successfully`)
        
        setDeliveries(prev => prev.filter(d => d._id !== selectedDelivery._id))
        setAssignedIds(prev => new Set([...prev, selectedDelivery._id]))
        
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1,
          highPriority: selectedDelivery.priority === 'high' ? prev.highPriority - 1 : prev.highPriority
        }))
        
        const personnelRes = await api.get(`${BASE_URL}/api/v1/delivery-personnel/persons`, {
          params: { limit: 50 },
          withCredentials: true
        })
        if (personnelRes.data.success) {
          const personnelData = personnelRes.data.data?.persons || personnelRes.data.persons || []
          setPersons(personnelData)
        }
        
        setSelectedDelivery(null)
      } else {
        toast.error(response.data.message || 'Assignment failed')
      }
    } catch (error: any) {
      console.error('Error assigning delivery:', error)
      toast.error(error.response?.data?.message || 'Failed to assign delivery')
    } finally {
      setAssigning(false)
    }
  }

  const filteredDeliveries = deliveries.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = d.deliveryNumber?.toLowerCase().includes(q) ||
      d.contact?.name?.toLowerCase().includes(q) ||
      d.addressSummary?.toLowerCase().includes(q) ||
      d.pincode?.includes(q) ||
      d.address?.pincode?.includes(q)
    const matchPriority = filterPriority === "all" || d.priority === filterPriority
    const matchType = filterType === "all" || d.type === filterType
    return matchSearch && matchPriority && matchType
  }).sort((a, b) => {
    if (sortBy === "priority") {
      const order = { high: 0, urgent: 0, medium: 1, low: 2 }
      return (order[a.priority as keyof typeof order] || 1) - (order[b.priority as keyof typeof order] || 1)
    }
    if (sortBy === "date") return new Date(a.schedule?.scheduledDate || a.scheduledDate).getTime() - new Date(b.schedule?.scheduledDate || b.scheduledDate).getTime()
    return 0
  })

  const filteredPersons = persons.filter(p => {
    const nm = `${p.user?.profile?.firstName} ${p.user?.profile?.lastName}`.toLowerCase()
    return nm.includes(personSearch.toLowerCase()) || p.employeeId?.toLowerCase().includes(personSearch.toLowerCase())
  })

  const onDuty = persons.filter(p => p.availability?.isOnDuty && p.availability?.isAvailable)
  const highPriority = deliveries.filter(d => d.priority === "high" || d.priority === "urgent").length
  const totalPersonnel = persons.length
  const avgRating = persons.length ? (persons.reduce((s, p) => s + (p.performance?.averageRating || 0), 0) / persons.length).toFixed(1) : "—"

  const bestMatch = selectedDelivery
    ? filteredPersons.find(p =>
        p.availability?.isOnDuty && p.availability?.isAvailable &&
        (p.currentAssignments?.length || 0) < (p.maxConcurrentDeliveries || 5) &&
        p.serviceablePincodes?.includes(selectedDelivery.pincode || selectedDelivery.address?.pincode || '')
      ) || filteredPersons.find(p =>
        p.availability?.isOnDuty && p.availability?.isAvailable &&
        (p.currentAssignments?.length || 0) < (p.maxConcurrentDeliveries || 5)
      )
    : null

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Top Navigation */}
        <div className="bg-white border-b sticky top-0 z-50">
          <div className="max-w-[1400px] mx-auto px-6">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Delivery</span>
                <span>/</span>
                <span className="text-slate-800 font-semibold">Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-slate-50 border text-xs text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {onDuty.length} on duty
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleRefresh}>
                      <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </Tooltip>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 py-7">
          {/* Page Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight mb-1">
              Delivery Assignments
            </h1>
            <p className="text-sm text-slate-400">
              Assign scheduled deliveries to available field personnel in real-time.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <StatCard label="Pending Deliveries" value={deliveries.length} icon={Package} color="indigo" trend={-8} />
            <StatCard label="High Priority" value={highPriority} sub="Needs immediate action" icon={AlertCircle} color="red" />
            <StatCard label="On Duty Now" value={onDuty.length} sub={`of ${totalPersonnel} total`} icon={Users} color="green" trend={5} />
            <StatCard label="Avg Rating" value={avgRating} icon={Star} color="amber" />
            <StatCard label="Assigned Today" value={assignedIds.size} icon={CheckCircle} color="blue" />
          </div>

          {/* Summary Strip */}
          <Card className="mb-6 bg-gradient-to-r from-slate-800 to-slate-900 border-0 text-white overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10" />
            <div className="absolute -bottom-10 right-40 w-24 h-24 rounded-full bg-emerald-500/10" />
            <CardContent className="p-5 relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Live Assignment Board
                  </div>
                  <div className="text-2xl font-black">
                    {filteredDeliveries.length} <span className="text-base font-medium text-slate-400">pending · ready to assign</span>
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-xl font-bold text-indigo-400">{deliveries.filter(d => d.type === "delivery").length}</div>
                    <div className="text-[10px] text-slate-400">Delivery</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-400">{deliveries.filter(d => d.type === "pickup").length}</div>
                    <div className="text-[10px] text-slate-400">Pickup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-400">{deliveries.filter(d => ["exchange", "return", "maintenance"].includes(d.type)).length}</div>
                    <div className="text-[10px] text-slate-400">Exchange/Return</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main 2-col Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Pending Deliveries */}
            <div>
              {/* Filter Bar */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="Search delivery, customer, pincode…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="return">Return</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue placeholder="Sort" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Sort: Priority</SelectItem>
                        <SelectItem value="date">Sort: Date</SelectItem>
                      </SelectContent>
                    </Select>
                    {(search || filterPriority !== "all" || filterType !== "all") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setSearch(""); setFilterPriority("all"); setFilterType("all") }}
                        className="h-8 gap-1 text-red-500"
                      >
                        <X className="w-3 h-3" /> Clear
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-500" />
                  <h2 className="font-semibold text-slate-700 text-sm">Pending</h2>
                  <Badge variant="secondary" className="text-xs">{filteredDeliveries.length}</Badge>
                </div>
                {selectedDelivery && (
                  <Badge className="bg-indigo-100 text-indigo-700 border-0">1 selected</Badge>
                )}
              </div>

              <div className="space-y-3">
                {filteredDeliveries.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="font-semibold text-slate-700">All caught up!</p>
                      <p className="text-xs text-slate-400">No pending deliveries match your filters.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredDeliveries.map(d => (
                    <DeliveryCard
                      key={d._id}
                      delivery={d}
                      selected={selectedDelivery}
                      onSelect={(del: PendingDelivery) => setSelectedDelivery(prev => prev?._id === del._id ? null : del)}
                      onAssign={handleAssign}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Personnel */}
            <div>
              {/* Smart Suggestion */}
              {selectedDelivery && bestMatch && (
                <SmartSuggestion delivery={selectedDelivery} person={bestMatch} onAssign={handleAssign} />
              )}

              {/* Personnel Search */}
              <Card className="mb-4">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                      placeholder="Search personnel by name or ID…"
                      value={personSearch}
                      onChange={(e) => setPersonSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <h2 className="font-semibold text-slate-700 text-sm">Personnel</h2>
                  <Badge variant="secondary" className="text-xs">{filteredPersons.length}</Badge>
                </div>
                <div className="flex gap-1.5">
                  <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">{onDuty.length} on duty</Badge>
                  <Badge variant="outline" className="text-[10px]">{persons.length - onDuty.length} off</Badge>
                </div>
              </div>

              {selectedDelivery && (
                <Card className="mb-4 bg-indigo-50 border-indigo-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 text-xs text-indigo-700">
                      <Target className="w-3.5 h-3.5" />
                      Showing best matches for <strong className="font-mono">#{selectedDelivery.deliveryNumber?.slice(-8)}</strong> · Pincode {selectedDelivery.pincode || selectedDelivery.address?.pincode}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {filteredPersons.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm text-slate-500">No personnel found</p>
                    </CardContent>
                  </Card>
                ) : (
                  [...filteredPersons]
                    .sort((a, b) => {
                      if (selectedDelivery) {
                        const aMatch = a.serviceablePincodes?.includes(selectedDelivery.pincode || selectedDelivery.address?.pincode || '') ? 0 : 1
                        const bMatch = b.serviceablePincodes?.includes(selectedDelivery.pincode || selectedDelivery.address?.pincode || '') ? 0 : 1
                        if (aMatch !== bMatch) return aMatch - bMatch
                      }
                      const aOn = a.availability?.isOnDuty && a.availability?.isAvailable ? 0 : 1
                      const bOn = b.availability?.isOnDuty && b.availability?.isAvailable ? 0 : 1
                      return aOn - bOn
                    })
                    .map(p => (
                      <PersonnelCard
                        key={p._id}
                        person={p}
                        selectedDelivery={selectedDelivery}
                        onQuickAssign={handleQuickAssign}
                        highlightPincode={selectedDelivery?.pincode || selectedDelivery?.address?.pincode}
                        isAssigning={assigning}
                      />
                    ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Insight Banner */}
          <Card className="mt-6 bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-100">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-blue-800 text-sm mb-1">Assignment Efficiency Insight</div>
                  <p className="text-xs text-blue-600 leading-relaxed">
                    Assigning deliveries based on <strong>pincode match</strong> reduces average delivery time by 23%. Personnel with on-time rates above 95% are recommended for high-priority orders. Use the "ZONE MATCH" indicators to optimize routing across your fleet.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignment Modal */}
        {showModal && (
          <AssignModal
            delivery={modalDelivery}
            persons={persons}
            onClose={() => { setShowModal(false); setModalDelivery(null) }}
            onConfirm={handleConfirmAssign}
            assigning={assigning}
          />
        )}
      </div>
    </TooltipProvider>
  )
}