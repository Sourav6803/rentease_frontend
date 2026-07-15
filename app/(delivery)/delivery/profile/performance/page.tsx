// app/(delivery)/delivery/profile/performance/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { Stat } from '@/components/delivery/profile/Stat';
import { Sparkline } from '@/components/delivery/profile/Sparkline';
import { deliveryApi } from '@/lib/api/delivery';
import {
  BarChart3, Package, CheckCircle2, XCircle, Navigation,
  Star, IndianRupee, ArrowRight, Activity as ActivityIcon,
} from 'lucide-react';

export default function PerformancePage() {
  const { profile } = useDeliveryPartner();
  const router = useRouter();
  const [performance, setPerformance] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [p, e, a] = await Promise.allSettled([
      deliveryApi.getPerformance('month'),
      deliveryApi.getEarnings('week'),
      deliveryApi.getActivity(8),
    ]);
    if (p.status === 'fulfilled') setPerformance(p.value.data?.performance ?? null);
    if (e.status === 'fulfilled') setEarnings(e.value.data ?? null);
    if (a.status === 'fulfilled') setActivity(a.value.data?.activities ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!profile) return null;

  // Fake 7-day sparkline until backend provides
  const spark = [12, 18, 15, 22, 19, 28, 24];
  const earningsSpark = [320, 480, 410, 620, 540, 720, 690];

  return (
    <div className="space-y-6">
      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total" value={String(performance?.totalDeliveries ?? 0)} icon={Package} accent="orange" spark={spark} />
        <Stat label="Completed" value={String(performance?.completedDeliveries ?? 0)} icon={CheckCircle2} accent="emerald" />
        <Stat label="Failed" value={String(performance?.failedDeliveries ?? 0)} icon={XCircle} accent="rose" />
        <Stat label="Distance" value={`${performance?.totalDistance ?? 0} km`} icon={Navigation} accent="blue" />
      </div>

      {/* Earnings */}
      <Section title="This week's earnings" icon={IndianRupee}>
        {loading ? (
          <div className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
        ) : earnings ? (
          <div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold tracking-tight tabular-nums text-gray-900 dark:text-white">
                ₹{earnings.total.toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {earnings.currency} · {earnings.period}
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={earningsSpark} color="#10b981" height={48} />
            </div>
            <div className="mt-4 space-y-2">
              {earnings.breakdown.slice(0, 3).map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.deliveryNumber}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div className="text-base font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +₹{item.amount}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push('/delivery/earnings')}
              className="mt-4 w-full rounded-xl bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 text-orange-700 dark:text-orange-400 text-sm font-bold py-3 transition-colors flex items-center justify-center gap-1"
            >
              View full earnings <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <EmptyState label="No earnings data yet" />
        )}
      </Section>

      {/* Activity feed */}
      <Section title="Recent activity" icon={ActivityIcon}>
        {activity.length > 0 ? (
          <div className="space-y-2">
            {activity.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  item.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30'
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  {item.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ActivityIcon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {item.action} · {item.customer}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    {item.time} · {item.deliveryNumber}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    +₹{item.earnings}
                  </div>
                  {item.rating && (
                    <div className="flex items-center gap-0.5 text-xs text-amber-500">
                      <Star className="w-3 h-3 fill-current" />
                      {item.rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState label="No recent activity" />
        )}
      </Section>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 mx-auto flex items-center justify-center mb-3">
        <BarChart3 className="w-5 h-5 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}
