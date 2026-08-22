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
const SENDER_STORAGE_KEY = 'rentease_fcm_sender'
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
  apiKey: 'AIzaSyAE7NcwgmEjGEFOJwO78sEhlgcA5cHzcWo',
  authDomain: 'rentease-314bb.firebaseapp.com',
  projectId: 'rentease-314bb',
  storageBucket: 'rentease-314bb.firebasestorage.app',
  messagingSenderId: '335424236149',
  appId: '1:335424236149:web:7c4f05d239e1c89e20a63c',
} as const

/** Public VAPID (web push) key — also safe to embed client-side. */
export const FALLBACK_VAPID_KEY =
  'BNvs7fJjA-vWHkuSWC0cO1g5Q_dzij0dJMUP4ZhSMUQ_EE51vDfsEWoA6PVjprXZpfC1sGRSanIks89xWHaxV_M'

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

/**
 * iOS (16.4+) only permits Web Push when the site has been installed to the
 * home screen and is running as a standalone PWA. In a plain Safari tab the
 * Notification/PushManager APIs may appear present but `requestPermission()` /
 * `getToken()` fail — so callers should detect this and prompt the user to
 * "Add to Home Screen" rather than firing a permission request that can never
 * succeed.
 *
 * Returns true when we are on iOS in a browser tab (NOT standalone), i.e. web
 * push is unavailable until the app is installed.
 */
export function isIosWebPushUnavailable(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false

  const ua = navigator.userAgent || ''
  const isIos =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ masquerades as macOS; disambiguate via touch support.
    (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1)
  if (!isIos) return false

  const standalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.('(display-mode: standalone)')?.matches === true

  return !standalone
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(SENDER_STORAGE_KEY)
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
    const registration = await navigator.serviceWorker.register(SW_PATH)
    // Health check: wait until the SW is actually activated. `register()`
    // resolves as soon as the registration exists, but FCM needs an ACTIVE
    // worker to receive background pushes — using the registration before it
    // activates yields a token bound to a worker that can't deliver. On a
    // fresh install `registration.active` is null until activation completes,
    // so fall back to `navigator.serviceWorker.ready`.
    if (!registration.active) {
      await navigator.serviceWorker.ready
    }
    return registration
  } catch (err) {
    console.error('[push] service worker registration failed', err)
    return null
  }
}

/**
 * Returns a valid FCM registration token, requesting/refreshing one if needed.
 *
 * We do NOT short-circuit on the localStorage cache: Firebase rotates tokens
 * (SW reinstall, key change, push-service invalidation) and a stale cached
 * token silently fails to deliver. `getToken()` is the source of truth — it
 * keeps its own IndexedDB cache and only hits the network when a refresh is
 * actually required — so we always call it against a *ready* service worker and
 * treat localStorage purely as an offline fallback when that call throws.
 */
export async function getFcmToken(vapidKey: string): Promise<string | null> {
  if (!isFirebaseWebConfigured()) return null
  if (typeof window === 'undefined') return null

  try {
    const { initializeApp, getApps, getApp } = await import('firebase/app')
    const { getMessaging, getToken, deleteToken } = await import('firebase/messaging')

    const app = getApps().length ? getApp() : initializeApp(firebaseConfig())
    const messaging = getMessaging(app)

    const registration = await registerServiceWorker()
    if (!registration) {
      // No usable SW — fall back to a previously cached token if we have one.
      return getStoredToken()
    }

    // Self-healing for Firebase project/sender changes:
    // If this browser subscribed under a DIFFERENT sender (e.g. the app used to
    // run on another Firebase project), the cached push subscription is bound
    // to the OLD sender and FCM rejects every send with
    // "messaging/mismatched-credential". Delete the stale subscription and
    // request a fresh token under the current sender.
    const currentSender = firebaseConfig().messagingSenderId
    const storedSender = localStorage.getItem(SENDER_STORAGE_KEY)
    if (storedSender && currentSender && storedSender !== currentSender) {
      console.warn(
        `[push] Firebase sender changed (${storedSender} -> ${currentSender}); ` +
          'dropping stale push subscription and re-registering'
      )
      try {
        // Uses the default registration (our SW_PATH worker — registered below
        // with default scope), which is the one the stale token was bound to.
        await deleteToken(messaging)
      } catch (err) {
        // The old subscription may already be invalid server-side; ignore and
        // fall through to requesting a new token anyway.
        console.warn('[push] deleteToken failed (ignored):', err)
      }
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      localStorage.removeItem(SENDER_STORAGE_KEY)
    }

    const token = await getToken(messaging, {
      vapidKey: vapidKey || undefined,
      serviceWorkerRegistration: registration,
    })

    if (token) {
      // Persist the (possibly rotated) token so callers can detect changes and
      // so we have an offline fallback next time. Remember the sender it was
      // issued under so a future project change can self-heal again.
      localStorage.setItem(TOKEN_STORAGE_KEY, token)
      if (currentSender) localStorage.setItem(SENDER_STORAGE_KEY, currentSender)
      return token
    }
    return getStoredToken()
  } catch (err) {
    console.error('[push] failed to get FCM token', err)
    // Network/SW hiccup — a cached token is better than nothing.
    return getStoredToken()
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
