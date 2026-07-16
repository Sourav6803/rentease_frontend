/**
 * frontend/lib/api/settings.ts
 *
 * Typed API client for /api/v1/settings (+ delete account, + local-first
 * appearance/language helpers). Mirrors the request/response envelopes
 * documented for the Delivery Partner Settings page.
 *
 * ⚠️ ADJUST ME: this file assumes a shared axios instance exported as the
 * default export of `@/lib/api/client` (same pattern as `delivery.ts`),
 * pre-configured with baseURL + an interceptor that attaches
 * `Authorization: Bearer <accessToken>`. If your shared client lives at a
 * different path or export name, change ONLY the import line below —
 * every method signature and return shape in this file already matches
 * what `app/(delivery)/delivery/settings/page.tsx` expects.
 *
 *   import apiClient from '@/lib/api/client';
 */

import apiClient from '@/lib/api/client';

/* ------------------------------------------------------------------------ */
/*                                   Types                                  */
/* ------------------------------------------------------------------------ */

export interface AccountSettings {
  name: string;
  email: string;
  phone: string;
  username?: string;
  bio: string;
  avatar: string | null;
}

export interface NotificationSettings {
  email: {
    marketing: boolean;
    orders: boolean;
    reminders: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
  push: {
    enabled: boolean;
    orders: boolean;
    promotions: boolean;
    reminders: boolean;
  };
  sms: {
    enabled: boolean;
    orders: boolean;
    otp: boolean;
  };
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showEmail: boolean;
  showPhone: boolean;
  showActivity: boolean;
  dataSharing: boolean;
  personalizedAds: boolean;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  compactView: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

export interface LanguageSettings {
  preferred: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timezone: string;
  currency: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  loginAlerts: boolean;
  lastPasswordChange: string | null;
}

export interface FullSettings {
  account: AccountSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  appearance: AppearanceSettings;
  language: LanguageSettings;
  security: SecuritySettings;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  timestamp?: string;
  data?: T;
}

/* ------------------------------------------------------------------------ */
/*                                 Defaults                                  */
/* ------------------------------------------------------------------------ */

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'system',
  compactView: false,
  reducedMotion: false,
  fontSize: 'medium',
};

export const DEFAULT_LANGUAGE: LanguageSettings = {
  preferred: 'en',
  dateFormat: 'DD/MM/YYYY',
  timezone: 'Asia/Kolkata',
  currency: 'INR',
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email: { marketing: false, orders: true, reminders: true, promotions: false, newsletter: false },
  push: { enabled: true, orders: true, promotions: false, reminders: true },
  sms: { enabled: true, orders: true, otp: true },
};

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'public',
  showEmail: false,
  showPhone: false,
  showActivity: true,
  dataSharing: true,
  personalizedAds: true,
};

const DEFAULT_SECURITY: SecuritySettings = {
  twoFactorEnabled: false,
  loginAlerts: true,
  lastPasswordChange: null,
};

/* ------------------------------------------------------------------------ */
/*                       Local-first storage (appearance/language)          */
/* ------------------------------------------------------------------------ */
/*
 * Appearance and (parts of) language are echo-only on the backend today —
 * see SKILL doc: "PUT /settings/appearance — Frontend-only echo" and
 * "PUT /settings/language — Persisted: preferred only; dateFormat/timezone/
 * currency echoed". We treat localStorage as the source of truth for these
 * and best-effort sync to the API so a future backend model picks it up
 * automatically.
 */

const APPEARANCE_KEY = 'rentease-delivery-appearance';
const LANGUAGE_KEY = 'rentease-delivery-language';

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export const localAppearance = {
  get(): AppearanceSettings {
    if (typeof window === 'undefined') return DEFAULT_APPEARANCE;
    return safeParse<AppearanceSettings>(window.localStorage.getItem(APPEARANCE_KEY), DEFAULT_APPEARANCE);
  },
  set(value: AppearanceSettings) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(value));
  },
};

export const localLanguage = {
  get(): LanguageSettings {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    return safeParse<LanguageSettings>(window.localStorage.getItem(LANGUAGE_KEY), DEFAULT_LANGUAGE);
  },
  set(value: LanguageSettings) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LANGUAGE_KEY, JSON.stringify(value));
  },
};

/* ------------------------------------------------------------------------ */
/*                                Settings API                              */
/* ------------------------------------------------------------------------ */

export const settingsApi = {
  /** GET /api/v1/settings */
  async getSettings(): Promise<FullSettings> {
    const res = await apiClient.get<ApiEnvelope<{ settings: FullSettings }>>('/settings');
    const settings = res.data?.data?.settings;
    if (!settings) throw new Error('Malformed settings response');
    return settings;
  },

  /** PUT /api/v1/settings/account */
  async updateAccount(payload: Pick<AccountSettings, 'name' | 'email' | 'phone' | 'bio'>): Promise<AccountSettings> {
    const res = await apiClient.put<ApiEnvelope<{ account: AccountSettings }>>('/settings/account', payload);
    const account = res.data?.data?.account;
    if (!account) throw new Error('Malformed account response');
    return account;
  },

  /**
   * PUT /api/v1/settings/notifications
   * Falls back to the simplified PUT /api/v1/users/notifications endpoint
   * (per SKILL doc Prompt 3: "If API fails, fallback to simplified booleans")
   * if the granular endpoint errors.
   */
  async updateNotifications(payload: NotificationSettings): Promise<NotificationSettings> {
    try {
      const res = await apiClient.put<ApiEnvelope<{ notifications: NotificationSettings }>>(
        '/settings/notifications',
        payload,
      );
      const notifications = res.data?.data?.notifications;
      if (!notifications) throw new Error('Malformed notifications response');
      return notifications;
    } catch (err) {
      // Fallback: simplified booleans on the generic users endpoint.
      await apiClient.put('/users/notifications', {
        email: payload.email.orders || payload.email.reminders,
        sms: payload.sms.enabled,
        push: payload.push.enabled,
      });
      // Backend doesn't echo granular shape on this route — return what
      // the user asked to save so the UI doesn't appear to revert.
      return payload;
    }
  },

  /** PUT /api/v1/settings/security */
  async updateSecurity(payload: Partial<Pick<SecuritySettings, 'twoFactorEnabled'>>): Promise<SecuritySettings> {
    const res = await apiClient.put<ApiEnvelope<{ security: SecuritySettings }>>('/settings/security', payload);
    const security = res.data?.data?.security;
    if (!security) throw new Error('Malformed security response');
    return security;
  },

  /** POST /api/v1/settings/change-password */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>('/settings/change-password', {
      currentPassword,
      newPassword,
    });
  },

  /**
   * PUT /api/v1/settings/language
   * `preferred` is persisted server-side; dateFormat/timezone/currency are
   * echoed only — we mirror everything into localStorage regardless so a
   * refresh doesn't lose the echoed fields.
   */
  async updateLanguage(payload: LanguageSettings): Promise<LanguageSettings> {
    const res = await apiClient.put<ApiEnvelope<{ language: LanguageSettings }>>('/settings/language', payload);
    const language = res.data?.data?.language ?? payload;
    localLanguage.set(language);
    return language;
  },

  /**
   * PUT /api/v1/settings/appearance
   * Backend-only echo (no DB) — caller (page.tsx) treats this as
   * fire-and-forget after updating localStorage + next-themes itself.
   */
  async updateAppearance(payload: AppearanceSettings): Promise<AppearanceSettings> {
    localAppearance.set(payload);
    try {
      const res = await apiClient.put<ApiEnvelope<{ appearance: AppearanceSettings }>>('/settings/appearance', payload);
      return res.data?.data?.appearance ?? payload;
    } catch {
      // Local-first: a failed echo call should never block the UI theme
      // change that already happened, and shouldn't throw to the caller.
      return payload;
    }
  },

  /** PUT /api/v1/settings/privacy (echo only — no dedicated model yet) */
  async updatePrivacy(payload: PrivacySettings): Promise<PrivacySettings> {
    try {
      const res = await apiClient.put<ApiEnvelope<{ privacy: PrivacySettings }>>('/settings/privacy', payload);
      return res.data?.data?.privacy ?? payload;
    } catch {
      return payload;
    }
  },

  /** DELETE /api/v1/settings/account */
  async deleteAccount(confirmText: 'DELETE'): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>('/settings/account', {
      data: { confirmText },
    });
  },
};

export {
  DEFAULT_NOTIFICATIONS,
  DEFAULT_PRIVACY,
  DEFAULT_SECURITY,
};