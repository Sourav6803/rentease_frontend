
// src/components/vendor/VendorRegistrationForm.tsx (Complete fixed version)
'use client'

import { useState } from 'react'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Progress } from '@/components/ui/progress'
import { BusinessDetailsStep } from './steps/BusinessDetailsStep'
import { ContactDetailsStep } from './steps/ContactDetailsStep'
import { VerificationStep } from './steps/VerificationStep'
// import { BankDetailsStep } from './steps/BankDetailsStep'
import { TermsStep } from './steps/TermsStep'
import { Check, ChevronLeft, ChevronRight, Clock, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRAND_GRADIENT =
  'bg-[linear-gradient(135deg,var(--brand-gradient-from),var(--brand-gradient-to))]'
import { BankDetailsStep } from './steps/BankDetailsSteps'
import { vendorSchema, type VendorFormValues } from './vendor-registration-schema'
import type { FieldPath, Resolver } from 'react-hook-form'

const steps = [
  { id: 1, title: 'Business Details', description: 'Tell us about your business' },
  { id: 2, title: 'Contact Information', description: 'Your personal and login details' },
  { id: 3, title: 'Verification', description: 'Verify your business identity' },
  { id: 4, title: 'Bank Details', description: 'For payouts and settlements' },
  { id: 5, title: 'Terms & Conditions', description: 'Agree to our terms' },
]

const VENDOR_REGISTER_API =
  `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/v1/auth/vendor/register`

/** Frontend upload state keys → multer field names in upload.middleware `uploadVendorDocuments` */
const UPLOAD_KEY_TO_FIELD: Record<string, string> = {
  panCard: 'panCard',
  addressProof: 'addressProof',
  bankStatement: 'bankStatement',
  gstCertificate: 'gstCertificate',
  businessRegistration: 'businessProof',
}

/** Multipart body keys must match `vendorValidations.registerVendor` (flat + bracket nesting). */
function buildVendorRegisterFormData(
  data: VendorFormValues,
  uploadedDocuments: Record<string, File>
): FormData {
  const fd = new FormData()

  fd.append('firstName', data.firstName)
  fd.append('lastName', data.lastName)
  fd.append('email', data.email)
  fd.append('phone', data.phone)
  fd.append('password', data.password)
  fd.append('confirmPassword', data.confirmPassword)
  fd.append('businessName', data.businessName)
  fd.append('businessType', data.businessType)

  if (data.gstin?.trim()) {
    fd.append('gstin', data.gstin.trim())
  }

  fd.append('panNumber', data.panNumber)

  fd.append('address[addressLine1]', data.address.street)
  fd.append('address[city]', data.address.city)
  fd.append('address[state]', data.address.state)
  fd.append('address[pincode]', data.address.pincode)
  fd.append('address[country]', data.address.country)

  fd.append('bankDetails[accountHolderName]', data.bankDetails.accountHolderName)
  fd.append('bankDetails[accountNumber]', data.bankDetails.accountNumber)
  fd.append('bankDetails[confirmAccountNumber]', data.bankDetails.confirmAccountNumber)
  fd.append('bankDetails[ifscCode]', data.bankDetails.ifscCode)
  fd.append('bankDetails[bankName]', data.bankDetails.bankName)
  fd.append('bankDetails[accountType]', data.bankDetails.accountType)
  if (data.bankDetails.branchName?.trim()) {
    fd.append('bankDetails[branchName]', data.bankDetails.branchName.trim())
  }
  if (data.bankDetails.upiId?.trim()) {
    fd.append('bankDetails[upiId]', data.bankDetails.upiId.trim())
  }

  fd.append('termsAccepted', data.termsAccepted ? 'true' : 'false')
  fd.append('dataProcessingAccepted', data.dataProcessingAccepted ? 'true' : 'false')

  for (const [docKey, file] of Object.entries(uploadedDocuments)) {
    if (!file) continue
    const fieldName = UPLOAD_KEY_TO_FIELD[docKey] ?? docKey
    fd.append(fieldName, file)
  }

  return fd
}

export function VendorRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, File>>({})
  const router = useRouter()

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema) as Resolver<VendorFormValues>,
    defaultValues: {
      businessName: '',
      businessType: 'individual',
      gstin: '',
      foundedYear: undefined,
      description: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      panNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      bankDetails: {
        accountHolderName: '',
        accountNumber: '',
        confirmAccountNumber: '',
        ifscCode: '',
        bankName: '',
        branchName: '',
        accountType: 'savings',
        upiId: '',
        bankVerified: false,
      },
      termsAccepted: false,
      dataProcessingAccepted: false,
    },
  })

  const progress = (currentStep / steps.length) * 100

  // Handle document upload from VerificationStep
  const handleDocumentUpload = (documentId: string, file: File) => {
    setUploadedDocuments(prev => ({
      ...prev,
      [documentId]: file
    }))
  }

  // Handle document removal from VerificationStep
  const handleDocumentRemove = (documentId: string) => {
    setUploadedDocuments(prev => {
      const newState = { ...prev }
      delete newState[documentId]
      return newState
    })
  }

  const nextStep = async () => {
    let fieldsToValidate: FieldPath<VendorFormValues>[] = []
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ['businessName', 'businessType']
        break
      case 2:
        fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword']
        break
      case 3:
        fieldsToValidate = ['panNumber', 'address']

        const requiredDocKeys = ['panCard', 'addressProof', 'bankStatement']
        const hasRequiredDocs = requiredDocKeys.every(docKey => !!uploadedDocuments[docKey])
        
        if (!hasRequiredDocs) {
          // Find which documents are missing
          const missingDocs = requiredDocKeys.filter(docKey => !uploadedDocuments[docKey])
          const missingDocNames = missingDocs.map(doc => {
            switch(doc) {
              case 'panCard': return 'PAN Card'
              case 'addressProof': return 'Address Proof'
              case 'bankStatement': return 'Bank Statement'
              default: return doc
            }
          }).join(', ')
          
          toast.error('Missing Documents', {
            description: `Please upload all required documents: ${missingDocNames}`,
          })
          return
        }
        break
      case 4:
        fieldsToValidate = [
          'bankDetails.accountHolderName', 
          'bankDetails.accountNumber', 
          'bankDetails.confirmAccountNumber',
          'bankDetails.ifscCode'
        ]
        break
      case 5:
        fieldsToValidate = ['termsAccepted', 'dataProcessingAccepted']
        break
    }

    const isValid = await form.trigger(fieldsToValidate)

    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: VendorFormValues) => {
    setIsSubmitting(true)

    try {
      const formData = buildVendorRegisterFormData(data, uploadedDocuments)

      const response = await axios.post(VENDOR_REGISTER_API, formData, {
        withCredentials: true,
      })

      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Registration failed')
      }

      toast.success('Registration Submitted!', {
        description: response.data?.message || 'Please check your email to verify your account.',
        duration: 6000,
      })

      router.push('/vendor/registration-success?email=' + encodeURIComponent(data.email))
    } catch (error) {
      console.error('Registration error:', error)
      let message = 'Please try again or contact support.'
      if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: string; errors?: unknown } | undefined
        message = data?.message || error.message || message
      } else if (error instanceof Error) {
        message = error.message
      }
      toast.error('Registration Failed', { description: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div id="register" className="form-scope scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Progress header */}
      <div className="border-b border-border bg-muted/25 p-5 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand">
              Step {currentStep} of {steps.length}
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {steps[currentStep - 1].title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 sm:flex">
            <Clock className="h-3.5 w-3.5 text-brand" />
            <span className="text-[11px] font-semibold text-muted-foreground">~10 min</span>
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        {/* Stepper */}
        <ol className="mt-5 flex items-start justify-between gap-1">
          {steps.map((step) => {
            const done = currentStep > step.id
            const active = currentStep === step.id
            return (
              <li key={step.id} className="flex flex-1 flex-col items-center text-center">
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    done && 'bg-brand text-white',
                    active && 'bg-brand text-white ring-4 ring-brand/15',
                    !done && !active && 'border border-border bg-card text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : step.id}
                </span>
                <span
                  className={cn(
                    'mt-2 hidden text-[11px] font-semibold leading-tight sm:block',
                    active || done ? 'text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="p-5 sm:p-6">
            {currentStep === 1 && <BusinessDetailsStep form={form} />}
            {currentStep === 2 && <ContactDetailsStep form={form} />}
            {currentStep === 3 && (
              <VerificationStep 
                form={form}
                onDocumentUpload={handleDocumentUpload}
                onDocumentRemove={handleDocumentRemove}
                uploadedDocuments={uploadedDocuments}
              />
            )}
            {currentStep === 4 && <BankDetailsStep form={form} />}
            {currentStep === 5 && <TermsStep form={form} />}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/25 p-5 sm:p-6">
            <Button
              type="button"
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 1}
              className="gap-2 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className={`gap-2 rounded-xl text-white shadow-lg shadow-brand/20 hover:opacity-90 ${BRAND_GRADIENT}`}
              >
                Save &amp; continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`gap-2 rounded-xl text-white shadow-lg shadow-brand/20 hover:opacity-90 ${BRAND_GRADIENT}`}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Submit application
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  )
}