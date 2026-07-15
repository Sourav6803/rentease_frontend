'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from './ThemeProvider'
import { AccentThemeProvider } from './AccentThemeProvider'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { SocketProvider } from './SocketProvider'
import { ToastProvider } from './ToastProvider'
import { PushNotificationProvider } from './PushNotificationProvider'

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
                {children}
                <ToastProvider />
              </PushNotificationProvider>
            </SocketProvider>
          </QueryProvider>
        </AuthProvider>
      </AccentThemeProvider>
    </ThemeProvider>
  )
}