// /**
//  * frontend/lib/api/analytics.ts
//  *
//  * Typed client for legacy platform analytics at /api/v1/analytics/*
//  * Complements the newer /api/v1/admin/intelligence/* surface.
//  */
// import axios from 'axios'
// import { getSession } from 'next-auth/react'
// import type { ApiEnvelope, PeriodParams } from '@/types/admin-intelligence.types'

// const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
// const API_PREFIX = '/api/v1/analytics'

// const analyticsClient = axios.create({
//   baseURL: BASE_URL,
//   withCredentials: true,
//   timeout: 25000,
// })

// analyticsClient.interceptors.request.use(async (config) => {
//   const session = await getSession()
//   const token = (session?.user as { accessToken?: string })?.accessToken
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// function clean(params: Record<string, unknown>): Record<string, string | number> {
//   return Object.fromEntries(
//     Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
//   ) as Record<string, string | number>
// }

// async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
//   const res = await analyticsClient.get<ApiEnvelope<T>>(`${API_PREFIX}${path}`, {
//     params: params ? clean(params) : undefined,
//   })
//   if (!res.data.data) throw new Error(res.data.message || 'Empty analytics response')
//   return res.data.data
// }

// export const analyticsApi = {
//   getPlatformOverview: (params?: PeriodParams) => get<Record<string, unknown>>('/platform', params),
//   getDashboardSummary: (params?: PeriodParams) => get<Record<string, unknown>>('/dashboard', params),
//   getUserAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/users', params),
//   getVendorAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/vendors', params),
//   getProductAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/products', params),
//   getRentalAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/rentals', params),
//   getRevenueAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/revenue', params),
//   getInventoryAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/inventory', params),
//   getCustomerAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/customers', params),
//   getPerformanceMetrics: (params?: PeriodParams) => get<Record<string, unknown>>('/performance', params),
//   getGrowthMetrics: (params?: PeriodParams) => get<Record<string, unknown>>('/growth', params),
//   getRetentionAnalytics: (params?: PeriodParams) => get<Record<string, unknown>>('/retention', params),
//   getConversionFunnel: (params?: PeriodParams) => get<Record<string, unknown>>('/funnel', params),

//   /** GET /export — returns blob for download */
//   async exportAnalytics(params?: PeriodParams & { format?: 'csv' | 'json' }): Promise<Blob> {
//     const res = await analyticsClient.get(`${API_PREFIX}/export`, {
//       params: params ? clean(params as Record<string, unknown>) : undefined,
//       responseType: 'blob',
//     })
//     return res.data
//   },

//   invalidateCache: () =>
//     analyticsClient.post<ApiEnvelope<unknown>>(`${API_PREFIX}/cache/invalidate`),
// }

// export default analyticsApi


/**
 * frontend/lib/api/analytics.ts
 *
 * Typed client for legacy platform analytics at /api/v1/analytics/*
 * Complements the newer /api/v1/admin/intelligence/* surface.
 */
import axios from 'axios'
import { getSession } from 'next-auth/react'
import type { ApiEnvelope, PeriodParams } from '@/types/admin-intelligence.types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const API_PREFIX = '/api/v1/analytics'

const analyticsClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 25000,
})

analyticsClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string })?.accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

function clean(params: Record<string, unknown>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>
}

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const res = await analyticsClient.get<ApiEnvelope<T>>(`${API_PREFIX}${path}`, {
    params: params ? clean(params) : undefined,
  })
  if (!res.data.data) throw new Error(res.data.message || 'Empty analytics response')
  return res.data.data
}

// Type-safe wrapper to convert PeriodParams to Record<string, unknown>
function toRecord(params?: PeriodParams): Record<string, unknown> | undefined {
  return params as Record<string, unknown>
}

export const analyticsApi = {
  getPlatformOverview: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/platform', toRecord(params)),
  getDashboardSummary: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/dashboard', toRecord(params)),
  getUserAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/users', toRecord(params)),
  getVendorAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/vendors', toRecord(params)),
  getProductAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/products', toRecord(params)),
  getRentalAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/rentals', toRecord(params)),
  getRevenueAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/revenue', toRecord(params)),
  getInventoryAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/inventory', toRecord(params)),
  getCustomerAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/customers', toRecord(params)),
  getPerformanceMetrics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/performance', toRecord(params)),
  getGrowthMetrics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/growth', toRecord(params)),
  getRetentionAnalytics: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/retention', toRecord(params)),
  getConversionFunnel: (params?: PeriodParams) => 
    get<Record<string, unknown>>('/funnel', toRecord(params)),

  /** GET /export — returns blob for download */
  async exportAnalytics(params?: PeriodParams & { format?: 'csv' | 'json' }): Promise<Blob> {
    const res = await analyticsClient.get(`${API_PREFIX}/export`, {
      params: params ? clean(params as Record<string, unknown>) : undefined,
      responseType: 'blob',
    })
    return res.data
  },

  invalidateCache: () =>
    analyticsClient.post<ApiEnvelope<unknown>>(`${API_PREFIX}/cache/invalidate`),
}

export default analyticsApi