
// app/(delivery)/delivery/profile/page.tsx
'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { Stat } from '@/components/delivery/profile/Stat';
import {
  Star, MapPin, Calendar, Shield, Zap, HelpCircle,
  Phone, Mail, BadgeCheck, ChevronRight, Package,
  TrendingUp, IndianRupee, Clock,
} from 'lucide-react';

const FAQS = [
  { q: 'How do I update my vehicle?', a: 'Use the Vehicle & Zone page to change details and tap Save.' },
  { q: 'When do I get paid?', a: 'Payouts run every Tuesday & Friday by 6 PM IST to your registered account.' },
  { q: 'How is my rating calculated?', a: 'Average of customer ratings over your last 50 deliveries.' },
  { q: 'How do I reach Gold Partner status?', a: 'Maintain ≥ 4.8 rating and ≥ 95% on-time rate over 30 days.' },
];

const BENEFITS = [
  { icon: Shield, title: 'Delivery Insurance', desc: 'Up to ₹50,000 coverage per incident' },
  { icon: Zap, title: 'Fuel Allowance', desc: '₹500/month fuel reimbursement' },
  { icon: HelpCircle, title: 'Priority Support', desc: '24/7 dedicated partner helpline' },
];

export default function ProfileOverviewPage() {
  const { profile, stats } = useDeliveryPartner();
  if (!profile) return null;

  const initials = `${profile.user.profile.firstName[0]}${profile.user.profile.lastName[0]}`.toUpperCase();
  const tier = profile.rating >= 4.8 ? 'Gold Partner' : profile.rating >= 4.5 ? 'Silver Partner' : 'Standard Partner';
  const isGold = profile.rating >= 4.8;
  const joined = profile.metadata.hiredAt ?? profile.createdAt;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-gray-200/80 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
      >
        {/* Pattern bg */}
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" className="text-gray-900 dark:text-white" />
          </svg>
        </div>
        {/* Gradient bloom */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-400/0 blur-3xl" />

        <div className="relative px-6 sm:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={`w-20 h-20 rounded-full p-[3px] ${
                  isGold
                    ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500'
                    : 'bg-gradient-to-br from-orange-400 to-amber-500'
                }`}
              >
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-2xl font-bold text-gray-900 dark:text-white">
                  {initials}
                </div>
              </div>
              {profile.status.isVerified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {profile.user.profile.firstName} {profile.user.profile.lastName}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    isGold
                      ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/40'
                      : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/40'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  {tier}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1.5">
                  <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                    {profile.employeeId}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.zone.toUpperCase()} Zone
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" />
                  {profile.vehicle.number}
                </span>
                {joined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Since {new Date(joined).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Rating row */}
              <div className="mt-4 flex items-center gap-6">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</div>
                  <div className="mt-0.5 flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                      {profile.rating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500">/ 5.0</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deliveries</div>
                  <div className="mt-0.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {profile?.totalDeliveries?.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 hidden sm:block" />
                <div className="hidden sm:block">
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">On-time</div>
                  <div className="mt-0.5 text-2xl font-bold tabular-nums text-gray-900 dark:text-white">
                    {profile?.onTimeRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Serviceable pincodes */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
              Serviceable Pincodes
            </div>
            <div className="flex flex-wrap gap-1.5">
              {profile.serviceablePincodes.slice(0, 8).map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-300"
                >
                  {p}
                </span>
              ))}
              {profile.serviceablePincodes.length > 8 && (
                <span className="px-2.5 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-xs font-semibold text-orange-700 dark:text-orange-400">
                  +{profile.serviceablePincodes.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* STAT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Today"
          value={String(stats?.todayDeliveries ?? 0)}
          icon={Package}
          accent="orange"
          trend="+12% vs avg"
          trendUp
        />
        <Stat
          label="This week"
          value={`₹${stats?.thisWeekEarnings?.toLocaleString('en-IN') ?? '0'}`}
          icon={IndianRupee}
          accent="emerald"
          trend="+₹420"
          trendUp
        />
        <Stat
          label="Acceptance"
          value={`${stats?.acceptanceRate ?? 0}%`}
          icon={TrendingUp}
          accent="blue"
        />
        <Stat
          label="Avg. pickup"
          value={`${stats?.avgPickupTime ?? 0} min`}
          icon={Clock}
          accent="violet"
        />
      </div>

      {/* CONTACT + BENEFITS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Section
          title="Contact"
          description="Reach you for ops and support"
          icon={Phone}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContactRow icon={Mail} label="Email" value={profile.user.email} />
            <ContactRow icon={Phone} label="Phone" value={profile.user.phone} />
          </div>
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            Contact support to update name, email or phone.
          </p>
        </Section>

        <Section title="Benefits" icon={Shield}>
          <div className="space-y-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0">
                  <b.icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">{b.title}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* FAQ */}
      <Section title="Frequently asked" icon={HelpCircle}>
        <div className="divide-y divide-gray-100 dark:divide-gray-800 -mx-6 -mb-5">
          {FAQS.map((f) => (
            <details key={f.q} className="group px-6 py-4">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{f.q}</span>
                <ChevronRight className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-90" />
              </summary>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</div>
      </div>
    </div>
  );
}
