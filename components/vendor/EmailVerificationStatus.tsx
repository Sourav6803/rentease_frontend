// src/components/vendor/EmailVerificationStatus.tsx
'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

interface EmailVerificationStatusProps {
  /** Optional; verification link from email only includes `token` */
  email?: string
  token: string
}

export function EmailVerificationStatus({ token }: EmailVerificationStatusProps) {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Backend: GET /api/v1/auth/verify-email/:token
        const url = `${API_BASE}/api/v1/auth/verify-email/${encodeURIComponent(token)}`
        const response = await fetch(url, { method: 'GET' })
        const data = await response.json().catch(() => ({}))

        if (response.ok && data.success) {
          setStatus('success')
          setMessage(data.message || 'Email verified successfully! You can now log in.')
        } else {
          setStatus('error')
          setMessage(data.message || 'Verification failed. Please try again.')
        }
      } catch (error) {
        setStatus('error')
        setMessage('An error occurred. Please try again.')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <Card className="max-w-md mx-auto p-8 text-center">
      <div className="flex justify-center mb-4">
        {status === 'verifying' && (
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        )}
        {status === 'success' && (
          <CheckCircle className="h-12 w-12 text-green-500" />
        )}
        {status === 'error' && (
          <XCircle className="h-12 w-12 text-red-500" />
        )}
      </div>
      <h2 className="text-xl font-semibold mb-2">
        {status === 'verifying' && 'Verifying your email...'}
        {status === 'success' && 'Email Verified!'}
        {status === 'error' && 'Verification Failed'}
      </h2>
      <p className={cn(
        "text-sm",
        status === 'success' && "text-green-600",
        status === 'error' && "text-red-600"
      )}>
        {message}
      </p>
      {status === 'success' && (
        <button
          onClick={() => window.location.href = '/vendor/login'}
          className="mt-4 text-primary hover:underline"
        >
          Continue to Login →
        </button>
      )}
    </Card>
  )
}