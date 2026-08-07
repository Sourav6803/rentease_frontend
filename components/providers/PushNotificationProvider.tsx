'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
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
import { registerPushToken, unregisterPushToken, checkPushTokenStatus } from '@/lib/api/notifications'
import { initNotificationSound, playNotificationSound } from '@/lib/notificationSound'
import { showPushToast } from '@/components/notifications/PushToast'

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ''

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const accessToken = session?.user?.accessToken
  const router = useRouter()
  const tokenRef = useRef<string | null>(null)

  // Unlock the notification chime on the first user gesture (browsers block
  // audio until then). Safe to run for every session state.
  useEffect(() => {
    initNotificationSound()
  }, [])

  // On login: ensure a push token exists, then listen for messages.
  useEffect(() => {
    if (status !== 'authenticated' || !isFirebaseWebConfigured()) return

    let cancelled = false
    let unsubscribe: (() => void) | null = null

    // Attach the foreground listener that renders the branded in-app toast.
    const attachForegroundListener = async () => {
      unsubscribe = await onForegroundMessage((payload) => {
        const title = payload?.notification?.title || 'RentEase'
        const body = payload?.notification?.body || ''
        const url =
          payload?.data?.url ||
          payload?.notification?.click_action ||
          '/notifications'
        const category = payload?.data?.type || payload?.data?.category
        const image = payload?.notification?.image || payload?.data?.imageUrl

        // Audible cue, like major e-commerce apps.
        playNotificationSound()

        // Branded, production-grade in-app toast (Flipkart/Amazon style).
        showPushToast({
          title,
          body,
          url: url === 'FLUTTER_NOTIFICATION_CLICK' ? '/notifications' : url,
          category,
          image,
          onView: (target) => router.push(target),
        })
      })
    }

    ;(async () => {
      // Check whether an active token already exists for this device (stable
      // per-browser deviceId). When true, skip the permission prompt and token
      // generation entirely — the backend already has a usable subscription.
      const deviceId = getDeviceId()
      try {
        const { exists } = await checkPushTokenStatus(deviceId, accessToken)
        if (cancelled) return
        if (exists) {
          console.log('[push] Active token already registered for this device')
          await attachForegroundListener()
          return
        }
      } catch (err) {
        // Status check failed (network / not authed) — fall through to
        // regenerate. Non-critical.
        console.warn('[push] status check failed, will regenerate', err)
      }

      // No active token for this device — generate and register a new one.
      const permission = await requestPermission()
      if (permission !== 'granted' || cancelled) return

      const token = await getFcmToken(VAPID_KEY)
      if (!token || cancelled) return

      tokenRef.current = token

      try {
        await registerPushToken(token, 'web', { deviceId }, accessToken)
      } catch (err) {
        console.error('[push] backend registration failed', err)
      }

      if (cancelled) return
      await attachForegroundListener()
    })()

    return () => {
      cancelled = true
      if (unsubscribe) unsubscribe()
    }
  }, [status, router, accessToken])

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
