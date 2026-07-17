


'use client';

/**
 * frontend/contexts/DeliveryPartnerContext.tsx
 * Provides profile, stats, deliveries, activities, toggleOnDuty(), updateProfile(), refresh() to the entire delivery portal.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import {
  deliveryPartnerApi,
  setDeliveryToken,
  type DeliveryPartnerProfile,
  type DashboardStats,
  type PartnerDelivery,
  type ActivityItem,
  type UpdateProfilePayload,
} from '@/lib/api/delivery';

// ─── Fallback data (merged from both versions) ─────────────────────────────────

export const FALLBACK_PROFILE: DeliveryPartnerProfile = {
  _id: 'fallback-001',
  employeeId: 'DLP0001',
  user: {
    _id: 'user-001',
    email: 'rahul.sharma@rentease.com',
    phone: '9876543210',
    profile: { firstName: 'Rahul', lastName: 'Sharma', avatar: undefined },
  },
  vehicle: { type: 'bike', number: 'DL 01 AB 1234', model: 'Honda Activa 6G', registrationNumber: 'DL01AB1234', capacity: 25 },
  zone: 'north',
  serviceablePincodes: ['201301', '201305', '110001'],
  availability: {
    isAvailable: true,
    isOnDuty: true,
    currentLocation: { type: 'Point', coordinates: [77.3910, 28.5355], updatedAt: new Date().toISOString() },
    shifts: { start: '09:00', end: '18:00', workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] },
  },
  performance: {
    totalDeliveries: 156,
    completedDeliveries: 152,
    failedDeliveries: 4,
    cancelledDeliveries: 2,
    averageRating: 4.9,
    onTimeRate: 98.5,
    totalDistance: 1245,
    totalEarnings: 18750,
    lastDeliveryAt: '2026-06-02T18:45:00.000Z',
  },
  documents: [
    { type: 'license',    number: 'DL1420190001234',    verified: true,  verifiedAt: '2024-01-20T00:00:00.000Z', expiryDate: '2030-12-31T00:00:00.000Z', uploadedAt: '2024-01-15T00:00:00.000Z' },
    { type: 'aadhar',     number: 'XXXX-XXXX-4321',     verified: true,  verifiedAt: '2024-01-20T00:00:00.000Z', uploadedAt: '2024-01-15T00:00:00.000Z' },
    { type: 'vehicle_rc', number: 'RC123456',            verified: false, uploadedAt: '2024-06-01T00:00:00.000Z' },
  ],
  bankDetails: { accountHolderName: 'Rahul Sharma', accountNumber: '****7890', ifscCode: 'SBIN0001234', bankName: 'State Bank of India', upiId: 'rahul.sharma@upi' },
  aiPreferences: { autoAcceptAssignments: false, maxAcceptanceDistance: 10, preferredDeliveryTypes: ['delivery', 'pickup'], avoidHighTraffic: true },
  otpConfig: { enabled: true, length: 6, expiryMinutes: 5 },
  currentAssignments: [],
  maxConcurrentDeliveries: 5,
  status: { isActive: true, isVerified: true, verificationStatus: 'verified' },
  metadata: { hiredAt: '2024-01-15T00:00:00.000Z', notes: 'Gold zone partner' },
  rating: 4.9,
  activeAssignmentsCount: 1,
  createdAt: '2024-01-15T00:00:00.000Z',
  updatedAt: new Date().toISOString(),
};

export const FALLBACK_STATS: DashboardStats = {
  todayDeliveries: 8,
  completedToday: 3,
  pendingToday: 5,
  activeDeliveries: 5,
  totalEarnings: 18750,
  thisWeekEarnings: 4250,
  todayEarnings: 255,
  rating: 4.9,
  onTimeRate: 98,
  totalDeliveries: 156,
  acceptanceRate: 97,
  avgDeliveryTime: 28,
  employeeId: 'DLP0001',
  zone: 'north',
};

export const FALLBACK_DELIVERIES: PartnerDelivery[] = [
  {
    _id: 'del-demo-1',
    deliveryNumber: 'DLV001234',
    type: 'delivery',
    status: 'assigned',
    priority: 'high',
    schedule: {
      scheduledDate: new Date().toISOString(),
      scheduledSlot: 'Morning (9 AM - 12 PM)',
    },
    address: {
      addressLine1: 'Sector 62, Noida',
      city: 'Noida',
      state: 'UP',
      pincode: '201301',
      contactName: 'Rajesh Gupta',
      contactPhone: '+91 98765 43210',
    },
    items: [{ name: 'Sony Headphones', quantity: 1, sku: 'SNY-001' }],
    distance: 2.3,
    estimatedDuration: 15,
    earnings: 85,
  },
  {
    _id: 'del-demo-2',
    deliveryNumber: 'DLV001235',
    type: 'pickup',
    status: 'assigned',
    priority: 'medium',
    schedule: {
      scheduledDate: new Date().toISOString(),
      scheduledSlot: 'Afternoon (12 PM - 3 PM)',
    },
    address: {
      addressLine1: 'Cyber City, Gurgaon',
      city: 'Gurgaon',
      state: 'HR',
      pincode: '122002',
      contactName: 'Priya Singh',
      contactPhone: '+91 98765 43211',
    },
    items: [{ name: 'MacBook Pro', quantity: 1, sku: 'APL-002' }],
    distance: 4.1,
    estimatedDuration: 25,
    earnings: 95,
  },
];

export const FALLBACK_ACTIVITIES: ActivityItem[] = [
  { id: '1', action: 'Completed delivery', customer: 'Rajesh Gupta', time: '10:15 AM', earnings: 85, rating: 5, status: 'success', deliveryNumber: 'DLV001234' },
  { id: '2', action: 'Received rating', customer: 'Meera Sharma', time: '9:30 AM', rating: 5, earnings: 0, status: 'success' },
  { id: '3', action: 'Started delivery', customer: 'Vikram Singh', time: '8:45 AM', status: 'pending' },
  { id: '4', action: 'Assigned new delivery', customer: 'Neha Patel', time: '8:00 AM', status: 'warning' },
];

// ─── Context shape (merged) ────────────────────────────────────────────────────

interface DeliveryPartnerContextValue {
  // Core data
  profile: DeliveryPartnerProfile | null;
  stats: DashboardStats | null;
  todayDeliveries: PartnerDelivery[];
  activeDeliveries: PartnerDelivery[];
  activities: ActivityItem[];
  
  // State flags
  isLoading: boolean;
  isUsingFallback: boolean;
  
  // Actions
  refresh: () => Promise<void>;
  toggleOnDuty: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<void>;
}

const DeliveryPartnerContext = createContext<DeliveryPartnerContextValue | null>(null);

export function useDeliveryPartner(): DeliveryPartnerContextValue {
  const ctx = useContext(DeliveryPartnerContext);
  if (!ctx) throw new Error('useDeliveryPartner must be used inside DeliveryPartnerProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function DeliveryPartnerProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  
  // State from old version (deliveries & activities)
  const [profile, setProfile] = useState<DeliveryPartnerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayDeliveries, setTodayDeliveries] = useState<PartnerDelivery[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<PartnerDelivery[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  
  // State flags
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Token handling from new version
  const token = (session?.user as { accessToken?: string })?.accessToken ?? '';
  
  useEffect(() => { 
    if (token) setDeliveryToken(token); 
  }, [token]);

  // Apply fallback function (merged from both versions)
  const applyFallback = useCallback(() => {
    setProfile(FALLBACK_PROFILE);
    setStats(FALLBACK_STATS);
    setTodayDeliveries(FALLBACK_DELIVERIES);
    setActiveDeliveries(FALLBACK_DELIVERIES.slice(0, 1));
    setActivities(FALLBACK_ACTIVITIES);
    setIsUsingFallback(true);
  }, []);

  // Refresh function (merged from both versions)
  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    let usedFallback = false;

    try {
      // Use Promise.allSettled from old version for better resilience
      const [profileRes, statsRes, todayRes, activeRes, activityRes] = await Promise.allSettled([
        deliveryPartnerApi.getProfile(),
        deliveryPartnerApi.getStats(),
        deliveryPartnerApi.getToday(),
        deliveryPartnerApi.getActive(),
        deliveryPartnerApi.getActivity(8),
      ]);

      // Handle profile
      if (profileRes.status === 'fulfilled' && profileRes.value.success && profileRes.value.data?.profile) {
        setProfile(profileRes.value.data.profile);
      } else if (profileRes.status === 'fulfilled' && profileRes.value.data?.profile) {
        setProfile(profileRes.value.data.profile);
      } else {
        setProfile(FALLBACK_PROFILE);
        usedFallback = true;
      }

      // Handle stats
      if (statsRes.status === 'fulfilled' && statsRes.value.success && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      } else if (statsRes.status === 'fulfilled' && statsRes.value.data?.stats) {
        setStats(statsRes.value.data.stats);
      } else {
        setStats(FALLBACK_STATS);
        usedFallback = true;
      }

      // Handle today deliveries
      if (todayRes.status === 'fulfilled' && todayRes.value.success && todayRes.value.data?.deliveries) {
        setTodayDeliveries(todayRes.value.data.deliveries);
      } else if (todayRes.status === 'fulfilled' && todayRes.value.data?.deliveries) {
        setTodayDeliveries(todayRes.value.data.deliveries);
      } else {
        setTodayDeliveries(FALLBACK_DELIVERIES);
        usedFallback = true;
      }

      // Handle active deliveries
      if (activeRes.status === 'fulfilled' && activeRes.value.success && activeRes.value.data?.deliveries) {
        setActiveDeliveries(activeRes.value.data.deliveries);
      } else if (activeRes.status === 'fulfilled' && activeRes.value.data?.deliveries) {
        setActiveDeliveries(activeRes.value.data.deliveries);
      } else {
        setActiveDeliveries([]);
      }

      // Handle activities
      if (activityRes.status === 'fulfilled' && activityRes.value.success && activityRes.value.data?.activities) {
        setActivities(activityRes.value.data.activities);
      } else if (activityRes.status === 'fulfilled' && activityRes.value.data?.activities) {
        setActivities(activityRes.value.data.activities);
      } else {
        setActivities(FALLBACK_ACTIVITIES);
        usedFallback = true;
      }

      setIsUsingFallback(usedFallback);
    } catch (error) {
      console.error('Failed to fetch delivery partner data:', error);
      applyFallback();
    } finally {
      setIsLoading(false);
    }
  }, [status, applyFallback]);

  // Initial load effect (merged from both versions)
  useEffect(() => {
    if (status === 'authenticated') {
      refresh();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
      // Don't apply fallback when unauthenticated — the layout will redirect to login.
      // Showing demo data with no session is misleading.
    }
  }, [status, refresh, applyFallback]);

  // Toggle on-duty (merged with optimistic update from new version)
  const toggleOnDuty = useCallback(async () => {
    const currentProfile = profile ?? FALLBACK_PROFILE;
    const newOnDuty = !currentProfile.availability.isOnDuty;
    
    // Optimistic update
    setProfile(prev => prev ? { 
      ...prev, 
      availability: { ...prev.availability, isOnDuty: newOnDuty } 
    } : prev);
    
    try {
      const res = await deliveryPartnerApi.updateAvailability({ isOnDuty: newOnDuty });
      if (res.success) {
        const { isOnDuty, isAvailable } = res.data ?? { isOnDuty: newOnDuty, isAvailable: profile?.availability.isAvailable ?? true };
        setProfile(prev => prev ? {
          ...prev,
          availability: {
            ...prev.availability,
            isOnDuty,
            isAvailable,
          },
        } : prev);
        setIsUsingFallback(false);
      }
    } catch (error) {
      // Revert on failure
      setProfile(prev => prev ? {
        ...prev,
        availability: { ...prev.availability, isOnDuty: !newOnDuty }
      } : prev);
      console.error('Failed to toggle on-duty status:', error);
    }
  }, [profile]);

  // Update profile from new version
  const updateProfile = useCallback(async (payload: UpdateProfilePayload) => {
    try {
      const res = await deliveryPartnerApi.updateProfile(payload);
      if (res.success && res.data?.profile) {
        setProfile(res.data.profile);
      } else {
        await refresh();
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }, [refresh]);

  // Memoized context value
  const value = useMemo(
    () => ({
      profile,
      stats,
      todayDeliveries,
      activeDeliveries,
      activities,
      isLoading,
      isUsingFallback,
      refresh,
      toggleOnDuty,
      updateProfile,
    }),
    [
      profile,
      stats,
      todayDeliveries,
      activeDeliveries,
      activities,
      isLoading,
      isUsingFallback,
      refresh,
      toggleOnDuty,
      updateProfile,
    ],
  );

  return (
    <DeliveryPartnerContext.Provider value={value}>
      {children}
    </DeliveryPartnerContext.Provider>
  );
}

// Export a hook alias for backward compatibility with old imports
export const useDeliveryPartnerContext: () => DeliveryPartnerContextValue = () => useDeliveryPartner();