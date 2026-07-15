// src/app/admin/settings/admins/components/AdminDetailsModal.tsx
'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AdminDetailsModalProps {
  open: boolean
  admin: any
  onClose: () => void
}

export function AdminDetailsModal({ open, admin, onClose }: AdminDetailsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Admin Details</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {/* Details implementation */}
          <p className="text-center text-muted-foreground">Admin details view...</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}