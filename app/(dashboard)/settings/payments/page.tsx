'use client'

import { useState, useEffect } from 'react'
import { CreditCard, MapPin, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SettingsCard } from '../components'
import { useSettings } from '../use-settings'

interface PaymentMethod {
  id: string
  brand?: string
  type: string
  last4?: string
  upiId?: string
  isDefault?: boolean
}

export default function PaymentSettingsPage() {
  const { fetchPaymentMethods } = useSettings()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetchPaymentMethods().then(methods => {
      if (!isMounted) return
      setPaymentMethods(methods)
      setIsLoading(false)
    })
    return () => { isMounted = false }
  }, [fetchPaymentMethods])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SettingsCard title="Saved Payment Methods" icon={CreditCard} badge="Secure">
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </SettingsCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="Saved Payment Methods" icon={CreditCard} badge="Secure">
        {paymentMethods.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-blue-500" />
            </div>
            <p className="text-gray-500">No payment methods saved</p>
            <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25 transition-all rounded-xl">
              <Plus className="h-4 w-4 mr-2" />
              Add Payment Method
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-blue-500/30 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">{method.brand || 'Card'}</p>
                    <p className="text-sm text-gray-500">
                      {method.type === 'card' ? `**** ${method.last4}` : method.upiId}
                    </p>
                  </div>
                  {method.isDefault && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                      Default
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="Billing Address" icon={MapPin}>
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-500/5 to-purple-500/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">Default Billing Address</p>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  123 Business Park<br />
                  Sector 62, Noida<br />
                  Uttar Pradesh, 201309<br />
                  India
                </p>
              </div>
              <Button variant="link" className="text-blue-500 hover:text-blue-600 p-0 h-auto">
                Edit
              </Button>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        </div>
      </SettingsCard>
    </div>
  )
}
