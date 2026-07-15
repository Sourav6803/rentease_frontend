

// app/(delivery)/delivery/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { DeliverySidebar } from '@/components/delivery/layout/DeliverySidebar';
import { DeliveryHeader } from '@/components/delivery/layout/DeliveryHeader';
import { DeliveryFooter } from '@/components/delivery/layout/DeliveryFooter';
import { DeliveryPartnerProvider } from '@/contexts/DeliveryPartnerContext';
import { useDeliverySidebarStore } from '@/store/DeliverySidebarStore';
import { Loader2 } from 'lucide-react';

export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  const { isCollapsed, setMobileOpen } = useDeliverySidebarStore();

  // Check if it's an auth page (no sidebar/header/footer)
  const isAuthPage = pathname?.startsWith('/delivery/auth') ?? false;

  useEffect(() => {
    if (isAuthPage) {
      setIsLoading(false);
      return;
    }

    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/delivery/auth/login');
      return;
    }

    // Check if user has delivery role
    const role = (session?.user as { role?: string } | undefined)?.role;
    const deliveryRoles = ['delivery_partner', 'delivery_boy', 'delivery'];

    if (!role || !deliveryRoles.includes(role)) {
      router.push('/delivery/auth/login');
      return;
    }

    setIsLoading(false);
  }, [session, status, router, pathname, isAuthPage]);

  // Close mobile sidebar on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setMobileOpen]);

  // Loading state
  if (isLoading && !isAuthPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
          <p className="text-sm text-gray-500">Loading delivery portal...</p>
        </div>
      </div>
    );
  }

  // Auth pages - render without layout
  if (isAuthPage) {
    return <>{children}</>;
  }

  // Protected layout with sidebar, header, footer
  return (
    <DeliveryPartnerProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <DeliverySidebar />

        <div
          className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
            isCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <DeliveryHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8">{children}</div>
          </main>
          <DeliveryFooter />
        </div>
      </div>
    </DeliveryPartnerProvider>
  );
}