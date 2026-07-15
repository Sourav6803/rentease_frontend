// src/components/vendor/steps/TermsStep.tsx
'use client'

import { useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { FormField, FormItem, FormControl, FormMessage, FormLabel, FormDescription } from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Scale, 
  Shield, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Printer,
  Download
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TermsStepProps {
  form: UseFormReturn<any>
}

interface TermSection {
  id: string
  title: string
  icon: React.ReactNode
  content: string[]
}

const termSections: TermSection[] = [
  {
    id: 'introduction',
    title: 'Introduction & Scope',
    icon: <FileText className="h-4 w-4" />,
    content: [
      'These Terms and Conditions govern the relationship between RentEase and vendors using our platform.',
      'By registering as a vendor, you agree to comply with all applicable laws and regulations.',
      'RentEase provides a marketplace connecting vendors with customers for rental services.',
      'These terms may be updated from time to time, with notice provided to vendors.',
    ],
  },
  {
    id: 'commission',
    title: 'Commission & Payments',
    icon: <DollarSign className="h-4 w-4" />,
    content: [
      'RentEase charges a commission fee of 10% on each successful rental transaction.',
      'Payouts are processed weekly, with a minimum payout threshold of ₹500.',
      'Payment processing fees (if any) will be deducted from the total rental amount.',
      'Vendors are responsible for applicable taxes including GST on their earnings.',
      'Commission rates may be revised with 30 days prior notice to vendors.',
    ],
  },
  {
    id: 'responsibilities',
    title: 'Vendor Responsibilities',
    icon: <Users className="h-4 w-4" />,
    content: [
      'Maintain accurate and up-to-date product listings with clear descriptions and photos.',
      'Ensure all products listed are safe, functional, and as described.',
      'Respond to customer inquiries within 24 hours.',
      'Process and fulfill orders in a timely manner as per the agreed timeline.',
      'Handle returns, exchanges, and customer complaints professionally.',
      'Maintain appropriate insurance coverage for rented items.',
      'Comply with all applicable laws regarding product safety and consumer protection.',
    ],
  },
  {
    id: 'policies',
    title: 'Cancellation & Refund Policies',
    icon: <Clock className="h-4 w-4" />,
    content: [
      'Vendors must adhere to RentEase\'s cancellation policy framework.',
      'Full refund for cancellations made 48 hours before rental start time.',
      '50% refund for cancellations made 24-48 hours before rental start time.',
      'No refund for cancellations within 24 hours of rental start time.',
      'Vendors may offer more flexible policies but cannot impose stricter terms.',
      'Security deposits are refundable as per the agreed terms.',
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance & Legal',
    icon: <Scale className="h-4 w-4" />,
    content: [
      'Vendors must comply with all applicable local, state, and central laws.',
      'Obtain necessary business licenses and permits for operations.',
      'Maintain proper records for tax and regulatory purposes.',
      'RentEase reserves the right to suspend accounts violating platform policies.',
      'Vendors are responsible for resolving disputes directly with customers.',
      'RentEase may mediate disputes but is not liable for vendor-customer conflicts.',
    ],
  },
  {
    id: 'security',
    title: 'Data Security & Privacy',
    icon: <Shield className="h-4 w-4" />,
    content: [
      'Vendors must comply with applicable data protection laws.',
      'Customer information should only be used for transaction fulfillment.',
      'Vendors must not share customer data with third parties without consent.',
      'RentEase implements security measures to protect all platform data.',
      'Any data breach must be reported to RentEase immediately.',
      'Vendors must maintain their own security measures for business data.',
    ],
  },
]

export function TermsStep({ form }: TermsStepProps) {
  const [activeTab, setActiveTab] = useState('introduction')
  const [allChecked, setAllChecked] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const progress = (element.scrollTop / (element.scrollHeight - element.clientHeight)) * 100
    setScrollProgress(progress)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Generate PDF of terms (in production, use a PDF generation library)
    const termsText = termSections.map(section => 
      `${section.title}\n${section.content.join('\n')}\n`
    ).join('\n')
    
    const blob = new Blob([termsText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'RentEase-Vendor-Terms.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAcceptAll = () => {
    form.setValue('termsAccepted', true)
    form.setValue('dataProcessingAccepted', true)
    form.setValue('commissionAccepted', true)
    setAllChecked(true)
  }

  const handleRejectAll = () => {
    form.setValue('termsAccepted', false)
    form.setValue('dataProcessingAccepted', false)
    form.setValue('commissionAccepted', false)
    setAllChecked(false)
  }

  console.log("from terms",form.getValues())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20 p-4">
        <div className="flex items-start gap-3">
          <Scale className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <h3 className="font-semibold">Vendor Terms & Conditions</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Please review the following terms carefully before proceeding. These terms outline your rights and obligations as a RentEase vendor.
            </p>
          </div>
        </div>
      </div>

      {/* Terms Content */}
      <Card className="overflow-hidden">
        <div className="border-b p-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRejectAll}
              className="text-red-600 hover:text-red-700"
            >
              Reject All
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAcceptAll}
              className="gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Accept All
            </Button>
          </div>
        </div>

        <div className="relative">
          {/* Scroll Progress Indicator */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 h-auto overflow-x-auto">
              {termSections.map((section) => (
                <TabsTrigger
                  key={section.id}
                  value={section.id}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2 py-3"
                >
                  {section.icon}
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>

            <ScrollArea className="h-[400px] p-6" onScroll={handleScroll}>
              {termSections.map((section) => (
                <TabsContent key={section.id} value={section.id} className="m-0">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      {section.icon}
                      {section.title}
                    </h4>
                    <ul className="space-y-3">
                      {section.content.map((item, idx) => (
                        <li key={idx} className="flex gap-3 text-sm text-muted-foreground">
                          <span className="text-primary mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>
              ))}
            </ScrollArea>
          </Tabs>
        </div>
      </Card>

      {/* Acceptance Checkboxes */}
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="termsAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium">
                  I agree to the Terms and Conditions *
                </FormLabel>
                <FormDescription>
                  I have read, understood, and agree to be bound by RentEase's Vendor Terms and Conditions.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dataProcessingAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium">
                  I agree to Data Processing Terms *
                </FormLabel>
                <FormDescription>
                  I consent to the collection, processing, and storage of my business and personal data as outlined in the Privacy Policy.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="commissionAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-medium">
                  I acknowledge the Commission Structure *
                </FormLabel>
                <FormDescription>
                  I understand that RentEase charges a commission of 10% on all successful rentals, and payouts are processed weekly.
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      </div>

      {/* Acknowledgement Note */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-800 dark:text-amber-300">
            <p className="font-medium">Legal Acknowledgement</p>
            <p className="mt-1">
              By accepting these terms, you confirm that you have the authority to bind your business to this agreement.
              These terms constitute a legally binding agreement between you and RentEase.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Summary of Key Terms</p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1">
              <li>✓ 10% commission on all rentals</li>
              <li>✓ Weekly payouts with ₹500 minimum threshold</li>
              <li>✓ 24-hour response time to customer inquiries</li>
              <li>✓ Compliance with all applicable laws and regulations</li>
              <li>✓ Data protection and privacy obligations</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  )
}