// src/components/ui/CookieConsent.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield, Settings, X, CheckCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useCookieConsent } from '@/hooks/useCookieConsent'
// import { useCookieConsent } from '@/hooks/useCookieConsent'

const cookieCategories = [
  {
    id: 'necessary',
    name: 'Necessary Cookies',
    description: 'Essential for the website to function properly. Cannot be disabled.',
    required: true,
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    description: 'Enable enhanced functionality and personalization.',
    required: false,
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our website.',
    required: false,
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    description: 'Used to deliver relevant advertisements and track campaign performance.',
    required: false,
  },
]

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  })
  const { hasConsented, acceptAll, acceptSelected, rejectAll, updatePreferences } = useCookieConsent()

  useEffect(() => {
    // Show consent if not already given
    if (!hasConsented) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [hasConsented])

  const handleAcceptAll = () => {
    acceptAll()
    setIsOpen(false)
    setShowSettings(false)
  }

  const handleRejectAll = () => {
    rejectAll()
    setIsOpen(false)
    setShowSettings(false)
  }

  const handleSavePreferences = () => {
    updatePreferences(preferences)
    acceptSelected(preferences)
    setIsOpen(false)
    setShowSettings(false)
  }

  if (hasConsented) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4 z-50 max-w-md mx-auto md:mx-0"
        >
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">We value your privacy</CardTitle>
                  <CardDescription className="text-xs">
                    We use cookies to enhance your browsing experience
                  </CardDescription>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            <CardContent className="pb-3">
              <p className="text-sm text-muted-foreground">
                We use cookies to analyze website traffic, personalize content, and serve targeted ads.
                By clicking "Accept All", you consent to our use of cookies.
              </p>

              {showSettings ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm font-medium">Customize your preferences</p>
                  <div className="space-y-3">
                    {cookieCategories.map((category) => (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label htmlFor={category.id} className="text-sm font-medium">
                            {category.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                        <Switch
                          id={category.id}
                          checked={preferences[category.id as keyof typeof preferences]}
                          onCheckedChange={(checked) =>
                            setPreferences((prev) => ({ ...prev, [category.id]: checked }))
                          }
                          disabled={category.required}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>Your data is safe with us</span>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="ml-auto text-primary hover:underline flex items-center gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    Customize
                  </button>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-0">
              {showSettings ? (
                <div className="flex gap-2 w-full">
                  <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleSavePreferences} className="flex-1">
                    Save Preferences
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Button variant="outline" onClick={handleRejectAll} className="flex-1">
                    Reject All
                  </Button>
                  <Button variant="outline" onClick={() => setShowSettings(true)} className="flex-1">
                    Customize
                  </Button>
                  <Button onClick={handleAcceptAll} className="flex-1 bg-primary">
                    Accept All
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}