

// app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminFooter } from "@/components/admin/layout/AdminFooter";
import { AdminCommandPalette } from "@/components/admin/layout/AdminCommandPalette";
import { AdminErrorBoundary } from "@/components/admin/layout/AdminErrorBoundary";
import { Loader2 } from "lucide-react";
import { useSidebarStore } from "@/store/SidebarStore";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  // Use Zustand store instead of local state
  const { isCollapsed, toggleCollapse, setMobileOpen } = useSidebarStore();

  useEffect(() => {
    // Check if user has admin role
    if (status === "loading") return;

    // Public admin-auth pages should NOT be wrapped by the protected admin shell
    if (
      pathname?.startsWith("/admin/login") ||
      pathname?.startsWith("/admin/forgot-password")
    ) {
      setIsLoading(false);
      return;
    }

    if (!session) {
      router.push("/admin/login");
      return;
    }

    const role = (session.user as any)?.role;
    const allowedRoles = [
      "super_admin",
      "admin",
      "super-admin",
      "operations_manager",
      "support_manager",
      "finance_manager",
      "inventory_manager",
      "content_manager",
      "analytics_viewer",
      "auditor",
    ];

    if (!allowedRoles.includes(role)) {
      router.push("/admin/login");
      return;
    }

    setIsLoading(false);
  }, [session, status, router, pathname]);

  // Close mobile sidebar on window resize (desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false); // Close mobile sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setMobileOpen]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Render public admin-auth pages without the sidebar/header/footer shell
  if (
    pathname?.startsWith("/admin/login") ||
    pathname?.startsWith("/admin/forgot-password")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Global command palette (Cmd/Ctrl + K) */}
      <AdminCommandPalette />

      {/* Sidebar - now uses store directly */}
      <AdminSidebar />

      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}
      >
        <AdminHeader />
        {/* Sole scroll container for admin pages. overflow-y is explicitly
            `auto` and overflow-x explicitly `hidden` — setting BOTH axes
            avoids the "x-hidden silently promotes y to auto" trap that made
            page-level wrappers spawn a second nested scrollbar. Pages must NOT
            set their own overflow; horizontal gradient blobs are clipped here. */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-2 md:p-4">
          <AdminErrorBoundary>{children}</AdminErrorBoundary>
        </main>
        <AdminFooter />
      </div>
    </div>
  );
}
