// src/app/admin/settings/api-keys/types/api-keys.types.ts

export interface APIKey {
  _id: string
  name: string
  key: string
  secret?: string
  permissions: string[]
  rateLimit: {
    enabled: boolean
    limit: number
    window: number
  }
  allowedIPs: string[]
  allowedDomains: string[]
  expiresAt?: string
  lastUsedAt?: string
  usageCount: number
  status: 'active' | 'revoked' | 'expired'
  createdBy: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateAPIKeyData {
  name: string
  permissions: string[]
  rateLimit: {
    enabled: boolean
    limit: number
    window: number
  }
  allowedIPs: string[]
  allowedDomains: string[]
  expiresInDays?: number
}

export interface APIKeyStats {
  totalKeys: number
  activeKeys: number
  revokedKeys: number
  expiredKeys: number
  totalRequests: number
  averageRequestsPerDay: number
  topKeys: Array<{
    keyId: string
    name: string
    usageCount: number
  }>
  usageByDay: Array<{
    date: string
    count: number
  }>
}

export interface APIKeyUsage {
  _id: string
  keyId: string
  endpoint: string
  method: string
  ipAddress: string
  userAgent: string
  statusCode: number
  responseTime: number
  timestamp: string
}