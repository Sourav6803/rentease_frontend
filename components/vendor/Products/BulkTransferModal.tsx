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
import type { InventoryItem } from '../VendorInventory'

interface BulkTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: InventoryItem
  onSuccess: () => void
}

export function BulkTransferModal({
  open,
  onOpenChange,
  item,
  onSuccess
}: BulkTransferModalProps) {
  // Implementation for bulk transfer modal
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Item</DialogTitle>
          <DialogDescription>
            Transfer {item.product.basicInfo.name} to another location
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Form fields for transfer */}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSuccess}>
            Confirm Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}