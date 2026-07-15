// src/app/(auth)/vendor/register/page.tsx
import { Metadata } from 'next'
import { VendorRegistrationForm } from '@/components/vendor/VendorRegistrationForm'
import { VendorRegistrationBanner } from '@/components/vendor/VendorRegistrationBanner'

export const metadata: Metadata = {
  title: 'Become a Vendor | RentEase',
  description: 'Join RentEase as a vendor and grow your rental business. Reach thousands of customers and maximize your revenue.',
  robots: 'noindex, nofollow', // Only for registration page
}

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container relative mx-auto px-4 py-8 md:py-12 lg:py-16">
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-900/20" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/20" />
        </div>

        <div className="relative">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6">
              🚀 Join Our Community
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl bg-linear-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent dark:from-slate-100 dark:via-primary dark:to-slate-100">
              Become a RentEase Vendor
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-3xl mx-auto">
              Start your rental business journey with India's fastest-growing rental platform. 
              Reach thousands of customers and grow your revenue exponentially.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Registration Form */}
            <div className="lg:col-span-2">
              <VendorRegistrationForm />
            </div>

            {/* Sidebar - Promotional Content */}
            <div className="space-y-6">
              <VendorRegistrationBanner />
              
              {/* Trust Badges */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <h3 className="font-semibold mb-4">Trusted by 1000+ Vendors</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: 'Active Vendors', value: '1,000+' },
                    { label: 'Monthly Rentals', value: '50,000+' },
                    { label: 'Customer Rating', value: '4.8/5' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-bold text-primary">{stat.value}</div>
                      <div className="text-xs text-muted-foreground">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm mb-4">
                  "RentEase transformed our business! We've seen 300% growth in rentals within 3 months. 
                  The platform is intuitive and the support team is exceptional."
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-blue-500 to-purple-500" />
                  <div>
                    <div className="font-medium text-sm">Rahul Sharma</div>
                    <div className="text-xs text-muted-foreground">ElectroRent, Mumbai</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}