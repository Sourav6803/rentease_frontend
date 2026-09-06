/**
 * src/hooks/useBehaviorTracking.ts
 *
 * Client-side behavior tracking helper.
 *  - generates a stable per-browser sessionId (localStorage)
 *  - detects device / browser / OS from UA
 *  - exposes `trackEvent` and `trackPageView`
 *  - safe to call before login / without auth (backend accepts optional auth)
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { trackEvent as trackEventApi, type BehaviorEventType, type TrackEventPayload, type BehaviorMetadata } from '@/lib/api/behavior'

const SESSION_KEY = 'rentease_behavior_session_id'

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

function getDeviceInfo(): { device: string; browser: string; os: string } {
  if (typeof window === 'undefined') return { device: 'Unknown', browser: 'Unknown', os: 'Unknown' }
  const ua = navigator.userAgent
  const device = /Mobi|Android|iPhone/i.test(ua) ? 'Mobile' : /Tablet|iPad/i.test(ua) ? 'Tablet' : 'Desktop'
  const browser = /Chrome/i.test(ua) ? 'Chrome' : /Firefox/i.test(ua) ? 'Firefox' : /Safari/i.test(ua) ? 'Safari' : /Edg/i.test(ua) ? 'Edge' : 'Browser'
  const os = /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'macOS' : /Android/i.test(ua) ? 'Android' : /iOS|iPhone|iPad/i.test(ua) ? 'iOS' : /Linux/i.test(ua) ? 'Linux' : 'Unknown'
  return { device, browser, os }
}

export function useBehaviorTracking() {
  const { data: session } = useSession()
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionId())
  const deviceInfo = useRef(getDeviceInfo())
  const scrollTracked = useRef(false)

  useEffect(() => {
    setSessionId(getOrCreateSessionId())
  }, [])

  const trackEvent = useCallback(
    async (
      eventType: BehaviorEventType,
      extras?: {
        productId?: string
        categoryId?: string
        metadata?: BehaviorMetadata
      },
    ) => {
      const payload: TrackEventPayload = {
        eventType,
        productId: extras?.productId,
        categoryId: extras?.categoryId,
        sessionId,
        metadata: {
          ...deviceInfo.current,
          ...extras?.metadata,
        },
      }
      try {
        await trackEventApi(payload)
      } catch {
        // tracking is fire-and-forget
      }
    },
    [sessionId],
  )

  const trackPageView = useCallback(
    async (path = typeof window !== 'undefined' ? window.location.pathname : '/') => {
      await trackEvent('page_view', {
        metadata: {
          pageUrl: path,
          referrer: typeof document !== 'undefined' ? document.referrer : undefined,
        },
      })
    },
    [trackEvent],
  )

  const trackScroll = useCallback(
    (productId: string, depth: number) => {
      if (scrollTracked.current) return
      if (depth >= 80) {
        scrollTracked.current = true
        trackEvent('product_scroll', { productId, metadata: { scrollDepth: depth } })
      }
    },
    [trackEvent],
  )

  const resetScrollTracking = useCallback(() => {
    scrollTracked.current = false
  }, [])

  return {
    sessionId,
    trackEvent,
    trackPageView,
    trackScroll,
    resetScrollTracking,
    userId: session?.user?.id ?? null,
  }
}
