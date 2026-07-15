'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  getFcmToken,
  requestPermission,
  onForegroundMessage,
  getStoredToken,
  clearStoredToken,
  getDeviceId,
  isFirebaseWebConfigured,
} from '@/lib/pushNotifications'
import { registerPushToken, unregisterPushToken } from '@/lib/api/notifications'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const tokenRef = useRef<string | null>(null)

  // On login: ask permission, get token, register with backend, listen for messages.
  useEffect(() => {
    if (status !== 'authenticated' || !isFirebaseWebConfigured()) return

    let cancelled = false
    let unsubscribe: (() => void) | null = null

    ;(async () => {
      const permission = await requestPermission()
      if (permission !== 'granted' || cancelled) return

      const token = await getFcmToken(VAPID_KEY)
      if (!token || cancelled) return

      tokenRef.current = token

      try {
        await registerPushToken(token, 'web', { deviceId: getDeviceId() })
      } catch (err) {
        console.error('[push] backend registration failed', err)
      }

      unsubscribe = await onForegroundMessage((payload) => {
        const title = payload?.notification?.title || 'RentEase'
        const body = payload?.notification?.body || ''
        const url =
          payload?.data?.url ||
          payload?.notification?.click_action ||
          '/notifications'

        toast(title, {
          description: body,
          action: {
            label: 'View',
            onClick: () => router.push(url),
          },
        })
      })
    })()

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [status, router])

  // On logout: remove the token from the backend and local cache.
  useEffect(() => {
    if (status !== 'unauthenticated') return
    const token = getStoredToken()
    if (token) {
      unregisterPushToken(token).catch(() => {})
      clearStoredToken()
      tokenRef.current = null
    }
  }, [status])

  return <>{children}</>
}
