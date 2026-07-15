// src/app/admin/support/types/support.types.ts

export interface SupportTicket {
  _id: string
  ticketNumber: string
  type: 'user_issue' | 'vendor_issue' | 'rental_dispute' | 'payment_dispute' | 'technical_issue' | 'content_moderation' | 'account_issue' | 'feature_request' | 'complaint' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened' | 'escalated'
  createdBy: {
    _id: string
    name: string
    email: string
    role: string
  }
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
  subject: string
  description: string
  attachments?: Array<{ url: string; filename: string; uploadedAt: string }>
  messages: Array<{
    sender: { type: string; id: string; name: string }
    message: string
    attachments?: string[]
    isInternal: boolean
    createdAt: string
    readBy: Array<{ admin: string; readAt: string }>
  }>
  resolution?: {
    summary: string
    resolvedAt: string
    resolvedBy: { _id: string; name: string }
    feedback?: { rating: number; comment: string; providedAt: string }
  }
  sla: {
    responseDue: string
    resolutionDue: string
    breached: boolean
  }
  createdAt: string
  updatedAt: string
}

export interface TicketStats {
  open: number
  pending: number
  resolvedToday: number
  avgResponseHours: number
  byPriority: Array<{ _id: string; count: number }>
  recentActivity: Array<{
    ticketId: string
    ticketNumber: string
    action: string
    timestamp: string
  }>
}

export interface CreateTicketData {
  type: SupportTicket['type']
  priority: SupportTicket['priority']
  subject: string
  description: string
  relatedTo?: {
    type: 'user' | 'vendor' | 'rental' | 'payment' | 'product'
    id: string
  }
}

export interface ReplyData {
  message: string
  isInternal?: boolean
  attachments?: File[]
}