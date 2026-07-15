import { toast } from 'sonner'

export type ToastType = typeof toast

/**
 * Hook wrapper around `sonner`'s `toast` API.
 * Usage:
 *   const toast = useToast()
 *   toast('Message')
 *   toast.success('Saved')
 *   toast.error('Error')
 */
export const useToast = (): ToastType => {
  return toast
}

