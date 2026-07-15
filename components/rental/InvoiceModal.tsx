// components/rental/InvoiceModal.tsx
'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, Printer, Share2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { format } from 'date-fns'
import { Separator } from '../ui/separator'
import Image from 'next/image'
import Logo from '../../app/icon.svg'

interface InvoiceModalProps {
  open: boolean
  onClose: () => void
  rentalId: string
  rentalNumber: string
  accessToken: string
}

interface InvoiceData {
  invoiceNumber: string
  date: string
  rental: {
    number: string
    startDate: string
    endDate: string
    status: string
  }
  customer: {
    name: string
    email: string
    phone: string
  }
  vendor: {
    name: string
    gstin: string
  }
  product: {
    name: string
    sku: string
  }
  charges: {
    monthlyRent: number
    tenureMonths: number
    subtotal: number
    discount: number
    securityDeposit: number
    deliveryCharges: number
    total: number
    paid: number
    due: number
  }
  payments: Array<{
    date: string
    amount: number
    method: string
    status: string
  }>
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatDate = (date: string): string => {
  return format(new Date(date), 'dd MMM yyyy')
}

const formatDateTime = (date: string): string => {
  return format(new Date(date), 'dd MMM yyyy, hh:mm a')
}

export function InvoiceModal({ open, onClose, rentalId, rentalNumber, accessToken }: InvoiceModalProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (open && rentalId) {
      fetchInvoice()
    }
  }, [open, rentalId])

  const fetchInvoice = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/rentals/${rentalId}/invoice`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )
      
      if (response.data.success) {
        setInvoice(response.data.data.invoice)
      } else {
        toast.error('Failed to load invoice')
      }
    } catch (error) {
      console.error('Error fetching invoice:', error)
      toast.error('Failed to load invoice')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/rentals/${rentalId}/invoice/download`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: 'blob'
        }
      )
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${rentalNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Invoice downloaded successfully')
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    const printContent = document.getElementById('invoice-content')
    if (printContent) {
      const originalTitle = document.title
      document.title = `Invoice-${rentalNumber}`
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice ${rentalNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
      document.title = originalTitle
    }
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogTitle>Loading</DialogTitle>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!invoice) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl sm:min-w-[400px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Invoice Details</DialogTitle>
          <div className="flex gap-2 no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              disabled={isDownloading}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-1" />
              )}
              Download PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div id="invoice-content" className="space-y-6">
          {/* Header */}

          <div className="text-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <div className="inline-flex items-center gap-3  from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl px-6 py-3 shadow-sm">
                
                <div className="flex flex-col items-center">
                    <div className='flex items-center gap-1'>
                        <Image src={Logo} alt='RentEase Logo' width={24} height={24} />
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                            RentEase
                        </h1>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium tracking-wider">
                        FURNITURE & APPLIANCE RENTALS
                    </p>
                </div>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verified GST</span>
                </div>
                <div className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Est. 2024</span>
                </div>
            </div>
          </div>

          {/* Invoice Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">TAX INVOICE</h2>
            <p className="text-gray-500">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-400">Date: {formatDateTime(invoice.date)}</p>
          </div>

          {/* Vendor & Customer Details */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">Vendor Details</h3>
              <div className="text-sm text-gray-600">
                <p>{invoice.vendor.name}</p>
                <p className="text-xs">GST: {invoice.vendor.gstin}</p>
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
              <div className="text-sm text-gray-600">
                <p>{invoice.customer.name}</p>
                <p>{invoice.customer.email}</p>
                <p>{invoice.customer.phone}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rental Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Rental Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Rental Number:</span>
                <p className="font-mono">{invoice.rental.number}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <p className="capitalize">{invoice.rental.status}</p>
              </div>
              <div>
                <span className="text-gray-500">Start Date:</span>
                <p>{formatDate(invoice.rental.startDate)}</p>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <p>{formatDate(invoice.rental.endDate)}</p>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Product Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Product Name:</span>
                <p>{invoice.product.name}</p>
              </div>
              <div>
                <span className="text-gray-500">SKU:</span>
                <p className="font-mono text-xs">{invoice.product.sku}</p>
              </div>
            </div>
          </div>

          {/* Charges Breakdown */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Charges Breakdown</h3>
            <table className="w-full text-sm">
              <tbody className="space-y-2">
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Monthly Rent</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.charges.monthlyRent)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Tenure (Months)</td>
                  <td className="py-2 text-right">{invoice.charges.tenureMonths}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Subtotal</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.charges.subtotal)}</td>
                </tr>
                {invoice.charges.discount > 0 && (
                  <tr className="border-b">
                    <td className="py-2 text-gray-500">Discount</td>
                    <td className="py-2 text-right text-green-600">-{formatCurrency(invoice.charges.discount)}</td>
                  </tr>
                )}
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Security Deposit</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.charges.securityDeposit)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 text-gray-500">Delivery Charges</td>
                  <td className="py-2 text-right">{formatCurrency(invoice.charges.deliveryCharges)}</td>
                </tr>
                <tr className="border-b font-bold">
                  <td className="py-3 text-gray-900">Total Amount</td>
                  <td className="py-3 text-right">{formatCurrency(invoice.charges.total)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-green-600">Amount Paid</td>
                  <td className="py-2 text-right text-green-600">{formatCurrency(invoice.charges.paid)}</td>
                </tr>
                {invoice.charges.due > 0 && (
                  <tr>
                    <td className="py-2 text-red-600">Amount Due</td>
                    <td className="py-2 text-right text-red-600">{formatCurrency(invoice.charges.due)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          {invoice.payments.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Payment History</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Method</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.payments.map((payment, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{formatDate(payment.date)}</td>
                      <td className="py-2">{formatCurrency(payment.amount)}</td>
                      <td className="py-2 capitalize">{payment.method.replace(/_/g, ' ')}</td>
                      <td className="py-2">
                        <span className="capitalize text-green-600">{payment.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 mt-6 text-center text-xs text-gray-400">
            <p>This is a computer-generated invoice and does not require a physical signature.</p>
            <p className="mt-1">For any queries, please contact support@rentease.com or call +91 1800-123-4567</p>
            <p className="mt-2">Thank you for choosing RentEase!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}