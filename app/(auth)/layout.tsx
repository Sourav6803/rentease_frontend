import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication',
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>

      <Footer />
    </div>
  )
}

