/**
 * frontend/lib/api/support.ts
 *
 * Typed API client for the Admin Help & Support console.
 * Talks to the backend Support Ticket module.
 *
 * Base path: /api/v1/supportTicket   (NOTE: it is `supportTicket`, NOT `support`)
 *
 * Auth: NextAuth session token injected via an axios request interceptor,
 * mirroring the pattern in `lib/api/delivery.ts`.
 */
import axios from 'axios'
import { getSession } from 'next-auth/react'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'
const API_PREFIX = '/api/v1/supportTicket'

/* ------------------------------------------------------------------------ */
/*                                  Types                                   */
/* ------------------------------------------------------------------------ */

export type TicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'escalated'

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'

export type TicketType =
  | 'user_issue'
  | 'vendor_issue'
  | 'rental_dispute'
  | 'payment_dispute'
  | 'technical_issue'
  | 'content_moderation'
  | 'account_issue'
  | 'feature_request'
  | 'complaint'
  | 'other'

export type SenderType = 'user' | 'admin' | 'system'

/** A user/admin the backend populates with `profile.firstName/lastName`. */
export interface Person {
  _id: string
  email?: string
  phone?: string
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
}

export interface TicketMessage {
  _id?: string
  sender: {
    type: SenderType
    id: string
    name?: string
  }
  message: string
  attachments?: string[]
  isInternal: boolean
  createdAt: string
}

export interface TimelineEntry {
  action: string
  performedBy?: { type: SenderType; id: string }
  note?: string
  timestamp: string
}

export interface TicketResolution {
  summary?: string
  resolvedAt?: string
  resolvedBy?: Person
  feedback?: {
    rating?: number
    comment?: string
    providedAt?: string
  }
}

export interface TicketSLA {
  responseDue?: string
  resolutionDue?: string
  breached?: boolean
}

export interface SupportTicket {
  _id: string
  ticketNumber: string
  type: TicketType
  priority: TicketPriority
  status: TicketStatus
  subject: string
  description: string
  createdBy: Person
  assignedTo?: Person | null
  relatedTo?: { type?: string; id?: string; model?: string }
  relatedEntity?: Record<string, unknown> | null
  attachments?: Array<{ url: string; filename: string; uploadedAt?: string }>
  messages: TicketMessage[]
  timeline?: TimelineEntry[]
  resolution?: TicketResolution | null
  sla?: TicketSLA
  /** Only present in list responses (getAllTickets) */
  slaBreached?: boolean
  metadata?: { source?: string; tags?: string[] }
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface TicketListResponse {
  tickets: SupportTicket[]
  pagination: Pagination
}

export interface DashboardStats {
  open: number
  pending: number
  resolvedToday: number
  avgResponseHours: number
  byPriority: Array<{ _id: TicketPriority; count: number }>
}

export interface ApiEnvelope<T> {
  success: boolean
  message: string
  timestamp?: string
  data?: T
}

export interface TicketListParams {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
  type?: TicketType
  assignedTo?: string
  search?: string
}

/* ------------------------------------------------------------------------ */
/*                              API client setup                            */
/* ------------------------------------------------------------------------ */

const supportApiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 20000,
})

supportApiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as { accessToken?: string })?.accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/* ------------------------------------------------------------------------ */
/*                              Helper utilities                            */
/* ------------------------------------------------------------------------ */

/** Best-effort display name for a populated Person (backend has no `name`). */
export function personName(p?: Person | null, fallback = 'Unknown'): string {
  if (!p) return fallback
  const full = `${p.profile?.firstName ?? ''} ${p.profile?.lastName ?? ''}`.trim()
  return full || p.email || fallback
}

/** Strip undefined values so we don't send `?status=undefined`. */
function clean(params: Record<string, unknown>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string | number>
}

/* ------------------------------------------------------------------------ */
/*                                API methods                               */
/* ------------------------------------------------------------------------ */

export const supportApi = {
  /** GET /admin/tickets — paginated list with SLA breach flags */
  async listTickets(params: TicketListParams = {}): Promise<TicketListResponse> {
    const res = await supportApiClient.get<ApiEnvelope<TicketListResponse>>(
      `${API_PREFIX}/admin/tickets`,
      { params: clean(params as Record<string, unknown>) },
    )
    return res.data.data ?? { tickets: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } }
  },

  /** GET /admin/dashboard/stats */
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await supportApiClient.get<ApiEnvelope<DashboardStats>>(
      `${API_PREFIX}/admin/dashboard/stats`,
    )
    return (
      res.data.data ?? { open: 0, pending: 0, resolvedToday: 0, avgResponseHours: 0, byPriority: [] }
    )
  },

  /** GET /admin/tickets/:id — full ticket detail */
  async getTicket(ticketId: string): Promise<SupportTicket> {
    const res = await supportApiClient.get<ApiEnvelope<{ ticket: SupportTicket }>>(
      `${API_PREFIX}/admin/tickets/${ticketId}`,
    )
    const ticket = res.data.data?.ticket
    if (!ticket) throw new Error('Ticket not found in response')
    return ticket
  },

  /** POST /admin/tickets/:id/messages — reply (or internal note) */
  async replyToTicket(
    ticketId: string,
    message: string,
    isInternal = false,
    attachments: string[] = [],
  ): Promise<TicketMessage> {
    const res = await supportApiClient.post<ApiEnvelope<{ message: TicketMessage }>>(
      `${API_PREFIX}/admin/tickets/${ticketId}/messages`,
      { message, isInternal, attachments },
    )
    const msg = res.data.data?.message
    if (!msg) throw new Error('Malformed reply response')
    return msg
  },

  /** PATCH /admin/tickets/:id/status */
  async updateStatus(ticketId: string, status: TicketStatus, note?: string): Promise<SupportTicket> {
    const res = await supportApiClient.patch<ApiEnvelope<{ ticket: SupportTicket }>>(
      `${API_PREFIX}/admin/tickets/${ticketId}/status`,
      { status, note },
    )
    const ticket = res.data.data?.ticket
    if (!ticket) throw new Error('Malformed status response')
    return ticket
  },

  /** POST /admin/tickets/:id/assign — body uses `adminId` (matches validator) */
  async assignTicket(ticketId: string, adminId: string, note?: string): Promise<SupportTicket> {
    const res = await supportApiClient.post<ApiEnvelope<{ ticket: SupportTicket }>>(
      `${API_PREFIX}/admin/tickets/${ticketId}/assign`,
      { adminId, note },
    )
    const ticket = res.data.data?.ticket
    if (!ticket) throw new Error('Malformed assign response')
    return ticket
  },
}

export default supportApi
