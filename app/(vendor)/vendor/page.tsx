// src/app/vendor/page.tsx (Dashboard redirect based on status)
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Clock, Shield, Mail, Phone, MapPin, Building2, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

// Status Screen Components
function PendingVerificationScreen({ vendor, onRefresh }: { vendor: any; onRefresh: () => void }) {
  const [uploadedDocs, setUploadedDocs] = useState([])
  const requiredDocs = [
    { key: 'pan_card', label: 'PAN Card', required: true },
    { key: 'gst_certificate', label: 'GST Certificate', required: true },
    { key: 'address_proof', label: 'Address Proof', required: true },
    { key: 'bank_statement', label: 'Bank Statement', required: true },
    { key: 'business_registration', label: 'Business Registration', required: false },
  ]

  const uploadedCount = vendor?.verification?.documents?.length || 0
  const requiredCount = requiredDocs.filter(d => d.required).length
  const completionPercentage = (uploadedCount / requiredCount) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Status Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-4">
            <Clock className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold">Account Pending Verification</h1>
          <p className="text-muted-foreground mt-2">
            Your vendor application is under review by our admin team
          </p>
        </div>

        {/* Progress Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Document Submission Progress</span>
              <span className="font-semibold">{uploadedCount}/{requiredCount} Documents</span>
            </div>
            <Progress value={completionPercentage} className="h-2 mb-4" />
            <div className="grid gap-2">
              {requiredDocs.map(doc => {
                const isUploaded = vendor?.verification?.documents?.some((d:any )=> d.type === doc.key)
                return (
                  <div key={doc.key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      {isUploaded ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                      <span className="text-sm">{doc.label}</span>
                      {doc.required && <Badge variant="outline" className="text-xs">Required</Badge>}
                    </div>
                    {!isUploaded && (
                      <Button variant="ghost" size="sm" onClick={() => document.getElementById(`upload-${doc.key}`)?.click()}>
                        Upload
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Application Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Application Submitted</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(vendor?.createdAt), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium">Document Verification</p>
                  <p className="text-sm text-muted-foreground">In progress - {uploadedCount}/{requiredCount} documents uploaded</p>
                </div>
              </div>
              <div className="flex gap-3 opacity-50">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Account Activation</p>
                  <p className="text-sm text-muted-foreground">Pending admin approval</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">What happens next?</p>
                <p className="text-sm text-blue-700 mt-1">
                  Once your documents are verified, you'll receive an email notification. 
                  The verification process typically takes 2-3 business days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function RejectedVerificationScreen({ vendor }: { vendor: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-4">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold">Application Declined</h1>
          <p className="text-muted-foreground mt-2">
            Your vendor application has been reviewed and declined
          </p>
        </div>

        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-lg text-red-800">Reason for Rejection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{vendor?.verification?.rejectionReason || 'No specific reason provided. Please contact support.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What can you do?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Contact Support
            </Button>
            <Button className="w-full">
              Submit New Application
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SuspendedVerificationScreen({ vendor }: { vendor: any }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-4">
            <AlertCircle className="h-10 w-10 text-orange-600" />
          </div>
          <h1 className="text-2xl font-bold">Account Suspended</h1>
          <p className="text-muted-foreground mt-2">
            Your vendor account has been temporarily suspended
          </p>
        </div>

        <Card className="mb-6 border-orange-200">
          <CardHeader>
            <CardTitle className="text-lg text-orange-800">Suspension Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">{vendor?.status?.blockReason || 'Contact support for more information.'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Need Assistance?</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Limited Dashboard for Pending Vendors
function LimitedDashboard({ vendor }: { vendor: any }) {
  const stats = [
    { label: 'Application Status', value: 'Pending Review', icon: Clock, color: 'text-amber-500' },
    { label: 'Documents', value: `${vendor?.verification?.documents?.length || 0} Uploaded`, icon: FileText, color: 'text-blue-500' },
    { label: 'Response Time', value: '2-3 Days', icon: Shield, color: 'text-green-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor Portal</h1>
        <p className="text-muted-foreground">Limited access mode - Account pending verification</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(stat => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Business Name</p>
              <p className="font-medium">{vendor?.business?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Business Type</p>
              <p className="font-medium capitalize">{vendor?.business?.businessType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{vendor?.contact?.primaryEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{vendor?.contact?.primaryPhone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Limited Access Mode</p>
              <p className="text-sm text-amber-700 mt-1">
                You're in read-only mode while your account is being verified. 
                Product management and rental features will be available after verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Main Vendor Page with Status-based Rendering
export default function VendorPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [vendor, setVendor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/vendor/login')
    }
    if (sessionStatus === 'authenticated') {
      fetchVendorStatus()
    }
  }, [sessionStatus])

  const fetchVendorStatus = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
        headers: { Authorization: `Bearer ${session?.user?.accessToken}` }
      })
      if (response.data.success) {
        setVendor(response.data.data.profile)
      }
    } catch (error) {
      console.error('Error fetching vendor:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (sessionStatus === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // const status = vendor?.verification?.status
  const status = (vendor as any)?.verification?.status;

  // Render based on verification status
  switch (status) {
    case 'pending':
      return <PendingVerificationScreen vendor={vendor} onRefresh={fetchVendorStatus} />
    
    case 'rejected':
      return <RejectedVerificationScreen vendor={vendor} />
    
    case 'suspended':
      return <SuspendedVerificationScreen vendor={vendor} />
    
    case 'verified':
      // Show full vendor dashboard
      return <LimitedDashboard vendor={vendor} />
    
    default:
      return <PendingVerificationScreen vendor={vendor} onRefresh={fetchVendorStatus} />
  }
}


