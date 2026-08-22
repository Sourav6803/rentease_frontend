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
  isIosWebPushUnavailable,
  FALLBACK_VAPID_KEY,
} from '@/lib/pushNotifications'
import { registerPushToken, unregisterPushToken, checkPushTokenStatus } from '@/lib/api/notifications'
import { initNotificationSound, playNotificationSound } from '@/lib/notificationSound'
import { showPushToast } from '@/components/notifications/PushToast'

// Falls back to the public web-push key so production works even if the
// NEXT_PUBLIC_* build-time env var is missing (it is inlined at build time).
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || FALLBACK_VAPID_KEY

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

        playNotificationSound()

        if ('Notification' in window && Notification.permission === 'granted') {
          try {
            navigator.serviceWorker.ready.then(reg => {
              reg.showNotification(title, {
                body,
                icon: '/logo.png',
                badge: '/badge.png',
                image,
                tag: payload?.data?.notificationId,
                data: { url: url === 'FLUTTER_NOTIFICATION_CLICK' ? '/notifications' : url }
              } as any)
            })
          } catch (err) {
            console.warn('[push] Foreground system notification failed', err)
          }
        }

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
      // iOS (16.4+) only allows web push from an installed standalone PWA; in a
      // plain Safari tab requestPermission()/getToken() cannot succeed, so skip
      // silently instead of firing a prompt that will always fail. (A UI nudge
      // to "Add to Home Screen" can hook into isIosWebPushUnavailable() too.)
      if (isIosWebPushUnavailable()) {
        console.info('[push] iOS web push requires installing the app to the home screen — skipping')
        return
      }

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

  // Detect OS/browser-level permission revocation. The main effect only checks
  // permission once at login; if the user later turns notifications off in
  // system/browser settings, our stored token becomes a dead subscription the
  // backend keeps pushing to. Re-check when the tab regains focus (and via the
  // Permissions API where supported) and clean up the token when it's gone.
  useEffect(() => {
    if (status !== 'authenticated' || typeof window === 'undefined') return
    if (!('Notification' in window)) return

    let permStatus: PermissionStatus | null = null

    const handleRevocation = () => {
      if (Notification.permission === 'granted') return
      const token = getStoredToken()
      if (token) {
        unregisterPushToken(token, accessToken).catch(() => {})
        clearStoredToken()
        tokenRef.current = null
      }
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') handleRevocation()
    }

    document.addEventListener('visibilitychange', onVisible)

    // Permissions API gives an immediate onchange signal on browsers that
    // support querying the 'notifications' permission (Chromium, Firefox).
    const perms = (navigator as Navigator & { permissions?: Permissions }).permissions
    if (perms?.query) {
      perms
        .query({ name: 'notifications' as PermissionName })
        .then((ps) => {
          permStatus = ps
          ps.onchange = handleRevocation
        })
        .catch(() => {})
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      if (permStatus) permStatus.onchange = null
    }
  }, [status, accessToken])

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
