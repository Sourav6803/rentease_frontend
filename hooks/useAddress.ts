// hooks/useAddress.ts

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Address, AddressFormData } from '@/types/address'
import { addressService } from '@/services/addressService'

interface UseAddressesOptions {
  autoFetch?: boolean
  onError?: (error: Error) => void
  onSuccess?: () => void
}

export function useAddresses(options: UseAddressesOptions = {}) {
  const { autoFetch = true, onError, onSuccess } = options

  const { data: session } = useSession()
  const accessToken = session?.user?.accessToken

  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await addressService.getAddresses(accessToken)
      setAddresses(data)
      onSuccess?.()
    } catch (err) {
      const e = err as Error
      const message = e.message || 'Failed to load addresses'
      setError(message)
      onError?.(e)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, onError, onSuccess])

  const addAddress = useCallback(async (data: AddressFormData) => {
    if (!accessToken) throw new Error('You must be signed in to add an address')
    try {
      const newAddress = await addressService.addAddress(accessToken, data)
      setAddresses((prev) => [...prev, newAddress])
      toast.success('Address added successfully')
      return newAddress
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'Failed to add address')
      throw e
    }
  }, [accessToken])

  const updateAddress = useCallback(async (id: string, data: Partial<AddressFormData>) => {
    if (!accessToken) throw new Error('You must be signed in to update an address')
    try {
      const updatedAddress = await addressService.updateAddress(accessToken, id, data)
      setAddresses((prev) =>
        prev.map((addr) => (addr._id === id ? updatedAddress : addr))
      )
      toast.success('Address updated successfully')
      return updatedAddress
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'Failed to update address')
      throw e
    }
  }, [accessToken])

  const deleteAddress = useCallback(async (id: string) => {
    if (!accessToken) throw new Error('You must be signed in to delete an address')
    try {
      await addressService.deleteAddress(accessToken, id)
      setAddresses((prev) => prev.filter((addr) => addr._id !== id))
      toast.success('Address deleted successfully')
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'Failed to delete address')
      throw e
    }
  }, [accessToken])

  const setDefaultAddress = useCallback(async (id: string) => {
    if (!accessToken) throw new Error('You must be signed in to update an address')
    try {
      await addressService.setDefaultAddress(accessToken, id)
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          isDefault: addr._id === id,
        }))
      )
      toast.success('Default address updated')
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'Failed to set default address')
      throw e
    }
  }, [accessToken])

  // Auto-load once we actually have a token (waits out the session hydration).
  useEffect(() => {
    if (autoFetch && accessToken) {
      fetchAddresses()
    }
  }, [autoFetch, accessToken, fetchAddresses])

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  }
}
