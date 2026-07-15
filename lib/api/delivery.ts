
/**
 * frontend/lib/api/delivery.ts
 * Delivery Partner API client — axios-based, token injected via interceptor.
 * Base path: /api/v1/deliveries (note: NOT /delivery)
 */
import axios from 'axios'
import { getSession } from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// ─── Types ────────────────────────────────────────────────────────────────────

export type VehicleType = 'bike' | 'scooter' | 'car' | 'van' | 'truck' | 'mini-truck'
export type ZoneType = 'north' | 'south' | 'east' | 'west' | 'central' | 'all'
export type DocType = 'license' | 'aadhar' | 'pan' | 'vehicle_rc' | 'insurance' | 'photo'

export interface DeliveryDocument {
  type: DocType
  number?: string
  url?: string
  verified: boolean
  verifiedAt?: string
  expiryDate?: string
  uploadedAt?: string
}

export interface BankDetails {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  upiId?: string
}

export interface AiPreferences {
  autoAcceptAssignments: boolean
  maxAcceptanceDistance: number
  preferredDeliveryTypes: string[]
  avoidHighTraffic: boolean
}

export interface DeliveryPartnerProfile {
  _id: string
  employeeId: string
  user: {
    _id: string
    email: string
    phone: string
    profile: {
      firstName: string
      lastName: string
      avatar?: string
      totalDeliveries?: number
    }
  }
  vehicle: {
    type: VehicleType
    number: string
    model?: string
    registrationNumber?: string
    capacity?: number
  }
  zone: ZoneType
  serviceablePincodes: string[]
  availability: {
    isAvailable: boolean
    isOnDuty: boolean
    currentLocation?: {
      type: 'Point'
      coordinates: [number, number]
      updatedAt: string
    }
    shifts: {
      start: string
      end: string
      workingDays: string[]
    }
  }
  performance: {
    totalDeliveries: number
    completedDeliveries: number
    failedDeliveries: number
    cancelledDeliveries: number
    averageRating: number
    onTimeRate: number
    totalDistance: number
    totalEarnings: number
    lastDeliveryAt?: string
  }
  documents: DeliveryDocument[]
  bankDetails: BankDetails
  aiPreferences: AiPreferences
  otpConfig: { enabled: boolean; length: number; expiryMinutes: number }
  currentAssignments: Array<{ delivery: string; assignedAt: string; status: string }>
  maxConcurrentDeliveries: number
  status: { isActive: boolean; isVerified: boolean; verificationStatus: string }
  metadata: { hiredAt?: string; notes?: string }
  rating: number
  activeAssignmentsCount: number
  createdAt: string
  updatedAt: string
}

export interface DashboardStats {
  todayDeliveries: number
  completedToday: number
  pendingToday: number
  activeDeliveries?: number
  totalEarnings: number
  thisWeekEarnings: number
  todayEarnings?: number
  rating: number
  onTimeRate: number
  totalDeliveries: number
  acceptanceRate: number
  avgDeliveryTime: number
  employeeId?: string
  zone?: string
}

// Alias for backward compatibility
export type DeliveryStats = DashboardStats

export interface PerformanceMetrics {
  period: string
  onTimeRate: number
  averageRating: number
  totalDeliveries: number
  completedDeliveries: number
  failedDeliveries: number
  totalDistance: number
  totalEarnings: number
}

export interface EarningsBreakdownItem {
  deliveryNumber: string
  date: string
  amount: number
}

export interface EarningsData {
  period: string
  total: number
  currency: string
  breakdown: EarningsBreakdownItem[]
}

export interface PartnerDelivery {
  _id: string
  deliveryNumber: string
  type: string
  status: string
  priority: 'high' | 'medium' | 'low' | 'urgent'
  schedule: { scheduledDate?: string; scheduledSlot: string; deadline?: string }
  address: {
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    contactName: string
    contactPhone: string
    coordinates?: {
      type: 'Point'
      coordinates: [number, number]
    }
    deliveryInstructions?: string
  }
  items: Array<{ name: string; quantity: number; sku?: string }>
  distance?: number | null
  estimatedDuration?: number | null
  earnings?: number
  stopSequence?: number | null
  optimizedSequence?: number | null
  route?: DeliveryRoute | null
  tracking?: DeliveryTracking | null
}

export interface DeliveryRoute {
  distance?: number
  duration?: number
  polyline?: unknown
  geometry?: unknown
  waypoints?: Array<{
    type: string
    coordinates: [number, number]
    address?: string
    stopType?: string
  }>
  optimized?: boolean
}

export interface DeliveryTracking {
  currentLocation?: {
    type: 'Point'
    coordinates: [number, number]
    updatedAt?: string
  }
  estimatedArrival?: string
  actualArrival?: string
  timeline?: Array<{
    status: string
    timestamp: string
    location?: { coordinates: [number, number]; address?: string }
    note?: string
  }>
}

export interface NavigateData {
  partnerLocation?: {
    type: 'Point'
    coordinates: [number, number]
    updatedAt?: string
  } | null
  zone: ZoneType
  isOnDuty: boolean
  isAvailable: boolean
  vehicle?: DeliveryPartnerProfile['vehicle']
  activeStops: PartnerDelivery[]
  optimizedOrder: Array<{ sequence: number; deliveryId: string; address: PartnerDelivery['address'] }>
  totalDistance: number
  totalETA: number
  count: number
}

export interface LocationHistoryPoint {
  coordinates: { type: 'Point'; coordinates: [number, number] }
  timestamp: string
  speed?: number
  battery?: number
  accuracy?: number
  address?: string
}

export interface LocationHistoryData {
  personId: string
  totalPoints: number
  history: LocationHistoryPoint[]
  lastLocation?: DeliveryPartnerProfile['availability']['currentLocation']
}

export interface RouteCalculationResult {
  distance: number
  duration: number
  polyline?: unknown
  geometry?: unknown
}

export interface OptimizedRouteResult {
  optimizedOrder: Array<{ sequence: number; deliveryId: string; address: PartnerDelivery['address'] }>
  totalDistance: number
  estimatedTime: number
  startPoint: [number, number] | null
}

export interface ActivityItem {
  id: string
  action: string
  customer: string
  time: string
  earnings?: number
  rating?: number
  status: 'success' | 'pending' | 'warning' | 'failed' | 'cancelled'
  deliveryNumber?: string
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

// Add these types to existing file
export interface TimeSlot {
  start: string;
  end: string;
  label: string;
  available: boolean;
  bookings: number;
}

export interface ScheduleDaySummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  earnings: number;
}

export interface ScheduleData {
  shifts: {
    start: string;
    end: string;
    workingDays: string[];
  };
  isOnDuty: boolean;
  zone: string;
  deliveries: PartnerDelivery[];
  summaryByDay: ScheduleDaySummary[];
  totalCount: number;
}

export interface DeliveryHistoryItem extends PartnerDelivery {
  completedAt?: string;
  deliveryTime?: number;
}

export interface HistoryData {
  deliveries: DeliveryHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// ─── UPDATE PAYLOAD ───────────────────────────────────────────────────────────

export interface UpdateProfilePayload {
  vehicle?: {
    type?: VehicleType
    number?: string
    model?: string
  }
  zone?: ZoneType
  serviceablePincodes?: string[]
  availability?: {
    isAvailable?: boolean
    isOnDuty?: boolean
    shifts?: {
      start?: string
      end?: string
      workingDays?: string[]
    }
  }
  bankDetails?: Partial<BankDetails>
  maxConcurrentDeliveries?: number
}

// ─── API CLIENT SETUP ─────────────────────────────────────────────────────────

const deliveryApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
})

// Token injection via NextAuth session interceptor (primary method)
deliveryApiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string })?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Fallback token setter for manual injection (for non-NextAuth contexts)
let _manualToken = ''
export function setDeliveryToken(token: string) {
  _manualToken = token
}

// Additional interceptor to handle manual token as fallback
deliveryApiClient.interceptors.request.use((config) => {
  if (_manualToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${_manualToken}`
  }
  return config
})

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function get<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const res = await deliveryApiClient.get<T>(path, { params })
  return res.data
}

async function put<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await deliveryApiClient.put<T>(path, body)
  return res.data
}

async function post<T>(path: string, body?: Record<string, unknown> | FormData): Promise<T> {
  const res = await deliveryApiClient.post<T>(path, body)
  return res.data
}

// ─── API FUNCTIONS ───────────────────────────────────────────────────────────

export const deliveryPartnerApi = {
  /** Profile */
  getProfile: () =>
    get<ApiEnvelope<{ profile: DeliveryPartnerProfile }>>('/api/v1/deliveries/profile'),

  updateProfile: (body: UpdateProfilePayload) =>
    put<ApiEnvelope<{ profile: DeliveryPartnerProfile }>>('/api/v1/deliveries/profile', body as unknown as Record<string, unknown>),

  /** Stats */
  getStats: () =>
    get<ApiEnvelope<{ stats: DashboardStats }>>('/api/v1/deliveries/stats'),

  /** Deliveries */
  getToday: () =>
    get<ApiEnvelope<{ deliveries: PartnerDelivery[]; count: number }>>('/api/v1/deliveries/today'),

  getActive: () =>
    get<ApiEnvelope<{ deliveries: PartnerDelivery[]; count: number }>>('/api/v1/deliveries/active'),

  getNavigate: () =>
    get<ApiEnvelope<NavigateData>>('/api/v1/deliveries/navigate'),

  getDeliveryById: (id: string) =>
    get<ApiEnvelope<{ delivery: PartnerDelivery }>>(`/api/v1/deliveries/${id}`),

  getLocationHistory: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
    get<ApiEnvelope<LocationHistoryData>>('/api/v1/deliveries/location/history', params as Record<string, string | number>),

  calculateRoute: (payload: {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
    waypoints?: Array<{ lat: number; lng: number }>
  }) =>
    post<ApiEnvelope<{ route: RouteCalculationResult }>>('/api/v1/deliveries/route/calculate', payload as unknown as Record<string, unknown>),

  optimizeRoute: (deliveryIds?: string[]) =>
    post<ApiEnvelope<OptimizedRouteResult>>('/api/v1/deliveries/route/optimize', { deliveryIds }),

  /** Performance */
  getPerformance: (period: 'week' | 'month' | 'quarter' | 'year' = 'month') =>
    get<ApiEnvelope<{ performance: PerformanceMetrics }>>('/api/v1/deliveries/performance', { period }),

  /** Earnings */
  getEarnings: (period: 'week' | 'month' | 'quarter' | 'year' = 'week') =>
    get<ApiEnvelope<EarningsData>>('/api/v1/deliveries/earnings', { period }),

  /** Activity */
  getActivity: (limit = 8) =>
    get<ApiEnvelope<{ activities: ActivityItem[] }>>('/api/v1/deliveries/activity', { limit }),

  /** Availability */
  updateAvailability: (payload: { isAvailable?: boolean; isOnDuty?: boolean }) =>
    put<ApiEnvelope<{ isAvailable: boolean; isOnDuty: boolean }>>('/api/v1/deliveries/availability', payload),

  /** Location */
  updateLocation: (lat: number, lng: number, speed?: number, battery?: number, accuracy?: number) =>
    put<ApiEnvelope<{ currentLocation: DeliveryPartnerProfile['availability']['currentLocation']; updatedDeliveries: number }>>('/api/v1/deliveries/location', { lat, lng, speed, battery, accuracy }),

  /** Auth */
  forgotPassword: (email: string) =>
    post<ApiEnvelope<{ message: string }>>('/api/v1/deliveries/auth/forgot-password', { email }),

  logout: () =>
    post<ApiEnvelope<{ success: boolean }>>('/api/v1/deliveries/auth/logout', {}),

  /** Delivery action endpoints */
  startDelivery: (id: string, location: { lat: number; lng: number }) =>
    post<ApiEnvelope<{ delivery: PartnerDelivery }>>(`/api/v1/deliveries/${id}/start`, { location }),

  updateProgress: (id: string, status: string, location: { lat: number; lng: number }) =>
    put<ApiEnvelope<{ delivery: PartnerDelivery }>>(`/api/v1/deliveries/${id}/progress`, { status, location }),

  upsertNote: (id: string, notes: string) =>
    post<ApiEnvelope<{ success: boolean }>>(`/api/v1/deliveries/${id}/notes`, { notes }),

  generateOtp: (id: string) =>
    post<ApiEnvelope<{ otp?: string }>>(`/api/v1/deliveries/${id}/generate-otp`, {}),

  verifyOtp: (id: string, otp: string) =>
    post<ApiEnvelope<{ verified: boolean }>>(`/api/v1/deliveries/${id}/verify-otp`, { otp }),

  completeDelivery: (id: string, formData: FormData) =>
    post<ApiEnvelope<{ success: boolean }>>(`/api/v1/deliveries/${id}/complete`, formData),

  failDelivery: (id: string, payload: { reason: string; notes: string; reschedule: boolean }) =>
    post<ApiEnvelope<{ success: boolean }>>(`/api/v1/deliveries/${id}/fail`, payload),

  reportIssue: (id: string, payload: { issueType: string; description: string }) =>
    post<ApiEnvelope<{ success: boolean }>>(`/api/v1/deliveries/${id}/report-issue`, payload),

  rescheduleDelivery: (id: string, payload: { newDate: string; newSlot: string; reason: string }) =>
    post<ApiEnvelope<{ success: boolean }>>(`/api/v1/deliveries/${id}/reschedule`, payload),

    // Get available time slots for rescheduling
    getAvailableSlots: (date: string, pincode?: string) =>
      get<ApiEnvelope<{ slots: TimeSlot[] }>>('/api/v1/deliveries/slots/available', { 
        date, 
        ...(pincode && { pincode }) 
      }),
    
    // Get delivery history with pagination
    getHistory: (params?: { 
      page?: number; 
      limit?: number; 
      status?: string; 
      startDate?: string; 
      endDate?: string;
    }) =>
      get<ApiEnvelope<HistoryData>>('/api/v1/deliveries/history', params as Record<string, string | number>),
    
    // Get schedule for date range (when backend ready)
    getScheduleRange: (startDate: string, endDate: string) =>
      get<ApiEnvelope<ScheduleData>>('/api/v1/deliveries/schedule', { startDate, endDate }),
    
    // Get upcoming deliveries
    getUpcoming: (days: number = 7) =>
      get<ApiEnvelope<{ deliveries: PartnerDelivery[] }>>('/api/v1/deliveries/schedule/upcoming', { days }),
  
}

// Export individual functions for backward compatibility with old imports
export const deliveryApi = deliveryPartnerApi