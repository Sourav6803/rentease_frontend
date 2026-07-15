// app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertCircle, RefreshCw, Home, ArrowLeft, Bug, WifiOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Error types for better categorization
enum ErrorType {
  NETWORK = 'network',
  AUTH = 'authentication',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  VALIDATION = 'validation',
  RATE_LIMIT = 'rate_limit',
  UNKNOWN = 'unknown',
}

interface ErrorMetadata {
  type: ErrorType
  title: string
  message: string
  showRetry: boolean
  showHome: boolean
  showBack: boolean
  icon: React.ReactNode
}

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Error categorization function
const categorizeError = (error: Error): ErrorType => {
  const message = error.message.toLowerCase()
  const name = error.name.toLowerCase()

  if (message.includes('network') || message.includes('failed to fetch') || 
      message.includes('networkerror') || name.includes('network')) {
    return ErrorType.NETWORK
  }
  
  if (message.includes('unauthorized') || message.includes('unauthenticated') ||
      message.includes('auth') || message.includes('permission') ||
      name.includes('auth')) {
    return ErrorType.AUTH
  }
  
  if (message.includes('not found') || message.includes('404') ||
      name.includes('notfound')) {
    return ErrorType.NOT_FOUND
  }
  
  if (message.includes('validation') || message.includes('invalid') ||
      name.includes('validation')) {
    return ErrorType.VALIDATION
  }
  
  if (message.includes('too many requests') || message.includes('rate limit')) {
    return ErrorType.RATE_LIMIT
  }
  
  if (message.includes('500') || message.includes('internal server') ||
      name.includes('server')) {
    return ErrorType.SERVER
  }
  
  return ErrorType.UNKNOWN
}

// Get error metadata based on type
const getErrorMetadata = (type: ErrorType): ErrorMetadata => {
  const metadata: Record<ErrorType, ErrorMetadata> = {
    [ErrorType.NETWORK]: {
      type: ErrorType.NETWORK,
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      showRetry: true,
      showHome: true,
      showBack: true,
      icon: <WifiOff className="h-12 w-12 text-yellow-500" />,
    },
    [ErrorType.AUTH]: {
      type: ErrorType.AUTH,
      title: 'Authentication Required',
      message: 'You need to be logged in to access this page.',
      showRetry: false,
      showHome: true,
      showBack: true,
      icon: <AlertCircle className="h-12 w-12 text-orange-500" />,
    },
    [ErrorType.NOT_FOUND]: {
      type: ErrorType.NOT_FOUND,
      title: 'Page Not Found',
      message: 'The page you are looking for does not exist or has been moved.',
      showRetry: false,
      showHome: true,
      showBack: true,
      icon: <AlertCircle className="h-12 w-12 text-blue-500" />,
    },
    [ErrorType.SERVER]: {
      type: ErrorType.SERVER,
      title: 'Server Error',
      message: 'Something went wrong on our end. Please try again later.',
      showRetry: true,
      showHome: true,
      showBack: true,
      icon: <AlertCircle className="h-12 w-12 text-red-500" />,
    },
    [ErrorType.VALIDATION]: {
      type: ErrorType.VALIDATION,
      title: 'Invalid Request',
      message: 'The request could not be processed due to invalid data.',
      showRetry: true,
      showHome: true,
      showBack: true,
      icon: <AlertCircle className="h-12 w-12 text-purple-500" />,
    },
    [ErrorType.RATE_LIMIT]: {
      type: ErrorType.RATE_LIMIT,
      title: 'Too Many Requests',
      message: 'You have made too many requests. Please wait a moment and try again.',
      showRetry: true,
      showHome: true,
      showBack: true,
      icon: <AlertCircle className="h-12 w-12 text-indigo-500" />,
    },
    [ErrorType.UNKNOWN]: {
      type: ErrorType.UNKNOWN,
      title: 'Unexpected Error',
      message: 'An unexpected error occurred. Our team has been notified.',
      showRetry: true,
      showHome: true,
      showBack: true,
      icon: <Bug className="h-12 w-12 text-gray-500" />,
    },
  }

  return metadata[type]
}

// Error logging function
const logError = (error: Error & { digest?: string }, errorInfo?: Record<string, unknown>) => {
  const digest = error.digest
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Boundary:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest,
      ...errorInfo,
    })
  }

  // Log to error tracking service (e.g., Sentry, LogRocket)
  if (process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true') {
    try {
      // Example: Send to your error tracking service
      fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: error.name,
          message: error.message,
          stack: error.stack,
          digest,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          ...errorInfo,
        }),
      }).catch(console.error) // Don't let logging errors affect the user experience
    } catch (loggingError) {
      // Silent fail for logging errors
      console.error('Failed to log error:', loggingError)
    }
  }
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter()
  const errorType = categorizeError(error)
  const metadata = getErrorMetadata(errorType)
  const digest = error.digest

  useEffect(() => {
    // Log the error to your error reporting service
    logError(error, {
      type: errorType,
      url: window.location.href,
    })

    // You can also send error digest to your analytics
    if (digest) {
      // Send to analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'exception', {
          description: digest,
          fatal: false,
        })
      }
    }
  }, [error, errorType])

  // Handle authentication errors - redirect to login
  useEffect(() => {
    if (errorType !== ErrorType.AUTH) return
    const timer = window.setTimeout(() => {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      )
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [errorType, router])

  // Handle retry with exponential backoff
  const handleRetry = async () => {
    try {
      // Attempt to reset the error boundary
      reset()
      
      // If it's a network error, try with exponential backoff
      if (errorType === ErrorType.NETWORK) {
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount < maxRetries) {
          try {
            await new Promise(resolve => 
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            )
            reset()
            break
          } catch {
            retryCount++
          }
        }
      }
    } catch (retryError) {
      logError(retryError as Error, { context: 'error-retry' })
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 shadow-lg border-0 ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="text-center space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-gray-50 dark:bg-gray-900 p-4">
              {metadata.icon}
            </div>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {metadata.title}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-400">
            {metadata.message}
          </p>

          {/* Error Digest (for support) */}
          {digest && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400">
                Error ID: {digest}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            {metadata.showBack && (
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}

            {metadata.showHome && (
              <Button
                variant="outline"
                asChild
                className="gap-2"
              >
                <Link href="/">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            )}

            {metadata.showRetry && (
              <Button
                onClick={handleRetry}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
          </div>

          {/* Additional Help */}
          <div className="text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-800">
            <p>
              Need help?{' '}
              <Link 
                href="/support" 
                className="text-primary hover:underline font-medium"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}