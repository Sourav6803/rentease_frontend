// src/app/admin/settings/types/settings.types.ts

export interface SystemSettings {
  siteName: string
  siteDescription: string
  siteLogo: string
  favicon: string
  contactEmail: string
  supportEmail: string
  supportPhone: string
  address: {
    street: string
    city: string
    state: string
    pincode: string
    country: string
  }
  socialLinks: {
    facebook: string
    twitter: string
    instagram: string
    linkedin: string
    youtube: string
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string[]
    googleAnalyticsId: string
    googleTagManagerId: string
  }
}

export interface EmailSettings {
  smtp: {
    host: string
    port: number
    secure: boolean
    user: string
    password: string
    fromEmail: string
    fromName: string
  }
  templates: {
    welcome: {
      subject: string
      body: string
    }
    verification: {
      subject: string
      body: string
    }
    rentalConfirmation: {
      subject: string
      body: string
    }
    paymentReceipt: {
      subject: string
      body: string
    }
  }
  notifications: {
    adminAlerts: boolean
    vendorAlerts: boolean
    userAlerts: boolean
    systemAlerts: boolean
  }
}

export interface PaymentSettings {
  razorpay: {
    keyId: string
    keySecret: string
    webhookSecret: string
  }
  stripe: {
    publishableKey: string
    secretKey: string
    webhookSecret: string
  }
  commission: {
    defaultRate: number
    maxRate: number
    minRate: number
    specialRates: Array<{
      vendorId: string
      rate: number
      validUntil: string
    }>
  }
  payout: {
    schedule: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    minimumAmount: number
    processingFee: number
    taxRate: number
  }
}

export interface SecuritySettings {
  authentication: {
    twoFactorRequired: boolean
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  compliance: {
    gdprEnabled: boolean
    dataRetentionDays: number
    auditLogRetention: number
    privacyPolicyUrl: string
    termsUrl: string
  }
  api: {
    rateLimit: number
    rateLimitWindow: number
    allowedOrigins: string[]
    apiKeys: Array<{
      name: string
      key: string
      permissions: string[]
      expiresAt: string
    }>
  }
}

export interface IntegrationSettings {
  google: {
    mapsApiKey: string
    recaptchaSiteKey: string
    recaptchaSecretKey: string
    analyticsId: string
  }
  sms: {
    provider: 'twilio' | 'msg91' | 'none'
    apiKey: string
    senderId: string
  }
  storage: {
    provider: 'aws' | 'cloudinary' | 'local'
    bucketName: string
    region: string
    accessKey: string
    secretKey: string
  }
  cdn: {
    enabled: boolean
    url: string
  }
}