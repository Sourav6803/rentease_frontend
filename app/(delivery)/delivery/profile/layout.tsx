// app/(delivery)/delivery/profile/layout.tsx
'use client';

import { ProfileNav } from '@/components/delivery/profile/ProfileNav';

/**
 * Profile section layout.
 *
 * The delivery app shell — sidebar, header and footer — is provided by the
 * parent `(delivery)/layout.tsx`. This section therefore only renders its own
 * *secondary* navigation (horizontal tabs) inside the existing content area,
 * the standard pattern for a settings/profile area nested in an app shell.
 * No second sidebar, no second header.
 */
export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Section heading */}
      <div className="mb-1">
        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Account
        </h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Manage your partner profile, vehicle, payouts and security.
        </p>
      </div>

      {/* Secondary navigation */}
      <div className="sticky top-0 z-10 -mx-4 mt-4 bg-gray-50/80 px-4 backdrop-blur-sm dark:bg-gray-950/80 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <ProfileNav />
      </div>

      {/* Page content */}
      <div className="py-6">{children}</div>
    </div>
  );
}
