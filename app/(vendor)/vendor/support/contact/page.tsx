// app/vendor/support/contact/page.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Phone, Mail, MessageCircle, Globe, Clock, Shield,
  Send, User, Building2, AlertCircle, CheckCircle,
  ChevronRight, Headphones, MessageSquare, Zap
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

async function getAuthHeaders() {
  const { getSession } = await import('next-auth/react')
  const session = await getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': session?.user?.accessToken ? `Bearer ${session.user.accessToken}` : '',
  }
}

const supportChannels = [
  {
    icon: Phone,
    title: 'Phone Support',
    description: '24/7 emergency support',
    details: '+91 1800 123 4567',
    timing: 'Available 24x7',
    color: '#2874f0',
    bg: '#ebf3fb'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'For non-urgent queries',
    details: 'vendor@rentease.com',
    timing: 'Response within 2-4 hours',
    color: '#21a056',
    bg: '#e8f5e9'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Instant messaging support',
    details: 'Chat with our team',
    timing: 'Available 9 AM - 9 PM IST',
    color: '#fb641b',
    bg: '#fff3e0'
  },
  {
    icon: Globe,
    title: 'Help Center',
    description: 'Self-service resources',
    details: 'help.rentease.com',
    timing: '24/7 access',
    color: '#9c27b0',
    bg: '#f3e5f5'
  }
]

const faqs = [
  {
    question: 'How long does it take to get a response?',
    answer: 'Our average response time is 2-4 hours for standard queries. Urgent issues are prioritized and addressed within 1 hour.'
  },
  {
    question: 'What information should I include in my ticket?',
    answer: 'Please include your order number, product details, screenshots (if applicable), and a clear description of the issue for faster resolution.'
  },
  {
    question: 'Can I track my support ticket status?',
    answer: 'Yes! You can track all your tickets from the "My Tickets" tab. You\'ll also receive email notifications for updates.'
  },
  {
    question: 'What are your support hours?',
    answer: 'Our support team is available 24/7 for critical issues. Standard support is available Monday-Friday, 9 AM - 9 PM IST.'
  }
]

export default function ContactSupportPage() {
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`${BASE_URL}/api/v1/support/tickets`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'vendor_issue',
          priority: formData.priority,
          subject: formData.subject,
          description: formData.message
        })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Support ticket created! We\'ll respond shortly.')
        setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium' })
      } else {
        toast.error(data.message || 'Failed to create ticket')
      }
    } catch (error) {
      toast.error('Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2874f0] to-[#00a0e3] rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">We're Here to Help</h2>
          <p className="text-white/80">
            Choose your preferred way to reach us. Our support team is ready to assist you with any questions or concerns.
          </p>
        </div>
      </div>

      {/* Support Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {supportChannels.map((channel, idx) => {
          const Icon = channel.icon
          return (
            <motion.div
              key={channel.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center" style={{ backgroundColor: channel.bg }}>
                <Icon className="h-6 w-6" style={{ color: channel.color }} />
              </div>
              <h3 className="font-semibold text-slate-800">{channel.title}</h3>
              <p className="text-sm text-slate-500 mt-1">{channel.description}</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{channel.details}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {channel.timing}
              </p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <MessageSquare className="h-5 w-5 text-[#2874f0]" />
            <h3 className="text-lg font-bold text-slate-800">Send us a Message</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={5}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30 resize-none"
                placeholder="Please provide detailed information about your issue..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send Message
            </button>
          </form>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <Zap className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-800">Frequently Asked Questions</h3>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group">
                  <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="text-sm font-medium text-slate-700 group-hover:text-[#2874f0] transition-colors">
                      {faq.question}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="text-sm text-slate-500 mt-2 pl-4 border-l-2 border-[#2874f0]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>

          {/* SLA Commitment */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
            <div className="flex items-start gap-3">
              <Shield className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <p className="font-semibold text-green-800">Our Support Commitment</p>
                <p className="text-sm text-green-700 mt-1">
                  We're committed to providing timely and effective support. 
                  Our SLA guarantees response within 2-4 hours for standard tickets 
                  and 1 hour for urgent issues.
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700">98% satisfaction rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700">2.5hr avg response</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Headphones className="h-5 w-5 text-[#2874f0]" />
              <h3 className="font-semibold text-slate-800">Support Hours</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Monday - Friday</span>
                <span className="text-slate-800">9:00 AM - 9:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Saturday</span>
                <span className="text-slate-800">10:00 AM - 6:00 PM IST</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sunday</span>
                <span className="text-slate-800">Emergency support only</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-amber-600">
                <AlertCircle className="h-3 w-3" />
                <span>24/7 emergency support available for critical issues</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}