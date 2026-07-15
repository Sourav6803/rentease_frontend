
// src/components/vendor/steps/VerificationStep.tsx (Updated)
'use client'

import { useState, useCallback } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  X, 
  Eye, 
  Home,
  Shield,
  Clock,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface VerificationStepProps {
  form: UseFormReturn<any>
  onDocumentUpload: (documentType: string, file: File) => void
  onDocumentRemove: (documentType: string) => void
  uploadedDocuments: Record<string, File>
}

interface DocumentType {
  id: string
  name: string
  description: string
  required: boolean
  acceptedFormats: string[]
  maxSize: number
  icon: React.ReactNode
  examples: string[]
}

const documentTypes: DocumentType[] = [
  {
    id: 'panCard',
    name: 'PAN Card',
    description: 'Permanent Account Number card of the business owner',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5,
    icon: <FileText className="h-5 w-5" />,
    examples: ['Clear photo of PAN card', 'Both front and back if applicable'],
  },
  {
    id: 'addressProof',
    name: 'Address Proof',
    description: 'Proof of business address',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5,
    icon: <Home className="h-5 w-5" />,
    examples: ['Electricity bill', 'Rent agreement', 'Trade license', 'GST certificate'],
  },
  {
    id: 'gstCertificate',
    name: 'GST Certificate',
    description: 'GST registration certificate (if applicable)',
    required: false,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5,
    icon: <FileText className="h-5 w-5" />,
    examples: ['GST registration certificate', 'GSTIN allocation letter'],
  },
  {
    id: 'businessRegistration',
    name: 'Business Registration',
    description: 'Company registration certificate',
    required: false,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5,
    icon: <FileText className="h-5 w-5" />,
    examples: ['Certificate of incorporation', 'Partnership deed', 'Shop and establishment certificate'],
  },
  {
    id: 'bankStatement',
    name: 'Bank Statement',
    description: 'Cancelled cheque or bank statement',
    required: true,
    acceptedFormats: ['PDF', 'JPG', 'PNG'],
    maxSize: 5,
    icon: <FileText className="h-5 w-5" />,
    examples: ['Cancelled cheque', 'First page of passbook', 'Bank statement with account details'],
  },
]

interface UploadedFileState {
  file: File
  preview: string
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function VerificationStep({ 
  form, 
  onDocumentUpload, 
  onDocumentRemove, 
  uploadedDocuments 
}: VerificationStepProps) {
  const [fileStates, setFileStates] = useState<Record<string, UploadedFileState>>({})
  const [uploading, setUploading] = useState<string | null>(null)
  const [panNumber, setPanNumber] = useState(form.watch('panNumber') || '')

  const handleFileUpload = useCallback(async (documentId: string, file: File) => {
    const docType = documentTypes.find(d => d.id === documentId)
    if (!docType) return

    // Validate file size
    if (file.size > docType.maxSize * 1024 * 1024) {
      setFileStates(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          status: 'error',
          error: `File size exceeds ${docType.maxSize}MB limit`,
        },
      }))
      return
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toUpperCase()
    if (!docType.acceptedFormats.includes(fileExtension || '')) {
      setFileStates(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          status: 'error',
          error: `Accepted formats: ${docType.acceptedFormats.join(', ')}`,
        },
      }))
      return
    }

    setUploading(documentId)
    
    const preview = URL.createObjectURL(file)
    
    setFileStates(prev => ({
      ...prev,
      [documentId]: {
        file,
        preview,
        progress: 0,
        status: 'uploading',
      },
    }))

    // Simulate upload progress
    const interval = setInterval(() => {
      setFileStates(prev => {
        const current = prev[documentId]
        if (!current || current.progress >= 100) {
          clearInterval(interval)
          return prev
        }
        return {
          ...prev,
          [documentId]: {
            ...current,
            progress: Math.min(current.progress + 10, 100),
            status: current.progress + 10 >= 100 ? 'success' : 'uploading',
          },
        }
      })
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setFileStates(prev => ({
        ...prev,
        [documentId]: {
          ...prev[documentId],
          progress: 100,
          status: 'success',
        },
      }))
      setUploading(null)
      onDocumentUpload(documentId, file)
      form.setValue(`documents.${documentId}`, file)
    }, 2000)

    return () => clearInterval(interval)
  }, [form, onDocumentUpload])

  const removeFile = (documentId: string) => {
    if (fileStates[documentId]?.preview) {
      URL.revokeObjectURL(fileStates[documentId].preview)
    }
    setFileStates(prev => {
      const newState = { ...prev }
      delete newState[documentId]
      return newState
    })
    onDocumentRemove(documentId)
  }

  const getDocumentStatusIcon = (documentId: string) => {
    const fileState = fileStates[documentId]
    if (!fileState) return null
    if (fileState.status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />
    if (fileState.status === 'error') return <AlertCircle className="h-5 w-5 text-red-500" />
    if (fileState.status === 'uploading') return <Loader2 className="h-5 w-5 animate-spin text-primary" />
    return null
  }

  const getOverallProgress = () => {
    const requiredDocs = documentTypes.filter(doc => doc.required)
    const uploadedRequired = requiredDocs.filter(doc => uploadedDocuments[doc.id]).length
    return (uploadedRequired / requiredDocs.length) * 100
  }

  console.log("fromm-->", form.watch())
  // Debug log to see what documents are uploaded
  console.log('Uploaded Documents in VerificationStep:', Object.keys(uploadedDocuments))
  console.log('File States:', fileStates)


  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold">Business Verification</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please provide the following documents to verify your business. This helps us maintain trust and security on our platform.
            </p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Verification Progress</span>
            <span className="font-medium">{Math.round(getOverallProgress())}%</span>
          </div>
          <Progress value={getOverallProgress()} className="h-2" />
        </div>
      </div>

      {/* PAN Number Field */}
      <FormField
        control={form.control}
        name="panNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>PAN Number *</FormLabel>
            <FormControl>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 uppercase"
                  placeholder="ABCDE1234F"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase()
                    field.onChange(value)
                    setPanNumber(value)
                  }}
                  maxLength={10}
                />
              </div>
            </FormControl>
            <FormDescription>
              Enter your 10-character alphanumeric PAN number
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* PAN Validation Tip */}
      {panNumber && panNumber.length === 10 && (
        <Alert className={cn(
          "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20",
          !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
        )}>
          <AlertCircle className={cn(
            "h-4 w-4",
            /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) ? "text-green-600" : "text-red-600"
          )} />
          <AlertDescription>
            {/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) 
              ? "✓ PAN number format looks valid" 
              : "✗ Invalid PAN number format. Format: 5 letters, 4 numbers, 1 letter"}
          </AlertDescription>
        </Alert>
      )}

      {/* Address Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <h4 className="font-semibold">Business Address</h4>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Street Address *</FormLabel>
                <FormControl>
                  <Textarea placeholder="House No., Building Name, Street Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="Mumbai" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Input placeholder="Maharashtra" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.pincode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pincode *</FormLabel>
                <FormControl>
                  <Input placeholder="400001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input {...field} disabled />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Document Upload Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Required Documents</h4>
          <Badge variant="outline" className="text-xs">
            Max size: 5MB per file
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {documentTypes.map((doc) => {
            const isUploaded = uploadedDocuments[doc.id]
            const fileState = fileStates[doc.id]
            
            return (
              <Card key={doc.id} className="relative overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        {doc.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{doc.name}</p>
                          {doc.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
                      </div>
                    </div>
                    {getDocumentStatusIcon(doc.id)}
                  </div>

                  {/* File Upload Area */}
                  {!isUploaded && !fileState && (
                    <div className="mt-3">
                      <label
                        htmlFor={`${doc.id}-upload`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {doc.acceptedFormats.join(', ')} • Max {doc.maxSize}MB
                          </p>
                        </div>
                        <input
                          id={`${doc.id}-upload`}
                          type="file"
                          className="hidden"
                          accept={doc.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(doc.id, file)
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* Uploaded File Preview */}
                  {(isUploaded || fileState) && (
                    <div className="mt-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {fileState?.file.name || (isUploaded as File)?.name || 'Uploaded file'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {fileState?.file && (fileState.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          {fileState?.status === 'uploading' && (
                            <Progress value={fileState.progress} className="h-1 mt-2" />
                          )}
                          {fileState?.error && (
                            <p className="text-xs text-red-500 mt-1">{fileState.error}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {fileState?.preview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(fileState.preview, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-500"
                            onClick={() => removeFile(doc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Examples */}
                  <details className="mt-3">
                    <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                      Accepted documents
                    </summary>
                    <ul className="mt-2 text-xs text-muted-foreground list-disc list-inside">
                      {doc.examples.map((example, idx) => (
                        <li key={idx}>{example}</li>
                      ))}
                    </ul>
                  </details>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Verification Note */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-300">
            <p className="font-medium">Verification Timeline</p>
            <p className="mt-1">
              Once you submit your application, our team will verify your documents within 2-3 business days. 
              You'll receive email updates about your verification status.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}