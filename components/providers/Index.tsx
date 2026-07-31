'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { AccentThemeProvider } from './AccentThemeProvider'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'
import { ToastProvider } from './ToastProvider'
import { PushNotificationProvider } from './PushNotificationProvider'
import { CartProvider } from '@/contexts/CartContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <AccentThemeProvider>
        <AuthProvider>
          <QueryProvider>
            <SocketProvider>
              <PushNotificationProvider>
                <CartProvider>
                  {children}
                  <ToastProvider />
                </CartProvider>
              </PushNotificationProvider>
            </SocketProvider>
          </QueryProvider>
        </AuthProvider>
      </AccentThemeProvider>
    </ThemeProvider>
  )
}