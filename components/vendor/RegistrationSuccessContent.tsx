// src/components/vendor/RegistrationSuccessContent.tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CheckCircle, 
  Mail, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Download, 
  Share2,
  Copy,
  Check,
  Sparkles,
  Building2,
  Users,
  TrendingUp,
  Shield,
  Gift,
  Zap,
  Star
} from 'lucide-react'
import confetti from 'canvas-confetti'
import { cn } from '@/lib/utils'

export function RegistrationSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const [timeLeft, setTimeLeft] = useState(60)
  const [isResending, setIsResending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Trigger confetti animation on mount
  useEffect(() => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0 && !isEmailSent) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft, isEmailSent])

  const handleResendEmail = async () => {
    if (timeLeft > 0) return
    
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsEmailSent(true)
        setTimeLeft(60)
        setTimeout(() => setIsEmailSent(false), 3000)
      } else {
        throw new Error('Failed to resend')
      }
    } catch (error) {
      console.error('Error resending email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const nextSteps = [
    {
      icon: Mail,
      title: 'Verify Your Email',
      description: 'Check your inbox and click the verification link',
      time: 'Immediate',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Shield,
      title: 'Document Verification',
      description: 'Our team will review your documents',
      time: '2-3 business days',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Building2,
      title: 'Account Activation',
      description: 'Get notified when your account is approved',
      time: 'Email notification',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Start Selling',
      description: 'List your products and start earning',
      time: 'Immediate after approval',
      color: 'from-orange-500 to-red-500',
    },
  ]

  const stats = [
    { label: 'Active Vendors', value: '10,000+', icon: Users },
    { label: 'Monthly Rentals', value: '50,000+', icon: TrendingUp },
    { label: 'Avg. Earnings', value: '₹85,000', icon: TrendingUp },
    { label: 'Satisfaction', value: '4.8/5', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-primary/5 to-transparent blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="max-w-5xl mx-auto">
          {/* Main Success Card */}
          <Card className="relative overflow-hidden shadow-2xl border-0">
            {/* Gradient Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 opacity-10" />
            
            <div className="relative p-6 md:p-8 lg:p-12">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20" />
                  <div className="relative rounded-full bg-gradient-to-r from-green-500 to-emerald-500 p-4 shadow-lg">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>

              {/* Title and Message */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-green-600 to-slate-900 bg-clip-text text-transparent">
                  Welcome to RentEase!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Your vendor application has been successfully submitted
                </p>
              </div>

              {/* Email Verification Alert */}
              <Alert className="mb-8 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
                <Mail className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">Verify your email address</p>
                      <p className="text-sm mt-1">
                        We've sent a verification link to{' '}
                        <button
                          onClick={handleCopyEmail}
                          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                        >
                          {email}
                          {copied ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendEmail}
                      disabled={timeLeft > 0 || isResending}
                      className="gap-2 whitespace-nowrap"
                    >
                      {isResending ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                      {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Email'}
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Next Steps Timeline */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  What's Next?
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {nextSteps.map((step, index) => {
                    const Icon = step.icon
                    return (
                      <div
                        key={step.title}
                        className="relative group"
                      >
                        <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition duration-300 rounded-lg blur" />
                        <div className="relative bg-card rounded-lg p-4 border shadow-sm hover:shadow-md transition-all">
                          <div className={cn(
                            "rounded-full bg-gradient-to-r p-2 w-10 h-10 flex items-center justify-center mb-3",
                            step.color
                          )}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="font-semibold mb-1">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.description}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <Clock className="h-3 w-3" />
                            <span>{step.time}</span>
                          </div>
                          {index < nextSteps.length - 1 && (
                            <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2">
                              <ArrowRight className="h-4 w-4 text-muted-foreground/30" />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Progress Tracker */}
              <div className="mb-8 p-4 rounded-lg bg-muted/30">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Application Progress</span>
                  <span className="text-primary">Step 1 of 3</span>
                </div>
                <Progress value={33} className="h-2 mb-4" />
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-medium text-primary">✓ Email</div>
                    <div>Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Documents</div>
                    <div>Review</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Account</div>
                    <div>Activation</div>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent">
                        <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tips and Resources */}
              <div className="grid gap-4 md:grid-cols-2 mb-8">
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
                  <div className="flex items-start gap-3">
                    <Gift className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-300">Welcome Offer</p>
                      <p className="text-sm text-blue-800 dark:text-blue-300 mt-1">
                        Get 0% commission on your first 10 rentals after approval!
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20">
                  <div className="flex items-start gap-3">
                    <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-300">Quick Start Guide</p>
                      <p className="text-sm text-purple-800 dark:text-purple-300 mt-1">
                        Learn how to list products and maximize your earnings
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                  onClick={() => window.location.href = '/vendor/login'}
                >
                  Go to Login
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.location.href = '/'}
                >
                  Return to Home
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => {
                    // Download vendor guide
                    const link = document.createElement('a')
                    link.href = '/vendor-guide.pdf'
                    link.download = 'RentEase-Vendor-Guide.pdf'
                    link.click()
                  }}
                >
                  <Download className="h-4 w-4" />
                  Download Guide
                </Button>
              </div>

              {/* Help Section */}
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-sm text-muted-foreground">
                  Need help? Contact our support team at{' '}
                  <a href="mailto:support@rentease.com" className="text-primary hover:underline">
                    support@rentease.com
                  </a>
                  {' '}or call{' '}
                  <a href="tel:+919876543210" className="text-primary hover:underline">
                    +91 98765 43210
                  </a>
                </p>
              </div>
            </div>
          </Card>

          {/* Social Proof */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by 10,000+ vendors across India</p>
            <div className="flex justify-center gap-4 text-muted-foreground/50">
              <span className="text-xs">🔒 SSL Secure</span>
              <span className="text-xs">💳 PCI Compliant</span>
              <span className="text-xs">🛡️ Data Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}