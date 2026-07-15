// src/app/admin/settings/sms/types/sms.types.ts

export interface TwilioSettings {
  accountSid: string
  authToken: string
  messagingServiceSid?: string
  fromNumber: string
  statusCallbackUrl?: string
  testMode: boolean
}

export interface SMSTemplate {
  id: string
  name: string
  body: string
  description: string
  variables: string[]
  category: 'verification' | 'notification' | 'alert' | 'promotional'
  isActive: boolean
  characterCount: number
  lastModified?: string
}

export interface TestSMSData {
  to: string
  template?: string
  body?: string
  variables?: Record<string, string>
}

export interface SMSLog {
  _id: string
  to: string
  from: string
  body: string
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  error?: string
  segments: number
  price: number
  sentAt: string
  deliveredAt?: string
}

export interface SMSUsage {
  totalSent: number
  totalSegments: number
  totalCost: number
  successRate: number
  dailyStats: Array<{
    date: string
    count: number
    cost: number
  }>
}