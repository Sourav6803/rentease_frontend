// components/payment/PaymentHistory.tsx
'use client'

import { useState, useEffect } from 'react'
import { usePayment, Payment } from '@/components/providers/PaymentProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight, Download, Eye } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PaymentReceipt } from './PaymentReceipt'

export function PaymentHistory() {
  const { getUserPayments, downloadReceipt } = usePayment()
  const [payments, setPayments] = useState<Payment[]>([])
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    loadPayments()
  }, [pagination.page])

  const loadPayments = async () => {
    setLoading(true)
    try {
      const data = await getUserPayments(pagination.page, 10)
      setPayments(data.payments)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      success: 'bg-emerald-100 text-emerald-700',
      pending: 'bg-amber-100 text-amber-700',
      failed: 'bg-red-100 text-red-700',
      refunded: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
    }
    return (
      <Badge className={`${colors[status as keyof typeof colors] || colors.pending} border-0 capitalize`}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No payments yet</h3>
          <p className="text-sm text-gray-500">Your payment history will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {payment.paymentNumber}
                  </span>
                  {getStatusBadge(payment.status)}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{format(new Date(payment.timestamps.initiated), 'dd MMM yyyy')}</span>
                  <span className="capitalize">{payment.type.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </span>
                  <p className="text-xs text-gray-400 capitalize">{payment.method.replace('_', ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedPayment(payment)
                      setShowReceipt(true)
                    }}
                    className="h-9 w-9 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {payment.status === 'success' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadReceipt(payment._id)}
                      className="h-9 w-9 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={pagination.page === 1}
            className="rounded-xl"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page === pagination.pages}
            className="rounded-xl"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Receipt Dialog */}
      <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-transparent border-0">
          {selectedPayment && (
            <PaymentReceipt
              paymentId={selectedPayment._id}
              onClose={() => setShowReceipt(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}