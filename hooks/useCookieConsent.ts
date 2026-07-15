// src/hooks/useCookieConsent.ts
'use client'

import { deleteCookie, getCookie, setCookie } from '@/lib/cookies'
import { useState, useEffect } from 'react'
// import { setCookie, getCookie, deleteCookie } from '@/lib/cookies'

interface CookiePreferences {
  necessary: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

export function useCookieConsent() {
  const [hasConsented, setHasConsented] = useState<boolean | null>(null)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    const consent = getCookie('cookie_consent')
    const savedPrefs = getCookie('cookie_preferences')
    
    if (consent === 'accepted') {
      setHasConsented(true)
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs))
      }
    } else if (consent === 'rejected') {
      setHasConsented(false)
    } else {
      setHasConsented(null)
    }
  }, [])

  const acceptAll = () => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    }
    setPreferences(allPreferences)
    setCookie('cookie_consent', 'accepted', 365)
    setCookie('cookie_preferences', JSON.stringify(allPreferences), 365)
    setHasConsented(true)
    
    // Initialize analytics if consented
    if (allPreferences.analytics) {
      initializeAnalytics()
    }
  }

  const rejectAll = () => {
    setCookie('cookie_consent', 'rejected', 365)
    deleteCookie('cookie_preferences')
    setHasConsented(false)
  }

  const acceptSelected = (selectedPreferences: CookiePreferences) => {
    setPreferences(selectedPreferences)
    setCookie('cookie_consent', 'accepted', 365)
    setCookie('cookie_preferences', JSON.stringify(selectedPreferences), 365)
    setHasConsented(true)
    
    // Initialize analytics if consented
    if (selectedPreferences.analytics) {
      initializeAnalytics()
    }
  }

  const updatePreferences = (newPreferences: CookiePreferences) => {
    setPreferences(newPreferences)
    setCookie('cookie_preferences', JSON.stringify(newPreferences), 365)
  }

  const initializeAnalytics = () => {
    // Initialize Google Analytics, Facebook Pixel, etc.
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      })
    }
  }

  return {
    hasConsented,
    preferences,
    acceptAll,
    rejectAll,
    acceptSelected,
    updatePreferences,
  }
}