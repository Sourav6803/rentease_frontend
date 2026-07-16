
'use client';

/**
 * Delivery Partner — Settings page
 * Route: /delivery/settings
 *
 * Data sources:
 *  - settingsApi.getSettings()              GET  /api/v1/settings
 *  - deliveryPartnerApi.getProfile()        GET  /api/v1/deliveries/profile
 *  - deliveryPartnerApi.updateProfile()     PUT  /api/v1/deliveries/profile   (maxConcurrentDeliveries)
 *  - deliveryPartnerApi.updateAvailability  PUT  /api/v1/deliveries/availability
 *  - useDeliveryPartner().toggleOnDuty()    PUT  /api/v1/deliveries/availability (isOnDuty)
 *  - settingsApi.updateNotifications/updateSecurity/updateLanguage/updateAppearance/updateAccount
 *  - settingsApi.changePassword / deleteAccount
 *
 * This page intentionally does NOT duplicate vehicle/documents/bank tabs from
 * /delivery/profile — it links out to that page and to /delivery/zones instead.
 *
 * NOTE: method names assume frontend/lib/api/delivery.ts exposes getProfile,
 * updateProfile, and updateAvailability. Adjust call sites if named differently.
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Bell,
  Shield,
  Palette,
  Globe,
  User,
  Truck,
  ChevronRight,
  Search,
  LogOut,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Info,
  ExternalLink,
  Mail,
  Phone,
  Pencil,
  ShieldCheck,
  Sparkles,
  Lock,
  MapPin,
  Clock,
  Wallet,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { deliveryPartnerApi } from '@/lib/api/delivery';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import {
  settingsApi,
  localAppearance,
  localLanguage,
  DEFAULT_APPEARANCE,
  DEFAULT_LANGUAGE,
  type FullSettings,
  type NotificationSettings,
  type LanguageSettings,
  type AppearanceSettings,
} from '@/lib/api/setting';
import { ChangePasswordDialog } from '@/components/delivery/settings/ChangePasswordDialog';

/* ------------------------------------------------------------------------ */
/*                              Supporting types                            */
/* ------------------------------------------------------------------------ */

interface PartnerSettingsProfile {
  employeeId: string;
  user: { email: string; phone: string; profile: { firstName: string; lastName: string } };
  availability: {
    isAvailable: boolean;
    isOnDuty: boolean;
    shifts: { start: string; end: string; workingDays: string[] };
  };
  aiPreferences: {
    autoAcceptAssignments: boolean;
    maxAcceptanceDistance: number;
    preferredDeliveryTypes: string[];
    avoidHighTraffic: boolean;
  };
  otpConfig: { enabled: boolean; length: number; expiryMinutes: number };
  maxConcurrentDeliveries: number;
  status: { isActive: boolean; isVerified: boolean; verificationStatus: string };
  zone: string;
  rating: number;
  activeAssignmentsCount: number;
}

/* ------------------------------------------------------------------------ */
/*                                  Motion                                  */
/* ------------------------------------------------------------------------ */

const containerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

/* ------------------------------------------------------------------------ */
/*                              Small primitives                            */
/* ------------------------------------------------------------------------ */

function SettingsSection({
  id,
  title,
  icon: Icon,
  dirty,
  children,
  footer,
  hidden,
}: {
  id: string;
  title: string;
  icon: typeof Bell;
  dirty?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hidden?: boolean;
}) {
  if (hidden) return null;
  return (
    <motion.section
      id={id}
      variants={fadeUp}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-orange-100/60 bg-white dark:border-orange-900/30 dark:bg-[#1a0900]"
    >
      <div className="flex items-center gap-2 border-b border-orange-100/60 px-4 py-3 dark:border-orange-900/30">
        <Icon className="h-4 w-4 text-orange-500" />
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          {title}
        </h2>
        {dirty && <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-orange-500" aria-label="Unsaved changes" />}
      </div>
      <div className="divide-y divide-orange-100/60 px-4 dark:divide-orange-900/30">{children}</div>
      {footer && <div className="border-t border-orange-100/60 px-4 py-3 dark:border-orange-900/30">{footer}</div>}
    </motion.section>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  description,
  control,
  iconClass = 'from-orange-500 to-amber-500',
  disabled,
}: {
  icon: typeof Bell;
  label: string;
  description?: string;
  control: React.ReactNode;
  iconClass?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-1 py-3 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${iconClass} text-white`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">{label}</span>
          {description && (
            <span className="block truncate text-xs text-stone-400 dark:text-stone-500">{description}</span>
          )}
        </span>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  );
}

function LinkRow({ href, icon: Icon, label, description }: { href: string; icon: typeof Bell; label: string; description?: string }) {
  return (
    <Link href={href} className="flex items-center justify-between gap-3 px-1 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">{label}</span>
          {description && <span className="block text-xs text-stone-400 dark:text-stone-500">{description}</span>}
        </span>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-stone-300 dark:text-stone-600" />
    </Link>
  );
}

function Stepper({ value, onChange, min = 1, max = 10 }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <button
        type="button"
        aria-label="Decrease"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-orange-600 ring-1 ring-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:ring-orange-900/40 dark:hover:bg-orange-950/30"
      >
        −
      </button>
      <span className="w-5 text-center text-sm font-semibold text-stone-900 dark:text-stone-100">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-7 w-7 items-center justify-center rounded-full text-orange-600 ring-1 ring-orange-200 hover:bg-orange-50 dark:text-orange-400 dark:ring-orange-900/40 dark:hover:bg-orange-950/30"
      >
        +
      </button>
    </div>
  );
}

const SECTION_NAV = [
  { id: 'delivery-preferences', label: 'Preferences', icon: Truck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'account', label: 'Account', icon: User },
];

/* ------------------------------------------------------------------------ */
/*                                Main page                                 */
/* ------------------------------------------------------------------------ */

export default function DeliverySettingsPage() {
  const deliveryPartnerCtx = (useDeliveryPartner?.() as any) ?? {};
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<FullSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [syncedAt, setSyncedAt] = useState<Date | null>(null);

  const [profile, setProfile] = useState<PartnerSettingsProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [search, setSearch] = useState('');

  // Notifications draft
  const [notifDraft, setNotifDraft] = useState<NotificationSettings | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const notifDirty = useMemo(
    () => !!settings && !!notifDraft && JSON.stringify(settings.notifications) !== JSON.stringify(notifDraft),
    [settings, notifDraft],
  );

  // Appearance (local-first)
  const [appearance, setAppearance] = useState<AppearanceSettings>(DEFAULT_APPEARANCE);

  // Language draft
  const [langDraft, setLangDraft] = useState<LanguageSettings>(DEFAULT_LANGUAGE);
  const [langSaving, setLangSaving] = useState(false);
  const langDirty = useMemo(
    () => !!settings && JSON.stringify(settings.language) !== JSON.stringify(langDraft),
    [settings, langDraft],
  );

  // Delivery preferences
  const [isAvailable, setIsAvailable] = useState(false);
  const [maxConcurrentDraft, setMaxConcurrentDraft] = useState(5);
  const [maxConcurrentSaving, setMaxConcurrentSaving] = useState(false);
  const maxConcurrentDirty = profile ? maxConcurrentDraft !== profile.maxConcurrentDeliveries : false;

  // Account edit dialog
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [accountDraft, setAccountDraft] = useState({ name: '', email: '', phone: '', bio: '' });
  const [accountSaving, setAccountSaving] = useState(false);

  // Sign out / delete account
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  /* --------------------------------- Fetch -------------------------------- */

  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    setSettingsError(null);
    try {
      const data = await settingsApi.getSettings();
      setSettings(data);
      setNotifDraft(data.notifications);
      setLangDraft(data.language);
      setAccountDraft({
        name: data.account.name,
        email: data.account.email,
        phone: data.account.phone,
        bio: data.account.bio ?? '',
      });
      setIsUsingFallback(false);
      setSyncedAt(new Date());
    } catch {
      setSettingsError("Couldn't load settings from the server.");
      setIsUsingFallback(true);
      setLangDraft(localLanguage.get());
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const res: any = await deliveryPartnerApi.getProfile();
      const p = (res?.data ?? res)?.profile ?? res;
      setProfile(p);
      setIsAvailable(!!p?.availability?.isAvailable);
      setMaxConcurrentDraft(p?.maxConcurrentDeliveries ?? 5);
    } catch {
      // Profile widgets degrade gracefully; primary settings still usable.
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadProfile();
    setAppearance(localAppearance.get());
  }, [loadSettings, loadProfile]);

  // Warn before leaving with unsaved notification/language/stepper changes.
  useEffect(() => {
    const dirty = notifDirty || langDirty || maxConcurrentDirty;
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [notifDirty, langDirty, maxConcurrentDirty]);

  const handleRefresh = () => {
    loadSettings();
    loadProfile();
    toast.success('Settings synced');
  };

  /* ------------------------------ Search filter ---------------------------- */

  const q = search.trim().toLowerCase();
  const matches = (...haystack: string[]) => !q || haystack.some((h) => h.toLowerCase().includes(q));

  /* ------------------------------ Delivery prefs --------------------------- */

  const handleToggleOnDuty = async () => {
    try {
      if (typeof deliveryPartnerCtx.toggleOnDuty === 'function') {
        await deliveryPartnerCtx.toggleOnDuty();
      } else {
        await deliveryPartnerApi.updateAvailability({ isOnDuty: !profile?.availability?.isOnDuty });
      }
      loadProfile();
      toast.success(profile?.availability?.isOnDuty ? 'You are now off duty' : "You're on duty");
    } catch {
      toast.error("Couldn't update duty status");
    }
  };

  const handleToggleAvailable = async (value: boolean) => {
    setIsAvailable(value);
    try {
      await deliveryPartnerApi.updateAvailability({ isAvailable: value });
      toast.success(value ? 'Available for new assignments' : 'Paused new assignments');
    } catch {
      setIsAvailable(!value);
      toast.error("Couldn't update availability");
    }
  };

  const saveMaxConcurrent = async () => {
    setMaxConcurrentSaving(true);
    try {
      await deliveryPartnerApi.updateProfile({ maxConcurrentDeliveries: maxConcurrentDraft });
      setProfile((p) => (p ? { ...p, maxConcurrentDeliveries: maxConcurrentDraft } : p));
      toast.success('Max concurrent deliveries updated');
    } catch {
      toast.error("Couldn't update — try again");
    } finally {
      setMaxConcurrentSaving(false);
    }
  };

  /* -------------------------------- Notifications --------------------------- */

  const saveNotifications = async () => {
    if (!notifDraft) return;
    setNotifSaving(true);
    try {
      const saved = await settingsApi.updateNotifications(notifDraft);
      setSettings((s) => (s ? { ...s, notifications: saved } : s));
      toast.success('Notification preferences saved');
    } catch {
      toast.error("Couldn't save notification preferences");
    } finally {
      setNotifSaving(false);
    }
  };

  /* --------------------------------- Appearance ------------------------------ */

  const applyAppearance = async (next: AppearanceSettings) => {
    setAppearance(next);
    setTheme(next.theme);
    if (next.reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
    if (next.compactView) {
      document.documentElement.classList.add('compact-ui');
    } else {
      document.documentElement.classList.remove('compact-ui');
    }
    await settingsApi.updateAppearance(next);
  };

  /* ---------------------------------- Language -------------------------------- */

  const saveLanguage = async () => {
    setLangSaving(true);
    try {
      const saved = await settingsApi.updateLanguage(langDraft);
      setSettings((s) => (s ? { ...s, language: saved } : s));
      toast.success('Language & region updated');
    } catch {
      toast.error("Couldn't save language settings");
    } finally {
      setLangSaving(false);
    }
  };

  const exampleDateLine = useMemo(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = now.toLocaleDateString('en-US', { month: 'long' });
    let datePart = `${day}/${month}/${year}`;
    if (langDraft.dateFormat === 'MM/DD/YYYY') datePart = `${month}/${day}/${year}`;
    if (langDraft.dateFormat === 'YYYY-MM-DD') datePart = `${year}-${month}-${day}`;
    return `${weekday}, ${datePart} (${weekday}, ${day} ${monthName} ${year}) · ₹850.00`;
  }, [langDraft.dateFormat]);

  /* ---------------------------------- Security -------------------------------- */

  const toggleTwoFactor = async (value: boolean) => {
    try {
      const saved = await settingsApi.updateSecurity({ twoFactorEnabled: value });
      setSettings((s) => (s ? { ...s, security: saved } : s));
      toast.success(value ? 'Two-factor authentication enabled' : 'Two-factor authentication disabled');
      if (value) toast.message('2FA setup will be required on your next login.');
    } catch {
      toast.error("Couldn't update security settings");
    }
  };

  /* ----------------------------------- Account --------------------------------- */

  const saveAccount = async () => {
    setAccountSaving(true);
    try {
      const saved = await settingsApi.updateAccount(accountDraft);
      setSettings((s) => (s ? { ...s, account: saved } : s));
      toast.success('Account details updated');
      setAccountDialogOpen(false);
    } catch {
      toast.error("Couldn't update account details");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await deliveryPartnerApi.logout();
    } catch {
      // Logout endpoint is a stub today — proceed to clear the session regardless.
    } finally {
      await signOut({ callbackUrl: '/delivery/login' });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeleting(true);
    try {
      await settingsApi.deleteAccount('DELETE');
      toast.success('Account deleted');
      await signOut({ callbackUrl: '/' });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Couldn't delete account");
    } finally {
      setDeleting(false);
    }
  };

  /* ----------------------------------- Render ----------------------------------- */

  const fullName = profile
    ? `${profile.user.profile.firstName} ${profile.user.profile.lastName}`
    : settings?.account.name ?? '';

  return (
    <div className="min-h-screen bg-slate-50 pb-24 dark:bg-[#0e0500] md:pb-8">
      <div className="mx-auto max-w-3xl px-4 pt-6 md:p-6">
        {/* Hero strip */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
            <p className="text-sm text-stone-500 dark:text-stone-400">Preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {profile && (
              <div className="flex items-center gap-2">
                {profileLoading ? (
                  <Skeleton className="h-8 w-32 rounded-full" />
                ) : (
                  <span className="flex items-center gap-1.5 rounded-full bg-orange-100/70 px-3 py-1.5 text-xs font-medium text-orange-700 dark:bg-orange-950/30 dark:text-orange-300">
                    {fullName} · {profile.employeeId}
                    {profile.status?.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />}
                  </span>
                )}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              aria-label="Refresh settings"
              className="rounded-full text-orange-500 hover:bg-orange-100/60 dark:hover:bg-orange-950/30"
            >
              <RefreshCw className={`h-4 w-4 ${settingsLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {syncedAt && (
          <p className="mt-1 text-[11px] text-stone-400 dark:text-stone-500">
            Settings synced {syncedAt.toLocaleTimeString()}
          </p>
        )}

        {/* Info callout — avoid duplicating Profile page content */}
        <div className="mt-4 flex items-start gap-2 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-300">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Looking for vehicle, documents, or bank details?{' '}
            <Link href="/delivery/profile" className="font-medium underline-offset-2 hover:underline">
              Go to Profile →
            </Link>
          </span>
        </div>

        {isUsingFallback && (
          <div className="mt-3 flex items-center gap-2 rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Couldn't reach the settings service — showing locally saved preferences.
            <Button size="sm" variant="ghost" className="ml-auto h-7 text-amber-800 dark:text-amber-300" onClick={loadSettings}>
              Retry
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search settings"
            aria-label="Search settings"
            className="rounded-xl border-orange-100/60 pl-9 dark:border-orange-900/30"
          />
        </div>

        <div className="mt-6 flex gap-8">
          {/* Desktop sticky section nav */}
          <nav className="sticky top-6 hidden h-fit w-40 shrink-0 space-y-1 md:block">
            {SECTION_NAV.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-orange-50 hover:text-orange-600 dark:text-stone-400 dark:hover:bg-orange-950/20 dark:hover:text-orange-400"
              >
                <s.icon className="h-3.5 w-3.5" /> {s.label}
              </a>
            ))}
          </nav>

          {/* Sections */}
          <motion.div variants={containerStagger} initial="hidden" animate="show" className="min-w-0 flex-1 space-y-5">
            {settingsLoading && !settings ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-2xl" />
                ))}
              </div>
            ) : (
              <>
                {/* 1. Delivery Preferences */}
                <SettingsSection
                  id="delivery-preferences"
                  title="Delivery preferences"
                  icon={Truck}
                  hidden={!matches('delivery preferences', 'on duty', 'available', 'max concurrent', 'working hours', 'zones', 'bank')}
                >
                  <SettingsRow
                    icon={Truck}
                    label="On duty"
                    description="Receive new assignments when on duty"
                    control={
                      <span className="flex items-center gap-2">
                        {profile?.availability?.isOnDuty && (
                          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" aria-hidden />
                        )}
                        <Switch
                          checked={!!profile?.availability?.isOnDuty}
                          onCheckedChange={handleToggleOnDuty}
                          aria-label="Toggle on duty"
                        />
                      </span>
                    }
                  />
                  <SettingsRow
                    icon={MapPin}
                    label="Available for assignments"
                    description={!profile?.availability?.isOnDuty ? 'Go on duty first to receive assignments' : 'Pause without going fully off duty'}
                    disabled={!profile?.availability?.isOnDuty}
                    control={
                      <Switch
                        checked={isAvailable}
                        onCheckedChange={handleToggleAvailable}
                        disabled={!profile?.availability?.isOnDuty}
                        aria-label="Toggle availability for assignments"
                      />
                    }
                  />
                  <SettingsRow
                    icon={Sparkles}
                    label="Max concurrent deliveries"
                    description={
                      maxConcurrentDirty && profile && maxConcurrentDraft < profile.activeAssignmentsCount
                        ? `You currently have ${profile.activeAssignmentsCount} active`
                        : 'Limit how many active deliveries you can hold'
                    }
                    control={<Stepper value={maxConcurrentDraft} onChange={setMaxConcurrentDraft} />}
                  />
                  <LinkRow href="/delivery/profile?tab=schedule" icon={Clock} label="Manage working hours" description={profile?.availability?.shifts ? `${profile.availability.shifts.start}–${profile.availability.shifts.end}` : undefined} />
                  <LinkRow href="/delivery/zones" icon={MapPin} label="Manage service zones" description={profile?.zone} />
                  <LinkRow href="/delivery/profile?tab=bank" icon={Wallet} label="Payment & bank details" />

                  {maxConcurrentDirty && (
                    <div className="flex items-center justify-end gap-2 py-2.5">
                      <Button size="sm" variant="ghost" onClick={() => setMaxConcurrentDraft(profile?.maxConcurrentDeliveries ?? 5)}>
                        Discard
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveMaxConcurrent}
                        disabled={maxConcurrentSaving}
                        className="rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90"
                      >
                        {maxConcurrentSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                        Save
                      </Button>
                    </div>
                  )}
                </SettingsSection>

                {/* 2. Smart Dispatch (read-only) */}
                <SettingsSection
                  id="smart-dispatch"
                  title="Smart dispatch"
                  icon={Sparkles}
                  hidden={!matches('smart dispatch', 'auto accept', 'traffic', 'preferred delivery types')}
                >
                  <SettingsRow
                    icon={Sparkles}
                    label="Auto-accept assignments"
                    description="Coming soon"
                    disabled
                    control={<Switch checked={!!profile?.aiPreferences?.autoAcceptAssignments} disabled aria-label="Auto-accept assignments (coming soon)" />}
                  />
                  <div className="px-1 py-3 opacity-60">
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100">Max acceptance distance</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {profile?.aiPreferences?.maxAcceptanceDistance ?? 10} km · Coming soon
                    </p>
                    <Slider value={[profile?.aiPreferences?.maxAcceptanceDistance ?? 10]} max={50} step={1} disabled className="mt-2" />
                  </div>
                  <SettingsRow
                    icon={Truck}
                    label="Avoid high traffic"
                    description="Coming soon"
                    disabled
                    control={<Switch checked={!!profile?.aiPreferences?.avoidHighTraffic} disabled aria-label="Avoid high traffic (coming soon)" />}
                  />
                  <div className="px-1 py-3 opacity-60">
                    <p className="mb-1.5 text-sm font-medium text-stone-900 dark:text-stone-100">Preferred delivery types</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(profile?.aiPreferences?.preferredDeliveryTypes ?? []).map((t) => (
                        <span key={t} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] capitalize text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                          {t}
                        </span>
                      ))}
                      {(!profile?.aiPreferences?.preferredDeliveryTypes || profile.aiPreferences.preferredDeliveryTypes.length === 0) && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">None set</span>
                      )}
                    </div>
                  </div>
                </SettingsSection>

                {/* 3. Delivery Verification (read-only) */}
                <SettingsSection
                  id="delivery-verification"
                  title="Delivery verification"
                  icon={Lock}
                  hidden={!matches('delivery verification', 'otp')}
                >
                  <SettingsRow
                    icon={Lock}
                    label="OTP required on delivery"
                    description="Managed centrally — not yet editable"
                    disabled
                    control={<Switch checked={!!profile?.otpConfig?.enabled} disabled aria-label="OTP required (read-only)" />}
                  />
                  <div className="flex items-center justify-between px-1 py-3 text-sm">
                    <span className="text-stone-500 dark:text-stone-400">OTP length</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{profile?.otpConfig?.length ?? 6} digits</span>
                  </div>
                  <div className="flex items-center justify-between px-1 py-3 text-sm">
                    <span className="text-stone-500 dark:text-stone-400">OTP expiry</span>
                    <span className="font-medium text-stone-900 dark:text-stone-100">{profile?.otpConfig?.expiryMinutes ?? 5} minutes</span>
                  </div>
                </SettingsSection>

                {/* 4. Notifications */}
                <SettingsSection
                  id="notifications"
                  title="Notifications"
                  icon={Bell}
                  dirty={notifDirty}
                  hidden={!matches('notifications', 'push', 'sms', 'email', 'assignment', 'reminders', 'earnings summary', 'marketing')}
                  footer={
                    notifDraft && (
                      <div className="flex items-center justify-end gap-2">
                        {notifDirty && (
                          <Button size="sm" variant="ghost" onClick={() => setNotifDraft(settings!.notifications)}>
                            Discard
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={saveNotifications}
                          disabled={!notifDirty || notifSaving}
                          className="rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90"
                        >
                          {notifSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                          Save changes
                        </Button>
                      </div>
                    )
                  }
                >
                  {notifDraft && (
                    <>
                      <SettingsRow
                        icon={Bell}
                        label="Push notifications"
                        description="Master switch for all push alerts"
                        control={
                          <Switch
                            checked={notifDraft.push.enabled}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, push: { ...notifDraft.push, enabled: v } })}
                            aria-label="Enable push notifications"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Truck}
                        label="New delivery assigned"
                        disabled={!notifDraft.push.enabled}
                        control={
                          <Switch
                            checked={notifDraft.push.orders}
                            disabled={!notifDraft.push.enabled}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, push: { ...notifDraft.push, orders: v } })}
                            aria-label="New delivery assigned alerts"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Clock}
                        label="Route updates & shift reminders"
                        disabled={!notifDraft.push.enabled}
                        control={
                          <Switch
                            checked={notifDraft.push.reminders}
                            disabled={!notifDraft.push.enabled}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, push: { ...notifDraft.push, reminders: v } })}
                            aria-label="Route updates and shift reminders"
                          />
                        }
                      />

                      <SettingsRow
                        icon={Phone}
                        label="SMS notifications"
                        description="Master switch for SMS"
                        iconClass="from-indigo-500 to-blue-500"
                        control={
                          <Switch
                            checked={notifDraft.sms.enabled}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, sms: { ...notifDraft.sms, enabled: v } })}
                            aria-label="Enable SMS notifications"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Truck}
                        label="Assignment SMS"
                        iconClass="from-indigo-500 to-blue-500"
                        disabled={!notifDraft.sms.enabled}
                        control={
                          <Switch
                            checked={notifDraft.sms.orders}
                            disabled={!notifDraft.sms.enabled}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, sms: { ...notifDraft.sms, orders: v } })}
                            aria-label="Assignment SMS"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Lock}
                        label="OTP & verification codes"
                        description="Recommended to keep on"
                        iconClass="from-indigo-500 to-blue-500"
                        control={<Switch checked disabled aria-label="OTP and verification codes (always on)" />}
                      />

                      <SettingsRow
                        icon={Mail}
                        label="Daily earnings summary"
                        iconClass="from-emerald-500 to-teal-500"
                        control={
                          <Switch
                            checked={notifDraft.email.orders}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, email: { ...notifDraft.email, orders: v } })}
                            aria-label="Daily earnings summary email"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Mail}
                        label="Weekly performance report"
                        iconClass="from-emerald-500 to-teal-500"
                        control={
                          <Switch
                            checked={notifDraft.email.reminders}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, email: { ...notifDraft.email, reminders: v } })}
                            aria-label="Weekly performance report email"
                          />
                        }
                      />
                      <SettingsRow
                        icon={Mail}
                        label="Promotional offers"
                        description="Off by default"
                        iconClass="from-emerald-500 to-teal-500"
                        control={
                          <Switch
                            checked={notifDraft.email.promotions}
                            onCheckedChange={(v) => setNotifDraft({ ...notifDraft, email: { ...notifDraft.email, promotions: v } })}
                            aria-label="Promotional offers email"
                          />
                        }
                      />
                    </>
                  )}
                </SettingsSection>

                {/* 5. Appearance */}
                <SettingsSection
                  id="appearance"
                  title="Appearance"
                  icon={Palette}
                  hidden={!matches('appearance', 'theme', 'dark mode', 'light mode', 'reduced motion', 'compact')}
                >
                  <div className="py-3">
                    <p className="mb-2 px-1 text-sm font-medium text-stone-900 dark:text-stone-100">Theme</p>
                    <div className="grid grid-cols-3 gap-2 px-1">
                      {(
                        [
                          { value: 'light', label: 'Light', icon: Sun, preview: 'bg-white border border-stone-200' },
                          { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-[#0e0500] border border-orange-900/40' },
                          { value: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-r from-white to-[#0e0500] border border-stone-300' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => applyAppearance({ ...appearance, theme: opt.value })}
                          className={`rounded-xl p-2.5 text-center ring-1 transition ${
                            appearance.theme === opt.value
                              ? 'ring-2 ring-orange-500'
                              : 'ring-orange-100/60 dark:ring-orange-900/30'
                          }`}
                        >
                          <span className={`block h-10 w-full rounded-lg ${opt.preview}`} />
                          <span className="mt-1.5 flex items-center justify-center gap-1 text-xs font-medium text-stone-600 dark:text-stone-300">
                            <opt.icon className="h-3 w-3" /> {opt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <SettingsRow
                    icon={Sparkles}
                    label="Reduced motion"
                    description="Minimize animations across the app"
                    control={
                      <Switch
                        checked={appearance.reducedMotion}
                        onCheckedChange={(v) => applyAppearance({ ...appearance, reducedMotion: v })}
                        aria-label="Reduced motion"
                      />
                    }
                  />
                  <SettingsRow
                    icon={Palette}
                    label="Compact view"
                    description="Tighter spacing for dense screens"
                    control={
                      <Switch
                        checked={appearance.compactView}
                        onCheckedChange={(v) => applyAppearance({ ...appearance, compactView: v })}
                        aria-label="Compact view"
                      />
                    }
                  />

                  {/* Live preview strip */}
                  <div className="py-3">
                    <div
                      className={`flex items-center justify-between rounded-xl p-3 ${
                        appearance.theme === 'dark' ? 'bg-[#1a0900] text-stone-100' : 'bg-white text-stone-900'
                      } ring-1 ring-orange-100/60 dark:ring-orange-900/30`}
                    >
                      <div>
                        <p className="text-xs text-stone-400">Today's earnings</p>
                        <p className="text-lg font-bold">₹425</p>
                      </div>
                      <span className="rounded-lg bg-gradient-to-r from-orange-500 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white">
                        View
                      </span>
                    </div>
                  </div>
                </SettingsSection>

                {/* 6. Language & Region */}
                <SettingsSection
                  id="language"
                  title="Language & region"
                  icon={Globe}
                  dirty={langDirty}
                  hidden={!matches('language', 'region', 'timezone', 'date format', 'currency', 'hindi', 'bengali')}
                  footer={
                    <div className="flex items-center justify-end gap-2">
                      {langDirty && (
                        <Button size="sm" variant="ghost" onClick={() => setLangDraft(settings?.language ?? localLanguage.get())}>
                          Discard
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={saveLanguage}
                        disabled={!langDirty || langSaving}
                        className="rounded-xl bg-gradient-to-r from-indigo-500 to-orange-500 text-white hover:opacity-90"
                      >
                        {langSaving ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
                        Save
                      </Button>
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 gap-3 py-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-stone-500 dark:text-stone-400">Language</Label>
                      <Select value={langDraft.preferred} onValueChange={(v) => setLangDraft({ ...langDraft, preferred: v })}>
                        <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-stone-500 dark:text-stone-400">Timezone</Label>
                      <Select value={langDraft.timezone} onValueChange={(v) => setLangDraft({ ...langDraft, timezone: v })}>
                        <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                          <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                          <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-stone-500 dark:text-stone-400">Date format</Label>
                      <Select value={langDraft.dateFormat} onValueChange={(v) => setLangDraft({ ...langDraft, dateFormat: v as LanguageSettings['dateFormat'] })}>
                        <SelectTrigger className="mt-1 rounded-xl"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-stone-500 dark:text-stone-400">Currency</Label>
                      <div className="mt-1 flex h-9 items-center rounded-xl bg-stone-100 px-3 text-sm text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        ₹ INR (locked)
                      </div>
                    </div>
                  </div>
                  <p className="py-3 text-xs text-stone-400 dark:text-stone-500">Example: {exampleDateLine}</p>
                </SettingsSection>

                {/* 7. Security */}
                <SettingsSection
                  id="security"
                  title="Security"
                  icon={Shield}
                  hidden={!matches('security', 'password', 'two-factor', '2fa', 'login alerts', 'login activity')}
                >
                  <ChangePasswordDialog />
                  <SettingsRow
                    icon={ShieldCheck}
                    label="Two-factor authentication"
                    description={settings?.security.twoFactorEnabled ? 'Enabled' : 'Adds an extra step at login'}
                    iconClass="from-red-500 to-orange-500"
                    control={
                      <Switch
                        checked={!!settings?.security.twoFactorEnabled}
                        onCheckedChange={toggleTwoFactor}
                        aria-label="Two-factor authentication"
                      />
                    }
                  />
                  <div className="flex items-center justify-between px-1 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white">
                        <Info className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Login alerts</span>
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                      Enabled
                    </span>
                  </div>
                  <LinkRow href="/delivery/settings/security/activity" icon={Shield} label="View login activity" description={settings?.security.lastPasswordChange ? `Password last changed ${new Date(settings.security.lastPasswordChange).toLocaleDateString()}` : undefined} />
                </SettingsSection>

                {/* 8. Account */}
                <SettingsSection
                  id="account"
                  title="Account"
                  icon={User}
                  hidden={!matches('account', 'name', 'email', 'phone', 'sign out', 'logout', 'employee id')}
                >
                  <button onClick={() => setAccountDialogOpen(true)} className="flex w-full items-center justify-between gap-3 px-1 py-3 text-left">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                        <User className="h-4 w-4" />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">{settings?.account.name}</span>
                        <span className="block text-xs text-stone-400 dark:text-stone-500">Display name</span>
                      </span>
                    </span>
                    <Pencil className="h-3.5 w-3.5 text-stone-300 dark:text-stone-600" />
                  </button>

                  <div className="flex items-center justify-between gap-3 px-1 py-3">
                    <span className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <span className="text-sm text-stone-900 dark:text-stone-100">{settings?.account.email}</span>
                    </span>
                    {profile?.status?.isVerified && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 px-1 py-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                      <Phone className="h-4 w-4" />
                    </span>
                    <span className="text-sm text-stone-900 dark:text-stone-100">+91 {settings?.account.phone}</span>
                  </div>

                  <div className="flex items-center justify-between px-1 py-3 text-sm">
                    <span className="text-stone-500 dark:text-stone-400">Employee ID</span>
                    <span className="font-mono text-stone-900 dark:text-stone-100">{profile?.employeeId}</span>
                  </div>

                  <div className="py-3">
                    <Button
                      variant="outline"
                      onClick={() => setSignOutOpen(true)}
                      className="w-full rounded-xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="mr-1.5 h-4 w-4" /> Sign out
                    </Button>
                  </div>
                </SettingsSection>

                {/* Danger zone */}
                <motion.section
                  variants={fadeUp}
                  className="overflow-hidden rounded-2xl border border-red-200 bg-red-50/40 dark:border-red-900/40 dark:bg-red-950/10"
                >
                  <div className="flex items-center gap-2 border-b border-red-200/70 px-4 py-3 dark:border-red-900/30">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">Danger zone</h2>
                  </div>
                  <div className="divide-y divide-red-200/70 px-4 dark:divide-red-900/30">
                    <div className="flex items-center justify-between gap-3 px-1 py-3">
                      <span>
                        <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Deactivate partner account</span>
                        <span className="block text-xs text-stone-400 dark:text-stone-500">Contact support to pause your partner status</span>
                      </span>
                      <Button variant="outline" size="sm" asChild className="rounded-xl border-red-200 text-red-600 dark:border-red-900/40 dark:text-red-400">
                        <Link href="mailto:support@rentease.com">Contact support</Link>
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-1 py-3">
                      <span>
                        <span className="block text-sm font-medium text-stone-900 dark:text-stone-100">Delete account permanently</span>
                        <span className="block text-xs text-stone-400 dark:text-stone-500">Lose history and pending payouts</span>
                      </span>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="rounded-xl">
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </motion.section>

                {/* Footer links */}
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-4 text-xs text-stone-400 dark:text-stone-500">
                  <Link href="/legal/privacy" className="inline-flex items-center gap-1 hover:text-orange-500">
                    Privacy Policy <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link href="/legal/terms" className="inline-flex items-center gap-1 hover:text-orange-500">
                    Terms <ExternalLink className="h-3 w-3" />
                  </Link>
                  <Link href="/help" className="inline-flex items-center gap-1 hover:text-orange-500">
                    Help Center <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* ----------------------------- Account edit dialog ---------------------------- */}
      <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit account details</DialogTitle>
            <DialogDescription>These details are visible to dispatch and customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div>
              <Label className="text-xs text-stone-500 dark:text-stone-400">Name</Label>
              <Input className="mt-1 rounded-xl" value={accountDraft.name} onChange={(e) => setAccountDraft({ ...accountDraft, name: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 dark:text-stone-400">Email</Label>
              <Input className="mt-1 rounded-xl" type="email" value={accountDraft.email} onChange={(e) => setAccountDraft({ ...accountDraft, email: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 dark:text-stone-400">Phone</Label>
              <Input className="mt-1 rounded-xl" value={accountDraft.phone} onChange={(e) => setAccountDraft({ ...accountDraft, phone: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs text-stone-500 dark:text-stone-400">Bio</Label>
              <Input className="mt-1 rounded-xl" value={accountDraft.bio} onChange={(e) => setAccountDraft({ ...accountDraft, bio: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccountDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAccount} disabled={accountSaving} className="rounded-xl bg-gradient-to-r from-orange-500 to-indigo-600 text-white hover:opacity-90">
              {accountSaving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------- Sign out confirm ------------------------------ */}
      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out of delivery portal?</DialogTitle>
            <DialogDescription>You'll need to sign back in to receive new assignments.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSignOutOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleSignOut} disabled={signingOut} className="rounded-xl">
              {signingOut ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <LogOut className="mr-1.5 h-4 w-4" />}
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ------------------------------- Delete account ------------------------------ */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setDeleteConfirmText(''); }}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 dark:text-red-400">Delete account permanently</DialogTitle>
            <DialogDescription>
              This removes your delivery history and any pending payouts. This can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-1">
            <Label className="text-xs text-stone-500 dark:text-stone-400">Type DELETE to confirm</Label>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || deleting}
              className="rounded-xl"
            >
              {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
