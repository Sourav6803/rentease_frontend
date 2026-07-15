

// app/vendor/support/page.tsx (My Tickets)
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Search, Filter, ChevronLeft, ChevronRight,
  RefreshCw, AlertCircle, CheckCircle, Clock, XCircle,
  Eye, Plus, Calendar, Tag, User, Mail, Phone,
  ChevronDown, Paperclip, Send, Smile, Image as ImageIcon,
  MoreVertical, Trash2, Edit, Star, Award, Shield,
  BookOpen, DollarSign
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'
import Link from 'next/link'


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

/** Format a date string safely — returns '' for missing/invalid dates instead of throwing. */
function safeFormat(date: string | undefined | null, pattern: string): string {
  if (!date) return ''
  const d = new Date(date)
  return isNaN(d.getTime()) ? '' : format(d, pattern)
}

interface SupportTicket {
  _id: string
  ticketNumber: string
  type: 'user_issue' | 'vendor_issue' | 'rental_dispute' | 'payment_dispute' | 'technical_issue' | 'content_moderation' | 'account_issue' | 'feature_request' | 'complaint' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical'
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened' | 'escalated'
  resolution?: {
    feedback?: {
      rating: number
      comment?: string
      submittedAt?: string
    }
  }
  subject: string
  description: string
  messages: Array<{
    sender: { type: string; id: string; name: string }
    message: string
    attachments: string[]
    isInternal: boolean
    createdAt: string
    readBy: Array<{ admin: string; readAt: string }>
  }>
  attachments: Array<{ url: string; filename: string; uploadedAt: string }>
  createdAt: string
  updatedAt: string
  unreadCount?: number
  slaBreached?: boolean
}

const TICKET_TYPES = {
  user_issue: { label: 'User Issue', icon: User, color: '#2874f0', bg: '#ebf3fb' },
  vendor_issue: { label: 'Vendor Issue', icon: Store, color: '#fb641b', bg: '#fff3e0' },
  rental_dispute: { label: 'Rental Dispute', icon: Calendar, color: '#9c27b0', bg: '#f3e5f5' },
  payment_dispute: { label: 'Payment Dispute', icon: DollarSign, color: '#21a056', bg: '#e8f5e9' },
  technical_issue: { label: 'Technical Issue', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  content_moderation: { label: 'Content Moderation', icon: Shield, color: '#8b5cf6', bg: '#f3e8ff' },
  account_issue: { label: 'Account Issue', icon: User, color: '#06b6d4', bg: '#ecfeff' },
  feature_request: { label: 'Feature Request', icon: Star, color: '#fbbf24', bg: '#fef3c7' },
  complaint: { label: 'Complaint', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' },
  other: { label: 'Other', icon: HelpCircle, color: '#64748b', bg: '#f1f5f9' }
}

const STATUS_CONFIG = {
  open: { label: 'Open', icon: MessageCircle, color: '#2874f0', bg: '#ebf3fb' },
  assigned: { label: 'Assigned', icon: User, color: '#8b5cf6', bg: '#f3e8ff' },
  in_progress: { label: 'In Progress', icon: RefreshCw, color: '#fb641b', bg: '#fff3e0' },
  pending: { label: 'Pending', icon: Clock, color: '#eab308', bg: '#fef3c7' },
  resolved: { label: 'Resolved', icon: CheckCircle, color: '#21a056', bg: '#e8f5e9' },
  closed: { label: 'Closed', icon: XCircle, color: '#64748b', bg: '#f1f5f9' },
  reopened: { label: 'Reopened', icon: RefreshCw, color: '#ef4444', bg: '#fef2f2' },
  escalated: { label: 'Escalated', icon: AlertCircle, color: '#ef4444', bg: '#fef2f2' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Low', color: '#64748b', bg: '#f1f5f9' },
  medium: { label: 'Medium', color: '#3b82f6', bg: '#eff6ff' },
  high: { label: 'High', color: '#f59e0b', bg: '#fef3c7' },
  urgent: { label: 'Urgent', color: '#ef4444', bg: '#fef2f2' },
  critical: { label: 'Critical', color: '#7f1d1d', bg: '#fef2f2' }
}

// Ticket Card Component
function TicketCard({ ticket, onClick }: { ticket: SupportTicket; onClick: () => void }) {
  const typeConfig = TICKET_TYPES[ticket.type]
  const statusConfig = STATUS_CONFIG[ticket.status]
  const priorityConfig = PRIORITY_CONFIG[ticket.priority]
  const TypeIcon = typeConfig.icon
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-mono text-slate-400">{ticket.ticketNumber}</span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold`}
              style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}>
              {priorityConfig.label}
            </span>
            {ticket.slaBreached && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700">
                <AlertCircle className="h-2.5 w-2.5" />
                SLA Breached
              </span>
            )}
            {/* {ticket?.unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2874f0] text-white">
                {ticket.unreadCount} new
              </span>
            )} */}

            {(ticket?.unreadCount ?? 0) > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#2874f0] text-white">
                {ticket.unreadCount ?? 0} new
              </span>
            )}
          </div>
          
          <h3 className="font-semibold text-slate-800 mb-1">{ticket.subject}</h3>
          
          <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <TypeIcon className="h-3 w-3" style={{ color: typeConfig.color }} />
              {typeConfig.label}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
        </div>
        
        <div className="text-right shrink-0">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold`}
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </span>
          {ticket.messages?.length > 0 && (
            <p className="text-xs text-slate-400 mt-2">
              {ticket.messages.length} message{ticket.messages.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Create Ticket Modal
function CreateTicketModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'vendor_issue',
    priority: 'medium',
    subject: '',
    description: '',
    relatedTo: { type: '', id: '' }
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Support ticket created successfully')
        onSuccess()
        onClose()
      } else {
        toast.error(data.message || 'Failed to create ticket')
      }
    } catch (error) {
      toast.error('Failed to create ticket')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] px-6 py-4">
            <h3 className="text-lg font-bold text-white">Create New Support Ticket</h3>
            <p className="text-white/70 text-sm mt-1">Our team will respond within 2-4 hours</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ticket Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
              >
                {Object.entries(TICKET_TYPES).map(([value, config]) => (
                  <option key={value} value={value}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
              >
                <option value="low">Low - General inquiry</option>
                <option value="medium">Medium - Minor issue</option>
                <option value="high">High - Urgent matter</option>
                <option value="urgent">Urgent - Business impact</option>
                <option value="critical">Critical - System down</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                placeholder="Brief summary of your issue"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 resize-none"
                placeholder="Please provide detailed information about your issue..."
                required
              />
              <p className="text-xs text-slate-400 mt-1">
                Include order numbers, screenshots, or any relevant details
              </p>
            </div>
            
            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Create Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Ticket Details Modal
function TicketDetailsModal({ ticket, onClose, onUpdate }: { ticket: SupportTicket; onClose: () => void; onUpdate: () => void }) {
  // Start from the list snapshot for an instant header, then hydrate with fresh full data.
  const [details, setDetails] = useState<SupportTicket>(ticket)
  const [isLoading, setIsLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const toast = useToast()

  const fetchDetails = useCallback(async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets/${ticket._id}`, { headers })
      const data = await res.json()
      if (data.success && data.data?.ticket) {
        setDetails(data.data.ticket)
      }
    } catch {
      // Keep the list snapshot if the detail fetch fails.
    } finally {
      setIsLoading(false)
    }
  }, [ticket._id])

  console.log('Ticket details:', details)

  useEffect(() => {
    fetchDetails()
  }, [fetchDetails])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets/${ticket._id}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: newMessage })
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Message sent successfully')
        setNewMessage('')
        await fetchDetails()
        onUpdate()
      } else {
        toast.error(data.message || 'Failed to send message')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSending(false)
    }
  }

  const handleProvideFeedback = async (rating: number) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets/${ticket._id}/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, comment: 'Thank you for your support!' })
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Feedback submitted. Thank you!')
        await fetchDetails()
        onUpdate()
      } else {
        toast.error(data.message || 'Failed to submit feedback')
      }
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
  }

  const statusConfig = STATUS_CONFIG[details.status] ?? STATUS_CONFIG.open
  const priorityConfig = PRIORITY_CONFIG[details.priority] ?? PRIORITY_CONFIG.medium
  const StatusIcon = statusConfig.icon
  // Hide internal admin notes from the vendor; guard against malformed rows.
  const visibleMessages = (details.messages || []).filter((m) => m && !m.isInternal)

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={onClose} /> */}
        <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
        <div className="relative z-10 w-full max-w-2xl bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all my-8">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${details.status === 'resolved' ? 'bg-green-50' : 'bg-slate-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-mono text-slate-500">{details.ticketNumber}</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold`}
                    style={{ backgroundColor: priorityConfig.bg, color: priorityConfig.color }}>
                    {priorityConfig.label}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold`}
                    style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}>
                    <StatusIcon className="h-3 w-3" />
                    {statusConfig.label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">{details.subject}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Created {safeFormat(details.createdAt, 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/50">
                <XCircle className="h-5 w-5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4 bg-[#fafafa]">
            {/* Initial Description */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2874f0] flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">You</span>
                    <span className="text-[10px] text-slate-400">{safeFormat(details.createdAt, 'hh:mm a')}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{details.description}</p>
                </div>
              </div>
            </div>

            {/* Conversation */}
            {visibleMessages.map((msg, idx) => {
              const isAdmin = msg.sender?.type === 'admin'
              return (
                <div key={idx} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAdmin ? 'bg-green-100' : 'bg-slate-100'
                  }`}>
                    {isAdmin ? (
                      <Shield className="h-4 w-4 text-green-600" />
                    ) : (
                      <User className="h-4 w-4 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`rounded-xl p-3 shadow-sm ${isAdmin ? 'bg-green-50' : 'bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {msg.sender?.name || (isAdmin ? 'Support' : 'You')}
                          {isAdmin && (
                            <span className="ml-2 text-xs text-green-600 font-normal">Support Team</span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400">{safeFormat(msg.createdAt, 'hh:mm a, dd MMM')}</span>
                      </div>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Loading / empty hint */}
            {isLoading && visibleMessages.length === 0 && (
              <div className="flex items-center justify-center py-6 text-slate-400">
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Loading conversation…</span>
              </div>
            )}
            {!isLoading && visibleMessages.length === 0 && (
              <p className="text-center text-sm text-slate-400 py-4">
                No replies yet. Our team will respond shortly.
              </p>
            )}
          </div>

          {/* Reply Box */}
          {details.status !== 'resolved' && details.status !== 'closed' && (
            <div className="border-t border-slate-200 p-4 bg-white">
              <div className="flex gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 resize-none text-sm"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors disabled:opacity-50 self-end"
                >
                  {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {details.status === 'resolved' && !details.resolution?.feedback && (
            <div className="border-t border-slate-200 p-4 bg-amber-50">
              <p className="text-sm font-semibold text-amber-800 mb-2">How was your experience?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleProvideFeedback(rating)}
                    className="p-2 hover:scale-110 transition-transform"
                  >
                    <Star className={`h-6 w-6 ${rating <= 3 ? 'text-slate-400' : 'text-amber-400'}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function SupportTicketsPage() {
  const { data: session, status } = useSession()
  const toast = useToast()
  const router = useRouter()
  
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  
  const fetchTickets = useCallback(async () => {
    if (status !== 'authenticated') return
    
    try {
      const headers = await getAuthHeaders()
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', '10')
      if (filterStatus !== 'all') params.set('status', filterStatus)
      if (filterPriority !== 'all') params.set('priority', filterPriority)
      if (searchTerm) params.set('search', searchTerm)
      
      const [ticketsRes, statsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/v1/support/tickets?${params.toString()}`, { headers }),
        fetch(`${BASE_URL}/api/v1/support/tickets/stats`, { headers })
      ])
      
      const ticketsData = await ticketsRes.json()
      const statsData = await statsRes.json()
      
      if (ticketsData.success) {
        setTickets(ticketsData.data.tickets || [])
        setTotalPages(ticketsData.data.pagination?.pages || 1)
        setTotalTickets(ticketsData.data.pagination?.total || 0)
      }
      
      if (statsData.success) {
        setStats(statsData.data)
      }
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, filterStatus, filterPriority, searchTerm, status, toast])
  
  useEffect(() => {
    if (status === 'authenticated') {
      fetchTickets()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [fetchTickets, status, router])
  
  const statCards = [
    { label: 'Open Tickets', value: stats?.byStatus?.find((s: any) => s._id === 'open')?.count || 0, icon: MessageCircle, color: '#2874f0', bg: '#ebf3fb' },
    { label: 'In Progress', value: stats?.byStatus?.find((s: any) => s._id === 'in_progress')?.count || 0, icon: RefreshCw, color: '#fb641b', bg: '#fff3e0' },
    { label: 'Resolved', value: stats?.byStatus?.find((s: any) => s._id === 'resolved')?.count || 0, icon: CheckCircle, color: '#21a056', bg: '#e8f5e9' },
    { label: 'Avg Response', value: `${stats?.averageResolutionHours || 0}h`, icon: Clock, color: '#8b5cf6', bg: '#f3e8ff' },
  ]
  
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#2874f0] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading support tickets...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: stat.bg }}>
                  <Icon className="h-4 w-4" style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-xs text-slate-500">{stat.label}</p>
            </motion.div>
          )
        })}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ticket number, subject..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
          <button
            onClick={() => fetchTickets()}
            className="px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Knowledge Base Tips */}
      <div className="bg-gradient-to-r from-[#2874f0]/5 to-[#00a0e3]/5 rounded-xl p-4 border border-[#2874f0]/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2874f0]/10 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-[#2874f0]" />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Quick Answers</p>
            <p className="text-sm text-slate-600 mt-0.5">
              Before creating a ticket, check our <Link href="/vendor/support/knowledge-base" className="text-[#2874f0] hover:underline">Knowledge Base</Link> for instant solutions to common issues.
              Most questions are answered within minutes!
            </p>
          </div>
        </div>
      </div>
      
      {/* Tickets List */}
      <AnimatePresence mode="popLayout">
        {tickets.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No Support Tickets</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                ? 'No tickets match your filters'
                : 'Create your first support ticket to get help'}
            </p>
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
              >
                Create New Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket._id}
                ticket={ticket}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
          <p className="text-sm text-slate-500">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Modals */}
      {showCreateModal && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchTickets}
        />
      )}
      
      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}
    </div>
  )
}

// Import missing icons
function Store(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </svg>
  )
}

function HelpCircle(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}