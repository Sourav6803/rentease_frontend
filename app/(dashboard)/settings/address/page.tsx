// app/(dashboard)/settings/address/page.tsx

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AddressList } from '@/components/address/AddressList'
import { useAddresses } from '@/hooks/useAddress'

export default function SettingsAddressPage() {
  const { status } = useSession()
  const router = useRouter()

  const {
    addresses,
    isLoading,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    fetchAddresses,
  } = useAddresses({
    autoFetch: status === 'authenticated',
  })

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/settings/address')
    return null
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                Manage Addresses
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Add, edit, or remove your saved addresses
              </p>
            </div>
          </div>

          {/* Address List */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <AddressList
              addresses={addresses}
              isLoading={isLoading}
              onAddAddress={addAddress}
              onUpdateAddress={updateAddress}
              onDeleteAddress={deleteAddress}
              onSetDefaultAddress={setDefaultAddress}
              onAddressUpdate={fetchAddresses}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}