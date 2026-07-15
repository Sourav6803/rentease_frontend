// app/vendor/security/api/page.tsx (API Access Management)
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Key, Plus, Copy, Trash2, Eye, EyeOff, RefreshCw,
  Clock, CheckCircle, XCircle, AlertCircle, Shield,
  Globe, Server, Code, Terminal, Database, Lock,
  Calendar, Activity, BarChart3, Download, Filter,
  ChevronRight, MoreVertical, Edit, Zap, Power
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { format } from 'date-fns'

interface APIKey {
  id: string
  name: string
  key: string
  maskedKey: string
  permissions: ('read' | 'write' | 'admin')[]
  createdAt: string
  lastUsed: string | null
  expiresAt: string | null
  status: 'active' | 'expired' | 'revoked'
  usageCount: number
  rateLimit: number
  allowedIPs: string[]
}

interface APIEndpoint {
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
  version: string
  rateLimit: string
  authRequired: boolean
}

const mockAPIKeys: APIKey[] = [
  {
    id: '1',
    name: 'Production App',
    key: 'rk_live_abc123def456ghi789jkl',
    maskedKey: 'rk_live_***...jkl',
    permissions: ['read', 'write'],
    createdAt: '2024-01-10T10:00:00',
    lastUsed: '2024-01-15T08:30:00',
    expiresAt: '2025-01-10T10:00:00',
    status: 'active',
    usageCount: 12456,
    rateLimit: 1000,
    allowedIPs: ['103.58.154.78', '203.192.245.12']
  },
  {
    id: '2',
    name: 'Staging Environment',
    key: 'rk_test_xyz789uvw456rst123',
    maskedKey: 'rk_test_***...123',
    permissions: ['read'],
    createdAt: '2024-01-05T14:30:00',
    lastUsed: '2024-01-14T16:45:00',
    expiresAt: null,
    status: 'active',
    usageCount: 3421,
    rateLimit: 500,
    allowedIPs: []
  },
  {
    id: '3',
    name: 'Analytics Integration',
    key: 'rk_live_def456ghi789jkl012',
    maskedKey: 'rk_live_***...012',
    permissions: ['read'],
    createdAt: '2023-10-20T09:15:00',
    lastUsed: '2024-01-12T11:20:00',
    expiresAt: '2024-10-20T09:15:00',
    status: 'active',
    usageCount: 8923,
    rateLimit: 2000,
    allowedIPs: ['45.118.167.34']
  }
]

const mockEndpoints: APIEndpoint[] = [
  { path: '/api/v1/products', method: 'GET', description: 'List all products', version: 'v1', rateLimit: '100/min', authRequired: true },
  { path: '/api/v1/products/:id', method: 'GET', description: 'Get product details', version: 'v1', rateLimit: '200/min', authRequired: true },
  { path: '/api/v1/products', method: 'POST', description: 'Create new product', version: 'v1', rateLimit: '50/min', authRequired: true },
  { path: '/api/v1/products/:id', method: 'PUT', description: 'Update product', version: 'v1', rateLimit: '50/min', authRequired: true },
  { path: '/api/v1/orders', method: 'GET', description: 'List orders', version: 'v1', rateLimit: '100/min', authRequired: true },
  { path: '/api/v1/orders/:id', method: 'GET', description: 'Get order details', version: 'v1', rateLimit: '200/min', authRequired: true },
  { path: '/api/v1/rentals', method: 'GET', description: 'List rentals', version: 'v1', rateLimit: '100/min', authRequired: true },
  { path: '/api/v1/payments', method: 'GET', description: 'List payments', version: 'v1', rateLimit: '100/min', authRequired: true },
  { path: '/api/v1/analytics', method: 'GET', description: 'Get analytics data', version: 'v1', rateLimit: '50/min', authRequired: true },
  { path: '/api/v1/webhooks', method: 'POST', description: 'Register webhook', version: 'v1', rateLimit: '10/min', authRequired: true },
]

function CreateAPIKeyModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    permissions: ['read'] as ('read' | 'write' | 'admin')[],
    rateLimit: 1000,
    expiresIn: 'never'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    // Simulate API call
    setTimeout(() => {
      setNewKey('rk_live_new_' + Math.random().toString(36).substring(2, 15))
      toast.success('API key created successfully')
      setIsCreating(false)
    }, 1500)
  }

  if (newKey) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">API Key Created</h3>
              <p className="text-sm text-slate-500 mt-1">
                Copy your new API key. You won't be able to see it again!
              </p>
              <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                <code className="text-sm font-mono break-all">{newKey}</code>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(newKey)
                    toast.success('Copied to clipboard')
                  }}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Copy Key
                </button>
                <button
                  onClick={() => {
                    onClose()
                    onSuccess()
                  }}
                  className="flex-1 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-2xl max-w-lg w-full">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Create New API Key</h3>
            <p className="text-sm text-slate-500">Configure access for your application</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Key Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Production Server, Mobile App"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Permissions
              </label>
              <div className="space-y-2">
                {[
                  { value: 'read', label: 'Read Only', description: 'View products, orders, and analytics' },
                  { value: 'write', label: 'Write Access', description: 'Create and update products, orders' },
                  { value: 'admin', label: 'Admin Access', description: 'Full access including API key management' }
                ].map((perm) => (
                  <label key={perm.value} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(perm.value as any)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, permissions: [...formData.permissions, perm.value as any] })
                        } else {
                          setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== perm.value) })
                        }
                      }}
                      className="mt-0.5 rounded border-slate-300 text-[#2874f0] focus:ring-[#2874f0]"
                    />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{perm.label}</p>
                      <p className="text-xs text-slate-500">{perm.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Rate Limit (requests per minute)
              </label>
              <select
                value={formData.rateLimit}
                onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg"
              >
                <option value="100">100 requests/min</option>
                <option value="500">500 requests/min</option>
                <option value="1000">1000 requests/min</option>
                <option value="2000">2000 requests/min</option>
                <option value="5000">5000 requests/min</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Expiration
              </label>
              <select
                value={formData.expiresIn}
                onChange={(e) => setFormData({ ...formData, expiresIn: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg"
              >
                <option value="never">Never expires</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={isCreating || !formData.name} className="flex-1 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold disabled:opacity-50">
                {isCreating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function APIKeyCard({ apiKey, onRevoke, onRegenerate }: { apiKey: APIKey; onRevoke: (id: string) => void; onRegenerate: (id: string) => void }) {
  const [showKey, setShowKey] = useState(false)

  const statusConfig = {
    active: { label: 'Active', icon: CheckCircle, color: '#21a056', bg: '#e8f5e9' },
    expired: { label: 'Expired', icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
    revoked: { label: 'Revoked', icon: AlertCircle, color: '#64748b', bg: '#f1f5f9' }
  }
  const config = statusConfig[apiKey.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-[#2874f0]" />
            <h3 className="font-semibold text-slate-800">{apiKey.name}</h3>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium`}
              style={{ backgroundColor: config.bg, color: config.color }}>
              <config.icon className="h-3 w-3" />
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
              {showKey ? apiKey.key : apiKey.maskedKey}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="p-1 hover:bg-slate-100 rounded">
              {showKey ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
            </button>
            <button onClick={() => navigator.clipboard.writeText(apiKey.key)} className="p-1 hover:bg-slate-100 rounded">
              <Copy className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {format(new Date(apiKey.createdAt), 'dd MMM yyyy')}</span>
            </div>
            {apiKey.lastUsed && (
              <div className="flex items-center gap-1 text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                <span>Last used: {format(new Date(apiKey.lastUsed), 'dd MMM yyyy')}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-500">
              <Activity className="h-3.5 w-3.5" />
              <span>{apiKey.usageCount.toLocaleString()} requests</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <Zap className="h-3.5 w-3.5" />
              <span>{apiKey.rateLimit}/min limit</span>
            </div>
          </div>
          {apiKey.allowedIPs.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-slate-500">Allowed IPs: {apiKey.allowedIPs.join(', ')}</p>
            </div>
          )}
          <div className="flex items-center gap-2 mt-3">
            {apiKey.permissions.map(perm => (
              <span key={perm} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full capitalize">
                {perm}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRegenerate(apiKey.id)}
            className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600"
            title="Regenerate Key"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => onRevoke(apiKey.id)}
            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600"
            title="Revoke Key"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function APIAccessPage() {
  const toast = useToast()
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)

  const handleRevokeKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.map(key => 
        key.id === id ? { ...key, status: 'revoked' } : key
      ))
      toast.success('API key revoked successfully')
    }
  }

  const handleRegenerateKey = (id: string) => {
    if (confirm('Regenerating this key will invalidate the old one. Continue?')) {
      toast.success('New API key generated')
    }
  }

  return (
    <div className="space-y-6">
      {/* API Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key className="h-4 w-4 text-[#2874f0]" />
            <span className="text-xs text-slate-500">Active Keys</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{apiKeys.filter(k => k.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-xs text-slate-500">Total Requests</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">24,867</p>
          <p className="text-xs text-green-600 mt-1">+12% this month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-purple-600" />
            <span className="text-xs text-slate-500">Rate Limit</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">1,000/min</p>
          <p className="text-xs text-slate-500 mt-1">Current usage: 23%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-slate-500">Avg Response</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">142ms</p>
          <p className="text-xs text-green-600 mt-1">-8ms from last week</p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">API Keys</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage access tokens for API integration</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold hover:bg-[#1a5fd4] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        </div>
        <div className="p-6 space-y-4">
          {apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No API keys created yet</p>
              <button className="mt-2 text-[#2874f0] text-sm">Create your first API key</button>
            </div>
          ) : (
            apiKeys.map(key => (
              <APIKeyCard
                key={key.id}
                apiKey={key}
                onRevoke={handleRevokeKey}
                onRegenerate={handleRegenerateKey}
              />
            ))
          )}
        </div>
      </div>

      {/* API Documentation Preview */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-[#2874f0]" />
            <h2 className="font-semibold text-slate-800">API Endpoints</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Available endpoints for integration</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Method</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Endpoint</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Description</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Rate Limit</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500">Auth</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockEndpoints.slice(0, 8).map((endpoint, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedEndpoint(endpoint)}>
                  <td className="px-6 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                      endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                      endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    <code className="text-sm font-mono text-slate-600">{endpoint.path}</code>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-500">{endpoint.description}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{endpoint.rateLimit}</td>
                  <td className="px-6 py-3">
                    {endpoint.authRequired ? (
                      <Key className="h-4 w-4 text-green-600" />
                    ) : (
                      <Globe className="h-4 w-4 text-slate-400" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button className="text-sm text-[#2874f0] hover:underline flex items-center gap-1">
            View Full API Documentation
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800">Webhook Configuration</h3>
            <p className="text-sm text-slate-500 mt-1">Receive real-time updates about orders, payments, and events</p>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="url"
                placeholder="https://your-domain.com/webhook"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2874f0]/30"
              />
              <button className="px-4 py-2 bg-[#2874f0] text-white rounded-lg font-semibold">Save Webhook</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {['order.created', 'order.updated', 'payment.success', 'rental.active'].map(event => (
                <label key={event} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm">
                  <input type="checkbox" className="rounded" />
                  {event}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAPIKeyModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {/* Endpoint Details Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedEndpoint(null)} />
            <div className="relative bg-white rounded-2xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold mb-2 ${
                    selectedEndpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                    selectedEndpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                    selectedEndpoint.method === 'PUT' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-lg font-mono text-slate-800 ml-2">{selectedEndpoint.path}</code>
                </div>
                <button onClick={() => setSelectedEndpoint(null)} className="p-1 hover:bg-slate-100 rounded">
                  <XCircle className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
                  <p className="text-sm text-slate-600">{selectedEndpoint.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Headers</h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <code className="text-sm font-mono">
                      Authorization: Bearer YOUR_API_KEY<br />
                      Content-Type: application/json<br />
                      Accept: application/json
                    </code>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-2">Example Request</h4>
                  <div className="bg-slate-900 rounded-lg p-3">
                    <pre className="text-xs text-green-400 font-mono overflow-x-auto">
{`curl -X ${selectedEndpoint.method} \\
  https://api.rentease.com${selectedEndpoint.path} \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}