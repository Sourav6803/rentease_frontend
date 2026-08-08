'use client'

/**
 * Client-side Firebase Cloud Messaging helpers for the RentEase web app.
 *
 * Everything here is browser-only and uses dynamic imports so that
 * `firebase/messaging` (which touches `navigator`/`window`) is never evaluated
 * during SSR. All entry points are no-ops when Firebase web config is absent.
 */

const SW_PATH = '/firebase-messaging-sw.js'
const TOKEN_STORAGE_KEY = 'rentease_fcm_token'
const DEVICE_ID_KEY = 'rentease_device_id'

/**
 * Public Firebase *web* config (safe to embed client-side — these values ship
 * to every browser and are duplicated in `public/firebase-messaging-sw.js`).
 *
 * Used as a fallback so production works even when the `NEXT_PUBLIC_FIREBASE_*`
 * build-time env vars are absent (they are inlined at `next build` time, so a
 * deploy built without them would otherwise silently disable push).
 */
const FALLBACK_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyAysDYysJFf1g-ANzOXTtuoiKAeupCZkl4',
  authDomain: 'jamalpur-bazar-7f15b.firebaseapp.com',
  projectId: 'jamalpur-bazar-7f15b',
  storageBucket: 'jamalpur-bazar-7f15b.firebasestorage.app',
  messagingSenderId: '173254412310',
  appId: '1:173254412310:web:b811039d3337b9b18c0d37',
} as const

/** Public VAPID (web push) key — also safe to embed client-side. */
export const FALLBACK_VAPID_KEY =
  'BO2LcF8F5sjvfbbM_ivGS2nngzJZglrrbFkwClMstHN4jKHF2EcRZkPXVjs1lfU-zcqu0uD60JwYeG96PhyehwM'

function firebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_FIREBASE_CONFIG.apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_FIREBASE_CONFIG.authDomain,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_FIREBASE_CONFIG.projectId,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_FIREBASE_CONFIG.messagingSenderId,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_FIREBASE_CONFIG.appId,
  }
}

export function isFirebaseWebConfigured() {
  // Config always resolves now (env var or public fallback), so web push is
  // available in every environment.
  return Boolean(firebaseConfig().apiKey)
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/** Stable per-browser device id used to de-duplicate push subscriptions. */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'unknown'
  let id = localStorage.getItem(DEVICE_ID_KEY)
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev_${Date.now()}_${Math.random().toString(36).slice(2)}`
    localStorage.setItem(DEVICE_ID_KEY, id)
  }
  return id
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return null
  try {
    return await navigator.serviceWorker.register(SW_PATH)
  } catch (err) {
    console.error('[push] service worker registration failed', err)
    return null
  }
}

/**
 * Returns a cached FCM registration token, requesting a new one if needed.
 * Safe to call repeatedly; the token is cached in localStorage.
 */
export async function getFcmToken(vapidKey: string): Promise<string | null> {
  if (!isFirebaseWebConfigured()) return null
  if (typeof window === 'undefined') return null

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app')
    const { getMessaging, getToken } = await import('firebase/messaging')

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig())
    const messaging = getMessaging(app)

    const registration = await registerServiceWorker()
    const cached = getStoredToken()
    if (cached) return cached

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration || undefined,
    })

    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    return token || null
  } catch (err) {
    console.error('[push] failed to get FCM token', err)
    return null
  }
}

/**
 * Subscribe to foreground (in-app) FCM messages. Returns an unsubscribe fn.
 */
export async function onForegroundMessage(
  callback: (payload: any) => void
): Promise<() => void> {
  if (!isFirebaseWebConfigured() || typeof window === 'undefined') {
    return () => {}
  }
  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app')
    const { getMessaging, onMessage } = await import('firebase/messaging')

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig())
    const messaging = getMessaging(app)

    return onMessage(messaging, (payload: any) => callback(payload))
  } catch (err) {
    console.error('[push] foreground listener setup failed', err)
    return () => {}
  }
}
