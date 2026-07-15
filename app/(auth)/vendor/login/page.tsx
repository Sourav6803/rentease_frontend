import { VendorLoginForm } from '@/components/vendor/VendorLoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vendor Login | RentEase Vendor Portal',
  description: 'Access your RentEase vendor dashboard to manage products, track orders, and grow your rental business.',
  robots: 'noindex, nofollow',
}

export default function VendorLoginPage() {
  return (
    
      <VendorLoginForm />
    
  )
}