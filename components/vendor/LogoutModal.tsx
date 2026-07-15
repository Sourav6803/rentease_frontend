// components/vendor/LogoutModal.tsx
'use client'

import { useState } from 'react'
import { LogOut, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  vendorName?: string
}

export function LogoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  vendorName 
}: LogoutModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="relative mx-4 rounded-xl bg-white shadow-2xl dark:bg-gray-900 animate-in fade-in zoom-in duration-200">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Title */}
            <h3 className="mt-4 text-center text-xl font-semibold text-gray-900 dark:text-gray-100">
              Log out of your account?
            </h3>

            {/* Description */}
            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              {vendorName 
                ? `Are you sure you want to log out of "${vendorName}"? You'll need to sign in again to access your vendor dashboard.`
                : 'Are you sure you want to log out? You\'ll need to sign in again to access your vendor dashboard.'
              }
            </p>

            {/* Warning for pending actions */}
            <div className="mt-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Any unsaved changes will be lost. Make sure to save your work before logging out.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all",
                  "bg-red-600 hover:bg-red-700 active:scale-[0.98]",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                  "flex items-center justify-center gap-2"
                )}
              >
                {isLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    Log out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}