// components/payment/PaymentReceipt.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePayment, Payment } from '@/components/providers/PaymentProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Download, FileText, Calendar, CreditCard, Banknote, Building2, Smartphone, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

interface PaymentReceiptProps {
  paymentId: string
  onClose?: () => void
}

export function PaymentReceipt({ paymentId, onClose }: PaymentReceiptProps) {
  const { getPayment, generateReceipt, downloadReceipt } = usePayment()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [receipt, setReceipt] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReceipt()
  }, [paymentId])

  const loadReceipt = async () => {
    setLoading(true)
    try {
      const [paymentData, receiptData] = await Promise.all([
        getPayment(paymentId),
        generateReceipt(paymentId)
      ])
      setPayment(paymentData)
      setReceipt(receiptData)
    } catch (error) {
      console.error('Failed to load receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCard className="h-4 w-4" />
      case 'upi':
        return <Smartphone className="h-4 w-4" />
      case 'net_banking':
        return <Building2 className="h-4 w-4" />
      default:
        return <Banknote className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      success: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
      pending: { color: 'bg-amber-100 text-amber-700', icon: null },
      failed: { color: 'bg-red-100 text-red-700', icon: null },
      refunded: { color: 'bg-gray-100 text-gray-700', icon: null },
    }
    const { color, icon: Icon } = config[status as keyof typeof config] || config.pending
    return (
      <Badge className={`${color} border-0 px-3 py-1`}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!payment) return null

  return (
    <Card className="max-w-2xl mx-auto shadow-xl border-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Payment Receipt</h2>
            <p className="text-indigo-200 text-sm mt-1">Receipt #{receipt?.receiptNumber || payment.paymentNumber}</p>
          </div>
          <FileText className="h-10 w-10 text-indigo-200" />
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-indigo-200">
            <Calendar className="h-4 w-4" />
            {format(new Date(payment.timestamps.completed || payment.timestamps.initiated), 'dd MMM yyyy, hh:mm a')}
          </div>
          {getStatusBadge(payment.status)}
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* Payment Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900">Payment Details</h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Number</span>
              <span className="font-mono text-sm font-medium">{payment.paymentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Transaction ID</span>
              <span className="font-mono text-sm">{payment.paymentDetails?.transactionId || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="flex items-center gap-2">
                {getPaymentIcon(payment.method)}
                {payment.method.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                {payment.paymentDetails?.cardLast4 && ` (**** ${payment.paymentDetails.cardLast4})`}
                {payment.paymentDetails?.upiId && ` (${payment.paymentDetails.upiId})`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Type</span>
              <span className="capitalize">{payment.type.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Gateway</span>
              <span className="capitalize">{payment.paymentDetails?.gateway}</span>
            </div>
          </div>
        </div>

        {/* Amount Breakdown */}
        {receipt?.breakdown && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Amount Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Base Amount</span>
                <span>₹{receipt.breakdown.baseAmount.toLocaleString()}</span>
              </div>
              {receipt.breakdown.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">GST (18%)</span>
                  <span>₹{receipt.breakdown.tax.toLocaleString()}</span>
                </div>
              )}
              {receipt.breakdown.convenienceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Convenience Fee</span>
                  <span>₹{receipt.breakdown.convenienceFee.toLocaleString()}</span>
                </div>
              )}
              {receipt.breakdown.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>-₹{receipt.breakdown.discount.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Paid</span>
                <span>₹{payment.amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Rental Info */}
        {payment.rental && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Rental Information</h3>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm">
                <span className="text-gray-500">Rental ID:</span>{' '}
                <span className="font-mono">{payment.rental.rentalNumber}</span>
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t">
          <p className="text-xs text-gray-400 text-center">
            This is a system generated receipt. For any queries, please contact support@rentease.com
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={() => downloadReceipt(paymentId)}
            variant="outline"
            className="flex-1 gap-2 rounded-xl"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="ghost" className="flex-1 rounded-xl">
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}