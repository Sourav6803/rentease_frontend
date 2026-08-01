// components/address/AddressList.tsx

'use client'

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Address, AddressFormData } from '@/types/address'
import { AddressCard } from './AddressCard'
import { AddressForm } from './AddressForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface AddressListProps {
  addresses: Address[]
  isLoading?: boolean
  onAddAddress: (data: AddressFormData) => Promise<Address | void>
  onUpdateAddress: (id: string, data: Partial<AddressFormData>) => Promise<Address | void>
  onDeleteAddress: (id: string) => Promise<void>
  onSetDefaultAddress: (id: string) => Promise<void>
  className?: string
  showActions?: boolean
  onAddressUpdate?: () => void
}

export function AddressList({
  addresses,
  isLoading = false,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  className = '',
  showActions = true,
  onAddressUpdate,
}: AddressListProps) {
  const [showFormDialog, setShowFormDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleOpenAddForm = () => {
    setEditingAddress(null)
    setShowFormDialog(true)
  }

  const handleOpenEditForm = (address: Address) => {
    setEditingAddress(address)
    setShowFormDialog(true)
  }

  const handleCloseForm = () => {
    setShowFormDialog(false)
    setEditingAddress(null)
  }

  const handleFormSubmit = async (data: AddressFormData) => {
    setIsSubmitting(true)
    try {
      if (editingAddress) {
        await onUpdateAddress(editingAddress._id, data)
      } else {
        await onAddAddress(data)
      }
      handleCloseForm()
      onAddressUpdate?.()
    } catch (error) {
      console.error('Failed to save address:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (!deleteId) return
    try {
      await onDeleteAddress(deleteId)
      onAddressUpdate?.()
    } catch (error) {
      console.error('Failed to delete address:', error)
    } finally {
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-slate-100"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-100 rounded"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-100 rounded"></div>
              <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className={className}>
        {showActions && (
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Saved addresses</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved
              </p>
            </div>
            <Button
              onClick={handleOpenAddForm}
              className="gap-2 rounded-xl h-9 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
              variant="ghost"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add address
            </Button>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-sm text-slate-500 mb-3">
              No addresses saved yet — add one to speed up checkout.
            </p>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenAddForm}
                className="text-blue-700 hover:text-blue-800"
              >
                Add your first address →
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDelete}
                  onSetDefault={onSetDefaultAddress}
                />
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Address Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="max-w-md bg-white border-slate-200 rounded-2xl max-h-[88vh] overflow-y-auto m-1">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-slate-900">
              {editingAddress ? 'Edit address' : 'Add new address'}
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              {editingAddress ? 'Update your address details' : 'Fill in your address details'}
            </DialogDescription>
          </DialogHeader>
          <AddressForm
            initialData={editingAddress || undefined}
            onSubmit={handleFormSubmit}
            onCancel={handleCloseForm}
            isLoading={isSubmitting}
            submitLabel={editingAddress ? 'Update address' : 'Save address'}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-white border-slate-200 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900">Delete address?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              This address will be removed from your saved addresses. You can always add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}