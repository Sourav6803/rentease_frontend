'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useToast } from '@/hooks/useToast'
import type { InventoryItem } from './VendorInventory'

interface StockAdjustModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function StockAdjustModal({
  open,
  onOpenChange,
  item,
  onSuccess
}: StockAdjustModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [operation, setOperation] = useState<'add' | 'remove'>('add')
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // API call to adjust stock
      // await axios.patch(...)
      toast.success(`Stock ${operation === 'add' ? 'added' : 'removed'} successfully`)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      toast.error('Failed to adjust stock')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
          <DialogDescription>
            Add or remove stock for {item.product.basicInfo.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Form fields */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}