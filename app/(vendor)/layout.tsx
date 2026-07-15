
// app/vendor/layout.tsx

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { VendorHeader } from "@/components/layout/VendorHeader";
import { VendorSidebar } from "@/components/layout/VendorSidebar";
import { useSidebarStore } from "@/store/SidebarStore";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// Allowed routes for pending vendors (exact matching)
const ALLOWED_PENDING_PATTERNS = [
  { pattern: "/vendor", exact: true, allowSubRoutes: false },
  { pattern: "/vendor/dashboard", exact: true, allowSubRoutes: false },
  { pattern: "/vendor/profile", exact: false, allowSubRoutes: true },
  { pattern: "/vendor/settings", exact: false, allowSubRoutes: true },
  { pattern: "/vendor/documents", exact: true, allowSubRoutes: false },
  { pattern: "/vendor/verification-status", exact: true, allowSubRoutes: false },
  { pattern: "/vendor/support", exact: true, allowSubRoutes: false },
  { pattern: "/vendor/registration-success", exact: true, allowSubRoutes: false },
];

// Public routes (no auth required)
const PUBLIC_VENDOR_ROUTES = [
  "/vendor/login",
  "/vendor/register",
  "/vendor/registration-success",
  "/vendor/forgot-password",
  "/vendor/reset-password",
  "/vendor/verify-email",
];

// Restricted routes for pending vendors
const RESTRICTED_ROUTES = [
  "/vendor/products",
  "/vendor/rentals",
  "/vendor/analytics",
  "/vendor/payments",
  "/vendor/inventory",
  "/vendor/orders",
];

const isAllowedForPendingVendor = (pathname: string): boolean => {
  return ALLOWED_PENDING_PATTERNS.some(pattern => {
    if (pattern.allowSubRoutes) {
      return pathname.startsWith(pattern.pattern);
    }
    return pathname === pattern.pattern;
  });
};

const isPublicVendorRoute = (pathname: string): boolean => {
  return PUBLIC_VENDOR_ROUTES.some(route => pathname?.startsWith(route));
};

const isRestrictedRoute = (pathname: string): boolean => {
  return RESTRICTED_ROUTES.some(route => pathname?.startsWith(route));
};

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed } = useSidebarStore();
  
  const [vendorStatus, setVendorStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const [redirectedFrom, setRedirectedFrom] = useState<string | null>(null);

  // Fetch vendor status
  useEffect(() => {
    const fetchVendorStatus = async () => {
      if (sessionStatus !== "authenticated" || isPublicVendorRoute(pathname || "")) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/v1/vendor/profile/me`, {
          headers: { Authorization: `Bearer ${session?.user?.accessToken}` },
        });
        
        if (response.data.success) {
          setVendorStatus(response.data.data.profile?.verification?.status);
        }
      } catch (error) {
        console.error("Error fetching vendor status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendorStatus();
  }, [sessionStatus, session, pathname]);

  // Handle routing based on verification status
  useEffect(() => {
    if (sessionStatus === "loading" || isLoading) return;
    if (isPublicVendorRoute(pathname || "")) return;

    // Not authenticated
    if (sessionStatus === "unauthenticated") {
      router.replace("/vendor/login"); // Use replace
      return;
    }

    // Authenticated but no status yet
    if (!vendorStatus) return;

    const isAllowed = isAllowedForPendingVendor(pathname || "");
    const isRestricted = isRestrictedRoute(pathname || "");

    // Handle different statuses
    switch (vendorStatus) {
      case "pending":
        // If trying to access restricted route, show message then redirect
        if (isRestricted || !isAllowed) {
          setRedirectedFrom(pathname);
          setShowPendingMessage(true);
          
          // Small delay to show the message
          setTimeout(() => {
            router.replace("/vendor"); // Use replace instead of push
          }, 1500);
        }
        break;
        
      case "verified":
        // Full access - allow everything
        setShowPendingMessage(false);
        break;
        
      case "rejected":
      case "suspended":
        router.replace("/vendor/verification-status");
        break;
        
      default:
        if (!isAllowed) {
          router.replace("/vendor");
        }
    }
  }, [sessionStatus, isLoading, vendorStatus, pathname, router]);

  // Clear pending message when on allowed page
  useEffect(() => {
    if (vendorStatus === "pending" && isAllowedForPendingVendor(pathname || "")) {
      setShowPendingMessage(false);
      setRedirectedFrom(null);
    }
  }, [pathname, vendorStatus]);

  // Loading state
  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && isLoading)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Public routes - no layout
  if (isPublicVendorRoute(pathname || "")) {
    return <>{children}</>;
  }

  // Show pending verification page for dashboard
  if (vendorStatus === "pending" && pathname === "/vendor" && !showPendingMessage) {
    return <PendingVerificationScreen />;
  }

  // Show redirect message
  if (showPendingMessage && vendorStatus === "pending") {
    return <RedirectMessage redirectedFrom={redirectedFrom} />;
  }

  // Show rejected/suspended page
  if (vendorStatus === "rejected" || vendorStatus === "suspended") {
    return <RejectedSuspendedScreen status={vendorStatus} />;
  }

  // Main vendor layout for verified vendors
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <VendorSidebar />
      <div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <VendorHeader />
        <main className="flex-1 overflow-y-auto p-2 md:p-2">
          {children}
        </main>
      </div>
    </div>
  );
}

// Redirect Message Component
function RedirectMessage({ redirectedFrom }: { redirectedFrom: string | null }) {

  const getPageName = (path: string | null): string => {
    if (!path) return "this page";
    const page = path.split("/").pop();
    
    // Fix: Ensure page is treated as string
    if (!page) return "this page";
    
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-lg animate-in fade-in zoom-in duration-300">
        <CardContent className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold mb-2">Account Pending Verification</h2>
          <p className="text-muted-foreground mb-4">
            {getPageName(redirectedFrom)} is not available while your account is being verified.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to dashboard...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Pending Verification Screen Component
function PendingVerificationScreen() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mb-6">
              <AlertCircle className="h-10 w-10 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Account Pending Verification</h1>
            <p className="text-muted-foreground mb-6">
              Your vendor application is under review. You'll get access to all features once verified.
            </p>
            <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                ⏳ Verification typically takes 2-3 business days. You'll receive an email once approved.
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = "/support"}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Rejected/Suspended Screen Component
function RejectedSuspendedScreen({ status }: { status: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="border-red-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <AlertCircle className="h-10 w-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {status === "rejected" ? "Application Declined" : "Account Suspended"}
            </h1>
            <p className="text-muted-foreground mb-6">
              {status === "rejected"
                ? "Your vendor application has been reviewed and declined."
                : "Your vendor account has been temporarily suspended."}
            </p>
            <Button onClick={() => window.location.href = "/support"}>
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}