// types/profile.types.ts
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    avatarPublicId?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
    bio?: string;
    location?: string;
    timezone?: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    language: string;
    currency: string;
  };
  verification: {
    email: boolean;
    phone: boolean;
    kyc?: {
      status: 'pending' | 'verified' | 'rejected' | 'not_submitted';
      level: 'basic' | 'enhanced' | 'full';
    };
  };
  stats: {
    rentals: {
      total: number;
      active: number;
      completed: number;
      cancelled: number;
    };
    payments: {
      totalSpent: number;
      totalPayments: number;
      avgPayment: number;
    };
    totalReviews: number;
    memberSince: string;
    loyaltyPoints?: number;
    loyaltyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
  status: {
    isActive: boolean;
    isBlocked: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  dateOfBirth: string;
  gender: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}
