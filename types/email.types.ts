// src/app/admin/settings/email/types/email.types.ts

export interface SMTPSettings {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
  fromEmail: string
  fromName: string
  replyTo?: string
  testMode: boolean
}

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  template: string
  description: string
  variables: string[]
  lastModified?: string
  isActive: boolean
}

export interface TestEmailData {
  to: string
  subject: string
  template?: string
  data?: Record<string, any>
}

export interface EmailLog {
  _id: string
  to: string
  subject: string
  template?: string
  status: 'sent' | 'failed' | 'pending'
  error?: string
  sentAt: string
  previewUrl?: string
}