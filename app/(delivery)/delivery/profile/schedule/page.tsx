// app/(delivery)/delivery/profile/schedule/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useDeliveryPartner } from '@/contexts/DeliveryPartnerContext';
import { Section } from '@/components/delivery/profile/Section';
import { SaveBar } from '@/components/delivery/profile/SaveBar';
import { useToast } from '@/hooks/useToast';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Sun } from 'lucide-react';

const DAYS = [
  { key: 'monday', label: 'Mon' },
  { key: 'tuesday', label: 'Tue' },
  { key: 'wednesday', label: 'Wed' },
  { key: 'thursday', label: 'Thu' },
  { key: 'friday', label: 'Fri' },
  { key: 'saturday', label: 'Sat' },
  { key: 'sunday', label: 'Sun' },
] as const;

export default function SchedulePage() {
  const { profile, updateProfile } = useDeliveryPartner();
  const toast = useToast();

  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('18:00');
  const [days, setDays] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState({ start: '09:00', end: '18:00', days: [] as string[] });

  useEffect(() => {
    if (!profile) return;
    const snap = {
      start: profile.availability.shifts.start,
      end: profile.availability.shifts.end,
      days: profile.availability.shifts.workingDays,
    };
    setStart(snap.start); setEnd(snap.end); setDays(snap.days); setSaved(snap);
  }, [profile]);

  const dirty = start !== saved.start || end !== saved.end ||
    days.length !== saved.days.length || !days.every((d) => saved.days.includes(d));

  const hours = useMemo(() => {
    const [sh] = start.split(':').map(Number);
    const [eh] = end.split(':').map(Number);
    return Math.max(0, eh - sh);
  }, [start, end]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ availability: { shifts: { start, end, workingDays: days } } });
      setSaved({ start, end, days });
      toast.success('Schedule saved ✓');
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  };

  const onDiscard = () => { setStart(saved.start); setEnd(saved.end); setDays(saved.days); };
  const toggle = (d: string) => setDays((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <Section title="Shift hours" description="When you're available for deliveries" icon={Clock}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Start</label>
            <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">End</label>
            <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-xl bg-orange-50 dark:bg-orange-950/30 px-4 py-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Hours/day</span>
              <span className="text-2xl font-bold tabular-nums text-orange-700 dark:text-orange-400">{hours}h</span>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Working days" description="Days you accept jobs" icon={Calendar}>
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((d) => {
            const active = days.includes(d.key);
            return (
              <motion.button
                key={d.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggle(d.key)}
                className={cn(
                  'py-4 rounded-2xl text-sm font-bold transition-all border',
                  active
                    ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white border-transparent shadow-sm shadow-orange-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-orange-300'
                )}
              >
                {d.label}
                {active && (
                  <div className="text-[10px] font-medium opacity-80 mt-0.5 tabular-nums">
                    {start.slice(0, 5)}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 flex items-center gap-3">
          <Sun className="w-5 h-5 text-amber-500" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">{days.length} days</span> active ·{' '}
            <span className="font-semibold tabular-nums">{hours * days.length}h</span> weekly capacity
          </div>
        </div>
      </Section>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} saveLabel="Save schedule" />

      <style jsx>{`
        .label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: rgb(55 65 81); margin-bottom: 6px; }
        :global(.dark) .label { color: rgb(209 213 219); }
        .input { height: 44px; width: 100%; padding: 0 14px; border-radius: 12px; border: 1px solid rgb(229 231 235); background: rgb(249 250 251); color: rgb(17 24 39); font-size: 14px; outline: none; }
        :global(.dark) .input { border-color: rgb(39 39 42); background: rgb(24 24 27 / 0.5); color: white; }
        .input:focus { border-color: rgb(251 146 60); box-shadow: 0 0 0 3px rgb(251 146 60 / 0.15); background: white; }
        :global(.dark) .input:focus { background: rgb(24 24 27); }
      `}</style>
    </div>
  );
}
